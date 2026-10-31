'use client';

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { clsx } from 'clsx';
import { StoryRing } from '@/components/frame/story-ring';
import type { StoryMeta } from '@/lib/site-config';

const StoryViewer = dynamic(() => import('@/components/stories/story-viewer').then((m) => m.StoryViewer), { ssr: false });

/** "Today at Afterglow": a row of story rings that open the full-screen viewer. */
export function StoryRings({ stories, className, label = 'Today at Afterglow' }: { stories: StoryMeta[]; className?: string; label?: string }) {
	const [open, setOpen] = useState<number | null>(null);
	const [seen, setSeen] = useState<Set<string>>(() => new Set());
	const close = useCallback(() => setOpen(null), []);
	return (
		<div className={className}>
			<p className="mb-3 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-muted">{label}</p>
			<ul className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:gap-6">
				{stories.map((s, i) => (
					<li key={s.key} className="shrink-0">
						<button
							type="button"
							onClick={() => {
								setOpen(i);
								setSeen((prev) => new Set(prev).add(s.key));
							}}
							className="group flex w-[5.25rem] flex-col items-center gap-2 text-center"
						>
							<StoryRing src={s.thumb} alt="" size={80} seen={seen.has(s.key)} className="transition-transform group-hover:scale-[1.04]" />
							<span className={clsx('w-full truncate text-[0.85rem]', seen.has(s.key) ? 'text-muted' : 'text-ink')}>{s.label}</span>
						</button>
					</li>
				))}
			</ul>
			{open !== null ? <StoryViewer stories={stories} start={open} onClose={close} /> : null}
		</div>
	);
}
