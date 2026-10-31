import { clsx } from 'clsx';
import type { ReactNode } from 'react';

/**
 * Section head: a clapperboard "slate" line (`SCENE 03 · THE SETS`) in Fragment
 * Mono over a Syne headline. Not an eyebrow pill.
 */
export function Slate({
	scene,
	label,
	title,
	intro,
	tone = 'cream',
	align = 'left',
	action,
	className,
	as: Tag = 'h2',
}: {
	scene?: string | number;
	label: string;
	title: ReactNode;
	intro?: ReactNode;
	tone?: 'cream' | 'night';
	align?: 'left' | 'center';
	action?: ReactNode;
	className?: string;
	as?: 'h1' | 'h2' | 'h3';
}) {
	return (
		<div className={clsx('flex flex-wrap items-end justify-between gap-x-8 gap-y-4', align === 'center' && 'flex-col items-center text-center', className)}>
			<div className={clsx('max-w-3xl', align === 'center' && 'mx-auto')}>
				<p className={clsx('mb-3 flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.2em]', align === 'center' && 'justify-center', tone === 'night' ? 'text-cream/70' : 'text-muted')}>
					{scene !== undefined ? (
						<span className={clsx('rounded-[4px] px-1.5 py-0.5', tone === 'night' ? 'bg-cream/10 text-cream' : 'bg-night text-cream')}>
							SC {String(scene).padStart(2, '0')}
						</span>
					) : null}
					<span>{label}</span>
				</p>
				<Tag className={clsx('font-display text-[2.1rem] font-bold leading-[1.02] sm:text-5xl', tone === 'night' ? 'text-cream' : 'text-ink')}>{title}</Tag>
				{intro ? <div className={clsx('mt-4 max-w-2xl text-[1.05rem] leading-relaxed', tone === 'night' ? 'text-cream/75' : 'text-ink-2')}>{intro}</div> : null}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}
