'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { clsx } from 'clsx';
import { useSession } from 'next-auth/react';
import type { AppointmentListItemResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { toBookingView, type BookingView } from '@/lib/booking-view';
import { editsState, rollStats, splitRoll } from '@/lib/roll';
import { callTime, toCalendarEvent } from '@/lib/call-sheet';
import { icsHref, ICS_FILENAME } from '@/lib/calendar';
import { toneHex } from '@/lib/site-config';
import { dayLabel, minutesLabel, timeLabel } from '@/lib/when';
import { useNow } from '@/hooks/use-now';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { FilmEdge } from '@/components/frame/film-edge';
import { CircledShot } from '@/components/shotlist/frame';
import { AccountError } from '@/components/roll/states';

export const BOOKINGS_KEY = '/api/account/appointments?take=100&orderBy=from&order=DESC';

/** Your roll: loads the customer's bookings and renders the view. */
export function YourRoll() {
	const { data: session } = useSession();
	const { data, error, isLoading, mutate } = useSWR<{ data: AppointmentListItemResponse[] }>(BOOKINGS_KEY, fetcher, { revalidateOnFocus: false });
	const views = useMemo(() => (data?.data ?? []).map((a) => toBookingView(a as Parameters<typeof toBookingView>[0])), [data]);
	if (error && !data)
		return (
			<div className="container-x py-10">
				<AccountError what="your roll" onRetry={() => void mutate()} />
			</div>
		);
	return <YourRollView views={views} loading={isLoading} name={session?.customer?.firstName ?? null} />;
}

/** One upcoming session as a call-sheet strip. */
function UpNextRow({ v }: { v: BookingView }) {
	return (
		<li className="grid gap-4 rounded-[16px] border border-line bg-white p-4 sm:grid-cols-[8.5rem_1fr_auto] sm:items-center sm:p-5">
			<div>
				<p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">Call</p>
				<p className="whitespace-nowrap font-display text-2xl font-bold leading-none">{timeLabel(callTime(v))}</p>
				<p className="mt-1 font-mono text-[0.68rem] uppercase text-muted">{dayLabel(v.start)}</p>
			</div>
			<div className="min-w-0">
				<p className="flex items-center gap-2 text-[1.1rem] font-medium">
					<span aria-hidden className="h-4 w-[3px] rounded-full" style={{ background: toneHex(v.tone) }} />
					{v.title}
				</p>
				<p className="text-sm text-muted">
					{[`${timeLabel(v.start)} · ${minutesLabel(v.minutes)}`, v.setName, v.siteName, v.coachFirstName ? `with ${v.coachFirstName}` : null].filter(Boolean).join(' · ')}
				</p>
				{v.shots.length ? (
					<div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-2">
						{v.shots.map((s) => (
							<CircledShot key={s.label} label={s.label} />
						))}
					</div>
				) : null}
			</div>
			<div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
				<Link href={`/account/appointments/${v.id}`} className={buttonClasses({ variant: 'shutter', size: 'sm' })}>
					Manage
				</Link>
				<a href={icsHref([toCalendarEvent(v)])} download={ICS_FILENAME} className="px-1 text-sm underline underline-offset-4">
					Add to calendar
				</a>
			</div>
		</li>
	);
}

/** One past session as a frame on the contact sheet. */
function ContactFrame({ v, n, now }: { v: BookingView; n: number; now: number }) {
	const edits = editsState(v, now);
	const num = String(n).padStart(2, '0');
	return (
		<li>
			<Link href={`/account/appointments/${v.id}`} className="group block">
				<div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-night">
					<span className="image-placeholder-night absolute inset-0" />
					<SafeImage src={v.image} alt="" fill sizes="(min-width: 1024px) 18vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
					<span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: toneHex(v.tone) }} />
					{v.shots.length || v.category === 'content' ? (
						<svg aria-hidden viewBox="0 0 100 125" preserveAspectRatio="none" className="grease-pop absolute inset-1.5 h-[calc(100%-0.75rem)] w-[calc(100%-0.75rem)]">
							<path d="M14 10C40 2 84 3 93 22c8 18 4 70-6 88-12 16-60 15-76 2C-1 101 1 40 6 24 9 15 18 9 30 7" fill="none" stroke="var(--color-pink)" strokeWidth="2.6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
						</svg>
					) : null}
				</div>
				<p className="mt-1.5 flex justify-between font-mono text-[0.6rem] tracking-[0.16em] text-[#c98a2b]">
					<span>
						{num} ▸ {num}A
					</span>
					<span className="text-muted">{dayLabel(v.start).replace(/^\w+, /, '')}</span>
				</p>
				<p className="mt-0.5 truncate font-medium">{v.title}</p>
				<p
					className={clsx(
						'font-mono text-[0.66rem] uppercase tracking-[0.1em]',
						edits.kind === 'sent' ? 'text-[#00897a]' : edits.kind === 'editing' ? 'text-pink' : 'text-muted',
					)}
				>
					{edits.kind === 'sent' ? 'Edits sent to your email' : edits.kind === 'editing' ? `In the edit · by ${dayLabel(edits.dueAt)}` : 'No shots booked'}
				</p>
			</Link>
		</li>
	);
}

/** The roll itself, from booking views (also used by the preview screens). */
export function YourRollView({ views, loading, name }: { views: BookingView[]; loading: boolean; name: string | null }) {
	const now = useNow(60_000);
	const split = useMemo(() => (now ? splitRoll(views, now.getTime()) : null), [views, now]);
	const stats = split ? rollStats(split.shot) : { sessions: 0, shots: 0, sets: 0 };

	return (
		<div className="pb-10">
			<section className="container-x pb-8 pt-8">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<div>
						<p className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-muted">Your roll</p>
						<h1 className="mt-1 font-display text-5xl font-extrabold">{name ? `${name}’s roll` : 'Your roll'}</h1>
					</div>
					<dl className="flex gap-6">
						{[
							['Sessions', stats.sessions],
							['Shots', stats.shots],
							['Sets', stats.sets],
						].map(([k, n]) => (
							<div key={k as string}>
								<dt className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">{k}</dt>
								<dd className="font-display text-4xl font-bold">{n}</dd>
							</div>
						))}
					</dl>
				</div>
			</section>

			<section className="container-x">
				<h2 className="font-display text-2xl font-bold">Up next</h2>
				{loading || !split ? (
					<div className="mt-4 h-28 animate-pulse rounded-[16px] bg-cream-2" />
				) : split.upcoming.length ? (
					<ul className="mt-4 space-y-3">
						{split.upcoming.map((v) => (
							<UpNextRow key={v.id} v={v} />
						))}
					</ul>
				) : (
					<div className="mt-4 rounded-[16px] border border-dashed border-line bg-white p-6">
						<p className="text-ink-2">Nothing booked. The schedule is full of good light.</p>
						<Link href="/schedule" className={buttonClasses({ variant: 'glow', className: 'mt-4' })}>
							Book a class
						</Link>
					</div>
				)}
			</section>

			<section className="mt-14 bg-night py-10 text-cream">
				<div className="container-x">
					<div className="flex flex-wrap items-baseline justify-between gap-3">
						<h2 className="font-display text-2xl font-bold">The contact sheet</h2>
						<p className="max-w-md text-sm text-cream/60">Every session you&rsquo;ve trained, circled when the crew shot it. The edits themselves arrive by email; this is the record.</p>
					</div>
				</div>
				<FilmEdge className="mt-6" code={`AFTERGLOW 400 · ${stats.sessions} FRAMES`} />
				<div className="container-x mt-6">
					{split && split.shot.length ? (
						<ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
							{split.shot.map((v, i) => (
								<ContactFrame key={v.id} v={v} n={split.shot.length - i} now={now!.getTime()} />
							))}
						</ul>
					) : (
						<p className="text-cream/60">{loading ? 'Loading…' : 'Your first frame lands here after your first session.'}</p>
					)}
				</div>
			</section>

			{split && split.cancelled.length ? (
				<section className="container-x mt-10">
					<h2 className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-muted">Cut ({split.cancelled.length})</h2>
					<ul className="mt-3 space-y-1 text-sm text-muted">
						{split.cancelled.map((v) => (
							<li key={v.id} className="line-through decoration-pink">
								{v.title} · {dayLabel(v.start)} · {timeLabel(v.start)}
							</li>
						))}
					</ul>
				</section>
			) : null}
		</div>
	);
}
