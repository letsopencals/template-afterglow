import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';

export default function NotFound() {
	return (
		<section className="container-x py-24">
			<p className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-muted">404 · out of frame</p>
			<h1 className="mt-2 font-display text-5xl font-extrabold">That shot didn&rsquo;t make the edit.</h1>
			<p className="mt-4 max-w-lg text-lg text-ink-2">The page moved or never existed. The schedule is a good place to start again.</p>
			<Link href="/schedule" className={buttonClasses({ variant: 'glow', size: 'lg', className: 'mt-8' })}>
				Today&rsquo;s call times
			</Link>
		</section>
	);
}
