'use client';

import { clsx } from 'clsx';
import type { Frame } from '@/lib/shot-list';
import { toneHex } from '@/lib/site-config';
import { formatPrice } from '@/lib/format';
import { dayLabel, minutesLabel, timeLabel } from '@/lib/when';
import { SafeImage } from '@/components/ui/safe-image';
import { GreaseCircle } from '@/components/frame/grease';

/** A shot circled in grease pencil: "Photo Set · 10 edits". */
export function CircledShot({ label, spec, className }: { label: string; spec?: string; className?: string }) {
	return (
		<span className={clsx('relative inline-flex items-baseline gap-1.5 px-3 py-1 text-[0.85rem] font-medium', className)}>
			<GreaseCircle className="-inset-x-2 -inset-y-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+1rem)]" />
			<span className="relative">{label}</span>
			{spec ? <span className="relative font-mono text-[0.68rem] text-muted">{spec}</span> : null}
		</span>
	);
}

/** One session on the contact sheet: the set photo with its frame number, what/when/where, the circled shots. */
export function FrameCard({ frame, currency, onRemove, removing, compact = false }: { frame: Frame; currency: string; onRemove?: () => void; removing?: boolean; compact?: boolean }) {
	const n = String(frame.n).padStart(2, '0');
	return (
		<li className={clsx('grid grid-cols-[5.5rem_1fr] gap-4 py-4 sm:grid-cols-[6.5rem_1fr]', removing && 'opacity-40')}>
			<div>
				<div className="relative aspect-[4/5] overflow-hidden rounded-[8px] bg-night">
					<span className="image-placeholder absolute inset-0" />
					<SafeImage src={frame.image} alt="" fill sizes="104px" className="object-cover" />
					<span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: toneHex(frame.tone) }} />
				</div>
				<p className="mt-1.5 font-mono text-[0.65rem] tracking-[0.16em] text-[#c98a2b]">
					{n} ▸ {n}A
				</p>
			</div>
			<div className="min-w-0">
				<div className="flex items-start justify-between gap-3">
					<p className="font-display text-[1.12rem] font-bold leading-tight">
						{frame.title}
						{frame.variant ? <span className="font-sans text-[0.9rem] font-normal text-muted"> · {frame.variant}</span> : null}
					</p>
					<p className="shrink-0 font-mono text-sm">{formatPrice(frame.total, currency)}</p>
				</div>
				<p className="mt-1 font-mono text-[0.72rem] uppercase tracking-[0.08em] text-ink-2">
					{dayLabel(frame.from)} · {timeLabel(frame.from)} · {minutesLabel(frame.minutes)}
				</p>
				{!compact ? (
					<p className="mt-0.5 text-[0.85rem] text-muted">
						{[frame.place, frame.coachFirstName ? `with ${frame.coachFirstName}` : null, frame.people > 1 ? `${frame.people} people` : null].filter(Boolean).join(' · ')}
					</p>
				) : null}
				{frame.shots.length ? (
					<div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-2">
						{frame.shots.map((s) => (
							<CircledShot key={s.id} label={s.meta.label} spec={s.meta.spec} />
						))}
					</div>
				) : !compact ? (
					<p className="mt-2 text-[0.8rem] text-muted">{frame.category === 'content' ? 'The crew shoots the whole session.' : 'No shots on this one. You can add them in the session.'}</p>
				) : null}
				{frame.extras.length ? (
					<p className="mt-2 text-[0.8rem] text-muted">
						+ {frame.extras.map((e) => (e.quantity > 1 ? `${e.title} ×${e.quantity}` : e.title)).join(', ')}
					</p>
				) : null}
				{frame.offer ? (
					<p className="mt-1.5 font-mono text-[0.7rem] text-pink">
						{frame.offer} · −{formatPrice(frame.baseDiscount, currency)}
					</p>
				) : null}
				{onRemove ? (
					<button type="button" onClick={onRemove} disabled={removing} className="mt-2 text-xs text-muted underline underline-offset-4 hover:text-ink">
						Strike from the list
					</button>
				) : null}
			</div>
		</li>
	);
}
