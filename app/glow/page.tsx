import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHead } from '@/components/pages/page-head';
import { BookerPage } from '@/components/booker/booker-page';
import { bookerLookups, toBookerOffering } from '@/lib/booker-data';
import { servicesIn } from '@/lib/catalog';
import { getCatalog } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 300;

export const metadata: Metadata = {
	title: 'Glow: saunas, plunge, red light and glam',
	description: 'Private infrared sauna suites on the South Beach rooftop, cold plunge pools, a red light pod and compression lounge in Miami, plus twenty-minute sweat-proof glam before a shoot.',
};

export default async function GlowPage() {
	const catalog = await getCatalog();
	const offerings = servicesIn(catalog, 'glow').map(toBookerOffering);
	const { coaches, sites } = bookerLookups(catalog);
	return (
		<>
			<PageHead label="Glow · recovery & prep" title={<>Heat, ice, <span className="afterglow-text">glow.</span></>} intro={siteConfig.categories.glow.blurb} image={siteConfig.media.categories.glow} readout="ISO 200 · 1/125 · f2.0" />
			<div className="container-x pb-20">
				<Suspense>
					<BookerPage offerings={offerings} people={coaches} sites={sites} />
				</Suspense>
			</div>
		</>
	);
}
