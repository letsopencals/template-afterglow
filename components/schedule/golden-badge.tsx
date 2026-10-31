import { clsx } from 'clsx';

/** "Golden hour": the class overlaps the real Miami sunrise or sunset hour on that date. */
export function GoldenBadge({ which, className }: { which: 'morning' | 'evening'; className?: string }) {
	return (
		<span className={clsx('inline-flex items-center gap-1.5 rounded-[6px] bg-gradient-to-r from-[#ffd59a] to-[#ffb38a] px-2 py-0.5 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-[#6b3a00]', className)}>
			<svg aria-hidden viewBox="0 0 16 10" className="h-2.5 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
				<path d="M2 9h12M4.5 9a3.5 3.5 0 0 1 7 0M8 1.5v1.6M2.8 3.6l1.1 1.1M13.2 3.6l-1.1 1.1" />
			</svg>
			{which === 'evening' ? 'Golden hour' : 'Sunrise light'}
		</span>
	);
}
