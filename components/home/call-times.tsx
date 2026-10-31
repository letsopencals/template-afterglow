import Link from 'next/link';
import { Slate } from '@/components/frame/slate';
import { buttonClasses } from '@/components/ui/button';
import { GoldenBadge } from '@/components/schedule/golden-badge';
import type { Occurrence } from '@/lib/timetable';
import { scheduleHref } from '@/lib/schedule-url';
import { setMeta, toneHex } from '@/lib/site-config';
import { dayLabel, timeParts } from '@/lib/when';

/** The next few sessions with space, as call-sheet rows. */
export function CallTimes({ occurrences }: { occurrences: Occurrence[] }) {
	return (
		<section className="bg-cream-2/60 py-20 sm:py-24">
			<div className="container-x">
				<Slate
					scene={2}
					label="Call times"
					title="On set next"
					action={
						<Link href="/schedule" className={buttonClasses({ variant: 'outline' })}>
							Full schedule
						</Link>
					}
				/>
				<ul className="mt-10 divide-y divide-line overflow-hidden rounded-[16px] border border-line bg-white">
					{occurrences.map((o) => {
						const t = timeParts(o.start);
						const set = setMeta(o.set);
						return (
							<li key={o.key}>
								<Link href={scheduleHref({ occ: o })} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-cream sm:grid-cols-[7rem_1fr_auto_auto] sm:px-6">
									<span>
										<span className="block font-display text-[1.7rem] font-bold leading-none">{t.clock}</span>
										<span className="font-mono text-[0.7rem] uppercase text-muted">
											{t.meridiem} · {dayLabel(o.start).split(',')[0]}
										</span>
									</span>
									<span className="min-w-0">
										<span className="flex items-center gap-2">
											<span aria-hidden className="h-3 w-[3px] rounded-full" style={{ background: toneHex(o.tone) }} />
											<span className="truncate text-[1.05rem] font-medium">{o.title}</span>
										</span>
										<span className="mt-0.5 block truncate text-sm text-muted">{[set?.name, o.siteKey === 'wynwood' ? 'Wynwood' : 'South Beach'].filter(Boolean).join(' · ')}</span>
									</span>
									<span className="hidden sm:block">{o.golden ? <GoldenBadge which={o.golden} /> : null}</span>
									<span className="text-right font-mono text-[0.8rem] text-ink-2">
										{o.seatsLeft} left
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
}
