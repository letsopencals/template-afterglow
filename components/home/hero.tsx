import Link from 'next/link';
import { Viewfinder } from '@/components/frame/viewfinder';
import { buttonClasses } from '@/components/ui/button';
import { HeroVideo } from '@/components/home/hero-video';
import { siteConfig } from '@/lib/site-config';
import { timeLabel } from '@/lib/when';
import type { Occurrence } from '@/lib/timetable';
import { scheduleHref } from '@/lib/schedule-url';

/** Full-bleed hero video in a viewfinder: "You train. We shoot." with the next call time burned in. */
export function Hero({ next }: { next: Occurrence | null }) {
	const m = siteConfig.media;
	return (
		<section className="relative isolate overflow-hidden bg-night text-white">
			<div className="relative flex min-h-[min(92svh,54rem)] w-full flex-col sm:h-[min(92svh,54rem)] sm:min-h-[36rem]">
				<HeroVideo wide={m.heroVideo} vertical={m.heroVideoVertical} poster={m.heroPoster} />
				<div aria-hidden className="light-drift absolute inset-0 mix-blend-soft-light" />
				<div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-night/10" />
				<Viewfinder inset="lg" timecode={next ? `NEXT ${timeLabel(next.start)}` : 'LIVE'} readout="ISO 800 · 1/250 · f1.8 · 4K" />

				<div className="container-x relative flex flex-1 flex-col justify-end pb-14 pt-16 sm:pb-20">
					<p className="mb-5 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-white/80">South Beach · Wynwood · Miami</p>
					<h1 className="max-w-4xl font-display text-[3.4rem] font-extrabold leading-[0.92] tracking-[-0.035em] sm:text-[5.5rem] lg:text-[7.2rem]">
						You train.
						<br />
						<span className="afterglow-text">We shoot.</span>
					</h1>
					<p className="mt-6 max-w-xl text-[1.1rem] leading-relaxed text-white/85 sm:text-[1.2rem]">
						Rhythm rides, Glute Lab, rooftop yoga at sunset and boxing under pink lights. An in-house crew films and photographs you while you train, and the edits land in your inbox.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-3">
						<Link href="/schedule" className={buttonClasses({ variant: 'glow', size: 'lg' })}>
							Book a class
						</Link>
						<Link href="/shoots" className={buttonClasses({ variant: 'light', size: 'lg' })}>
							Book a shoot
						</Link>
						<p className="w-full pt-1 text-sm text-white/75 sm:w-auto sm:pl-3 sm:pt-0">{siteConfig.introOffer.headline} · shots 30% off, always</p>
					</div>
					{next ? (
						<Link href={scheduleHref({ occ: next })} className="mt-10 inline-flex max-w-full items-center gap-3 self-start rounded-[12px] border border-white/25 bg-black/30 px-4 py-2.5 backdrop-blur-md transition-colors hover:bg-black/45">
							<span aria-hidden className="rec-blink h-2 w-2 shrink-0 rounded-full bg-[#ff2d55]" />
							<span className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-white/70">Next call</span>
							<span className="truncate text-[0.95rem]">
								{timeLabel(next.start)} · {next.title} · {next.seatsLeft} {next.seatsLeft === 1 ? 'spot' : 'spots'} left
							</span>
						</Link>
					) : null}
				</div>
			</div>
		</section>
	);
}
