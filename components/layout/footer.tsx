import Link from 'next/link';
import { Logo } from '@/components/frame/logo';
import { FilmEdge } from '@/components/frame/film-edge';
import { siteConfig } from '@/lib/site-config';

export interface FooterSite {
	key: string;
	name: string;
	address: string;
	hours: string;
}

/** Night footer: the wordmark, both sites with hours, links and the handle. */
export function Footer({ email, phone, sites }: { email: string; phone: string; sites: FooterSite[] }) {
	return (
		<footer className="bg-night text-cream">
			<FilmEdge code="AFTERGLOW 400 · END OF ROLL" />
			<div className="container-x grid gap-10 py-14 md:grid-cols-12">
				<div className="md:col-span-4">
					<Logo tone="light" className="!h-7" />
					<p className="mt-5 max-w-xs font-display text-2xl font-bold leading-tight">
						You train.
						<br />
						<span className="afterglow-text">We shoot.</span>
					</p>
					<p className="mt-5 text-sm text-cream/60">
						<a href={`mailto:${email}`} className="hover:text-cream">
							{email}
						</a>
						<br />
						<a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="hover:text-cream">
							{phone}
						</a>
					</p>
				</div>
				<div className="grid gap-8 sm:grid-cols-2 md:col-span-5">
					{sites.map((s) => (
						<div key={s.key}>
							<p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#f4a93b]">Location</p>
							<Link href={`/sites/${s.key}`} className="mt-2 block font-display text-xl font-bold hover:underline">
								{s.name}
							</Link>
							<p className="mt-1.5 text-sm text-cream/65">{s.address}</p>
							<p className="mt-1 text-sm text-cream/45">{s.hours}</p>
						</div>
					))}
				</div>
				<nav aria-label="Footer" className="md:col-span-3">
					<ul className="space-y-2 text-[0.95rem]">
						{[...siteConfig.nav, ...siteConfig.footerNav].map((n) => (
							<li key={n.href}>
								<Link href={n.href} className="text-cream/70 hover:text-cream">
									{n.label}
								</Link>
							</li>
						))}
					</ul>
					<a href={siteConfig.contact.instagram} className="mt-6 inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-cream/70 hover:text-cream">
						<span aria-hidden className="afterglow h-2 w-2 rounded-full" />
						{siteConfig.contact.instagramHandle}
					</a>
				</nav>
			</div>
			<div className="container-x flex flex-wrap justify-between gap-3 border-t border-line-night py-5 text-xs text-cream/40">
				<p>
					© {new Date().getFullYear()} {siteConfig.name}. Bookings by{' '}
					<a href="https://opencals.com" className="underline underline-offset-2 hover:text-cream">
						Opencals
					</a>
					.
				</p>
				<p>Open-source template · Miami, FL</p>
			</div>
		</footer>
	);
}
