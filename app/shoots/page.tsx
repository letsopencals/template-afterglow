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
	title: 'Shoots: book the crew',
	description: 'Book Afterglow’s photographers and filmmakers in Miami: golden hour on the South Beach rooftop, gym glam in Mirror Hall, reels, transformation and duo shoots, creator brand days and the Studio Wall.',
};

export default async function ShootsPage() {
	const catalog = await getCatalog();
	const offerings = [...servicesIn(catalog, 'content'), ...servicesIn(catalog, 'intro')].map(toBookerOffering);
	const { coaches, sites } = bookerLookups(catalog);
	return (
		<>
			<PageHead
				label="Shoots · the crew"
				title={
					<>
						Book the crew.
						<br />
						<span className="afterglow-text">Keep the light.</span>
					</>
				}
				intro={siteConfig.categories.content.blurb}
				image={siteConfig.media.shoots}
				readout="ISO 100 · 1/1000 · f2.8"
			/>
			<div className="container-x pb-20">
				<Suspense>
					<BookerPage offerings={offerings} people={coaches} sites={sites} />
				</Suspense>
			</div>
		</>
	);
}
