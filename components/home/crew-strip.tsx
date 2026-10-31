import Link from 'next/link';
import { Slate } from '@/components/frame/slate';
import { SafeImage } from '@/components/ui/safe-image';
import type { Coach } from '@/lib/catalog';

/** The crew and the coaches: portraits with handles, a horizontal roll. */
export function CrewStrip({ people }: { people: Coach[] }) {
	return (
		<section className="overflow-hidden bg-cream-2/60 py-20 sm:py-24">
			<div className="container-x">
				<Slate scene={5} label="Cast & crew" title="The people on set" intro="Coaches who train you, and photographers and filmmakers who make it look like it felt." action={<Link href="/crew" className="text-[0.95rem] underline underline-offset-4">Meet everyone</Link>} />
			</div>
			<ul className="snap-row container-x mt-10 flex gap-4 overflow-x-auto pb-2">
				{people.map((p) => (
					<li key={p.id} className="w-44 shrink-0 sm:w-52">
						<Link href={`/crew#${p.slug}`} className="group block">
							<div className="relative aspect-[3/4] overflow-hidden rounded-[14px] bg-night">
								<span className="image-placeholder absolute inset-0" />
								<SafeImage src={p.image} alt={p.name} fill sizes="208px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
								{p.meta?.role && p.meta.role !== 'coach' ? (
									<span className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-[6px] bg-black/55 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white backdrop-blur">
										<span aria-hidden className="rec-blink h-1.5 w-1.5 rounded-full bg-[#ff2d55]" />
										Crew
									</span>
								) : null}
							</div>
							<p className="mt-3 font-medium leading-tight">{p.name}</p>
							<p className="font-mono text-[0.72rem] text-muted">{p.meta?.handle ?? ''}</p>
							<p className="mt-0.5 text-sm text-ink-2">{p.meta?.title}</p>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
