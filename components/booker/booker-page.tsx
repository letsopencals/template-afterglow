'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';
import { formatWholePrice } from '@/lib/format';
import { minutesLabel } from '@/lib/when';
import { toneHex } from '@/lib/site-config';
import type { BookerOffering, BookerPerson, BookerSite } from '@/lib/booker-data';
import { useSettings } from '@/contexts/settings-context';
import { SafeImage } from '@/components/ui/safe-image';
import { Viewfinder } from '@/components/frame/viewfinder';
import { GreaseCircle } from '@/components/frame/grease';
import { ServiceBooker } from '@/components/booker/service-booker';

/**
 * Portrait service frames across the top (`?service=`), then the booker for the
 * chosen one. `?who=<staff slug>` preselects a person (from the crew page).
 */
export function BookerPage({ offerings, people, sites }: { offerings: BookerOffering[]; people: Record<string, BookerPerson>; sites: Record<string, BookerSite> }) {
	const params = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const { currency } = useSettings();
	const key = params.get('service');
	const active = offerings.find((o) => o.key === key) ?? offerings[0];
	const choose = useCallback((k: string) => router.replace(`${pathname}?service=${k}#book`, { scroll: false }), [router, pathname]);
	if (!active) return <p className="text-muted">Nothing to book here yet.</p>;
	const from = (o: BookerOffering) => Math.min(...o.series.map((s) => s.price));

	return (
		<div>
			<div role="tablist" aria-label="Sessions" className="snap-row -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 lg:mx-0 lg:px-0">
				{offerings.map((o, i) => {
					const on = o.key === active.key;
					const s0 = o.series[0];
					return (
						<button key={o.key} type="button" role="tab" aria-selected={on} onClick={() => choose(o.key)} className="group w-44 shrink-0 text-left sm:w-48">
							<span className={clsx('relative block aspect-[4/5] overflow-hidden rounded-[14px] bg-night ring-offset-2 ring-offset-cream transition-shadow', on ? 'ring-2 ring-pink' : '')}>
								<span className="image-placeholder absolute inset-0" />
								<SafeImage src={o.image} alt="" fill sizes="192px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
								<span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: toneHex(o.tone) }} />
								{on ? <Viewfinder inset="sm" timecode={`TAKE ${String(i + 1).padStart(2, '0')}`} /> : null}
							</span>
							<span className="relative mt-2.5 inline-block px-1">
								{on ? <GreaseCircle className="-inset-x-2 -inset-y-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+1rem)]" /> : null}
								<span className="relative block font-display text-[1.05rem] font-bold leading-tight">{o.short}</span>
							</span>
							<span className="mt-0.5 block font-mono text-[0.7rem] text-muted">
								{from(o) === 0 ? 'Free' : `from ${formatWholePrice(from(o), currency)}`}
								{s0 ? ` · ${minutesLabel(s0.durationMin)}` : ''}
							</span>
						</button>
					);
				})}
			</div>

			<div id="book" className="mt-12 scroll-mt-24">
				<div className="grid gap-6 border-b border-line pb-8 md:grid-cols-12">
					<div className="min-w-0 md:col-span-7">
						<h2 className="font-display text-4xl font-bold leading-tight">{active.title}</h2>
						<p className="mt-2 text-lg text-ink-2">{active.tagline}</p>
						<p className="mt-3 max-w-2xl text-muted">{active.description}</p>
					</div>
					<ul className="space-y-2 text-[0.95rem] md:col-span-5 md:pt-2">
						{active.includes.map((i) => (
							<li key={i} className="flex gap-2.5">
								<span aria-hidden className="afterglow mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
								{i}
							</li>
						))}
						{active.whatToBring.length ? <li className="pt-1 text-muted">Bring: {active.whatToBring.join(' · ')}</li> : null}
						{active.people > 1 ? <li className="pt-1 font-medium">One booking for {active.people} people.</li> : null}
					</ul>
				</div>
				<div className="mt-8">
					<ServiceBooker key={active.key} offering={active} people={people} sites={sites} initialWho={params.get('who')} />
				</div>
			</div>
		</div>
	);
}
