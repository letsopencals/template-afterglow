'use client';

import { clsx } from 'clsx';
import type { AddOnListItemResponse } from '@opencals/storefront-sdk';
import { GreaseCircle } from '@/components/frame/grease';
import { formatPrice } from '@/lib/format';
import { shotMeta, type ShotKind } from '@/lib/site-config';

/** A tiny drawing of what the crew delivers, inside a viewfinder. */
function Deliverable({ kind }: { kind: ShotKind }) {
	if (kind === 'clips')
		return (
			<svg aria-hidden viewBox="0 0 60 40" className="h-10 w-16">
				{[8, 26, 44].map((x, i) => (
					<rect key={x} x={x} y={4 + i * 2} width="12" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
				))}
				<path d="M12 33h40" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
			</svg>
		);
	if (kind === 'photos')
		return (
			<svg aria-hidden viewBox="0 0 60 40" className="h-10 w-16">
				{Array.from({ length: 10 }, (_, i) => (
					<rect key={i} x={6 + (i % 5) * 10} y={8 + Math.floor(i / 5) * 13} width="8" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
				))}
			</svg>
		);
	if (kind === 'reel')
		return (
			<svg aria-hidden viewBox="0 0 60 40" className="h-10 w-16">
				<rect x="21" y="3" width="18" height="32" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
				<path d="M27 13l8 6-8 6z" fill="currentColor" />
				<path d="M8 20h8M44 20h8" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 2.5" />
			</svg>
		);
	return (
		<svg aria-hidden viewBox="0 0 60 40" className="h-10 w-16">
			<rect x="4" y="8" width="52" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
			{[10, 18, 26, 34, 42, 50].map((x) => (
				<g key={x}>
					<rect x={x - 2} y="10.5" width="3" height="2" fill="currentColor" />
					<rect x={x - 2} y="27.5" width="3" height="2" fill="currentColor" />
				</g>
			))}
			<path d="M8 15h44v10H8z" fill="none" stroke="currentColor" strokeWidth="1" />
		</svg>
	);
}

/**
 * The shot add-ons as viewfinder frames you circle. Only add-ons that site copy
 * knows as shots render here; other add-ons (drinks, towel) go to the extras list.
 */
export function ShotPicker({ addOns, picked, onToggle, loading }: { addOns: AddOnListItemResponse[]; picked: Record<string, number>; onToggle: (id: string, on: boolean) => void; loading?: boolean }) {
	const shots = addOns.map((a) => ({ a, meta: shotMeta(a.title) })).filter((x): x is { a: AddOnListItemResponse; meta: NonNullable<ReturnType<typeof shotMeta>> } => Boolean(x.meta));
	if (loading && shots.length === 0) {
		return (
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-busy="true">
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className="h-36 animate-pulse rounded-[12px] bg-cream-2" />
				))}
			</div>
		);
	}
	if (shots.length === 0) return null;
	return (
		<fieldset>
			<legend className="mb-3 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
				<span aria-hidden className="rec-blink h-1.5 w-1.5 rounded-full bg-[#ff2d55]" />
				Get the shot · circle what you want
			</legend>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{shots.map(({ a, meta }) => {
					const on = Boolean(picked[a.id]);
					return (
						<label
							key={a.id}
							className={clsx(
								'relative flex cursor-pointer flex-col rounded-[12px] border bg-white p-3 transition-[border-color,box-shadow]',
								on ? 'border-pink shadow-[0_8px_24px_-14px_rgba(255,94,138,0.9)]' : 'border-line hover:border-ink/40',
							)}
						>
							<input type="checkbox" className="sr-only" checked={on} onChange={(e) => onToggle(a.id, e.target.checked)} />
							<span className="relative flex h-16 items-center justify-center rounded-[8px] bg-night text-cream">
								<span aria-hidden className="absolute left-1.5 top-1.5 h-2.5 w-2.5 border-l border-t border-cream/70" />
								<span aria-hidden className="absolute right-1.5 top-1.5 h-2.5 w-2.5 border-r border-t border-cream/70" />
								<span aria-hidden className="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-b border-l border-cream/70" />
								<span aria-hidden className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 border-b border-r border-cream/70" />
								<Deliverable kind={meta.kind} />
							</span>
							<span className="relative mt-2.5 inline-block self-start px-1">
								{on ? <GreaseCircle className="-inset-x-2 -inset-y-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+1rem)]" /> : null}
								<span className="relative text-[0.95rem] font-medium">{meta.label}</span>
							</span>
							<span className="mt-0.5 font-mono text-[0.68rem] text-muted">
								{meta.spec} · in {meta.eta}
							</span>
							<span className="mt-auto pt-2 font-mono text-[0.85rem]">+{formatPrice(a.price)}</span>
						</label>
					);
				})}
			</div>
		</fieldset>
	);
}

/** Non-shot add-ons as plain checkbox rows (drinks, towel, glam). */
export function ExtrasList({ addOns, picked, onToggle }: { addOns: AddOnListItemResponse[]; picked: Record<string, number>; onToggle: (id: string, on: boolean) => void }) {
	const extras = addOns.filter((a) => !shotMeta(a.title));
	if (extras.length === 0) return null;
	return (
		<fieldset>
			<legend className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">From the bar & the desk</legend>
			<ul className="grid gap-x-6 sm:grid-cols-2">
				{extras.map((a) => (
					<li key={a.id}>
						<label className="flex cursor-pointer items-center gap-3 border-b border-dashed border-line py-2">
							<input type="checkbox" checked={Boolean(picked[a.id])} onChange={(e) => onToggle(a.id, e.target.checked)} className="h-4 w-4 accent-[var(--color-pink)]" />
							<span className="flex-1 text-[0.92rem]">{a.title}</span>
							<span className="font-mono text-[0.8rem] text-ink-2">+{formatPrice(a.price)}</span>
						</label>
					</li>
				))}
			</ul>
		</fieldset>
	);
}
