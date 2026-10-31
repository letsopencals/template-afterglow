'use client';

import { clsx } from 'clsx';

/** "Spots held 14:32": the cart hold as a camera timecode. */
export function HoldTimer({ seconds, onExtend, className }: { seconds: number | null; onExtend?: () => void; className?: string }) {
	if (seconds === null) return null;
	const expired = seconds <= 0;
	const m = Math.max(0, Math.floor(seconds / 60));
	const s = Math.max(0, seconds % 60);
	const urgent = expired || seconds < 120;
	return (
		<div className={clsx('flex items-center justify-between gap-3 bg-night px-4 py-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-cream', className)}>
			<span className="flex items-center gap-2">
				<span aria-hidden className={clsx('h-2 w-2 rounded-full', urgent ? 'rec-blink bg-[#ff2d55]' : 'bg-rec')} />
				{expired ? 'Hold expired' : 'Spots held'}
			</span>
			<span className="flex items-center gap-3">
				<span className={clsx('text-[0.85rem] tabular-nums', urgent ? 'text-[#ff6b8a]' : 'text-rec')}>
					{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
				</span>
				{onExtend && seconds < 300 ? (
					<button type="button" onClick={onExtend} className="normal-case tracking-normal underline underline-offset-4">
						{expired ? 'Hold again' : 'Add time'}
					</button>
				) : null}
			</span>
		</div>
	);
}
