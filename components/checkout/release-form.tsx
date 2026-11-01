'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { clsx } from 'clsx';
import type { CheckoutQuestionResponse as CheckoutQuestion, CustomerProviderCatalogItem, PaymentProviderName } from '@opencals/storefront-sdk';
import { useCheckout } from '@/contexts/checkout-context';
import { useCart } from '@/contexts/cart-context';
import { useSettings } from '@/contexts/settings-context';
import { framesFor, shotCount } from '@/lib/shot-list';
import { formatPrice } from '@/lib/format';
import { siteConfig, toneHex } from '@/lib/site-config';
import { dayLabel, timeLabel } from '@/lib/when';
import { FilmEdge } from '@/components/frame/film-edge';
import { GreaseUnderline } from '@/components/frame/grease';
import { FrameCard } from '@/components/shotlist/frame';
import { Totals } from '@/components/shotlist/totals';
import { PromoCode } from '@/components/shotlist/promo-code';
import { HoldTimer } from '@/components/shotlist/hold-timer';
import { SafeImage } from '@/components/ui/safe-image';
import { Button, buttonClasses } from '@/components/ui/button';
import { FieldLabel, Input, Select, Textarea } from '@/components/ui/input';

const StripePayment = dynamic(() => import('@/components/checkout/stripe-payment').then((m) => m.StripePayment), {
	ssr: false,
	loading: () => <div className="h-56 animate-pulse rounded-[12px] bg-cream-2" aria-busy="true" aria-label="Loading secure payment form" />,
});

function Clause({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
	return (
		<section className="grid gap-4 border-t border-line pt-6 sm:grid-cols-[4rem_1fr]">
			<p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">§ {n}</p>
			<div>
				<h2 className="font-display text-2xl font-bold">{title}</h2>
				<div className="mt-4">{children}</div>
			</div>
		</section>
	);
}

/** A question as the release form asks it: big options for short lists, a checkbox for the waiver, fields otherwise. */
function QuestionField({ q, value, onChange }: { q: CheckoutQuestion; value: string; onChange: (v: string) => void }) {
	const t = q.translations?.[0];
	const title = t?.title ?? q.internalName;
	const id = `q-${q.id}`;
	const options = (t?.options as string[] | null | undefined) ?? null;
	if (q.type === 'checkbox') {
		return (
			<label htmlFor={id} className={clsx('flex cursor-pointer gap-3 rounded-[12px] border p-4 transition-colors', value === 'true' ? 'border-night bg-white' : 'border-line bg-white hover:border-ink/40')}>
				<input id={id} type="checkbox" required={q.required} checked={value === 'true'} onChange={(e) => onChange(e.target.checked ? 'true' : '')} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-pink)]" />
				<span>
					<span className="block font-medium leading-snug">
						{title}
						{q.required ? <span className="text-pink"> *</span> : null}
					</span>
					{t?.description ? <span className="mt-1 block text-sm text-muted">{t.description}</span> : null}
				</span>
			</label>
		);
	}
	if (q.type === 'file-upload' || q.type === 'rating') return null;
	if (q.type === 'dropdown' && options && options.length <= 3) {
		return (
			<fieldset>
				<legend className="mb-2 text-[0.95rem] font-medium">
					{title}
					{q.required ? <span className="text-pink"> *</span> : null}
				</legend>
				{t?.description ? <p className="-mt-1 mb-3 text-sm text-muted">{t.description}</p> : null}
				<div className="grid gap-2 sm:grid-cols-3">
					{options.map((o, i) => {
						const on = value === o;
						return (
							<label key={o} className={clsx('relative flex cursor-pointer flex-col gap-1 rounded-[12px] border p-3.5 text-[0.92rem] transition-colors', on ? 'border-pink bg-white shadow-[0_8px_24px_-16px_rgba(255,94,138,0.9)]' : 'border-line bg-white hover:border-ink/40')}>
								<input type="radio" name={id} value={o} required={q.required} checked={on} onChange={() => onChange(o)} className="sr-only" />
								<span aria-hidden className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">Option {String.fromCharCode(65 + i)}</span>
								<span className="font-medium leading-snug">{o}</span>
							</label>
						);
					})}
				</div>
			</fieldset>
		);
	}
	const isHandle = /instagram|handle/i.test(title);
	return (
		<div>
			<FieldLabel htmlFor={id} required={q.required}>
				{title}
			</FieldLabel>
			{t?.description ? <p className="-mt-0.5 mb-2 text-xs text-muted">{t.description}</p> : null}
			{q.type === 'dropdown' && options ? (
				<Select id={id} required={q.required} value={value} onChange={(e) => onChange(e.target.value)}>
					<option value="">Choose…</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</Select>
			) : q.type === 'multi-line-text-field' ? (
				<Textarea id={id} required={q.required} value={value} onChange={(e) => onChange(e.target.value)} />
			) : isHandle ? (
				<div className="relative">
					<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">@</span>
					<Input id={id} required={q.required} value={value.replace(/^@/, '')} onChange={(e) => onChange(e.target.value ? `@${e.target.value.replace(/^@/, '')}` : '')} className="pl-8" autoComplete="off" />
				</div>
			) : (
				<Input id={id} required={q.required} value={value} onChange={(e) => onChange(e.target.value)} />
			)}
		</div>
	);
}

function methodCopy(p: CustomerProviderCatalogItem): { title: string; body: string; action: string } {
	switch (p.name) {
		case 'stripe':
			return { title: 'Card, Apple Pay or Google Pay', body: 'Pay now, securely through Stripe.', action: 'Continue to card' };
		case 'cash':
			return { title: 'Pay at the desk', body: 'Your spots are held. Pay by card or phone when you arrive.', action: 'Confirm, pay at the desk' };
		case 'bank_transfer':
			return { title: 'Bank transfer', body: 'The account details show on your call sheet and in the email.', action: 'Book, pay by transfer' };
		case 'stripe_invoice':
			return { title: 'Pay by invoice', body: 'We email an invoice you pay online, by card or bank.', action: 'Book, send the invoice' };
		case 'no_payment_required':
			return { title: 'Nothing to pay', body: 'This one is on us.', action: 'Confirm booking' };
		default:
			// A provider this template doesn't know yet: the store's own name and description for it.
			return {
				title: p.displayName || 'Another way to pay',
				body: p.description ?? '',
				action: p.checkoutMode === 'internal' || p.checkoutMode === 'redirect' ? 'Continue to payment' : 'Book',
			};
	}
}

/**
 * Checkout as a release form: the shot list as a film strip on top, one
 * document with "The talent" and "The release" signed together, then payment.
 */
export function ReleaseForm() {
	const c = useCheckout();
	const { cart, removeItem } = useCart();
	const { currency } = useSettings();
	const [method, setMethod] = useState<PaymentProviderName | undefined>(undefined);
	const frames = useMemo(() => framesFor(c.items), [c.items]);
	const shots = shotCount(frames);
	const signed = c.step === 'payment-select' || c.step === 'payment';
	const total = cart ? formatPrice(cart.total, currency) : '';
	const chosen = method ?? (c.providers.length === 1 ? c.providers[0]?.name : undefined);
	const questions = useMemo(() => [...c.questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [c.questions]);
	const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
	const consentQ = questions.find((q) => /post|consent|tag/i.test(q.translations?.[0]?.title ?? q.internalName));
	const consent = consentQ ? c.answers[consentQ.id] : undefined;

	if (!cart || frames.length === 0) {
		return (
			<div className="container-x py-24">
				<p className="font-display text-4xl font-bold">The sheet is blank</p>
				<p className="mt-3 text-ink-2">Add a class or a shoot to your shot list first.</p>
				<Link href="/schedule" className={buttonClasses({ variant: 'shutter', className: 'mt-6' })}>
					Today&rsquo;s call times
				</Link>
			</div>
		);
	}

	return (
		<div className="pb-24">
			{/* The shot list as a film strip */}
			<section className="bg-night text-cream">
				<FilmEdge code={`AFTERGLOW 400 · ${frames.length} ${frames.length === 1 ? 'FRAME' : 'FRAMES'} · ${shots} ${shots === 1 ? 'SHOT' : 'SHOTS'} CIRCLED`} />
				<div className="container-x flex flex-wrap items-end gap-x-10 gap-y-6 py-8">
					<div className="min-w-0 flex-1">
						<p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-cream/60">Checkout</p>
						<h1 className="mt-1 font-display text-4xl font-extrabold sm:text-5xl">Sign the release</h1>
						<ul className="no-scrollbar -mx-4 mt-6 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
							{frames.map((f) => (
								<li key={f.key} className="w-40 shrink-0">
									<div className="relative aspect-[4/5] overflow-hidden rounded-[8px] bg-night-2">
										<span className="image-placeholder-night absolute inset-0" />
										<SafeImage src={f.image} alt="" fill sizes="160px" className="object-cover opacity-85" />
										<span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: toneHex(f.tone) }} />
										<span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2.5 pb-2 pt-8">
											<span className="block font-display text-[0.95rem] font-bold leading-tight">{f.title}</span>
											<span className="block font-mono text-[0.62rem] text-white/75">
												{dayLabel(f.from)} · {timeLabel(f.from)}
											</span>
										</span>
									</div>
									<p className="mt-1.5 font-mono text-[0.6rem] tracking-[0.16em] text-[#f4a93b]">
										{String(f.n).padStart(2, '0')} ▸ {f.shots.length ? `${f.shots.length} ${f.shots.length === 1 ? 'shot' : 'shots'}` : 'no shots'}
									</p>
								</li>
							))}
						</ul>
					</div>
					<div className="w-full max-w-xs rounded-[14px] bg-cream p-4 text-ink sm:w-80">
						<Totals cart={cart} currency={currency} />
					</div>
				</div>
			</section>
			<HoldTimer seconds={c.timeRemaining} onExtend={c.extendCart} className="!bg-night-2" />

			<div className="container-x mt-10 grid gap-12 lg:grid-cols-12">
				<div className="min-w-0 lg:col-span-8">
					<div className="paper-grain rounded-[20px] border border-line p-5 shadow-[0_30px_60px_-40px_rgba(18,14,26,0.35)] sm:p-10">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div>
								<p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">Afterglow · talent release</p>
								<p className="mt-1 font-display text-3xl font-bold">Release form</p>
							</div>
							<p className="text-right font-mono text-[0.7rem] uppercase leading-relaxed tracking-[0.14em] text-muted">
								{frames.length} {frames.length === 1 ? 'session' : 'sessions'}
								<br />
								{shots} {shots === 1 ? 'shot' : 'shots'} for the crew
							</p>
						</div>

						{signed ? (
							<div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-dashed border-pink/60 bg-white px-5 py-4">
								<div>
									<p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-pink">Signed</p>
									<p className="mt-1 font-display text-2xl font-bold italic">{name || c.email}</p>
									<p className="text-sm text-muted">
										{c.email}
										{consent ? ` · ${consent}` : ''}
									</p>
								</div>
								<button type="button" onClick={() => c.setStep('customer')} className="text-sm underline underline-offset-4">
									Edit
								</button>
							</div>
						) : (
							<form onSubmit={c.handleSign} className="mt-8 space-y-8">
								<Clause n="1" title="The talent">
									<div className="grid gap-4 sm:grid-cols-2">
										<div>
											<FieldLabel htmlFor="first" required>
												First name
											</FieldLabel>
											<Input id="first" autoComplete="given-name" required value={c.firstName} onChange={(e) => c.setFirstName(e.target.value)} />
										</div>
										<div>
											<FieldLabel htmlFor="last">Last name</FieldLabel>
											<Input id="last" autoComplete="family-name" value={c.lastName} onChange={(e) => c.setLastName(e.target.value)} />
										</div>
										<div className="sm:col-span-2">
											<FieldLabel htmlFor="email" required hint="Your booking, sign-in code and edits go here">
												Email
											</FieldLabel>
											<Input id="email" type="email" autoComplete="email" required value={c.email} onChange={(e) => c.setEmail(e.target.value)} disabled={Boolean(c.customerId)} />
										</div>
									</div>
								</Clause>
								{questions.some((q) => q.type !== 'file-upload' && q.type !== 'rating') ? (
									<Clause n="2" title="The release">
										<p className="-mt-1 mb-5 text-[0.95rem] text-ink-2">How we use the shots is your call. The crew only posts what you say yes to, and your edits are yours either way.</p>
										<div className="space-y-6">
											{questions.map((q) => (
												<QuestionField key={q.id} q={q} value={c.answers[q.id] ?? ''} onChange={(v) => c.setAnswers((a) => ({ ...a, [q.id]: v }))} />
											))}
										</div>
									</Clause>
								) : null}
								<div className="border-t border-line pt-6">
									<div className="flex flex-wrap items-end justify-between gap-6">
										<div className="min-w-0">
											<p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-muted">Signature</p>
											<p className="relative mt-1 min-h-10 font-display text-3xl font-bold italic">
												{name || <span className="text-dim">Your name</span>}
												<GreaseUnderline className="absolute -bottom-1 left-0 h-3 w-full" />
											</p>
										</div>
										<Button type="submit" variant="glow" size="lg" loading={c.submitting} disabled={c.isExpired}>
											Sign & continue
										</Button>
									</div>
								</div>
							</form>
						)}

						{signed ? (
							<section className="mt-10 border-t border-line pt-6">
								<p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted">§ 3</p>
								<h2 className="font-display text-2xl font-bold">Payment</h2>
								<div className="mt-5">
									{c.step === 'payment' && c.paymentData ? (
										c.paymentData.clientSecret && c.providers.find((p) => p.name === c.paymentData?.provider)?.checkoutMode !== 'manual' ? (
											<StripePayment
												clientSecret={c.paymentData.clientSecret}
												stripeAccountId={c.paymentData.stripeAccountId}
												publishableKey={c.paymentData.publishableKey}
												onSuccess={(id) => void c.handleSubmitCheckout(id)}
												onError={(m) => c.setError(m)}
												disabled={c.isExpired || c.submitting}
												payLabel={total}
												fallback={
													c.providers.some((p) => p.name === 'cash') ? (
														<Button variant="outline" className="mt-4" onClick={() => void c.handleStartCheckout('cash')}>
															Confirm, pay at the desk
														</Button>
													) : null
												}
											/>
										) : (
											<Button variant="glow" size="lg" loading={c.submitting} disabled={c.isExpired} onClick={() => void c.handleSubmitCheckout()}>
												Confirm booking
											</Button>
										)
									) : c.providers.length === 0 ? (
										<p className="text-muted">Online payment isn&rsquo;t open right now. Call the desk and we&rsquo;ll book you in.</p>
									) : (
										<form
											onSubmit={(e) => {
												e.preventDefault();
												if (chosen) void c.handleStartCheckout(chosen);
											}}
											className="space-y-3"
										>
											<fieldset className="grid gap-2 sm:grid-cols-2">
												<legend className="sr-only">Payment method</legend>
												{c.providers.map((p) => {
													const copy = methodCopy(p);
													const on = chosen === p.name;
													return (
														<label key={p.name} className={clsx('flex cursor-pointer items-start gap-3 rounded-[12px] border bg-white p-4 transition-colors', on ? 'border-night' : 'border-line hover:border-ink/40')}>
															<input type="radio" name="method" value={p.name} checked={on} onChange={() => setMethod(p.name)} className="mt-1 h-4 w-4 accent-[var(--color-pink)]" />
															<span>
																<span className="block font-medium">{copy.title}</span>
																<span className="block text-sm text-muted">{copy.body}</span>
															</span>
														</label>
													);
												})}
											</fieldset>
											<Button type="submit" variant="glow" size="lg" fullWidth loading={c.submitting} disabled={!chosen || c.isExpired}>
												{chosen ? methodCopy(c.providers.find((p) => p.name === chosen)!).action : 'Choose how to pay'} · {total}
											</Button>
										</form>
									)}
								</div>
							</section>
						) : null}
						{c.error ? (
							<div role="alert" className="mt-6 rounded-[10px] border-l-4 border-danger bg-white px-4 py-3 text-sm text-danger">
								<p>{c.error}</p>
								{c.errorCode === 'CART_EXPIRED' ? (
									<Button variant="shutter" size="sm" className="mt-3" onClick={c.restartFromSchedule}>
										Pick a new time
									</Button>
								) : null}
							</div>
						) : null}
					</div>
				</div>

				<aside className="min-w-0 lg:col-span-4">
					<p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">The contact sheet</p>
					<ul className="mt-2 divide-y divide-line">
						{frames.map((f) => (
							<FrameCard key={f.key} frame={f} currency={currency} compact onRemove={signed ? undefined : () => void removeItem(f.key)} />
						))}
					</ul>
					<div className="mt-3 border-t border-line pt-4">
						<PromoCode className="mb-3" />
					</div>
					<p className="mt-4 text-xs text-muted">Free to move or cancel up to {siteConfig.policies.changeHours} hours before each session, from Your roll.</p>
				</aside>
			</div>
		</div>
	);
}
