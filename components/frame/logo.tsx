/* eslint-disable @next/next/no-img-element */
import { clsx } from 'clsx';

/** The wordmark (hand-drawn SVG in public/): a sunset inside a viewfinder + AFTERGLOW. */
export function Logo({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
	return <img src={tone === 'dark' ? '/logo.svg' : '/logo-light.svg'} alt="Afterglow" width={925} height={100} className={clsx('h-6 w-auto sm:h-7', className)} />;
}
