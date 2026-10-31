import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';
import { physicalSites } from '@/lib/catalog';
import { getCatalog } from '@/lib/server-data';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteConfig.url;
	const now = new Date();
	const entry = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly') => ({
		url: `${base}${path}`,
		lastModified: now,
		changeFrequency,
		priority,
	});

	const catalog = await getCatalog();

	return [
		entry('', 1),
		entry('/schedule', 0.95, 'daily'),
		entry('/shoots', 0.9),
		entry('/coaching', 0.9),
		entry('/glow', 0.85),
		entry('/bar', 0.8, 'daily'),
		entry('/crew', 0.8),
		entry('/glow-pass', 0.6),
		...catalog.classes.map((c) => entry(`/classes/${c.key}`, 0.8)),
		...physicalSites(catalog).map((s) => entry(`/sites/${s.key}`, 0.8)),
	];
}
