import { Slate } from '@/components/frame/slate';
import { Viewfinder } from '@/components/frame/viewfinder';
import { SafeImage } from '@/components/ui/safe-image';
import { siteConfig } from '@/lib/site-config';

const SHOTS = ['/images/gallery/mirror-selfie-free.jpg', '/images/gallery/shoot-bts.jpg', '/images/gallery/edit-suite.jpg'];

/** "You train. We shoot." in three frames. */
export function Promise() {
	return (
		<section className="container-x py-20 sm:py-28">
			<Slate scene={1} label="How it works" title={<>No phone on the water bottle.</>} intro="Every class and session can come with a crew. Circle the shots you want when you book, then forget about them." />
			<ol className="mt-12 grid gap-6 md:grid-cols-3">
				{siteConfig.promise.map((p, i) => (
					<li key={p.n} className="group">
						<div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-night">
							<span className="image-placeholder absolute inset-0" />
							<SafeImage src={SHOTS[i]} alt="" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
							<Viewfinder inset="sm" timecode={`SC ${p.n}`} readout={['BOOK', 'TRAIN', 'POST'][i]} />
						</div>
						<p className="mt-5 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-muted">Frame {p.n}</p>
						<h3 className="mt-1.5 font-display text-2xl font-bold leading-tight">{p.title}</h3>
						<p className="mt-2 text-ink-2">{p.body}</p>
					</li>
				))}
			</ol>
		</section>
	);
}
