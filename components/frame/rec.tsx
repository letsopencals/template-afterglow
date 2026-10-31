import { clsx } from 'clsx';

/** A blinking REC / LIVE marker. */
export function Rec({ label = 'REC', className }: { label?: string; className?: string }) {
	return (
		<span className={clsx('inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.16em]', className)}>
			<span aria-hidden className="rec-blink h-2 w-2 rounded-full bg-[#ff2d55]" />
			{label}
		</span>
	);
}
