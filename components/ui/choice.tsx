'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export interface ChoiceOption<T extends string> {
	value: T;
	label: ReactNode;
	sub?: ReactNode;
	disabled?: boolean;
}

/** A plain radio row (length, tier, site). Selected = night fill; never a pill. */
export function ChoiceRow<T extends string>({
	name,
	value,
	options,
	onChange,
	size = 'md',
	className,
}: {
	name: string;
	value: T | null;
	options: ChoiceOption<T>[];
	onChange: (v: T) => void;
	size?: 'sm' | 'md';
	className?: string;
}) {
	return (
		<div role="radiogroup" aria-label={name} className={clsx('flex flex-wrap gap-2', className)}>
			{options.map((o) => {
				const on = o.value === value;
				return (
					<button
						key={o.value}
						type="button"
						role="radio"
						aria-checked={on}
						disabled={o.disabled}
						onClick={() => onChange(o.value)}
						className={clsx(
							'flex min-w-[4.5rem] flex-col items-start rounded-[10px] border text-left transition-colors disabled:opacity-40',
							size === 'sm' ? 'px-3 py-1.5 text-[0.85rem]' : 'px-4 py-2.5',
							on ? 'border-night bg-night text-cream' : 'border-line bg-white text-ink hover:border-ink/60',
						)}
					>
						<span className="font-medium leading-tight">{o.label}</span>
						{o.sub ? <span className={clsx('mt-0.5 font-mono text-[0.72rem]', on ? 'text-cream/70' : 'text-muted')}>{o.sub}</span> : null}
					</button>
				);
			})}
		</div>
	);
}
