import type { Metadata } from 'next';
import { Slate } from '@/components/frame/slate';
import { ScheduleView } from '@/components/schedule/schedule-view';
import type { ScheduleClass, SchedulePerson } from '@/components/schedule/types';
import { physicalSites } from '@/lib/catalog';
import { getCatalog, getTimetable } from '@/lib/server-data';
import { localDates, localParts } from '@/lib/timetable';
import { parseSessionKey } from '@/lib/schedule-url';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
	title: 'Schedule',
	description: 'Every class at Afterglow South Beach and Wynwood, day by day: Rhythm Ride, Glute Lab, Sunset Rooftop Yoga, boxing and more, with shots from the crew on every one.',
};

export const revalidate = 60;

type Search = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

export default async function SchedulePage({ searchParams }: { searchParams: Search }) {
	const sp = await searchParams;
	const [catalog, timetable] = await Promise.all([getCatalog(), getTimetable()]);
	const now = Date.now();
	const occurrences = timetable.filter((o) => Date.parse(o.start) > now);
	const today = localParts(now).date;
	const dates = localDates(today, Math.min(siteConfig.policies.bookingWindowDays, 21));

	const people: Record<string, SchedulePerson> = Object.fromEntries(
		catalog.coaches.map((c) => [c.id, { id: c.id, slug: c.slug, name: c.name, firstName: c.firstName, image: c.image, handle: c.meta?.handle ?? null }]),
	);
	const classes: Record<string, ScheduleClass> = Object.fromEntries(catalog.classes.map((c) => [c.key, { key: c.key, title: c.title, description: c.description, image: c.images[0] ?? null }]));
	const sites = physicalSites(catalog).map((s) => ({ id: s.id, key: s.key, nickname: s.nickname }));

	const openKey = one(sp.s);
	const opened = parseSessionKey(openKey);
	const openedOcc = opened ? occurrences.find((o) => o.seriesSlug === opened.seriesSlug && o.start === opened.start) : null;
	const askedDay = one(sp.day);
	const cls = one(sp.class);
	const firstOfClass = cls ? occurrences.find((o) => o.classKey === cls) : null;
	const day = openedOcc?.localDate ?? (askedDay && dates.includes(askedDay) ? askedDay : (firstOfClass?.localDate ?? today));
	const type = one(sp.type);
	const site = one(sp.site);

	return (
		<>
			<section className="container-x pb-6 pt-10 sm:pt-14">
				<Slate as="h1" label="Call times" title="Schedule" intro="Pick a day, tap a class, circle the shots you want. Every class can come with the crew." />
			</section>
			<ScheduleView
				occurrences={occurrences}
				dates={dates}
				people={people}
				classes={classes}
				sites={sites}
				initial={{
					day,
					site: site && sites.some((s) => s.key === site) ? site : null,
					type: type && type in siteConfig.categories ? type : null,
					cls: cls && classes[cls] ? cls : null,
					coach: one(sp.coach),
					golden: one(sp.light) === 'golden',
					open: openedOcc ? openKey : null,
				}}
			/>
		</>
	);
}
