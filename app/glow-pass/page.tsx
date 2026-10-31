import type { Metadata } from 'next';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { Viewfinder } from '@/components/frame/viewfinder';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
	title: 'The Glow Pass (coming soon)',
	description: 'Unlimited classes and four shoots a month at Afterglow Miami. The Glow Pass is coming soon: book a free First Glow Tour to hear first.',
};

/** The Glow Pass: a preview only. Passes aren't on sale; the only action books the free tour. */
export default function GlowPassPage() {
	const p = siteConfig.glowPass;
	return (
		<section className="relative isolate overflow-hidden bg-night text-cream">
			<div className="absolute inset-0 -z-10 opacity-50">
				<SafeImage src={siteConfig.media.pass} alt="" fill priority sizes="100vw" className="object-cover" />
			</div>
			<div aria-hidden className="light-drift absolute inset-0 -z-10 opacity-70" />
			<div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/60 to-night/20" />
			<div className="container-x grid min-h-[80svh] gap-12 py-20 lg:grid-cols-12 lg:items-center">
				<div className="lg:col-span-7">
					<p className="inline-flex items-center gap-2 rounded-[8px] bg-cream/10 px-3 py-1 font-mono text-[0.72rem] uppercase tracking-[0.2em]">
						<span aria-hidden className="rec-blink h-1.5 w-1.5 rounded-full bg-rec" />
						{p.status}
					</p>
					<h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] sm:text-7xl">{p.name}</h1>
					<p className="mt-5 max-w-xl text-2xl text-cream/90">{p.headline}</p>
					<p className="mt-3 font-mono text-sm uppercase tracking-[0.14em] text-[#ffd59a]">{p.priceHint} · indicative</p>
					<p className="mt-8 max-w-lg text-cream/75">{p.note}</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<Link href={`/shoots?service=${siteConfig.introService}#book`} className={buttonClasses({ variant: 'glow', size: 'lg' })}>
							Book a free First Glow Tour
						</Link>
						<Link href="/schedule" className={buttonClasses({ variant: 'light', size: 'lg' })}>
							Book a class today
						</Link>
					</div>
				</div>
				<div className="relative lg:col-span-5">
					<div className="relative overflow-hidden rounded-[22px] border border-cream/20 bg-cream/5 p-7 backdrop-blur-md">
						<Viewfinder inset="sm" rec={false} readout="PASS · PREVIEW" />
						<p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-cream/60">What it will include</p>
						<ul className="mt-5 space-y-3.5">
							{p.perks.map((perk) => (
								<li key={perk} className="flex gap-3 border-b border-cream/15 pb-3.5 text-[1.05rem]">
									<span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f4a93b]" />
									{perk}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
