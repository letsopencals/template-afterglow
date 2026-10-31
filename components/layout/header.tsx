'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { clsx } from 'clsx';
import { useCart } from '@/contexts/cart-context';
import { useShotListUi } from '@/contexts/shot-list-ui-context';
import { Logo } from '@/components/frame/logo';
import { GreaseUnderline } from '@/components/frame/grease';
import { Overlay, CloseButton } from '@/components/ui/overlay';
import { ShotListDrawer } from '@/components/shotlist/shot-list-drawer';
import { siteConfig } from '@/lib/site-config';

/** A tiny film frame with the session count; it ticks and flashes on every add. */
function ShotListButton() {
	const { cart } = useCart();
	const { setOpen, flashKey } = useShotListUi();
	const count = cart?.items?.length ?? 0;
	return (
		<button
			type="button"
			onClick={() => setOpen(true)}
			className="relative flex h-10 items-center gap-2.5 overflow-hidden rounded-[12px] bg-night pl-3 pr-3.5 text-cream transition-colors hover:bg-night-2"
			aria-label={count ? `Open your shot list, ${count} ${count === 1 ? 'session' : 'sessions'}` : 'Open your shot list'}
		>
			<svg aria-hidden viewBox="0 0 22 16" className="h-4 w-[1.35rem]" fill="none">
				<rect x="1" y="1" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
				<path d="M1 4.5h20M1 11.5h20" stroke="currentColor" strokeWidth="1.2" />
				<path d="M4 2.6v.6M8 2.6v.6M12 2.6v.6M16 2.6v.6M4 12.8v.6M8 12.8v.6M12 12.8v.6M16 12.8v.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
			</svg>
			<span className="text-[0.9rem] font-medium max-sm:hidden">Shot list</span>
			<span key={flashKey} className={clsx('flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[0.7rem] font-semibold', count ? 'afterglow count-tick text-white' : 'bg-cream/15')}>
				{count}
			</span>
			{flashKey ? <span key={`f${flashKey}`} aria-hidden className="shutter-flash pointer-events-none absolute inset-0 bg-white" /> : null}
		</button>
	);
}

/** The cream top bar: wordmark, nav, sign in / your roll, and the Shot list. */
export function Header() {
	const pathname = usePathname();
	const { status } = useSession();
	const [menu, setMenu] = useState(false);
	const signedIn = status === 'authenticated';
	return (
		<>
			<header className="sticky top-0 z-50 border-b border-line/70 bg-cream/92 backdrop-blur-md">
				<div className="container-x flex h-16 items-center gap-4">
					<Link href="/" className="shrink-0" aria-label="Afterglow home">
						<Logo />
					</Link>
					<nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
						{siteConfig.nav.map((n) => {
							const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
							return (
								<Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined} className={clsx('relative px-3 py-2 text-[0.95rem] transition-colors', active ? 'font-medium text-ink' : 'text-ink-2 hover:text-ink')}>
									{n.label}
									{active ? <GreaseUnderline className="absolute inset-x-2 -bottom-0.5 h-2" /> : null}
								</Link>
							);
						})}
					</nav>
					<div className="ml-auto flex items-center gap-2">
						<Link href="/glow-pass" className="hidden items-center gap-2 px-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted hover:text-ink xl:flex">
							<span aria-hidden className="afterglow h-1.5 w-1.5 rounded-full" />
							Glow Pass · soon
						</Link>
						<Link href={signedIn ? '/account' : '/login'} className="hidden h-10 items-center whitespace-nowrap px-2.5 text-[0.95rem] text-ink-2 hover:text-ink sm:flex">
							{signedIn ? 'Your roll' : 'Sign in'}
						</Link>
						<ShotListButton />
						<button type="button" onClick={() => setMenu(true)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-2 lg:hidden" aria-label="Open menu">
							<svg aria-hidden viewBox="0 0 20 14" className="h-3.5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
								<path d="M1 1.5h18M1 7h12M1 12.5h18" />
							</svg>
						</button>
					</div>
				</div>
			</header>
			<Overlay open={menu} onClose={() => setMenu(false)} kind="drawer" label="Menu">
				<div className="flex items-center justify-between px-5 pt-3">
					<Logo />
					<CloseButton onClick={() => setMenu(false)} />
				</div>
				<nav aria-label="Menu" className="mt-6 flex flex-col px-5">
					{[...siteConfig.nav, { label: 'Glow Pass', href: '/glow-pass' }, { label: signedIn ? 'Your roll' : 'Sign in', href: signedIn ? '/account' : '/login' }].map((n, i) => (
						<Link key={n.href} href={n.href} onClick={() => setMenu(false)} className="flex items-baseline gap-4 border-b border-line py-3.5">
							<span className="font-mono text-[0.7rem] text-muted">{String(i + 1).padStart(2, '0')}</span>
							<span className="font-display text-[2rem] font-bold leading-none">{n.label}</span>
						</Link>
					))}
				</nav>
				<p className="mt-auto px-5 pb-6 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted">{siteConfig.contact.instagramHandle}</p>
			</Overlay>
			<ShotListDrawer />
		</>
	);
}
