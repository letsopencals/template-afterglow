import Link from 'next/link';
import { Slate } from '@/components/frame/slate';
import { Viewfinder } from '@/components/frame/viewfinder';
import { SafeImage } from '@/components/ui/safe-image';
import type { Site } from '@/lib/catalog';

/** South Beach and Wynwood side by side. */
export function SitesPair({ sites }: { sites: Site[] }) {
	return (
		<section className="container-x py-20 sm:py-28">
			<Slate scene={7} label="Locations" title="Two buildings, one crew" />
			<ul className="mt-10 grid gap-6 md:grid-cols-2">
				{sites.map((s) => (
					<li key={s.id}>
						<Link href={`/sites/${s.key}`} className="group block">
							<div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-night">
								<span className="image-placeholder absolute inset-0" />
								<SafeImage src={s.meta?.images[0]} alt={s.name} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
								<Viewfinder inset="md" rec={false} readout={s.meta?.neighborhood.toUpperCase()} />
							</div>
							<h3 className="mt-5 font-display text-3xl font-bold">{s.name}</h3>
							<p className="mt-1 text-muted">{s.address}</p>
							<p className="mt-3 max-w-lg text-ink-2">{s.meta?.blurb}</p>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
