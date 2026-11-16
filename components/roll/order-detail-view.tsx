'use client';

import Link from 'next/link';
import useSWR from 'swr';
import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { formatPrice } from '@/lib/format';
import { toBookingView } from '@/lib/booking-view';
import { dayLabel, timeLabel } from '@/lib/when';
import { toneHex } from '@/lib/site-config';
import { paymentLabel } from '@/lib/booking-state';
import { AccountError, AccountLoading } from '@/components/roll/states';

/** One order: its sessions and the totals. */
export function OrderDetailView({ id }: { id: string }) {
	const { data: o, error, isLoading, mutate } = useSWR<OrderDetailResponse>(`/api/account/orders/${encodeURIComponent(id)}`, fetcher, { revalidateOnFocus: false });
	if (error && !o) return <AccountError what="this order" onRetry={() => void mutate()} />;
	if (isLoading || !o) return <AccountLoading label="Loading the order" />;
	const cur = o.paymentCurrencyCode;
	// The order's `subtotal` is already net of offers and leaves out cancelled sessions: rebuild the gross the same way.
	const live = o.lineItems.filter((li) => li.appointment?.status !== 'canceled');
	const gross = live.reduce((sum, li) => sum + li.originalSubtotal + li.addOnLineItems.reduce((a, ao) => a + ao.originalSubtotal, 0), 0);
	const offers = Math.max(0, Math.round((gross - o.subtotal) * 100) / 100);
	return (
		<div className="max-w-3xl">
			<Link href="/account/orders" className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted hover:text-ink">
				← Orders
			</Link>
			<h1 className="font-display font-bold mt-3 text-6xl">{o.name}</h1>
			<p className="font-mono text-sm text-muted">
				{dayLabel(o.createdAt)} · {paymentLabel(o)}
			</p>
			<ul className="mt-6 border-t border-line">
				{o.lineItems.map((li) => {
					const v = li.appointment ? toBookingView(li.appointment) : null;
					return (
						<li key={li.appointmentId ?? li.createdAt} className="flex items-center gap-3 border-b border-line py-3">
							{v ? <span aria-hidden className="mt-1 h-8 w-[3px] shrink-0 rounded-full" style={{ background: toneHex(v.tone) }} /> : null}
							<span className="min-w-0 flex-1">
								{v ? (
									<Link href={`/account/appointments/${v.id}`} className="font-semibold hover:underline">
										{v.title}
									</Link>
								) : (
									'Session'
								)}
								{v ? (
									<span className="font-mono block text-xs text-muted">
										{dayLabel(v.start)} · {timeLabel(v.start)}
										{v.coachFirstName ? ` · ${v.coachFirstName}` : ''}
									</span>
								) : null}
							</span>
							<span className="font-mono">{formatPrice(li.discountedSubtotal + li.addOnSubtotal, cur)}</span>
						</li>
					);
				})}
			</ul>
			<dl className="ml-auto mt-4 max-w-xs space-y-1 text-sm">
				<div className="flex justify-between">
					<dt className="text-muted">Subtotal</dt>
					<dd className="font-mono">{formatPrice(gross, cur)}</dd>
				</div>
				{offers > 0 ? (
					<div className="flex justify-between">
						<dt className="text-muted">Offers</dt>
						<dd className="font-mono text-pink">−{formatPrice(offers, cur)}</dd>
					</div>
				) : null}
				{!o.taxesIncluded && o.totalTax > 0 ? (
					<div className="flex justify-between">
						<dt className="text-muted">Tax</dt>
						<dd className="font-mono">{formatPrice(o.totalTax, cur)}</dd>
					</div>
				) : null}
				<div className="flex justify-between border-t border-line pt-2">
					<dt className="font-semibold uppercase">Total</dt>
					<dd className="font-display font-bold text-3xl">{formatPrice(o.total, cur)}</dd>
				</div>
			</dl>
		</div>
	);
}
