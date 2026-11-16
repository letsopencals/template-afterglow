import { getBookingMeta, type AppointmentLike } from '@/lib/booking-meta';
import { classMeta, serviceMeta, setMeta, shotMeta, siteConfig, type ShotMeta, type Tone } from '@/lib/site-config';

/**
 * The cart as a contact sheet: one frame per session, numbered in time order,
 * with the shot add-ons pulled out (they get the grease-pencil circle) from the
 * other extras. Pure; the totals always come from the cart itself.
 */

export interface CartItemLike {
	id: string;
	discountedTotal?: number | null;
	totalDiscount?: number | null;
	originalSubtotal?: number | null;
	appointment?: (AppointmentLike & { id?: string; product?: AppointmentLike['product'] & { image?: { url?: string | null } | null } }) | null;
	addOnItems?: Array<{ id: string; quantity: number; discountedTotal?: number | null; totalDiscount?: number | null; originalSubtotal?: number | null; addOn?: { title?: string | null } | null }> | null;
	discounts?: Array<{ title?: string | null }> | null;
}

export interface Frame {
	key: string;
	/** 1-based frame number in time order. */
	n: number;
	title: string;
	variant: string | null;
	tone: Tone;
	/** The set photo (or the category photo) from site copy. */
	image: string | null;
	from: string;
	minutes: number;
	coachFirstName: string | null;
	place: string | null;
	people: number;
	total: number;
	baseDiscount: number;
	offer: string | null;
	shots: Array<{ id: string; meta: ShotMeta; total: number; discount: number }>;
	extras: Array<{ id: string; title: string; quantity: number; total: number }>;
}

export function framesFor(items: readonly CartItemLike[] | null | undefined): Frame[] {
	return (items ?? [])
		.filter((it) => it.appointment)
		.slice()
		.sort((a, b) => (a.appointment!.from ?? '').localeCompare(b.appointment!.from ?? ''))
		.map((it, i) => {
			const appt = it.appointment!;
			const meta = getBookingMeta(appt);
			const shots: Frame['shots'] = [];
			const extras: Frame['extras'] = [];
			for (const a of it.addOnItems ?? []) {
				const title = a.addOn?.title ?? 'Extra';
				const shot = shotMeta(title);
				if (shot) shots.push({ id: a.id, meta: shot, total: a.discountedTotal ?? 0, discount: a.totalDiscount ?? 0 });
				else extras.push({ id: a.id, title, quantity: a.quantity, total: a.discountedTotal ?? 0 });
			}
			const key = meta.offeringKey;
			const set = key ? (classMeta(key)?.set ?? serviceMeta(key)?.set) : undefined;
			const image = setMeta(set)?.image ?? siteConfig.media.categories[meta.category] ?? null;
			return {
				key: it.id,
				n: i + 1,
				title: meta.title,
				variant: meta.kindLabel === 'Class' ? null : meta.variant,
				tone: meta.tone,
				image,
				from: appt.from,
				minutes: meta.minutes,
				coachFirstName: meta.coachFirstName,
				place: meta.locationTitle?.replace(/^Afterglow\s+/, '') ?? null,
				people: meta.people,
				// The item's own total covers the class or session only; the frame price includes its shots and extras.
				total: (it.discountedTotal ?? 0) + (it.addOnItems ?? []).reduce((sum, a) => sum + (a.discountedTotal ?? 0), 0),
				baseDiscount: it.totalDiscount ?? 0,
				offer: (it.totalDiscount ?? 0) > 0 ? (it.discounts?.[0]?.title ?? null) : null,
				shots,
				extras,
			};
		});
}

/** How many shot add-ons are circled across the list. */
export function shotCount(frames: readonly Frame[]): number {
	return frames.reduce((n, f) => n + f.shots.length, 0);
}

/** Everything on the list before offers. The cart's `subtotal` is already net of discounts. */
export function grossSubtotal(items: readonly CartItemLike[] | null | undefined): number {
	const cents = (items ?? []).reduce((sum, it) => {
		const addOns = (it.addOnItems ?? []).reduce((a, ao) => a + Math.round((ao.originalSubtotal ?? ao.discountedTotal ?? 0) * 100), 0);
		return sum + Math.round((it.originalSubtotal ?? it.discountedTotal ?? 0) * 100) + addOns;
	}, 0);
	return cents / 100;
}
