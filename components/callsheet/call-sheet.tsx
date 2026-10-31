import Link from 'next/link';
import type { BookingView } from '@/lib/booking-view';
import { googleCalendarHref, icsHref, ICS_FILENAME } from '@/lib/calendar';
import { callTime, deliveryLine, toCalendarEvent } from '@/lib/call-sheet';
import { serviceMeta, siteConfig, toneHex } from '@/lib/site-config';
import { dayLabel, minutesLabel, timeLabel } from '@/lib/when';
import { FilmEdge } from '@/components/frame/film-edge';
import { CircledShot } from '@/components/shotlist/frame';
import { StoryCard } from '@/components/callsheet/story-card';
import { buttonClasses } from '@/components/ui/button';

/**
 * The confirmation artifact: a production call sheet. Call time (arrive early),
 * scene, crew, set and location, wardrobe and the circled shots per session;
 * then notes (what to bring, getting there, when the edits land), calendar
 * links, a story card and "same time next week".
 */
export function CallSheet({ orderName, name, email, views, total }: { orderName: string | null; name: string | null; email: string | null; views: BookingView[]; total: string | null }) {
	const first = views[0]!;
	const events = views.map(toCalendarEvent);
	const delivery = deliveryLine(views);
	const bring = [...new Set(views.flatMap((v) => v.whatToBring))];
	const sites = [...new Map(views.filter((v) => v.siteSlug).map((v) => [v.siteSlug, v])).values()];
	const firstName = name?.split(' ')[0];
	return (
		<div className="pb-24">
			<section className="container-x pb-8 pt-12">
				<p className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-muted">Booked · {orderName ?? 'confirmed'}</p>
				<h1 className="mt-2 max-w-4xl font-display text-[2.6rem] font-extrabold leading-[0.98] tracking-[-0.03em] sm:text-6xl">
					You&rsquo;re on the call sheet{firstName ? `, ${firstName}` : ''}.
				</h1>
				<p className="mt-4 max-w-2xl text-lg text-ink-2">
					{email ? `The confirmation is on its way to ${email}. ` : ''}Bring this, or just your name: the desk has the same sheet.
				</p>
			</section>

			<div className="container-x">
				<article className="paper-grain overflow-hidden rounded-[20px] border border-line shadow-[0_40px_80px_-50px_rgba(18,14,26,0.45)]">
					<header className="afterglow px-5 py-5 text-white sm:px-8">
						<div className="flex flex-wrap items-end justify-between gap-4">
							<div>
								<p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-white/85">Call sheet · {siteConfig.name}</p>
								<p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{views.length === 1 ? first.title : `${views.length} sessions`}</p>
							</div>
							<dl className="grid grid-cols-2 gap-x-8 gap-y-1 font-mono text-[0.72rem] uppercase tracking-[0.14em]">
								<dt className="text-white/70">Talent</dt>
								<dd>{name ?? email ?? 'You'}</dd>
								<dt className="text-white/70">Order</dt>
								<dd>{orderName ?? '—'}</dd>
								{total ? (
									<>
										<dt className="text-white/70">Total</dt>
										<dd>{total}</dd>
									</>
								) : null}
							</dl>
						</div>
					</header>
					<FilmEdge tone="cream" code={`AFTERGLOW 400 · ${views.length} ${views.length === 1 ? 'SCENE' : 'SCENES'}`} />

					{/* Scenes */}
					<div className="hidden grid-cols-[8rem_1.4fr_1fr_1fr_1.2fr] gap-4 border-b border-line px-8 py-3 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted lg:grid">
						<span>Call</span>
						<span>Scene</span>
						<span>Crew</span>
						<span>Set</span>
						<span>Shots</span>
					</div>
					<ol className="divide-y divide-line">
						{views.map((v, i) => (
							<li key={v.id} className="grid gap-3 px-5 py-5 sm:px-8 lg:grid-cols-[8rem_1.4fr_1fr_1fr_1.2fr] lg:gap-4">
								<div>
									<p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-muted lg:hidden">Call</p>
									<p className="font-display text-2xl font-bold leading-none">{timeLabel(callTime(v))}</p>
									<p className="mt-1 font-mono text-[0.7rem] uppercase text-muted">{dayLabel(v.start)}</p>
								</div>
								<div className="min-w-0">
									<p className="font-mono text-[0.62rem] tracking-[0.16em] text-[#c98a2b]">SC {String(i + 1).padStart(2, '0')}</p>
									<p className="flex items-center gap-2 text-[1.1rem] font-medium">
										<span aria-hidden className="h-4 w-[3px] rounded-full" style={{ background: toneHex(v.tone) }} />
										{v.title}
										{v.variant && v.kindLabel !== 'Class' ? <span className="text-muted">· {v.variant}</span> : null}
									</p>
									<p className="text-sm text-muted">
										Starts {timeLabel(v.start)} · {minutesLabel(v.minutes)}
										{v.people > 1 ? ` · ${v.people} people` : ''}
									</p>
									{v.wardrobe ? (
										<p className="mt-2 text-[0.88rem] text-ink-2">
											<span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted">Wardrobe · </span>
											{v.wardrobe}
										</p>
									) : null}
								</div>
								<div className="text-[0.92rem]">
									<p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted lg:hidden">Crew</p>
									{v.coach ? <p>{v.category === 'content' ? `Camera: ${v.coach}` : `Coach: ${v.coach}`}</p> : null}
									{v.shots.length && v.category !== 'content' ? <p className="text-muted">Camera: the Afterglow crew</p> : null}
								</div>
								<div className="text-[0.92rem]">
									<p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted lg:hidden">Set</p>
									<p>{v.setName ?? v.locationTitle}</p>
									<p className="text-muted">{v.siteName}</p>
								</div>
								<div>
									<p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted lg:hidden">Shots</p>
									{v.shots.length ? (
										<div className="flex flex-wrap gap-x-3 gap-y-2">
											{v.shots.map((s) => (
												<CircledShot key={s.label} label={s.label} spec={s.spec} />
											))}
										</div>
									) : v.category === 'content' ? (
										<ul className="text-sm text-ink-2">
											{(serviceMeta(v.offeringKey)?.includes ?? ['Edited photos from the shoot']).slice(0, 2).map((d) => (
												<li key={d}>{d}</li>
											))}
										</ul>
									) : (
										<p className="text-sm text-muted">No shots booked</p>
									)}
									{v.extras.length ? <p className="mt-2 text-sm text-muted">+ {v.extras.join(', ')}</p> : null}
									<p className="mt-2 flex gap-3 text-[0.8rem]">
										<a href={icsHref([events[i]!])} download={ICS_FILENAME} className="underline underline-offset-2">
											.ics
										</a>
										<a href={googleCalendarHref(events[i]!)} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
											Google
										</a>
									</p>
								</div>
							</li>
						))}
					</ol>

					{/* Notes */}
					<div className="grid gap-8 border-t border-line bg-cream/50 px-5 py-8 sm:px-8 md:grid-cols-3">
						<div>
							<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Notes · before you come</p>
							<ul className="mt-3 space-y-1.5 text-[0.95rem]">
								<li>Arrive at the call time: 15 minutes early, 25 with a shoot.</li>
								{bring.slice(0, 5).map((b) => (
									<li key={b}>Bring: {b.toLowerCase()}</li>
								))}
							</ul>
						</div>
						<div>
							<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">Getting there</p>
							<div className="mt-3 space-y-3 text-[0.92rem]">
								{sites.map((v) => (
									<div key={v.siteSlug}>
										<p className="font-medium">{v.siteName}</p>
										{v.address ? <p className="text-muted">{v.address}</p> : null}
										{v.transit ? <p className="mt-1 text-ink-2">{v.transit}</p> : null}
										{v.parking ? <p className="mt-1 text-muted">{v.parking}</p> : null}
									</div>
								))}
							</div>
						</div>
						<div>
							<p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-muted">The edits</p>
							<p className="mt-3 text-[0.95rem]">{delivery ?? 'No shots on this booking. Add them any time before the session: just ask at the desk.'}</p>
							<p className="mt-3 text-sm text-muted">Free to move or cancel up to {siteConfig.policies.changeHours} hours before, from Your roll.</p>
						</div>
					</div>
				</article>

				<div className="mt-8 grid gap-6 lg:grid-cols-2">
					<StoryCard view={first} />
					<div className="flex flex-col justify-center gap-3 rounded-[16px] border border-line bg-white p-5">
						<a href={icsHref(events)} download={ICS_FILENAME} className={buttonClasses({ variant: 'shutter' })}>
							Add {views.length === 1 ? 'it' : `all ${views.length}`} to your calendar
						</a>
						<div className="flex flex-wrap gap-2">
							<Link href={first.bookAgainHref} className={buttonClasses({ variant: 'outline', className: 'flex-1' })}>
								Same time next week
							</Link>
							<Link href="/account" className={buttonClasses({ variant: 'ghost', className: 'flex-1' })}>
								Your roll →
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
