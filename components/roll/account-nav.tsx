'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { signOut, useSession } from 'next-auth/react';
import { GreaseUnderline } from '@/components/frame/grease';

const TABS = [
	{ href: '/account', label: 'Your roll', match: (p: string) => p === '/account' || p.startsWith('/account/appointments') },
	{ href: '/account/orders', label: 'Orders', match: (p: string) => p.startsWith('/account/orders') },
	{ href: '/account/settings', label: 'Settings', match: (p: string) => p.startsWith('/account/settings') },
] as const;

/** Account tabs with a grease-pencil underline, and sign out. */
export function AccountNav() {
	const pathname = usePathname();
	const { data: session } = useSession();
	const name = session?.customer?.firstName ?? null;
	return (
		<div className="border-b border-line">
			<div className="container-x flex flex-wrap items-end justify-between gap-x-6 gap-y-2 pt-6">
				<nav aria-label="Account" className="no-scrollbar flex gap-2 overflow-x-auto">
					{TABS.map((t) => {
						const active = t.match(pathname);
						return (
							<Link key={t.href} href={t.href} aria-current={active ? 'page' : undefined} className={clsx('relative whitespace-nowrap px-3 pb-3 pt-2 text-[1rem]', active ? 'font-medium text-ink' : 'text-muted hover:text-ink')}>
								{t.label}
								{active ? <GreaseUnderline className="absolute inset-x-2 bottom-0.5 h-2" /> : null}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-4 pb-3 text-sm text-muted">
					{name ? <span className="max-sm:hidden">Signed in as {name}</span> : null}
					<button type="button" onClick={() => void signOut({ callbackUrl: '/' })} className="text-ink underline underline-offset-4">
						Sign out
					</button>
				</div>
			</div>
		</div>
	);
}
