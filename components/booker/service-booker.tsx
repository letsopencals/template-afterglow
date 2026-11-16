'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { clsx } from 'clsx';
import { fetcher } from '@/lib/fetcher';
import { lengthsFor, priceFor, startsByDay, startsFrom, type FreeRange, type SlotStart } from '@/lib/slots';
import { goldenFor, localDates, localParts } from '@/lib/timetable';
import { formatPrice } from '@/lib/format';
import { longDayLabel, minutesLabel, timeLabel } from '@/lib/when';
import { setMeta, shotMeta, siteConfig, toneHex } from '@/lib/site-config';
import type { BookerOffering, BookerPerson, BookerSite } from '@/lib/booker-data';
import { useSettings } from '@/contexts/settings-context';
import { useNow } from '@/hooks/use-now';
import { useAddOns } from '@/hooks/use-add-ons';
import { useAddToShotList } from '@/hooks/use-add-to-shot-list';
import { ChoiceRow } from '@/components/ui/choice';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { ShotPicker, ExtrasList } from '@/components/schedule/shot-picker';
import { BookerDays, SlotButtons } from '@/components/booker/slot-buttons';

const ANY = 'any';

function Block({ n, title, children, aside }: { n: string; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
	return (
		<section>
			<div className="mb-3 flex items-baseline justify-between gap-3">
				<h3 className="flex items-baseline gap-2.5">
					<span className="font-mono text-[0.7rem] text-muted">{n}</span>
					<span className="text-[1.05rem] font-medium">{title}</span>
				</h3>
				{aside}
			</div>
			{children}
		</section>
	);
}

/** The "who" picker: portrait rings with handles, plus "Anyone free". */
function WhoPicker({ people, value, onChange, label }: { people: BookerPerson[]; value: string; onChange: (id: string) => void; label: string }) {
	return (
		<div role="radiogroup" aria-label={label} className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
			{[null, ...people].map((p) => {
				const id = p?.id ?? ANY;
				const on = id === value;
				return (
					<button key={id} type="button" role="radio" aria-checked={on} onClick={() => onChange(id)} className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-center">
						<span className={clsx('flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full p-[3px] transition-[background]', on ? 'afterglow' : 'bg-line')}>
							<span className="relative block h-full w-full overflow-hidden rounded-full border-[3px] border-cream bg-cream-2">
								{p ? <SafeImage src={p.image} alt="" fill sizes="72px" className="object-cover" /> : <span className="flex h-full items-center justify-center font-mono text-[0.7rem] uppercase text-muted">Any</span>}
							</span>
						</span>
						<span className={clsx('w-full truncate text-[0.85rem]', on ? 'font-medium' : 'text-ink-2')}>{p?.firstName ?? 'Anyone'}</span>
						<span className="w-full truncate font-mono text-[0.6rem] text-muted">{p?.handle ?? 'first free'}</span>
					</button>
				);
			})}
		</div>
	);
}

/**
 * The service booker (shoots, coaching, glow, bar tables): option, who, where,
 * length or party size, then the day row with plain time buttons right under
 * it. Free windows load once per (variant, person, site) across the horizon.
 * Beside it, a call-sheet preview fills in as you choose and holds Book.
 */
export function ServiceBooker({
	offering,
	people,
	sites,
	initialWho,
}: {
	offering: BookerOffering;
	people: Record<string, BookerPerson>;
	sites: Record<string, BookerSite>;
	initialWho?: string | null;
}) {
	const { currency } = useSettings();
	const now = useNow(60_000);
	const [seriesId, setSeriesId] = useState(offering.series[0]?.id ?? '');
	const series = offering.series.find((s) => s.id === seriesId) ?? offering.series[0]!;

	const whoChoices = useMemo(() => series.coachIds.map((id) => people[id]).filter((p): p is BookerPerson => Boolean(p)), [series, people]);
	const initialWhoId = whoChoices.find((p) => p.slug === initialWho)?.id ?? null;
	const [whoId, setWhoId] = useState<string>(initialWhoId ?? ANY);
	const who = whoId === ANY ? null : (people[whoId] ?? null);

	const siteChoices = useMemo(() => series.siteIds.map((id) => sites[id]).filter((s): s is BookerSite => Boolean(s)).filter((s) => !who || who.siteIds.includes(s.id)), [series, sites, who]);
	const [siteIdRaw, setSiteId] = useState<string | null>(null);
	const siteId = siteChoices.some((s) => s.id === siteIdRaw) ? siteIdRaw! : (siteChoices[0]?.id ?? null);

	const lengths = series.allowCustomDuration ? lengthsFor(series.durationMin, series.maxDurationMin, offering.lengths ?? undefined) : [series.durationMin];
	const [lengthRaw, setLength] = useState<number | null>(null);
	const length = lengthRaw && lengths.includes(lengthRaw) ? lengthRaw : lengths.includes(60) ? 60 : lengths[0]!;
	const [party, setParty] = useState(2);
	const places = offering.party ? Math.min(party, series.capacity) : 1;

	const q = new URLSearchParams({ productId: series.id });
	if (who) q.set('staffMemberId', who.id);
	if (siteId && (siteChoices.length > 1 || who)) q.set('locationId', siteId);
	const { data: ranges, isLoading, error: rangesError } = useSWR<FreeRange[]>(`/api/ranges?${q}`, fetcher, { revalidateOnFocus: false, keepPreviousData: true });

	const starts = useMemo(
		() => (ranges && now ? startsFrom(ranges, { durationMin: length, stepMin: offering.stepMin, now: now.getTime(), advanceSeconds: series.advanceSeconds, places }) : []),
		[ranges, now, length, offering.stepMin, series.advanceSeconds, places],
	);
	const byDay = useMemo(() => startsByDay(starts), [starts]);
	const today = now ? localParts(now.getTime()).date : null;
	const days = useMemo(() => (today ? localDates(today, 21).map((date) => ({ date, count: byDay[date]?.length ?? 0 })) : []), [today, byDay]);
	const firstOpen = days.find((d) => d.count > 0)?.date ?? null;
	const [dayRaw, setDay] = useState<string | null>(null);
	const day = dayRaw && days.some((d) => d.date === dayRaw) ? dayRaw : firstOpen;
	const [picked, setPicked] = useState<SlotStart | null>(null);
	const pick = picked && byDay[picked.localDate]?.some((s) => s.start === picked.start) ? picked : null;

	const { addOns, picked: addOnPicks, setQuantity, selection, loading: addOnsLoading } = useAddOns(series.slug);
	const { add, pending, error } = useAddToShotList();
	const toggle = (id: string, on: boolean) => setQuantity(id, on ? 1 : 0);
	const hasShots = addOns.some((a) => shotMeta(a.title));

	const base = priceFor(series.price, series.durationMin, length) * (offering.party ? places : 1);
	const extras = selection.reduce((s, x) => s + (addOns.find((a) => a.id === x.addOnId)?.price ?? 0) * x.quantity, 0);
	const total = base + extras;
	const site = siteId ? sites[siteId] : null;
	const pickWho = pick?.staffMemberId ? (people[pick.staffMemberId] ?? null) : who;
	const set = setMeta(offering.set);
	const isGolden = (s: SlotStart) => Boolean(goldenFor(offering.set, s.localDate, s.start, s.end));
	const whoLabel = offering.whoLabel ?? 'Who';
	const deliverables = offering.includes;

	const reset = () => setPicked(null);
	const book = () => {
		if (!pick) return;
		void add([
			{
				slot: { productId: series.id, start: pick.start, end: pick.end, staffMemberId: who?.id ?? pick.staffMemberId, locationId: siteId },
				numberOfAttendees: places,
				addOns: selection,
				people: offering.people > 1 ? offering.people : undefined,
			},
		]);
	};

	const preview = (
		<div className="overflow-hidden rounded-[16px] border border-line bg-white">
			<div className="afterglow px-5 py-3 text-white">
				<p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-white/85">Call sheet · draft</p>
				<p className="mt-0.5 font-display text-2xl font-bold leading-tight">{offering.short}</p>
			</div>
			<dl className="divide-y divide-line text-[0.92rem]">
				{[
					['Call time', pick ? `${longDayLabel(pick.start)} · ${timeLabel(pick.start)}` : 'Pick a time'],
					['Set', set ? `${set.name}${site && !site.online ? `, ${site.nickname}` : ''}` : site?.name ?? '—'],
					whoChoices.length ? [whoLabel, pickWho ? `${pickWho.name}${pickWho.handle ? ` · ${pickWho.handle}` : ''}` : 'First free'] : null,
					['Length', `${minutesLabel(length)}${offering.party ? ` · table for ${places}` : offering.people > 1 ? ` · ${offering.people} people` : ''}`],
				]
					.filter((x): x is string[] => Boolean(x))
					.map(([k, v]) => (
						<div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3 px-5 py-2.5">
							<dt className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted">{k}</dt>
							<dd>{v}</dd>
						</div>
					))}
				{deliverables.length ? (
					<div className="grid grid-cols-[6.5rem_1fr] gap-3 px-5 py-2.5">
						<dt className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted">{offering.category === 'content' ? 'You get' : 'Includes'}</dt>
						<dd>
							<ul className="space-y-0.5">
								{deliverables.map((d) => (
									<li key={d}>{d}</li>
								))}
							</ul>
						</dd>
					</div>
				) : null}
			</dl>
			<div className="border-t border-line px-5 pb-5 pt-4">
				<div className="flex items-baseline justify-between">
					<span className="text-sm text-muted">{series.allowCustomDuration && length !== series.durationMin ? `${length / series.durationMin} × ${formatPrice(series.price, currency)}` : offering.party ? `${places} × ${formatPrice(series.price, currency)} deposit` : 'Price'}</span>
					<span className="font-display text-[2.2rem] font-bold">{formatPrice(total, currency)}</span>
				</div>
				<Button variant="glow" size="lg" fullWidth className="mt-3" disabled={!pick} loading={pending} onClick={book}>
					{pick ? 'Add to shot list' : 'Pick a time first'}
				</Button>
				{error ? (
					<p role="alert" className="mt-2 text-sm text-danger">
						{error}
					</p>
				) : null}
				<p className="mt-3 text-xs text-muted">Free to move or cancel up to {siteConfig.policies.changeHours} hours before.</p>
			</div>
		</div>
	);

	// Steps are numbered in the order shown, so a booker without options, sites or lengths reads 01, 02, 03.
	const steps = [offering.series.length > 1 && 'option', whoChoices.length > 1 && 'who', siteChoices.length > 1 && 'where', lengths.length > 1 && 'length', offering.party && 'party', 'day', (addOns.length || addOnsLoading) && 'extras'].filter(Boolean);
	const stepNo = (key: string) => String(steps.indexOf(key) + 1).padStart(2, '0');

	return (
		<div className="grid min-w-0 gap-10 lg:grid-cols-12">
			<div className="min-w-0 space-y-8 lg:col-span-8">
				{offering.series.length > 1 ? (
					<Block n={stepNo('option')} title="Option">
						<ChoiceRow
							name="Option"
							value={series.id}
							onChange={(v) => {
								setSeriesId(v);
								reset();
							}}
							options={offering.series.map((s) => ({ value: s.id, label: s.label || offering.short, sub: `${s.price === 0 ? 'Free' : formatPrice(s.price, currency)}${s.allowCustomDuration ? ` / ${s.durationMin} min` : ''}` }))}
						/>
					</Block>
				) : null}
				{whoChoices.length > 1 ? (
					<Block n={stepNo('who')} title={whoLabel}>
						<WhoPicker
							people={whoChoices}
							value={whoId}
							label={whoLabel}
							onChange={(id) => {
								setWhoId(id);
								reset();
							}}
						/>
					</Block>
				) : null}
				{siteChoices.length > 1 || lengths.length > 1 || offering.party ? (
					<div className="grid gap-8 sm:grid-cols-2">
						{siteChoices.length > 1 ? (
							<Block n={stepNo('where')} title="Where">
								<ChoiceRow
									name="Where"
									value={siteId}
									onChange={(v) => {
										setSiteId(v);
										reset();
									}}
									options={siteChoices.map((s) => ({ value: s.id, label: s.nickname }))}
								/>
							</Block>
						) : null}
						{lengths.length > 1 ? (
							<Block n={stepNo('length')} title="How long">
								<ChoiceRow
									name="How long"
									value={String(length)}
									onChange={(v) => {
										setLength(Number(v));
										reset();
									}}
									options={lengths.map((l) => ({ value: String(l), label: minutesLabel(l), sub: formatPrice(priceFor(series.price, series.durationMin, l), currency) }))}
								/>
							</Block>
						) : null}
						{offering.party ? (
							<Block n={stepNo('party')} title="Party size">
								<ChoiceRow
									name="Party size"
									value={String(places)}
									onChange={(v) => {
										setParty(Number(v));
										reset();
									}}
									options={Array.from({ length: series.capacity }, (_, i) => i + 1).map((n) => ({ value: String(n), label: String(n) }))}
								/>
							</Block>
						) : null}
					</div>
				) : null}
				<Block n={stepNo('day')} title="Day & time" aside={isLoading ? <span className="font-mono text-xs text-muted">Loading times…</span> : null}>
					{rangesError ? <p className="text-sm text-danger">Times didn&rsquo;t load. Refresh to try again.</p> : null}
					{!rangesError && ranges && !firstOpen ? (
						<p className="rounded-[12px] border border-dashed border-line px-4 py-6 text-center text-muted">Nothing free in the next three weeks{who ? ` with ${who.firstName}. Try anyone.` : '.'}</p>
					) : null}
					{days.length ? (
						<>
							<BookerDays
								days={days}
								value={day}
								today={today}
								onChange={(d) => {
									setDay(d);
									reset();
								}}
							/>
							<div className="mt-3">{day ? <SlotButtons starts={byDay[day] ?? []} value={pick?.start ?? null} onChange={setPicked} showLeft={series.capacity > 1} golden={set?.outdoor ? isGolden : undefined} /> : null}</div>
						</>
					) : (
						<div className="h-40 animate-pulse rounded-[12px] bg-cream-2" />
					)}
				</Block>
				{addOns.length || addOnsLoading ? (
					<Block n={stepNo('extras')} title={hasShots ? 'Shots & extras' : 'Extras'}>
						<div className="space-y-5">
							<ShotPicker addOns={addOns} picked={addOnPicks} onToggle={toggle} loading={addOnsLoading} />
							<ExtrasList addOns={addOns} picked={addOnPicks} onToggle={toggle} />
						</div>
					</Block>
				) : null}
			</div>
			<aside className="hidden lg:col-span-4 lg:block">
				<div className="sticky top-24">{preview}</div>
			</aside>
			{/* Phone: the total and Book pinned to the bottom. */}
			<div className="sticky bottom-0 z-30 -mx-4 border-t border-line bg-cream/95 px-4 py-3 backdrop-blur lg:hidden">
				<div className="flex items-center gap-3">
					<span aria-hidden className="h-10 w-[3px] rounded-full" style={{ background: toneHex(offering.tone) }} />
					<div className="min-w-0 flex-1">
						<p className="truncate font-mono text-[0.7rem] text-muted">{pick ? `${longDayLabel(pick.start)} · ${timeLabel(pick.start)}` : `${offering.short} · ${minutesLabel(length)}`}</p>
						<p className="font-display text-2xl font-bold leading-none">{formatPrice(total, currency)}</p>
					</div>
					<Button variant="glow" size="md" disabled={!pick} loading={pending} onClick={book}>
						{pick ? 'Add to list' : 'Pick a time'}
					</Button>
				</div>
				{error ? (
					<p role="alert" className="mt-1 text-xs text-danger">
						{error}
					</p>
				) : null}
			</div>
		</div>
	);
}
