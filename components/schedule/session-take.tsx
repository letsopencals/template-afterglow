'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAddOns } from '@/hooks/use-add-ons';
import { useAddToShotList } from '@/hooks/use-add-to-shot-list';
import { Button } from '@/components/ui/button';
import { ShotPicker, ExtrasList } from '@/components/schedule/shot-picker';
import { classMeta, shotMeta, siteConfig } from '@/lib/site-config';
import { formatPrice } from '@/lib/format';
import { minutesLabel, timeLabel } from '@/lib/when';
import type { Occurrence } from '@/lib/timetable';
import type { ScheduleClass, SchedulePerson } from '@/components/schedule/types';

/**
 * The expanded row ("the take"): what the class is, what the crew shoots, the
 * shot add-ons as frames to circle, extras, the price and Book. On phones the
 * Book bar sticks to the bottom of the screen while the row is open.
 */
export function SessionTake({ occurrence, cls, coach, onBooked }: { occurrence: Occurrence; cls: ScheduleClass | null; coach: SchedulePerson | null; onBooked: () => void }) {
	const router = useRouter();
	const meta = classMeta(occurrence.classKey);
	const { addOns, loading, picked, setQuantity, selection, reset } = useAddOns(occurrence.seriesSlug);
	const { add, pending, error } = useAddToShotList();
	const [flash, setFlash] = useState(0);
	const toggle = (id: string, on: boolean) => setQuantity(id, on ? 1 : 0);
	const extrasTotal = useMemo(() => addOns.filter((a) => picked[a.id]).reduce((s, a) => s + a.price * (picked[a.id] ?? 0), 0), [addOns, picked]);
	const shotsPicked = addOns.filter((a) => picked[a.id] && shotMeta(a.title)).length;

	const book = async () => {
		const ok = await add([
			{
				slot: { productId: occurrence.seriesId, start: occurrence.start, end: occurrence.end, staffMemberId: occurrence.coachId, locationId: occurrence.siteId },
				numberOfAttendees: 1,
				addOns: selection,
			},
		]);
		if (ok) {
			setFlash((f) => f + 1);
			reset();
			onBooked();
			router.refresh();
		}
	};

	return (
		<div className="unfold relative rounded-b-[inherit] border-t border-line bg-cream/60 px-4 pb-4 pt-5 sm:px-6">
			{flash ? <span key={flash} aria-hidden className="shutter-flash pointer-events-none absolute inset-0 z-10 bg-white" /> : null}
			<div className="grid gap-6 lg:grid-cols-12">
				<div className="lg:col-span-4">
					<p className="text-[1.02rem] leading-relaxed text-ink-2">{meta?.tagline ?? cls?.description}</p>
					{cls?.description && meta?.tagline ? <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{cls.description}</p> : null}
					<dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.85rem]">
						<div>
							<dt className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Level</dt>
							<dd>{occurrence.level}</dd>
						</div>
						<div>
							<dt className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Length</dt>
							<dd>{minutesLabel(occurrence.minutes)}</dd>
						</div>
						<div>
							<dt className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Coach</dt>
							<dd>{coach ? <Link href={`/crew#${coach.slug}`} className="underline underline-offset-2">{coach.name}</Link> : 'TBC'}</dd>
						</div>
						<div>
							<dt className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Bring</dt>
							<dd>{meta?.whatToBring.slice(0, 2).join(', ')}</dd>
						</div>
					</dl>
					{meta?.shotNote ? (
						<p className="mt-4 rounded-[10px] border border-dashed border-pink/50 bg-white px-3 py-2.5 text-[0.88rem] text-ink-2">
							<span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-pink">The crew shoots · </span>
							{meta.shotNote}
						</p>
					) : null}
				</div>
				<div className="space-y-5 lg:col-span-8">
					<ShotPicker addOns={addOns} picked={picked} onToggle={toggle} loading={loading} />
					<ExtrasList addOns={addOns} picked={picked} onToggle={toggle} />
				</div>
			</div>
			<div className="sticky bottom-0 z-[5] -mx-4 mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line bg-cream px-4 py-3 sm:static sm:mx-0 sm:rounded-[12px] sm:border sm:bg-white sm:px-4">
				<div className="mr-auto min-w-0">
					<p className="truncate text-[0.95rem] font-medium">
						{occurrence.title} · {timeLabel(occurrence.start)}
					</p>
					<p className="font-mono text-[0.72rem] text-muted">
						{formatPrice(occurrence.price)}
						{extrasTotal > 0 ? ` + ${formatPrice(extrasTotal)} ${selection.length === 1 ? 'add-on' : 'add-ons'}` : ''} · offers apply in your shot list
					</p>
				</div>
				{error ? (
					<p role="alert" className="w-full text-sm text-danger sm:order-last">
						{error}
					</p>
				) : null}
				<Button variant="glow" size="lg" loading={pending} onClick={() => void book()} className="max-sm:w-full">
					{shotsPicked ? `Book + ${shotsPicked} ${shotsPicked === 1 ? 'shot' : 'shots'}` : 'Book this class'} · {formatPrice(occurrence.price + extrasTotal)}
				</Button>
			</div>
			<p className="mt-3 text-xs text-muted">
				Free to move or cancel up to {siteConfig.policies.changeHours} hours before. {siteConfig.introOffer.headline}.
			</p>
		</div>
	);
}
