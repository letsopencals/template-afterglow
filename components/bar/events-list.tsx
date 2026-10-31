'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useAddToShotList } from '@/hooks/use-add-to-shot-list';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import type { Occurrence } from '@/lib/timetable';
import { localDateParts, timeLabel } from '@/lib/when';

export interface EventCopy {
	key: string;
	title: string;
	description: string;
	image: string | null;
}

/** Dated events at the bar and on the roof: a date block, the copy and Book. */
export function EventsList({ events, copy }: { events: Occurrence[]; copy: Record<string, EventCopy> }) {
	const router = useRouter();
	const { add, pending, error } = useAddToShotList();
	const [busy, setBusy] = useState<string | null>(null);
	if (!events.length) return <p className="text-muted">No events on the calendar right now. Follow {siteConfig.contact.instagramHandle} for the next one.</p>;
	return (
		<ul className="grid gap-6 md:grid-cols-3">
			{events.map((o) => {
				const c = copy[o.classKey];
				const d = localDateParts(o.localDate);
				const ev = siteConfig.events[o.classKey];
				return (
					<li key={o.key} className="flex flex-col overflow-hidden rounded-[16px] border border-line bg-white">
						<div className="relative aspect-[16/10] bg-night">
							<span className="image-placeholder absolute inset-0" />
							<SafeImage src={c?.image} alt="" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
							<span className="absolute left-3 top-3 rounded-[10px] bg-white px-3 py-1.5 text-center leading-none text-night">
								<span className="block font-mono text-[0.62rem] uppercase tracking-[0.14em]">{d.month}</span>
								<span className="block font-display text-2xl font-bold">{d.day}</span>
							</span>
						</div>
						<div className="flex flex-1 flex-col p-5">
							<p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">
								{d.weekday} · {timeLabel(o.start)} · {o.siteKey === 'wynwood' ? 'Wynwood' : 'South Beach'}
							</p>
							<h3 className="mt-1 font-display text-2xl font-bold">{o.title}</h3>
							<p className="mt-2 text-[0.95rem] text-ink-2">{ev?.tagline ?? c?.description}</p>
							<div className="mt-auto flex items-center justify-between gap-3 pt-5">
								<span className={clsx('font-mono text-sm', o.status === 'low' && 'text-pink')}>
									{formatPrice(o.price)} · {o.seatsLeft} left
								</span>
								<Button
									variant="shutter"
									size="sm"
									loading={pending && busy === o.key}
									onClick={async () => {
										setBusy(o.key);
										const ok = await add([{ slot: { productId: o.seriesId, start: o.start, end: o.end, staffMemberId: o.coachId, locationId: o.siteId }, numberOfAttendees: 1 }]);
										setBusy(null);
										if (ok) router.refresh();
									}}
								>
									Book
								</Button>
							</div>
							{error && busy === null ? null : null}
						</div>
					</li>
				);
			})}
			{error ? (
				<li className="md:col-span-3" role="alert">
					<p className="text-sm text-danger">{error}</p>
				</li>
			) : null}
		</ul>
	);
}
