import type { ReactNode } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { Viewfinder } from '@/components/frame/viewfinder';
import { siteConfig } from '@/lib/site-config';

/** Sign-in pages: a photo in a viewfinder with the take number, the form on cream. */
export function AuthShell({ step, title, intro, children, footer }: { step?: string; title: string; intro?: ReactNode; children: ReactNode; footer?: ReactNode }) {
	return (
		<div className="grid min-h-[calc(100svh-4rem)] md:grid-cols-2">
			<div className="relative flex min-h-[18rem] flex-col justify-end overflow-hidden bg-night p-8 text-white md:p-12">
				<span className="image-placeholder-night absolute inset-0" />
				<SafeImage src={siteConfig.media.crew} alt="" fill sizes="50vw" className="object-cover opacity-70" />
				<span aria-hidden className="light-drift absolute inset-0 mix-blend-soft-light" />
				<span aria-hidden className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent" />
				<Viewfinder inset="lg" timecode={step} readout="ISO 800 · 1/250" />
				<div className="relative">
					<h1 className="whitespace-pre-line font-display text-5xl font-extrabold leading-[0.95] sm:text-6xl">{title}</h1>
					{intro ? <p className="mt-4 max-w-md text-white/80">{intro}</p> : null}
				</div>
			</div>
			<div className="flex items-center p-8 md:p-12">
				<div className="w-full max-w-md">
					{children}
					{footer ? <p className="mt-8 text-sm text-muted">{footer}</p> : null}
				</div>
			</div>
		</div>
	);
}

export function Notice({ tone = 'error', children, className }: { tone?: 'error' | 'success'; children: ReactNode; className?: string }) {
	return (
		<p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-[10px] border-l-4 bg-white px-4 py-3 text-sm ${tone === 'error' ? 'border-danger' : 'border-[#00c2a8]'} ${className ?? ''}`}>
			{children}
		</p>
	);
}
