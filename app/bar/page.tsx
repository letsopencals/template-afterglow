import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHead } from '@/components/pages/page-head';
import { Slate } from '@/components/frame/slate';
import { BookerPage } from '@/components/booker/booker-page';
import { EventsList, type EventCopy } from '@/components/bar/events-list';
import { bookerLookups, toBookerOffering } from '@/lib/booker-data';
import { servicesIn } from '@/lib/catalog';
import { getAddOnsForProduct, getCatalog, getEventOccurrences } from '@/lib/server-data';
import { formatPrice } from '@/lib/format';
import { shotMeta, siteConfig } from '@/lib/site-config';

export const revalidate = 300;

export const metadata: Metadata = {
	title: 'The bar, the café and events',
	description: 'The Afterglow Bar on Collins Ave and the Wynwood café: matcha protein, açaí and mocktails after class. Book a table, add drinks to any booking, and join Sunset Sessions and Creator Night.',
};

export default async function BarPage() {
	const [catalog, events, menuAddOns] = await Promise.all([getCatalog(), getEventOccurrences(), getAddOnsForProduct('bar-table-south-beach')]);
	const offerings = servicesIn(catalog, 'bar').map(toBookerOffering);
	const { coaches, sites } = bookerLookups(catalog);
	const copy: Record<string, EventCopy> = Object.fromEntries(catalog.events.map((e) => [e.key, { key: e.key, title: e.title, description: e.description, image: e.images[0] ?? null }]));
	const menu = menuAddOns.filter((a) => !shotMeta(a.title));
	return (
		<>
			<PageHead label="The bar & café" title={<>After class, <span className="afterglow-text">the bar.</span></>} intro={siteConfig.categories.bar.blurb} image={siteConfig.media.bar} readout="ISO 640 · 1/160 · f1.8">
				<ul className="mt-8 max-w-md divide-y divide-dashed divide-line border-y border-dashed border-line">
					{menu.map((m) => (
						<li key={m.id} className="flex items-baseline justify-between gap-4 py-2.5">
							<span className="font-medium">{m.title}</span>
							<span className="font-mono text-sm">{formatPrice(m.price)}</span>
						</li>
					))}
				</ul>
				<p className="mt-3 text-sm text-muted">Add any of these to a class or a shoot, and it&rsquo;s waiting at the bar when you finish.</p>
			</PageHead>
			<div className="container-x pb-20">
				<Suspense>
					<BookerPage offerings={offerings} people={coaches} sites={sites} />
				</Suspense>
			</div>
			<section id="events" className="scroll-mt-20 bg-cream-2/60 py-20">
				<div className="container-x">
					<Slate label="Events" title="Nights and mornings worth dressing for" intro={siteConfig.categories.events.blurb} />
					<div className="mt-10">
						<EventsList events={events} copy={copy} />
					</div>
				</div>
			</section>
		</>
	);
}
