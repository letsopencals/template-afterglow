import { clsx } from 'clsx';

/** A strip of film edge: sprocket holes plus an edge code (`AFTERGLOW 400 · 07 ▸ 07A`). */
export function FilmEdge({ code, frame, tone = 'night', className }: { code?: string; frame?: number | string; tone?: 'night' | 'cream'; className?: string }) {
	return (
		<div
			aria-hidden
			className={clsx(
				'flex h-5 items-center justify-between gap-3 px-2 font-mono text-[0.6rem] tracking-[0.18em]',
				tone === 'night' ? 'bg-night text-[#f4a93b]' : 'bg-cream-2 text-muted',
				className,
			)}
		>
			<span className={clsx('h-2.5 w-14 shrink-0', tone === 'night' ? 'sprockets' : 'sprockets-night opacity-20')} />
			<span className="truncate">{code ?? 'AFTERGLOW 400'}</span>
			{frame !== undefined ? <span className="shrink-0">{`${frame} ▸ ${frame}A`}</span> : null}
			<span className={clsx('h-2.5 w-14 shrink-0', tone === 'night' ? 'sprockets' : 'sprockets-night opacity-20')} />
		</div>
	);
}
