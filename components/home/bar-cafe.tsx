import Link from 'next/link';
import { Slate } from '@/components/frame/slate';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';

export interface MenuItem {
	id: string;
	title: string;
	price: number;
	description: string | null;
}

/** The Afterglow Bar and the café: photo, the menu from the store's add-ons, book a table. */
export function BarCafe({ menu }: { menu: MenuItem[] }) {
	return (
		<section className="container-x grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-12">
			<div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-night lg:col-span-6">
				<span className="image-placeholder absolute inset-0" />
				<SafeImage src={siteConfig.media.bar} alt="The Afterglow Bar" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
			</div>
			<div className="lg:col-span-6">
				<Slate scene={6} label="The bar & café" title="After class, the bar" intro="Matcha, açaí and mocktails on the corner of Collins, and the café by the roll-up door in Wynwood. Add a drink to any booking, or keep a table." />
				<ul className="mt-8 divide-y divide-dashed divide-line border-y border-dashed border-line">
					{menu.map((m) => (
						<li key={m.id} className="flex items-baseline justify-between gap-4 py-3">
							<span>
								<span className="font-medium">{m.title}</span>
								{m.description ? <span className="mt-0.5 block text-sm text-muted">{m.description}</span> : null}
							</span>
							<span className="font-mono text-sm">{formatPrice(m.price)}</span>
						</li>
					))}
				</ul>
				<div className="mt-8 flex flex-wrap gap-3">
					<Link href="/bar#book" className={buttonClasses({ variant: 'shutter', size: 'lg' })}>
						Book a table
					</Link>
					<Link href="/bar#events" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
						Events at the bar
					</Link>
				</div>
			</div>
		</section>
	);
}
