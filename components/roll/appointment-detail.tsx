'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR, { mutate as globalMutate } from 'swr';
import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { onSessionExpired } from '@/lib/session-expired';
import { toBookingView } from '@/lib/booking-view';
import { changeWindow, policyLine } from '@/lib/change-window';
import { callTime, toCalendarEvent } from '@/lib/call-sheet';
import { editsState } from '@/lib/roll';
import { awaitingLabel } from '@/lib/booking-state';
import { icsHref, ICS_FILENAME } from '@/lib/calendar';
import { toneHex } from '@/lib/site-config';
import { dayLabel, longDayLabel, minutesLabel, timeLabel } from '@/lib/when';
import { useNow } from '@/hooks/use-now';
import { Button, buttonClasses } from '@/components/ui/button';
import { Overlay } from '@/components/ui/overlay';
import { SafeImage } from '@/components/ui/safe-image';
import { Viewfinder } from '@/components/frame/viewfinder';
import { CircledShot } from '@/components/shotlist/frame';
import { ReschedulePicker } from '@/components/roll/reschedule-picker';
import { AccountError, AccountLoading } from '@/components/roll/states';
import { BOOKINGS_KEY } from '@/components/roll/your-roll';

export type DetailAction = 'cancel' | 'reschedule' | 'feedback';

/** One session from the roll: its call sheet, Move (inline) and Cancel (confirm). */
export function AppointmentDetail({ id, initialAction }: { id: string; initialAction: DetailAction | null }) {
	const key = `/api/account/appointments/${encodeURIComponent(id)}`;
	const { data: appt, error, isLoading, mutate } = useSWR<AppointmentDetailResponse>(key, fetcher, { revalidateOnFocus: false });
	const now = useNow(30_000);
	const [moving, setMoving] = useState(initialAction === 'reschedule');
	const [confirmCancel, setConfirmCancel] = useState(initialAction === 'cancel');
	const [pending, setPending] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	if (error && !appt) return <AccountError what="this booking" onRetry={() => void mutate()} />;
	if (isLoading || !appt || !now) return <AccountLoading label="Loading the booking" />;
	const v = toBookingView(appt as Parameters<typeof toBookingView>[0]);
	const w = changeWindow(appt, now.getTime());
	const past = v.start <= now.getTime();
	const edits = editsState(v, now.getTime());

	const change = async (kind: 'cancel' | 'reschedule', slot?: Record<string, string | null>) => {
		setPending(true);
		setMessage(null);
		try {
			const res = await fetch(`${key}/${kind}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kind === 'reschedule' ? { slot } : {}) });
			if (res.status === 401) return onSessionExpired();
			const body = await res.json().catch(() => null);
			if (!res.ok) throw new Error(body?.error || (kind === 'cancel' ? 'We couldn’t cancel this.' : 'We couldn’t move this.'));
			await mutate(body as AppointmentDetailResponse, { revalidate: true });
			void globalMutate(BOOKINGS_KEY);
			setMoving(false);
			setConfirmCancel(false);
			setMessage(kind === 'cancel' ? 'Cut. The spot is back on the schedule.' : 'Moved. Same coach, same set, new call time.');
		} catch (err) {
			setMessage(err instanceof Error ? err.message : 'Something went wrong.');
		} finally {
			setPending(false);
		}
	};

	return (
		<div className="grid gap-10 lg:grid-cols-12">
			<div className="lg:col-span-7">
				<Link href="/account" className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted hover:text-ink">
					← Your roll
				</Link>
				<div className="mt-4 overflow-hidden rounded-[18px] border border-line bg-white">
					<div className="relative aspect-[16/7] bg-night">
						<span className="image-placeholder-night absolute inset-0" />
						<SafeImage src={v.image} alt="" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover opacity-90" />
						<Viewfinder inset="md" rec={!past && v.status === 'scheduled'} timecode={`CALL ${timeLabel(callTime(v))}`} readout={v.setName?.toUpperCase()} />
					</div>
					<div className="p-5 sm:p-6">
						<p className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted">
							<span aria-hidden className="h-3 w-[3px] rounded-full" style={{ background: toneHex(v.tone) }} />
							{v.kindLabel}
							{v.status === 'canceled' ? <span className="text-danger">· cut</span> : null}
							{v.awaiting ? <span className="text-pink">· {awaitingLabel(v.awaiting)}</span> : null}
						</p>
						<h1 className="mt-1 font-display text-4xl font-bold leading-tight">{v.title}</h1>
						<p className="mt-1 text-ink-2">
							{longDayLabel(v.start)} · {timeLabel(v.start)} · {minutesLabel(v.minutes)}
						</p>
						<p className="text-sm text-muted">{[v.variant, v.coach ? `with ${v.coach}` : null, v.setName, v.siteName, v.people > 1 ? `${v.people} people` : null].filter(Boolean).join(' · ')}</p>
						{v.address ? <p className="text-sm text-muted">{v.address}</p> : null}
						{v.shots.length ? (
							<div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">
								{v.shots.map((s) => (
									<CircledShot key={s.label} label={s.label} spec={s.spec} />
								))}
							</div>
						) : null}
						{past && v.status !== 'canceled' ? (
							<p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-2">
								{edits.kind === 'sent' ? 'Edits sent to your email. Check spam if you can’t find them.' : edits.kind === 'editing' ? `In the edit · in your inbox by ${dayLabel(edits.dueAt)}, ${timeLabel(edits.dueAt)}` : 'No shots booked for this one.'}
							</p>
						) : null}
					</div>
				</div>
				{message ? (
					<p role="status" className="mt-4 rounded-[10px] border-l-4 border-pink bg-white px-4 py-3 text-sm">
						{message}
					</p>
				) : null}
				{v.status === 'scheduled' && !past ? (
					<div className="mt-6">
						<p className="text-sm text-muted">{policyLine(w)}</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{w.reschedule.allowed ? (
								<Button variant={moving ? 'shutter' : 'outline'} dot={false} onClick={() => setMoving((m) => !m)}>
									{moving ? 'Keep this time' : 'Move'}
								</Button>
							) : null}
							{w.cancel.allowed ? (
								<Button variant="outline" onClick={() => setConfirmCancel(true)}>
									Cancel
								</Button>
							) : null}
							<a href={icsHref([toCalendarEvent(v)])} download={ICS_FILENAME} className={buttonClasses({ variant: 'ghost' })}>
								Add to calendar
							</a>
						</div>
						{moving ? (
							<div className="mt-6 border-t border-line pt-5">
								<h2 className="mb-4 font-display text-2xl font-bold">Pick a new call time</h2>
								<ReschedulePicker appt={appt as Parameters<typeof ReschedulePicker>[0]['appt']} pending={pending} onMove={(slot) => void change('reschedule', slot)} />
							</div>
						) : null}
					</div>
				) : (
					<Link href={v.bookAgainHref} className={buttonClasses({ variant: 'glow', className: 'mt-6' })}>
						Book it again
					</Link>
				)}
			</div>
			<aside className="space-y-6 lg:col-span-5 lg:pt-10">
				{v.wardrobe ? (
					<div className="rounded-[14px] border border-line bg-white p-4">
						<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Wardrobe</p>
						<p className="mt-1">{v.wardrobe}</p>
					</div>
				) : null}
				{v.whatToBring.length ? (
					<div className="rounded-[14px] border border-line bg-white p-4">
						<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Bring</p>
						<p className="mt-1">{v.whatToBring.join(' · ')}</p>
					</div>
				) : null}
				{v.transit ? (
					<div className="rounded-[14px] border border-line bg-white p-4">
						<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Getting there</p>
						<p className="mt-1 text-sm">{v.transit}</p>
						{v.parking ? <p className="mt-1 text-sm text-muted">{v.parking}</p> : null}
					</div>
				) : null}
				{v.extras.length ? (
					<div className="rounded-[14px] border border-line bg-white p-4">
						<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Waiting at the bar</p>
						<p className="mt-1 text-sm">{v.extras.join(' · ')}</p>
					</div>
				) : null}
			</aside>
			<Overlay open={confirmCancel} onClose={() => setConfirmCancel(false)} kind="sheet" label="Cancel this session" className="p-6">
				<h2 className="font-display text-3xl font-bold">Cut {v.title}?</h2>
				<p className="mt-2 text-muted">
					{longDayLabel(v.start)} at {timeLabel(v.start)}. The spot goes back on the schedule. Refunds follow the studio&rsquo;s policy and go back to how you paid.
				</p>
				<div className="mt-6 flex gap-2">
					<Button variant="shutter" loading={pending} onClick={() => void change('cancel')}>
						Yes, cancel
					</Button>
					<Button variant="outline" onClick={() => setConfirmCancel(false)}>
						Keep it
					</Button>
				</div>
			</Overlay>
		</div>
	);
}
