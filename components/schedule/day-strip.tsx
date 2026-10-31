'use client';

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { localDateParts, timeLabel } from '@/lib/when';
import { sunTimes } from '@/lib/sun';
import { siteConfig } from '@/lib/site-config';

/** Days as a strip right above the call times: date, how many sessions, and that day's sunset. */
export function DayStrip({ dates, counts, value, onChange }: { dates: string[]; counts: Record<string, number>; value: string; onChange: (d: string) => void }) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		ref.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
	}, [value]);
	return (
		<div ref={ref} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0" role="group" aria-label="Day">
			{dates.map((d, i) => {
				const p = localDateParts(d);
				const on = d === value;
				const sun = sunTimes(d, siteConfig.geo.latitude, siteConfig.geo.longitude);
				const n = counts[d] ?? 0;
				return (
					<button
						key={d}
						type="button"
						aria-pressed={on}
						onClick={() => onChange(d)}
						className={clsx(
							'flex min-w-[4.6rem] shrink-0 flex-col items-start rounded-[12px] border px-3 py-2 text-left transition-colors',
							on ? 'border-night bg-night text-cream' : 'border-line bg-white hover:border-ink/40',
							n === 0 && !on && 'opacity-50',
						)}
					>
						<span className={clsx('font-mono text-[0.66rem] uppercase tracking-[0.14em]', on ? 'text-cream/70' : 'text-muted')}>{i === 0 ? 'Today' : i === 1 ? 'Tmrw' : p.weekday}</span>
						<span className="font-display text-[1.45rem] font-bold leading-tight">{p.day}</span>
						<span className={clsx('font-mono text-[0.64rem]', on ? 'text-cream/70' : 'text-muted')}>{n ? `${n} calls` : 'Rest day'}</span>
						{sun ? (
							<span className={clsx('mt-0.5 flex items-center gap-1 font-mono text-[0.62rem]', on ? 'text-[#ffd59a]' : 'text-[#b36a00]')}>
								<svg aria-hidden viewBox="0 0 12 8" className="h-2 w-3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
									<path d="M1 7h10M3 7a3 3 0 0 1 6 0" />
								</svg>
								{timeLabel(sun.sunset).replace(' PM', 'p').replace(' AM', 'a')}
							</span>
						) : null}
					</button>
				);
			})}
		</div>
	);
}
