import type { Metadata } from 'next';
import { PageHead } from '@/components/pages/page-head';
import { Slate } from '@/components/frame/slate';
import { PersonCard } from '@/components/crew/person-card';
import { getCatalog } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';

export const revalidate = 300;

export const metadata: Metadata = {
	title: 'Cast & crew',
	description: 'The coaches, photographers, filmmakers and makeup artist at Afterglow Miami: who trains you, who shoots you, and their handles.',
};

const SHOOT_FOR: Record<string, string> = { photographer: 'golden-hour-shoot', videographer: 'reel-in-an-hour', makeup: 'glam-touch-up' };

export default async function CrewPage() {
	const catalog = await getCatalog();
	const coaches = catalog.coaches.filter((c) => (c.meta?.role ?? 'coach') === 'coach');
	const crew = catalog.coaches.filter((c) => c.meta?.role && c.meta.role !== 'coach');
	return (
		<>
			<PageHead label="Cast & crew" title={<>The people <span className="afterglow-text">on set.</span></>} intro="Coaches who train you hard, and a crew who make it look like it felt. Every handle is real enough to tag." image={siteConfig.media.crew} readout="ISO 400 · 1/320 · f2.0" />
			<section className="container-x pb-16">
				<Slate scene={1} label="Behind the camera" title="The crew" intro="Photographers, filmmakers and a makeup artist. Book them on their own, or add them to any class with a shot add-on." />
				<div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3">
					{crew.map((p) => (
						<PersonCard key={p.id} person={p} size="lg" href={`/${p.meta?.role === 'makeup' ? 'glow' : 'shoots'}?service=${SHOOT_FOR[p.meta?.role ?? ''] ?? 'golden-hour-shoot'}&who=${p.slug}#book`} />
					))}
				</div>
			</section>
			<section className="bg-cream-2/60 py-16">
				<div className="container-x">
					<Slate scene={2} label="In front of it" title="The coaches" intro="Every coach teaches classes and takes 1:1 physique coaching." />
					<div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
						{coaches.map((p) => (
							<PersonCard key={p.id} person={p} size="lg" href={`/coaching?service=physique-coaching&who=${p.slug}#book`} />
						))}
					</div>
				</div>
			</section>
		</>
	);
}
