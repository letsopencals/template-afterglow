import Link from 'next/link';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import type { Coach } from '@/lib/catalog';

const ROLE: Record<string, string> = { coach: 'Coach', photographer: 'Photographer', videographer: 'Filmmaker', makeup: 'Makeup' };

/** A portrait card for a coach or crew member: photo, name, handle, title, and a book link. */
export function PersonCard({ person, href, size = 'md' }: { person: Coach; href?: string; size?: 'md' | 'lg' }) {
	const role = person.meta?.role ?? 'coach';
	return (
		<article id={person.slug} className="group scroll-mt-28">
			<div className={clsx('relative overflow-hidden rounded-[16px] bg-night', size === 'lg' ? 'aspect-[4/5]' : 'aspect-[3/4]')}>
				<span className="image-placeholder absolute inset-0" />
				<SafeImage src={person.image} alt={person.name} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
				<span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-[6px] bg-black/55 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white backdrop-blur">
					{role !== 'coach' ? <span aria-hidden className="rec-blink h-1.5 w-1.5 rounded-full bg-[#ff2d55]" /> : null}
					{ROLE[role] ?? role}
					{person.meta?.tier && person.meta.tier !== 'coach' ? ` · ${person.meta.tier}` : ''}
				</span>
			</div>
			<h3 className="mt-3 font-display text-xl font-bold leading-tight">{person.name}</h3>
			<p className="font-mono text-[0.75rem] text-muted">{person.meta?.handle}</p>
			<p className="mt-1 text-[0.92rem] text-ink-2">{person.meta?.title}</p>
			{size === 'lg' && person.meta?.bio ? <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{person.meta.bio}</p> : null}
			{size === 'lg' && person.meta?.quote ? <p className="mt-2 font-display text-[1.05rem] font-semibold leading-snug">“{person.meta.quote}”</p> : null}
			{href ? (
				<Link href={href} className="mt-3 inline-block text-[0.92rem] underline underline-offset-4">
					{role === 'coach' ? `Train with ${person.firstName}` : `Book ${person.firstName}`}
				</Link>
			) : null}
		</article>
	);
}
