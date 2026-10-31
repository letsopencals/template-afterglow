import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead } from '@/components/pages/page-head';
import { Slate } from '@/components/frame/slate';
import { Viewfinder } from '@/components/frame/viewfinder';
import { SafeImage } from '@/components/ui/safe-image';
import { buttonClasses } from '@/components/ui/button';
import { findSite, physicalSites } from '@/lib/catalog';
import { getCatalog } from '@/lib/server-data';
import { scheduleHref } from '@/lib/schedule-url';
import { setMeta } from '@/lib/site-config';

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
	return physicalSites(await getCatalog()).map((s) => ({ slug: s.key }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const s = findSite(await getCatalog(), slug);
	return s ? { title: s.name, description: s.meta?.blurb ?? s.address } : { title: 'Location' };
}

export default async function SitePage({ params }: { params: Params }) {
	const { slug } = await params;
	const catalog = await getCatalog();
	const site = findSite(catalog, slug);
	if (!site || site.online) notFound();
	const m = site.meta;
	const sets = (m?.sets ?? []).map((k) => setMeta(k)).filter((x): x is NonNullable<ReturnType<typeof setMeta>> => Boolean(x));
	const maps = site.latitude && site.longitude ? `https://www.google.com/maps/search/?api=1&query=${site.latitude},${site.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;
	return (
		<>
			<PageHead label={m?.neighborhood ?? 'Location'} title={site.name} intro={m?.blurb} image={m?.images[0]} readout={m?.neighborhood.toUpperCase()}>
				<div className="mt-6 flex flex-wrap gap-3">
					<Link href={scheduleHref({ site: site.key })} className={buttonClasses({ variant: 'glow', size: 'lg' })}>
						Classes here
					</Link>
					<a href={maps} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
						Directions
					</a>
				</div>
			</PageHead>
			<section className="container-x grid gap-8 pb-12 md:grid-cols-3">
				{[
					['Address', site.address],
					['Hours', m?.hours],
					['Getting here', m?.transit],
					['Parking', m?.parking],
				].map(([k, v]) =>
					v ? (
						<div key={k} className="rounded-[14px] border border-line bg-white p-5">
							<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">{k}</p>
							<p className="mt-2">{v}</p>
						</div>
					) : null,
				)}
				<div className="rounded-[14px] border border-line bg-white p-5">
					<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">On site</p>
					<ul className="mt-2 space-y-1">
						{m?.facilities.map((f) => (
							<li key={f}>{f}</li>
						))}
					</ul>
				</div>
			</section>
			<section className="bg-night py-16 text-cream">
				<div className="container-x">
					<Slate tone="night" label="The sets" title={`Sets at ${site.nickname}`} />
					<ul className="mt-10 grid gap-6 md:grid-cols-3">
						{sets.map((s) => (
							<li key={s.key}>
								<div className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-night-2">
									<span className="image-placeholder-night absolute inset-0" />
									<SafeImage src={s.image} alt={s.name} fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" />
									<Viewfinder inset="sm" rec={false} readout={s.readout} />
								</div>
								<p className="mt-3 font-display text-xl font-bold">{s.name}</p>
								<p className="text-sm text-cream/65">{s.blurb}</p>
							</li>
						))}
					</ul>
				</div>
			</section>
		</>
	);
}
