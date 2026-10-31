import { clsx } from 'clsx';

/**
 * Grease-pencil marks, drawn by hand in SVG. `circle` rings a chosen frame
 * (a slightly open, wobbly ellipse); `underline` marks the current nav item.
 */
export function GreaseCircle({ className, color = 'var(--color-pink)' }: { className?: string; color?: string }) {
	return (
		<svg aria-hidden viewBox="0 0 200 120" preserveAspectRatio="none" className={clsx('grease-pop pointer-events-none absolute', className)} fill="none">
			<path
				d="M30 22C62 6 150 4 182 30c22 18 10 60-34 74-46 15-112 10-134-18C-4 64 8 36 44 20c18-8 44-11 70-10"
				stroke={color}
				strokeWidth="4.5"
				strokeLinecap="round"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
}

export function GreaseUnderline({ className, color = 'var(--color-pink)' }: { className?: string; color?: string }) {
	return (
		<svg aria-hidden viewBox="0 0 100 8" preserveAspectRatio="none" className={clsx('pointer-events-none', className)} fill="none">
			<path d="M2 5.5C20 2.5 48 2 64 3.6c12 1.2 22 2.2 34 0.4" stroke={color} strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
		</svg>
	);
}

/** A grease-pencil tick for a booked shot in the contact sheet. */
export function GreaseTick({ className, color = 'var(--color-pink)' }: { className?: string; color?: string }) {
	return (
		<svg aria-hidden viewBox="0 0 24 20" className={clsx('pointer-events-none', className)} fill="none">
			<path d="M3 11.5c2.5 1.8 4.6 4 6 6.2C12 11 16 5.6 21.5 2.4" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}
