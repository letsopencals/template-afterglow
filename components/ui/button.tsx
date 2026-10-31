import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'shutter' | 'glow' | 'outline' | 'light' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
	'group/btn relative inline-flex select-none items-center justify-center gap-2.5 overflow-hidden rounded-[12px] font-sans font-medium tracking-[-0.005em] transition-[background-color,color,border-color,box-shadow,transform] duration-150 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45';

/**
 * Soft rectangles, never pills.
 * - `shutter`: night with a shutter dot that fills with the afterglow on hover (default action).
 * - `glow`: the afterglow gradient, for Book / Add to shot list.
 * - `outline`: 1px ink. `light`: white on photos and night. `ghost`: text only.
 */
const VARIANTS: Record<ButtonVariant, string> = {
	shutter: 'bg-night text-cream hover:bg-night-2',
	glow: 'afterglow text-white shadow-[0_8px_24px_-10px_rgba(255,94,138,0.7)] hover:shadow-[0_10px_30px_-8px_rgba(255,94,138,0.85)]',
	outline: 'border border-ink/80 text-ink hover:bg-ink hover:text-cream',
	light: 'bg-white/95 text-night hover:bg-white',
	ghost: 'text-ink underline-offset-4 hover:underline',
};

const SIZES: Record<ButtonSize, string> = {
	sm: 'h-9 px-3.5 text-[0.85rem]',
	md: 'h-11 px-5 text-[0.95rem]',
	lg: 'h-14 px-7 text-[1.02rem]',
};

export function buttonClasses({
	variant = 'shutter',
	size = 'md',
	fullWidth = false,
	className,
}: {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	className?: string;
} = {}): string {
	return clsx(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);
}

/** The shutter dot: a ring that fills with the afterglow on hover. */
export function ShutterDot({ className }: { className?: string }) {
	return (
		<span aria-hidden className={clsx('relative inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-current', className)}>
			<span className="afterglow h-1.5 w-1.5 scale-0 rounded-full transition-transform duration-200 group-hover/btn:scale-100" />
		</span>
	);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
	loading?: boolean;
	/** Show the shutter dot before the label (on by default for `shutter`). */
	dot?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ variant = 'shutter', size, fullWidth, loading, dot, className, children, disabled, type = 'button', ...props },
	ref,
) {
	const showDot = dot ?? variant === 'shutter';
	return (
		<button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
			{loading ? <span aria-hidden className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : showDot ? <ShutterDot /> : null}
			{children}
		</button>
	);
});
