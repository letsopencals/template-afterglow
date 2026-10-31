import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead } from '@/components/pages/page-head';
import { Slate } from '@/components/frame/slate';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { GoldenBadge } from '@/components/schedule/golden-badge';
import { findOffering } from '@/lib/catalog';
import { getCatalog, getTimetable } from '@/lib/server-data';
import { scheduleHref } from '@/lib/schedule-url';
import { categoryMeta, setMeta, siteConfig } from '@/lib/site-config';
import { formatPrice } from '@/lib/format';
import { dayLabel, minutesLabel, timeLabel } from '@/lib/when';

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
	const catalog = await getCatalog();
	return catalog.classes.map((c) => ({ slug: c.key }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
	const o = findOffering(await getCatalog(), slug);
	if (!o) return { title: 'Class' };
	return { title: `${o.title} in Miami`, description: `${o.classMeta?.tagline ?? ''} ${o.description}`.trim().slice(0, 160) };
}

export default async function ClassPage({ params }: { params: Params }) {
	const { slug } = await params;
	const [catalog, timetable] = await Promise.all([getCatalog(), getTimetable()]);
	const o = findOffering(catalog, slug);
	if (!o || o.kind !== 'class') notFound();
	const meta = o.classMeta;
	const set = setMeta(meta?.set);
	const now = Date.now();
	const next = timetable.filter((x) => x.classKey === o.key && x.status !== 'full' && Date.parse(x.start) > now).slice(0, 8);
	const coaches = catalog.coaches.filter((c) => o.coachIds.includes(c.id));
	return (
		<>
			<PageHead label={`${categoryMeta(o.category)?.label ?? 'Class'} · ${set?.name ?? ''}`} title={o.title} intro={meta?.tagline} image={o.images[0] ?? set?.image} readout={set?.readout}>
				<p className="mt-4 max-w-xl text-ink-2">{o.description}</p>
				<dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
					{[
						['From', formatPrice(o.fromPrice)],
						['Length', minutesLabel(Math.round(o.duration / 60))],
						['Level', meta?.level ?? 'All levels'],
						['Spots', String(Math.max(...o.series.map((s) => s.capacity)))],
					].map(([k, v]) => (
						<div key={k}>
							<dt className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">{k}</dt>
							<dd className="text-lg">{v}</dd>
						</div>
					))}
				</dl>
			</PageHead>
			<section className="container-x grid gap-10 pb-20 lg:grid-cols-12">
				<div className="lg:col-span-7">
					<Slate as="h2" label="Next call times" title="Book a spot" />
					<ul className="mt-6 divide-y divide-line overflow-hidden rounded-[16px] border border-line bg-white">
						{next.map((x) => (
							<li key={x.key}>
								<Link href={scheduleHref({ occ: x })} className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-cream">
									<span>
										<span className="font-medium">{dayLabel(x.start)}</span>
										<span className="ml-2 text-muted">{timeLabel(x.start)}</span>
									</span>
									<span className="flex items-center gap-3">
										{x.golden ? <GoldenBadge which={x.golden} /> : null}
										<span className="font-mono text-sm text-ink-2">{x.seatsLeft} left</span>
									</span>
								</Link>
							</li>
						))}
						{next.length === 0 ? <li className="px-5 py-6 text-muted">Nothing with space in the next weeks. Check back soon.</li> : null}
					</ul>
					<Link href={scheduleHref({ class: o.key })} className={buttonClasses({ variant: 'shutter', className: 'mt-6' })}>
						All {o.title} times
					</Link>
				</div>
				<aside className="space-y-6 lg:col-span-5">
					{meta?.shotNote ? (
						<div className="rounded-[16px] border border-dashed border-pink/60 bg-white p-5">
							<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-pink">What the crew shoots</p>
							<p className="mt-2 text-lg">{meta.shotNote}</p>
							<p className="mt-3 text-sm text-muted">Add clips, a photo set, a slow-mo reel or the raw roll when you book. {siteConfig.introOffer.body}</p>
						</div>
					) : null}
					{meta?.wardrobe ? (
						<div className="rounded-[16px] border border-line bg-white p-5">
							<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Wardrobe</p>
							<p className="mt-2">{meta.wardrobe}</p>
						</div>
					) : null}
					<div>
						<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Coaches</p>
						<ul className="mt-3 space-y-3">
							{coaches.map((c) => (
								<li key={c.id} className="flex items-center gap-3">
									<span className="relative h-12 w-12 overflow-hidden rounded-full bg-cream-2">
										<SafeImage src={c.image} alt="" fill sizes="48px" className="object-cover" />
									</span>
									<span>
										<Link href={`/crew#${c.slug}`} className="font-medium hover:underline">
											{c.name}
										</Link>
										<span className="block font-mono text-[0.72rem] text-muted">{c.meta?.handle}</span>
									</span>
								</li>
							))}
						</ul>
					</div>
				</aside>
			</section>
		</>
	);
}
