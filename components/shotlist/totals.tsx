'use client';

import { clsx } from 'clsx';
import type { CartResponse } from '@opencals/storefront-sdk';
import { formatPrice } from '@/lib/format';
import { codeState } from '@/lib/discount-state';

/** Subtotal, each applied offer and the total, exactly as the cart returns them. */
export function Totals({ cart, currency, className }: { cart: CartResponse; currency: string; className?: string }) {
	const state = codeState(cart);
	// "Shot on us" can come back with a zero amount on a line with no shots: hide it.
	const discounts = (cart.appliedDiscounts ?? []).filter((d) => d.totalAmount > 0);
	const saved = Math.max(0, cart.subtotal - cart.total);
	return (
		<dl className={clsx('space-y-1.5 text-[0.95rem]', className)}>
			<div className="flex justify-between gap-4">
				<dt className="text-muted">Sessions & shots</dt>
				<dd className="font-mono">{formatPrice(cart.subtotal, currency)}</dd>
			</div>
			{discounts.map((d) => (
				<div key={d.id} className="flex justify-between gap-4">
					<dt className="flex min-w-0 flex-1 items-start gap-2">
						<span aria-hidden className="afterglow mt-2 h-2 w-2 shrink-0 rounded-full" />
						{d.title}
					</dt>
					<dd className="whitespace-nowrap font-mono text-pink">−{formatPrice(d.totalAmount, currency)}</dd>
				</div>
			))}
			{state.status === 'outranked' ? (
				<p className="text-xs text-muted">{state.code} is on the order, but a better offer already applies. Offers on a session don&rsquo;t stack: it gets the biggest one.</p>
			) : null}
			<div className="flex items-baseline justify-between gap-4 border-t border-line pt-2.5">
				<dt className="font-medium">Total</dt>
				<dd className="font-display text-[1.9rem] font-bold">{formatPrice(cart.total, currency)}</dd>
			</div>
			{saved > 0 ? <p className="text-right font-mono text-xs text-pink">You save {formatPrice(saved, currency)}</p> : null}
		</dl>
	);
}
