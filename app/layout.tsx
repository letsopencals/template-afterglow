import type { Metadata, Viewport } from 'next';
import { Fragment_Mono, Outfit, Syne } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Providers } from '@/components/providers';
import { siteConfig } from '@/lib/site-config';
import { storeContact } from '@/lib/contact';
import { physicalSites } from '@/lib/catalog';
import { getCatalog, getLocations, getStoreSettings, storeImages } from '@/lib/server-data';
import './globals.css';

const syne = Syne({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-syne', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-outfit', display: 'swap' });
const fragment = Fragment_Mono({ subsets: ['latin'], weight: ['400'], variable: '--font-fragment', display: 'swap' });

const title = `${siteConfig.name} | Content gym in Miami: you train, we shoot`;

export const metadata: Metadata = {
	title: { default: title, template: `%s | ${siteConfig.name}` },
	description: siteConfig.description,
	metadataBase: new URL(siteConfig.url),
	applicationName: siteConfig.name,
	keywords: ['boutique gym Miami', 'rhythm cycling Wynwood', 'glute class South Beach', 'fitness photographer Miami', 'rooftop yoga Miami Beach', 'boxing class Wynwood', 'gym photoshoot Miami'],
	openGraph: { title, description: siteConfig.description, siteName: siteConfig.name, locale: siteConfig.locale, type: 'website' },
	twitter: { card: 'summary_large_image', title, description: siteConfig.description },
	robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: '#FFF4EA', colorScheme: 'light' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const [initialSettings, catalog, locations] = await Promise.all([getStoreSettings(), getCatalog(), getLocations()]);
	const { logo, banner } = storeImages(initialSettings);
	const { email, phone } = storeContact(initialSettings);
	const sites = physicalSites(catalog);
	const physical = locations.filter((l) => l.type === siteConfig.locationTypes.physical);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': ['ExerciseGym', 'HealthClub'],
		name: initialSettings?.name || siteConfig.name,
		description: siteConfig.description,
		url: siteConfig.url,
		...(logo ? { logo } : {}),
		...(banner ? { image: banner } : {}),
		telephone: phone,
		email,
		sameAs: [siteConfig.contact.instagram],
		location: physical.map((l) => ({
			'@type': 'ExerciseGym',
			name: l.title,
			url: `${siteConfig.url}/sites/${sites.find((s) => s.id === l.id)?.key ?? l.slug}`,
			address: {
				'@type': 'PostalAddress',
				streetAddress: [l.addressLine1, l.addressLine2].filter(Boolean).join(', '),
				addressLocality: l.city,
				addressRegion: l.state,
				postalCode: l.postalCode,
				addressCountry: l.country,
			},
			...(l.latitude && l.longitude ? { geo: { '@type': 'GeoCoordinates', latitude: l.latitude, longitude: l.longitude } } : {}),
		})),
	};

	return (
		<html lang="en-US" className={`${syne.variable} ${outfit.variable} ${fragment.variable}`}>
			<body>
				<Providers initialSettings={initialSettings}>
					<a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded-[10px] focus:bg-night focus:px-3 focus:py-2 focus:text-cream">
						Skip to content
					</a>
					<Header />
					<main id="main">{children}</main>
					<Footer email={email} phone={phone} sites={sites.map((s) => ({ key: s.key, name: s.name, address: s.address, hours: s.meta?.hours ?? '' }))} />
				</Providers>
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
			</body>
		</html>
	);
}
