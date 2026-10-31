'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { useShotListUi } from '@/contexts/shot-list-ui-context';
import { useSettings } from '@/contexts/settings-context';
import { Overlay, CloseButton } from '@/components/ui/overlay';
import { buttonClasses, ShutterDot } from '@/components/ui/button';
import { FilmEdge } from '@/components/frame/film-edge';
import { FrameCard } from '@/components/shotlist/frame';
import { Totals } from '@/components/shotlist/totals';
import { PromoCode } from '@/components/shotlist/promo-code';
import { HoldTimer } from '@/components/shotlist/hold-timer';
import { framesFor, shotCount, type CartItemLike } from '@/lib/shot-list';

/** The Shot List: the cart as a contact sheet. */
export function ShotListDrawer() {
	const { open, setOpen } = useShotListUi();
	const { cart, removeItem, timeRemaining, extendCart } = useCart();
	const { currency } = useSettings();
	const [removing, setRemoving] = useState<string | null>(null);
	const frames = useMemo(() => framesFor((cart?.items ?? []) as unknown as CartItemLike[]), [cart?.items]);
	const shots = shotCount(frames);
	const close = () => setOpen(false);
	return (
		<Overlay open={open} onClose={close} kind="drawer" label="Your shot list">
			<FilmEdge code={`AFTERGLOW 400 · CONTACT SHEET · ${frames.length} ${frames.length === 1 ? 'FRAME' : 'FRAMES'}`} />
			<div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
				<div>
					<p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">Your shot list</p>
					<p className="mt-1 font-display text-[1.9rem] font-bold leading-none">
						{frames.length ? `${frames.length} ${frames.length === 1 ? 'session' : 'sessions'}` : 'Nothing yet'}
					</p>
					{frames.length ? <p className="mt-1.5 text-sm text-muted">{shots ? `${shots} ${shots === 1 ? 'shot' : 'shots'} circled for the crew` : 'No shots circled yet'}</p> : null}
				</div>
				<CloseButton onClick={close} />
			</div>
			<HoldTimer seconds={frames.length ? timeRemaining : null} onExtend={extendCart} />
			<div className="flex-1 overflow-y-auto bg-cream-2/60 px-5">
				{frames.length === 0 ? (
					<div className="py-10">
						<p className="font-display text-2xl font-bold">The sheet is blank</p>
						<p className="mt-2 text-ink-2">Pick a class on the schedule and circle the shots you want, or book a session with the crew.</p>
						<div className="mt-6 flex flex-wrap gap-2">
							<Link href="/schedule" onClick={close} className={buttonClasses({ variant: 'shutter' })}>
								<ShutterDot />
								Today&rsquo;s call times
							</Link>
							<Link href="/shoots" onClick={close} className={buttonClasses({ variant: 'outline' })}>
								Book a shoot
							</Link>
						</div>
					</div>
				) : (
					<ul className="divide-y divide-line">
						{frames.map((f) => (
							<FrameCard
								key={f.key}
								frame={f}
								currency={currency}
								removing={removing === f.key}
								onRemove={async () => {
									setRemoving(f.key);
									try {
										await removeItem(f.key);
									} finally {
										setRemoving(null);
									}
								}}
							/>
						))}
					</ul>
				)}
			</div>
			{cart && frames.length ? (
				<div className="border-t border-line bg-cream px-5 pb-5 pt-4">
					<PromoCode className="mb-3" />
					<Totals cart={cart} currency={currency} />
					<Link href="/checkout" onClick={close} className={buttonClasses({ variant: 'glow', size: 'lg', fullWidth: true, className: 'mt-4' })}>
						Sign the release · {frames.length} {frames.length === 1 ? 'session' : 'sessions'}
					</Link>
				</div>
			) : null}
		</Overlay>
	);
}
