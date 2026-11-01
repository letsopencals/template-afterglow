import type { PaymentInstructions } from '@opencals/storefront-sdk';
import { safeInvoiceUrl } from '@/lib/booking-state';
import { longDayLabel, timeLabel } from '@/lib/when';
import { buttonClasses } from '@/components/ui/button';

/**
 * "How to pay" on the call sheet, for bookings placed with a manual method:
 * the hosted invoice link, the bank details or a pay-at-the-desk note, and the
 * deadline. Without instructions (the page was opened on another device) it
 * points to the email, which carries the same details.
 */
export function PaymentNote({ instructions, orderName }: { instructions: PaymentInstructions | null; orderName: string | null }) {
	if (!instructions) {
		return (
			<section className="rounded-[14px] border border-dashed border-pink/60 bg-white px-5 py-4">
				<p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-pink">Payment</p>
				<p className="mt-1 text-[0.95rem]">Check your email for the payment details. Your spots are confirmed once it&rsquo;s paid.</p>
			</section>
		);
	}
	const invoice = safeInvoiceUrl(instructions.hostedInvoiceUrl);
	const bank = instructions.bankDetails;
	const due = instructions.dueAt ? `${longDayLabel(instructions.dueAt)}, ${timeLabel(instructions.dueAt)}` : null;
	const rows: Array<[string, string]> = bank
		? ([
				['Account name', bank.accountName],
				['Bank', bank.bankName],
				['IBAN / account', bank.iban],
				['SWIFT / BIC', bank.swift],
				['Reference', orderName],
			].filter((r): r is [string, string] => Boolean(r[1])))
		: [];
	const isInvoice = instructions.provider === 'stripe_invoice';
	const isDesk = instructions.provider === 'cash';
	return (
		<section className="rounded-[14px] border border-dashed border-pink/60 bg-white px-5 py-5">
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-pink">{isInvoice ? 'Invoice' : isDesk ? 'Pay at the desk' : bank ? 'Bank transfer' : 'Payment'}</p>
				{due ? <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-2">Pay by {due}</p> : null}
			</div>
			<p className="mt-2 text-[0.95rem] text-ink-2">
				{isInvoice
					? invoice
						? 'Pay the invoice online, by card or bank. The sheet is final once it’s paid.'
						: 'Your invoice is on its way to your email. Pay it there; the sheet is final once it’s paid.'
					: isDesk
						? 'Pay by card or phone at the desk when you arrive.'
						: bank
							? 'Send the total to this account with the reference, so the desk can match it.'
							: 'Your email has the payment details.'}
				{due && !isDesk ? ' Unpaid bookings are released after the deadline.' : ''}
			</p>
			{rows.length ? (
				<dl className="mt-4 grid grid-cols-[8.5rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[0.92rem]">
					{rows.map(([k, v]) => (
						<div key={k} className="contents">
							<dt className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted">{k}</dt>
							<dd className="break-all font-mono">{v}</dd>
						</div>
					))}
				</dl>
			) : null}
			{invoice ? (
				<a href={invoice} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: 'glow', className: 'mt-4' })}>
					Pay invoice
				</a>
			) : null}
		</section>
	);
}
