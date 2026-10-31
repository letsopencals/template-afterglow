import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHead } from '@/components/pages/page-head';
import { Slate } from '@/components/frame/slate';
import { BookerPage } from '@/components/booker/booker-page';
import { PersonCard } from '@/components/crew/person-card';
import { bookerLookups, toBookerOffering } from '@/lib/booker-data';
import { servicesIn } from '@/lib/catalog';
import { getCatalog } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 300;

export const metadata: Metadata = {
	title: 'Physique coaching 1:1',
	description: 'Personal training in Miami for 30, 60 or 90 minutes with a coach, senior coach or head coach, partner training for two, and progress photos from the crew.',
};

const TIERS = [
	{ tier: 'head', label: 'Head coaches', note: 'Run the programmes. $95 per 30 minutes.' },
	{ tier: 'senior', label: 'Senior coaches', note: 'Years on the floor and a specialty. $75 per 30 minutes.' },
	{ tier: 'coach', label: 'Coaches', note: 'Sharp, patient and booked a lot. $55 per 30 minutes.' },
] as const;

export default async function CoachingPage() {
	const catalog = await getCatalog();
	const offerings = servicesIn(catalog, 'coaching').map(toBookerOffering);
	const { coaches, sites } = bookerLookups(catalog);
	const pt = offerings.find((o) => o.key === 'physique-coaching');
	const priceOf = (tier: string) => pt?.series.find((s) => s.slug === `pt-${tier}`)?.price;
	return (
		<>
			<PageHead label="Coaching · 1:1" title={<>One coach. <span className="afterglow-text">Your physique.</span></>} intro={siteConfig.categories.coaching.blurb} image={siteConfig.media.categories.coaching} readout="ISO 400 · 1/250 · f2.2" />
			<div className="container-x pb-20">
				<Suspense>
					<BookerPage offerings={offerings} people={coaches} sites={sites} />
				</Suspense>
			</div>
			<section className="bg-cream-2/60 py-20">
				<div className="container-x">
					<Slate label="The coaches" title="Pick by person" intro="Every coach teaches classes and takes 1:1s. The tier sets the price per 30 minutes; the person sets everything else." />
					<div className="mt-12 space-y-14">
						{TIERS.map((t) => {
							const list = catalog.coaches.filter((c) => c.meta?.role === 'coach' && c.meta?.tier === t.tier);
							if (!list.length) return null;
							const price = priceOf(t.tier);
							return (
								<div key={t.tier}>
									<div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-3">
										<h3 className="font-display text-2xl font-bold">{t.label}</h3>
										<p className="text-sm text-muted">{price ? t.note.replace(/\$\d+/, `$${price}`) : t.note}</p>
									</div>
									<div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
										{list.map((c) => (
											<PersonCard key={c.id} person={c} href={`/coaching?service=physique-coaching&who=${c.slug}#book`} />
										))}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>
		</>
	);
}
