import { Hero } from '@/components/home/hero';
import { StoryRings } from '@/components/stories/story-rings';
import { Promise as PromiseSection } from '@/components/home/promise';
import { CallTimes } from '@/components/home/call-times';
import { SetsSheet } from '@/components/home/sets-sheet';
import { ShootsTeaser } from '@/components/home/shoots-teaser';
import { CrewStrip } from '@/components/home/crew-strip';
import { BarCafe, type MenuItem } from '@/components/home/bar-cafe';
import { PassBand } from '@/components/home/pass-band';
import { SitesPair } from '@/components/home/sites-pair';
import { physicalSites, servicesIn } from '@/lib/catalog';
import { getAddOnsForProduct, getCatalog, getTimetable } from '@/lib/server-data';
import { shotMeta, siteConfig } from '@/lib/site-config';

export const revalidate = 60;

const DRINK = /matcha|açaí|acai|mocktail|smoothie|coffee|bowl/i;

export default async function HomePage() {
	const [catalog, timetable, barAddOns] = await Promise.all([getCatalog(), getTimetable(), getAddOnsForProduct('bar-table-south-beach')]);
	const now = Date.now();
	const upcoming = timetable.filter((o) => o.status !== 'full' && Date.parse(o.start) > now);
	const menu: MenuItem[] = barAddOns
		.filter((a) => !shotMeta(a.title) && DRINK.test(a.title))
		.map((a) => ({ id: a.id, title: a.title, price: a.price, description: a.description ?? null }));
	const people = [...catalog.coaches].sort((a, b) => Number(b.meta?.role !== 'coach') - Number(a.meta?.role !== 'coach'));
	return (
		<>
			<Hero next={upcoming[0] ?? null} />
			<div className="container-x pt-8">
				<StoryRings stories={siteConfig.stories} />
			</div>
			<PromiseSection />
			<CallTimes occurrences={upcoming.slice(0, 6)} />
			<SetsSheet />
			<ShootsTeaser shoots={servicesIn(catalog, 'content')} />
			<CrewStrip people={people} />
			<BarCafe menu={menu} />
			<PassBand />
			<SitesPair sites={physicalSites(catalog)} />
		</>
	);
}
