import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { siteConfig } from '@/lib/site-config';

/** The Glow Pass, coming soon: a night band with the perks and the free tour as the only action. */
export function PassBand() {
	const p = siteConfig.glowPass;
	return (
		<section className="relative isolate overflow-hidden bg-night text-cream">
			<div className="absolute inset-0 -z-10 opacity-45">
				<SafeImage src={siteConfig.media.pass} alt="" fill sizes="100vw" className="object-cover" />
			</div>
			<div aria-hidden className="light-drift absolute inset-0 -z-10 opacity-60" />
			<div className="container-x grid gap-10 py-20 sm:py-24 lg:grid-cols-12">
				<div className="lg:col-span-7">
					<p className="inline-flex items-center gap-2 rounded-[8px] bg-cream/10 px-3 py-1 font-mono text-[0.72rem] uppercase tracking-[0.2em]">
						<span aria-hidden className="h-1.5 w-1.5 rounded-full bg-rec" />
						{p.status}
					</p>
					<h2 className="mt-5 font-display text-4xl font-extrabold leading-[1] sm:text-6xl">{p.name}</h2>
					<p className="mt-4 max-w-xl text-xl text-cream/85">{p.headline}</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<Link href="/glow-pass" className={buttonClasses({ variant: 'light', size: 'lg' })}>
							See the Glow Pass
						</Link>
						<Link href={`/shoots?service=${siteConfig.introService}#book`} className="inline-flex h-14 items-center px-2 text-[1rem] underline underline-offset-4">
							Book a free First Glow Tour
						</Link>
					</div>
				</div>
				<ul className="space-y-3 self-end lg:col-span-5">
					{p.perks.map((perk) => (
						<li key={perk} className="flex gap-3 border-b border-cream/15 pb-3">
							<span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f4a93b]" />
							{perk}
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
