/** Plain lookups the schedule needs from the catalog (RSC → client). */
export interface SchedulePerson {
	id: string;
	slug: string;
	name: string;
	firstName: string;
	image: string | null;
	handle: string | null;
}

export interface ScheduleClass {
	key: string;
	title: string;
	description: string;
	image: string | null;
}

export interface ScheduleSite {
	id: string;
	key: string;
	nickname: string;
}
