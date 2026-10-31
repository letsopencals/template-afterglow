'use client';

import { clsx } from 'clsx';
import type { SlotStart } from '@/lib/slots';
import { localTimeLabel } from '@/lib/when';

/** Plain time buttons for one day, directly under the day strip. */
export function SlotButtons({ starts, value, onChange, showLeft, golden }: { starts: SlotStart[]; value: number | null; onChange: (s: SlotStart) => void; showLeft: boolean; golden?: (s: SlotStart) => boolean }) {
	if (!starts.length) return <p className="rounded-[12px] border border-dashed border-line px-4 py-6 text-center text-muted">No times left on this day. Try the next one.</p>;
	return (
		<div role="radiogroup" aria-label="Start time" className="grid grid-cols-3 gap-2 sm:grid-cols-5 xl:grid-cols-6">
			{starts.map((s) => {
				const on = s.start === value;
				const g = golden?.(s);
				return (
					<button
						key={s.start}
						type="button"
						role="radio"
						aria-checked={on}
						onClick={() => onChange(s)}
						className={clsx(
							'relative flex h-12 flex-col items-center justify-center rounded-[10px] border transition-colors',
							on ? 'border-night bg-night text-cream' : g ? 'border-[#f2c48a] bg-[#fff1dc] hover:border-ink/50' : 'border-line bg-white hover:border-ink/50',
						)}
					>
						<span className="text-[0.95rem] font-medium">{localTimeLabel(s.localTime)}</span>
						{showLeft ? <span className={clsx('font-mono text-[0.6rem]', on ? 'text-cream/70' : 'text-muted')}>{s.left} left</span> : g ? <span className={clsx('font-mono text-[0.58rem] uppercase', on ? 'text-[#ffd59a]' : 'text-[#b36a00]')}>golden</span> : null}
					</button>
				);
			})}
		</div>
	);
}

/** The day row for the booker: days with no free time are disabled. */
export function BookerDays({ days, value, onChange, today }: { days: Array<{ date: string; count: number }>; value: string | null; onChange: (d: string) => void; today: string | null }) {
	return (
		<div role="radiogroup" aria-label="Day" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
			{days.map((d) => {
				const [, , dd] = d.date.split('-');
				const wd = new Date(`${d.date}T16:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
				const on = d.date === value;
				return (
					<button
						key={d.date}
						type="button"
						role="radio"
						aria-checked={on}
						disabled={d.count === 0}
						onClick={() => onChange(d.date)}
						className={clsx('flex w-[4.2rem] shrink-0 flex-col items-start rounded-[12px] border px-2.5 py-2 text-left transition-colors disabled:opacity-35', on ? 'border-night bg-night text-cream' : 'border-line bg-white hover:border-ink/40')}
					>
						<span className={clsx('font-mono text-[0.64rem] uppercase tracking-[0.14em]', on ? 'text-cream/70' : 'text-muted')}>{d.date === today ? 'Today' : wd}</span>
						<span className="font-display text-[1.45rem] font-bold leading-tight">{Number(dd)}</span>
						<span className={clsx('font-mono text-[0.6rem]', on ? 'text-cream/70' : 'text-muted')}>{d.count ? `${d.count} times` : 'Full'}</span>
					</button>
				);
			})}
		</div>
	);
}
