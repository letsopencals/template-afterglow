import type { ReactNode } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { Viewfinder } from '@/components/frame/viewfinder';

/** A page opener: slate line, Syne title, intro, and a wide photo in a viewfinder. */
export function PageHead({ label, title, intro, image, readout, children }: { label: string; title: ReactNode; intro?: ReactNode; image?: string | null; readout?: string; children?: ReactNode }) {
	return (
		<section className="container-x grid gap-8 pb-10 pt-10 sm:pt-14 lg:grid-cols-12 lg:items-end">
			<div className="lg:col-span-6">
				<p className="mb-3 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-muted">{label}</p>
				<h1 className="font-display text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-6xl">{title}</h1>
				{intro ? <div className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">{intro}</div> : null}
				{children}
			</div>
			{image ? (
				<div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-night lg:col-span-6">
					<span className="image-placeholder absolute inset-0" />
					<SafeImage src={image} alt="" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
					<Viewfinder inset="md" readout={readout} />
				</div>
			) : null}
		</section>
	);
}
