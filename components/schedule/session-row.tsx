'use client';

import { memo } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import { GoldenBadge } from '@/components/schedule/golden-badge';
import { SessionTake } from '@/components/schedule/session-take';
import type { Occurrence } from '@/lib/timetable';
import { scheduleHref } from '@/lib/schedule-url';
import { siteConfig, toneHex } from '@/lib/site-config';
import { dayLabel, minutesLabel, timeParts } from '@/lib/when';
import type { ScheduleClass, SchedulePerson } from '@/components/schedule/types';

/** One call time. Collapsed: time, class, coach, spots, light. Tapping expands the take in place. */
export const SessionRow = memo(function SessionRow({
	occurrence: o,
	cls,
	coach,
	open,
	next,
	onToggle,
	onBooked,
}: {
	occurrence: Occurrence;
	cls: ScheduleClass | null;
	coach: SchedulePerson | null;
	open: boolean;
	next: Occurrence | null;
	onToggle: () => void;
	onBooked: () => void;
}) {
	const t = timeParts(o.start);
	const full = o.status === 'full';
	const id = `row-${o.key.replace(/[^a-z0-9]/gi, '')}`;
	return (
		<li id={id} className={clsx('scroll-mt-40 transition-colors', open ? 'bg-white' : full ? 'bg-cream/40' : 'bg-white hover:bg-cream/50')}>
			<button
				type="button"
				onClick={onToggle}
				disabled={full}
				aria-expanded={open}
				aria-controls={`${id}-take`}
				className={clsx('grid w-full grid-cols-[4.6rem_1fr_auto] items-center gap-3 px-4 py-4 text-left sm:grid-cols-[6rem_1fr_auto_auto] sm:gap-5 sm:px-6', full && 'cursor-default')}
			>
				<span className={clsx(full && 'opacity-45')}>
					<span className="block font-display text-[1.6rem] font-bold leading-none sm:text-[1.9rem]">{t.clock}</span>
					<span className="font-mono text-[0.68rem] uppercase text-muted">
						{t.meridiem} · {minutesLabel(o.minutes)}
					</span>
				</span>
				<span className={clsx('min-w-0', full && 'opacity-55')}>
					<span className="flex items-center gap-2">
						<span aria-hidden className="h-4 w-[3px] shrink-0 rounded-full" style={{ background: toneHex(o.tone) }} />
						<span className="truncate text-[1.08rem] font-medium">{o.title}</span>
						{o.offPeak ? <span className="hidden shrink-0 rounded-[5px] bg-rec/70 px-1.5 py-px font-mono text-[0.62rem] uppercase text-night sm:inline">{siteConfig.offPeak.label}</span> : null}
					</span>
					<span className="mt-1 flex items-center gap-2 text-[0.88rem] text-muted">
						{coach ? (
							<span className="relative inline-block h-5 w-5 shrink-0 overflow-hidden rounded-full bg-cream-2">
								<SafeImage src={coach.image} alt="" fill sizes="20px" className="object-cover" />
							</span>
						) : null}
						<span className="truncate">{coach ? `with ${coach.firstName}` : o.level}</span>
						{o.golden ? <GoldenBadge which={o.golden} className="sm:hidden" /> : null}
					</span>
				</span>
				<span className="hidden sm:block">{o.golden ? <GoldenBadge which={o.golden} /> : null}</span>
				<span className="flex items-center gap-3 justify-self-end">
					{full ? (
						<span className="font-mono text-[0.78rem] uppercase tracking-[0.1em] text-muted line-through decoration-pink decoration-2">Full</span>
					) : (
						<span className={clsx('text-right font-mono text-[0.8rem]', o.status === 'low' ? 'text-pink' : 'text-ink-2')}>
							{o.status === 'low' ? `${o.seatsLeft} left` : `${o.seatsLeft} spots`}
						</span>
					)}
					{!full ? (
						<span aria-hidden className={clsx('flex h-8 w-8 items-center justify-center rounded-full border transition-transform', open ? 'rotate-45 border-night bg-night text-cream' : 'border-line')}>
							<svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
								<path d="M6 1v10M1 6h10" />
							</svg>
						</span>
					) : null}
				</span>
			</button>
			{full && next ? (
				<p className="-mt-2 px-4 pb-3 pl-[5.6rem] text-[0.85rem] sm:pl-[8.5rem]">
					<Link href={scheduleHref({ occ: next })} scroll={false} className="text-violet underline underline-offset-2">
						Next with space: {dayLabel(next.start)}, {timeParts(next.start).clock} {timeParts(next.start).meridiem} →
					</Link>
				</p>
			) : null}
			{open ? (
				<div id={`${id}-take`}>
					<SessionTake occurrence={o} cls={cls} coach={coach} onBooked={onBooked} />
				</div>
			) : null}
		</li>
	);
});
