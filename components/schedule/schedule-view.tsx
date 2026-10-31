'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { DayStrip } from '@/components/schedule/day-strip';
import { SessionRow } from '@/components/schedule/session-row';
import { SafeImage } from '@/components/ui/safe-image';
import { Viewfinder } from '@/components/frame/viewfinder';
import { filterOccurrences, nextWithSpace, type Occurrence } from '@/lib/timetable';
import { parseSessionKey, scheduleHref, sessionKey } from '@/lib/schedule-url';
import { categoryMeta, setMeta, siteConfig, toneHex, type SetKey } from '@/lib/site-config';
import { sunTimes } from '@/lib/sun';
import { longDayLabel, timeLabel } from '@/lib/when';
import type { ScheduleClass, SchedulePerson, ScheduleSite } from '@/components/schedule/types';

export interface ScheduleInitial {
	day: string;
	site: string | null;
	type: string | null;
	cls: string | null;
	coach: string | null;
	golden: boolean;
	open: string | null;
}

const SET_ORDER: SetKey[] = ['neon-room', 'mirror-hall', 'rooftop', 'ring', 'mural-floor', 'beach', 'studio-wall'];

/**
 * Call times: one day at a time. Date strip on top, filters, then sessions
 * grouped by set (each with its photo). A row expands in place to choose shots
 * and book. Everything lives in the URL so a row can be linked to.
 */
export function ScheduleView({
	occurrences,
	dates,
	people,
	classes,
	sites,
	initial,
}: {
	occurrences: Occurrence[];
	dates: string[];
	people: Record<string, SchedulePerson>;
	classes: Record<string, ScheduleClass>;
	sites: ScheduleSite[];
	initial: ScheduleInitial;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [day, setDay] = useState(initial.day);
	const [site, setSite] = useState<string | null>(initial.site);
	const [type, setType] = useState<string | null>(initial.type);
	const [cls, setCls] = useState<string | null>(initial.cls);
	const [coach, setCoach] = useState<string | null>(initial.coach);
	const [golden, setGolden] = useState(initial.golden);
	const [open, setOpen] = useState<string | null>(initial.open);

	// Keep the URL in step (replace, no scroll), so a row or a filtered view can be shared.
	useEffect(() => {
		const occ = open ? parseSessionKey(open) : null;
		const u = new URL(scheduleHref({ day, site, type, class: cls, coach, occ: occ ? { ...occ, localDate: day } : null }), 'http://x');
		if (golden) u.searchParams.set('light', 'golden');
		router.replace(`${pathname}${u.search}`, { scroll: false });
	}, [day, site, type, cls, coach, golden, open, router, pathname]);

	// Deep link: scroll the opened row into view once.
	useEffect(() => {
		if (!initial.open) return;
		const o = occurrences.find((x) => sessionKey(x) === initial.open);
		if (!o) return;
		document.getElementById(`row-${o.key.replace(/[^a-z0-9]/gi, '')}`)?.scrollIntoView({ block: 'start' });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const coachId = useMemo(() => (coach ? (Object.values(people).find((p) => p.slug === coach)?.id ?? null) : null), [coach, people]);
	const filtered = useMemo(
		() => filterOccurrences(occurrences, { site, category: type, class: cls, coach: coachId }).filter((o) => !golden || o.golden),
		[occurrences, site, type, cls, coachId, golden],
	);
	const counts = useMemo(() => {
		const c: Record<string, number> = {};
		for (const o of filtered) c[o.localDate] = (c[o.localDate] ?? 0) + 1;
		return c;
	}, [filtered]);
	const today = useMemo(() => filtered.filter((o) => o.localDate === day), [filtered, day]);
	const groups = useMemo(() => {
		const map = new Map<string, Occurrence[]>();
		for (const o of today) {
			const k = o.set ?? 'other';
			if (!map.has(k)) map.set(k, []);
			map.get(k)!.push(o);
		}
		return [...map.entries()].sort(([a], [b]) => SET_ORDER.indexOf(a as SetKey) - SET_ORDER.indexOf(b as SetKey));
	}, [today]);
	const sun = sunTimes(day, siteConfig.geo.latitude, siteConfig.geo.longitude);
	const coachesOnSchedule = useMemo(() => {
		const ids = new Set(occurrences.map((o) => o.coachId).filter(Boolean) as string[]);
		return Object.values(people)
			.filter((p) => ids.has(p.id))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [occurrences, people]);
	const types = Object.entries(siteConfig.categories).filter(([k]) => (siteConfig.timetableCategories as string[]).includes(k));

	const toggle = useCallback((key: string) => setOpen((cur) => (cur === key ? null : key)), []);
	const clearFilters = () => {
		setSite(null);
		setType(null);
		setCls(null);
		setCoach(null);
		setGolden(false);
	};
	const anyFilter = Boolean(site || type || cls || coach || golden);

	return (
		<div>
			<div className="sticky top-16 z-30 border-b border-line bg-cream/95 py-3 backdrop-blur-md">
				<div className="container-x space-y-3">
					<DayStrip
						dates={dates}
						counts={counts}
						value={day}
						onChange={(d) => {
							setDay(d);
							setOpen(null);
						}}
					/>
					<div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
						<div role="radiogroup" aria-label="Location" className="flex shrink-0 overflow-hidden rounded-[10px] border border-line bg-white">
							{[{ key: null as string | null, nickname: 'Both' }, ...sites].map((s) => (
								<button key={s.key ?? 'all'} type="button" role="radio" aria-checked={site === s.key} onClick={() => setSite(s.key)} className={clsx('h-9 px-3 text-[0.88rem] transition-colors', site === s.key ? 'bg-night text-cream' : 'hover:bg-cream')}>
									{s.nickname}
								</button>
							))}
						</div>
						{types.map(([k, m]) => (
							<button key={k} type="button" aria-pressed={type === k} onClick={() => setType(type === k ? null : k)} className={clsx('flex h-9 shrink-0 items-center gap-2 rounded-[10px] border px-3 text-[0.88rem] transition-colors', type === k ? 'border-night bg-night text-cream' : 'border-line bg-white hover:border-ink/40')}>
								<span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: toneHex(m.tone) }} />
								{m.label}
							</button>
						))}
						<button type="button" aria-pressed={golden} onClick={() => setGolden(!golden)} className={clsx('flex h-9 shrink-0 items-center gap-2 rounded-[10px] border px-3 text-[0.88rem] transition-colors', golden ? 'border-[#e08a1f] bg-[#ffe3b8] text-[#6b3a00]' : 'border-line bg-white hover:border-ink/40')}>
							<span aria-hidden>☼</span>
							Golden hour
						</button>
						<select aria-label="Coach" value={coach ?? ''} onChange={(e) => setCoach(e.target.value || null)} className="h-9 shrink-0 rounded-[10px] border border-line bg-white px-3 text-[0.88rem]">
							<option value="">Any coach</option>
							{coachesOnSchedule.map((p) => (
								<option key={p.id} value={p.slug}>
									{p.name}
								</option>
							))}
						</select>
						{anyFilter ? (
							<button type="button" onClick={clearFilters} className="h-9 shrink-0 px-2 text-[0.85rem] text-muted underline underline-offset-4">
								Clear
							</button>
						) : null}
					</div>
				</div>
			</div>

			<div className="container-x pb-24 pt-8">
				<div className="flex flex-wrap items-baseline justify-between gap-3">
					<h2 className="font-display text-3xl font-bold">{longDayLabel(`${day}T16:00:00Z`)}</h2>
					{sun ? (
						<p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-muted">
							Sunrise {timeLabel(sun.sunrise)} · Sunset <span className="text-[#b36a00]">{timeLabel(sun.sunset)}</span>
						</p>
					) : null}
				</div>
				{cls && classes[cls] ? (
					<p className="mt-2 text-sm text-ink-2">
						Showing {classes[cls].title} only.{' '}
						<button type="button" className="underline underline-offset-4" onClick={() => setCls(null)}>
							Show everything
						</button>
					</p>
				) : null}

				{groups.length === 0 ? (
					<div className="mt-10 rounded-[16px] border border-dashed border-line bg-white px-6 py-12 text-center">
						<p className="font-display text-2xl font-bold">Nothing on set</p>
						<p className="mt-2 text-ink-2">{anyFilter ? 'No sessions match these filters on this day.' : 'No classes this day. Pick another day above.'}</p>
						{anyFilter ? (
							<button type="button" onClick={clearFilters} className="mt-4 underline underline-offset-4">
								Clear filters
							</button>
						) : null}
					</div>
				) : (
					<div className="mt-8 space-y-10">
						{groups.map(([setKey, list]) => {
							const sm = setMeta(setKey);
							return (
								<section key={setKey} aria-labelledby={`set-${setKey}`}>
									<div className="relative overflow-hidden rounded-t-[16px] bg-night text-white">
										<div className="relative h-28 sm:h-32">
											<span className="image-placeholder-night absolute inset-0" />
											<SafeImage src={sm?.image} alt="" fill sizes="(min-width: 1024px) 80rem, 100vw" className="object-cover opacity-80" />
											<span aria-hidden className="absolute inset-0 bg-gradient-to-r from-night/85 via-night/40 to-transparent" />
											<Viewfinder inset="sm" rec={false} readout={sm?.readout} readoutClassName="max-sm:hidden" />
											<div className="absolute inset-y-0 left-6 flex flex-col justify-center sm:left-8">
												<p className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-white/70">
													{sm?.site === 'wynwood' ? 'Wynwood' : 'South Beach'} · {list.length} {list.length === 1 ? 'call' : 'calls'}
												</p>
												<h3 id={`set-${setKey}`} className="font-display text-[1.7rem] font-bold leading-tight sm:text-3xl">
													{sm?.name ?? 'On location'}
												</h3>
												<p className="text-[0.85rem] text-white/75">{sm?.light}</p>
											</div>
										</div>
									</div>
									<ul className="divide-y divide-line rounded-b-[16px] border border-t-0 border-line [&>li:last-child]:rounded-b-[16px]">
										{list.map((o) => {
											const key = sessionKey(o);
											return (
												<SessionRow
													key={o.key}
													occurrence={o}
													cls={classes[o.classKey] ?? null}
													coach={o.coachId ? (people[o.coachId] ?? null) : null}
													open={open === key}
													next={o.status === 'full' ? nextWithSpace(o, occurrences) : null}
													onToggle={() => toggle(key)}
													onBooked={() => setOpen(null)}
												/>
											);
										})}
									</ul>
								</section>
							);
						})}
					</div>
				)}
				<p className="mt-10 max-w-2xl text-sm text-muted">
					{categoryMeta('ride')?.label}, {categoryMeta('sculpt')?.label?.toLowerCase()}, {categoryMeta('flow')?.label?.toLowerCase()}, {categoryMeta('box')?.label?.toLowerCase()} and {categoryMeta('sweat')?.label?.toLowerCase()} classes. Full sessions point to the next one with space. Golden-hour badges come from the real Miami sunrise and sunset for each date.
				</p>
			</div>
		</div>
	);
}
