'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Overlay, CloseButton } from '@/components/ui/overlay';
import { Logo } from '@/components/frame/logo';
import type { StoryMeta } from '@/lib/site-config';

const CLIP_MS = 8000;

/**
 * Full-screen story viewer: vertical clips with segmented progress bars across
 * all stories. Tap right / left (or arrow keys) to move, hold to pause,
 * Escape to close. A "Book" sticker links into booking.
 */
export function StoryViewer({ stories, start, onClose }: { stories: StoryMeta[]; start: number | null; onClose: () => void }) {
	const [index, setIndex] = useState(start ?? 0);
	const [clip, setClip] = useState(0);
	const [paused, setPaused] = useState(false);
	const [progress, setProgress] = useState(0);
	const videoRef = useRef<HTMLVideoElement>(null);
	const open = start !== null;

	useEffect(() => {
		if (start !== null) {
			setIndex(start);
			setClip(0);
		}
	}, [start]);

	const story = stories[index];
	const current = story?.clips[clip];

	const next = useCallback(() => {
		setProgress(0);
		if (!story) return;
		if (clip + 1 < story.clips.length) setClip(clip + 1);
		else if (index + 1 < stories.length) {
			setIndex(index + 1);
			setClip(0);
		} else onClose();
	}, [story, clip, index, stories.length, onClose]);

	const prev = useCallback(() => {
		setProgress(0);
		if (clip > 0) setClip(clip - 1);
		else if (index > 0) {
			setIndex(index - 1);
			setClip(0);
		}
	}, [clip, index]);

	// Progress follows the video when it plays; a poster-only clip runs on a timer.
	useEffect(() => {
		if (!open || paused) return;
		const v = videoRef.current;
		let raf = 0;
		const started = performance.now() - progress * CLIP_MS;
		const tick = () => {
			const p = v && v.duration && !Number.isNaN(v.duration) && v.currentTime > 0 ? v.currentTime / v.duration : (performance.now() - started) / CLIP_MS;
			if (p >= 1) {
				next();
				return;
			}
			setProgress(p);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, paused, index, clip, next]);

	useEffect(() => {
		const v = videoRef.current;
		if (!v) return;
		v.muted = true;
		if (paused) v.pause();
		else void v.play().catch(() => undefined);
	}, [paused, index, clip, open]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight') next();
			if (e.key === 'ArrowLeft') prev();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, next, prev]);

	if (!story || !current) return null;

	return (
		<Overlay open={open} onClose={onClose} kind="full" label={`${story.label} story`} tone="night">
			<div className="relative mx-auto flex h-full w-full max-w-[min(100vw,calc(100svh*9/16))] flex-col overflow-hidden bg-night-2 sm:my-4 sm:h-[calc(100%-2rem)] sm:rounded-[20px]">
				<div className="absolute inset-0">
					<span className="image-placeholder-night absolute inset-0" />
					<video
						key={current.video}
						ref={videoRef}
						src={current.video}
						poster={current.poster}
						playsInline
						muted
						autoPlay
						preload="metadata"
						className="absolute inset-0 h-full w-full object-cover"
					/>
					<span aria-hidden className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/55 to-transparent" />
					<span aria-hidden className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/70 to-transparent" />
				</div>

				{/* Progress, one segment per story clip */}
				<div className="relative z-10 flex gap-1 px-3 pt-3">
					{stories.flatMap((s, si) =>
						s.clips.map((_, ci) => {
							const done = si < index || (si === index && ci < clip);
							const live = si === index && ci === clip;
							return (
								<span key={`${s.key}-${ci}`} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
									<span className="block h-full origin-left bg-white" style={{ transform: `scaleX(${done ? 1 : live ? progress : 0})` }} />
								</span>
							);
						}),
					)}
				</div>
				<div className="relative z-10 flex items-center gap-3 px-3 pt-3 text-white">
					<span className="afterglow flex h-9 w-9 items-center justify-center rounded-full p-[2px]">
						<span className="flex h-full w-full items-center justify-center rounded-full bg-night">
							<svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4">
								<circle cx="10" cy="11" r="5" fill="url(#sv)" />
								<defs>
									<linearGradient id="sv" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0" stopColor="#FFB38A" />
										<stop offset="1" stopColor="#6A4BFF" />
									</linearGradient>
								</defs>
							</svg>
						</span>
					</span>
					<div className="min-w-0 flex-1 leading-tight">
						<p className="text-[0.9rem] font-medium">afterglow.club</p>
						<p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/70">{story.label}</p>
					</div>
					<button type="button" onClick={() => setPaused((p) => !p)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/15" aria-label={paused ? 'Play' : 'Pause'}>
						{paused ? (
							<svg aria-hidden viewBox="0 0 12 14" className="h-3.5 w-3" fill="currentColor">
								<path d="M0 0l12 7-12 7z" />
							</svg>
						) : (
							<svg aria-hidden viewBox="0 0 12 14" className="h-3.5 w-3" fill="currentColor">
								<rect width="4" height="14" />
								<rect x="8" width="4" height="14" />
							</svg>
						)}
					</button>
					<CloseButton onClick={onClose} tone="night" label="Close stories" />
				</div>

				{/* Tap zones */}
				<button type="button" aria-label="Previous" onClick={prev} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} className="absolute bottom-40 left-0 top-24 z-[5] w-1/3" />
				<button type="button" aria-label="Next" onClick={next} onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} className="absolute bottom-40 right-0 top-24 z-[5] w-2/3" />

				<div className="relative z-10 mt-auto px-5 pb-7 text-white">
					<p className={clsx('max-w-[18rem] text-[1.05rem] leading-snug drop-shadow')}>{current.caption}</p>
					{current.cta ? (
						<Link href={current.cta.href} onClick={onClose} className="mt-4 inline-flex -rotate-2 items-center gap-2 rounded-[10px] bg-white px-4 py-2.5 text-[0.95rem] font-semibold text-night shadow-lg">
							<span aria-hidden className="afterglow h-2.5 w-2.5 rounded-full" />
							{current.cta.label}
						</Link>
					) : null}
					<div className="mt-5 opacity-80">
						<Logo tone="light" className="!h-4" />
					</div>
				</div>
			</div>
		</Overlay>
	);
}
