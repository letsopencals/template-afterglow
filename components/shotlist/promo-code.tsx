'use client';

import { useId, useState } from 'react';
import type { DiscountCodeErrorResponse } from '@opencals/storefront-sdk';
import { clsx } from 'clsx';
import { useCart } from '@/contexts/cart-context';
import { codeState } from '@/lib/discount-state';

const ERRORS: Partial<Record<DiscountCodeErrorResponse['code'], string>> = {
	CODE_NOT_FOUND: 'We don’t recognise that code.',
	CODE_EXPIRED: 'That code has expired.',
	CODE_LIMIT_REACHED: 'That code has been used up.',
	CODE_NO_MATCHING_ITEMS: 'That code doesn’t cover anything on your list.',
	minimum_requirement_not_met: 'Add a little more to use that code.',
};

/** "Got a code?"; an applied code shows as a dashed tag with Remove. */
export function PromoCode({ className }: { className?: string }) {
	const { cart, applyDiscountCode, removeDiscountCode, discountCodeError, clearDiscountCodeError } = useCart();
	const [open, setOpen] = useState(false);
	const [code, setCode] = useState('');
	const [pending, setPending] = useState(false);
	const id = useId();
	const state = codeState(cart);

	if (state.status !== 'none') {
		return (
			<div className={clsx('flex items-center justify-between gap-3 text-sm', className)}>
				<span className="text-muted">Code</span>
				<span className="flex items-center gap-3">
					<span className={clsx('rounded-[6px] border border-dashed border-ink/40 px-2 py-0.5 font-mono text-xs uppercase', state.status === 'outranked' && 'line-through opacity-60')}>{state.code}</span>
					<button
						type="button"
						disabled={pending}
						className="text-xs underline underline-offset-4"
						onClick={async () => {
							setPending(true);
							try {
								await removeDiscountCode();
							} finally {
								setPending(false);
							}
						}}
					>
						Remove
					</button>
				</span>
			</div>
		);
	}

	if (!open) {
		return (
			<button type="button" className={clsx('text-sm text-ink-2 underline underline-offset-4 hover:text-ink', className)} onClick={() => setOpen(true)}>
				Got a code?
			</button>
		);
	}

	return (
		<form
			className={className}
			onSubmit={async (e) => {
				e.preventDefault();
				if (!code.trim()) return;
				setPending(true);
				try {
					if (await applyDiscountCode(code.trim())) {
						setCode('');
						setOpen(false);
					}
				} finally {
					setPending(false);
				}
			}}
		>
			<label htmlFor={id} className="text-sm text-muted">
				Discount code
			</label>
			<div className="mt-1.5 flex gap-2">
				<input
					id={id}
					value={code}
					autoFocus
					onChange={(e) => {
						setCode(e.target.value);
						if (discountCodeError) clearDiscountCodeError();
					}}
					aria-invalid={Boolean(discountCodeError)}
					aria-describedby={discountCodeError ? `${id}-err` : undefined}
					className="h-11 min-w-0 flex-1 rounded-[10px] border border-line bg-white px-3 font-mono uppercase focus:border-violet focus:outline-none"
				/>
				<button type="submit" disabled={pending} className="h-11 rounded-[10px] bg-night px-4 text-sm font-medium text-cream">
					Apply
				</button>
			</div>
			{discountCodeError ? (
				<p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-danger">
					{ERRORS[discountCodeError.code] ?? discountCodeError.message ?? 'That code didn’t work.'}
				</p>
			) : null}
		</form>
	);
}
