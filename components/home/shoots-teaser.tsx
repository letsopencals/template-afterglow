import Link from 'next/link';
import { Slate } from '@/components/frame/slate';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import type { Offering } from '@/lib/catalog';
import { formatWholePrice } from '@/lib/format';
import { minutesLabel } from '@/lib/when';

/** Content sessions with the crew: the big-ticket sessions, as wide cards. */
export function ShootsTeaser({ shoots }: { shoots: Offering[] }) {
	return (
		<section className="container-x py-20 sm:py-28">
			<Slate
				scene={4}
				label="Shoots"
				title={
					<>
						An hour that is <span className="afterglow-text">all about you</span>
					</>
				}
				intro="Book the crew on their own: golden hour on the roof, gym glam in Mirror Hall, a reel in an hour, or a full creator day on the Studio Wall."
				action={
					<Link href="/shoots" className={buttonClasses({ variant: 'shutter' })}>
						All shoots
					</Link>
				}
			/>
			<ul className="snap-row -mx-4 mt-10 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
				{shoots.slice(0, 6).map((o) => (
					<li key={o.key} className="w-[78vw] shrink-0 sm:w-auto">
						<Link href={`/shoots?service=${o.key}#book`} className="group block">
							<div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-night">
								<span className="image-placeholder absolute inset-0" />
								<SafeImage src={o.images[0]} alt={o.title} fill sizes="(min-width: 1024px) 30vw, 80vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
								<span className="absolute left-3 top-3 rounded-[8px] bg-white/90 px-2.5 py-1 font-mono text-[0.7rem] text-night">{minutesLabel(Math.round(o.duration / 60))}</span>
							</div>
							<div className="mt-4 flex items-baseline justify-between gap-3">
								<h3 className="font-display text-xl font-bold">{o.title}</h3>
								<span className="font-mono text-sm">from {formatWholePrice(o.fromPrice)}</span>
							</div>
							<p className="mt-1 text-[0.95rem] text-ink-2">{o.serviceMeta?.tagline}</p>
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
