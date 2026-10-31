'use client';

import { useCallback, useState } from 'react';
import type { BookingView } from '@/lib/booking-view';
import { dayLabel, timeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { Button } from '@/components/ui/button';

/**
 * Draws a 1080×1920 story card on a canvas ("Booked at Afterglow"): the
 * gradient, the class, the time and the set, in the brand fonts. Downloads as
 * a PNG the guest can post. Nothing leaves the browser.
 */
async function drawCard(v: BookingView): Promise<string> {
	const W = 1080;
	const H = 1920;
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const g = c.getContext('2d')!;
	await document.fonts.ready;
	const css = getComputedStyle(document.body);
	const display = css.getPropertyValue('--font-syne').trim() || 'sans-serif';
	const mono = css.getPropertyValue('--font-fragment').trim() || 'monospace';
	const sans = css.getPropertyValue('--font-outfit').trim() || 'sans-serif';

	const grad = g.createLinearGradient(0, 0, W, H);
	grad.addColorStop(0, '#FFB38A');
	grad.addColorStop(0.55, '#FF5E8A');
	grad.addColorStop(1, '#6A4BFF');
	g.fillStyle = grad;
	g.fillRect(0, 0, W, H);

	// Sun disc
	g.fillStyle = 'rgba(255,244,234,0.9)';
	g.beginPath();
	g.arc(W / 2, 820, 250, Math.PI, 0);
	g.fill();
	g.fillStyle = 'rgba(255,94,138,0.0)';

	// Viewfinder brackets
	g.strokeStyle = 'rgba(255,255,255,0.95)';
	g.lineWidth = 8;
	const m = 90;
	const L = 90;
	const corner = (x: number, y: number, dx: number, dy: number) => {
		g.beginPath();
		g.moveTo(x, y + dy * L);
		g.lineTo(x, y);
		g.lineTo(x + dx * L, y);
		g.stroke();
	};
	corner(m, m, 1, 1);
	corner(W - m, m, -1, 1);
	corner(m, H - m, 1, -1);
	corner(W - m, H - m, -1, -1);

	g.fillStyle = '#ff2d55';
	g.beginPath();
	g.arc(m + 70, m + 48, 12, 0, Math.PI * 2);
	g.fill();
	g.fillStyle = '#fff';
	g.font = `500 34px ${mono}`;
	g.fillText('REC', m + 96, m + 60);

	g.fillStyle = '#120E1A';
	g.font = `800 64px ${display}`;
	g.textAlign = 'center';
	g.fillText('BOOKED AT', W / 2, 1180);
	g.font = `800 120px ${display}`;
	g.fillText(siteConfig.name.toUpperCase(), W / 2, 1310);

	g.fillStyle = '#fff';
	g.font = `700 76px ${display}`;
	g.fillText(v.title, W / 2, 1480);
	g.font = `400 46px ${sans}`;
	g.fillText(`${dayLabel(v.start)} · ${timeLabel(v.start)}`, W / 2, 1560);
	g.font = `500 34px ${mono}`;
	g.fillText([v.setName, v.siteName].filter(Boolean).join(' · ').toUpperCase(), W / 2, 1630);
	g.font = `500 32px ${mono}`;
	g.fillText(siteConfig.contact.instagramHandle.toUpperCase(), W / 2, H - m - 40);
	return c.toDataURL('image/png');
}

export function StoryCard({ view }: { view: BookingView }) {
	const [busy, setBusy] = useState(false);
	const [url, setUrl] = useState<string | null>(null);
	const make = useCallback(async () => {
		setBusy(true);
		try {
			const data = await drawCard(view);
			setUrl(data);
			const a = document.createElement('a');
			a.href = data;
			a.download = `afterglow-${view.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
			a.click();
		} finally {
			setBusy(false);
		}
	}, [view]);
	return (
		<div className="flex items-center gap-5 rounded-[16px] border border-line bg-white p-4">
			<div className="afterglow relative flex aspect-[9/16] w-24 shrink-0 flex-col items-center justify-end overflow-hidden rounded-[10px] pb-3 text-center text-[0.5rem] text-white">
				{url ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={url} alt="Your story card" className="absolute inset-0 h-full w-full object-cover" />
				) : (
					<>
						<span aria-hidden className="absolute left-1/2 top-[34%] h-8 w-16 -translate-x-1/2 rounded-t-full bg-cream/90" />
						<span className="font-display text-[0.42rem] font-extrabold text-night">BOOKED AT</span>
						<span className="font-display text-[0.52rem] font-extrabold tracking-tight text-night">AFTERGLOW</span>
						<span className="mt-1 px-1 font-display text-[0.5rem] font-bold leading-tight">{view.title}</span>
					</>
				)}
			</div>
			<div>
				<p className="font-display text-xl font-bold">Post the booking</p>
				<p className="mt-1 text-sm text-ink-2">A 9:16 story card for {view.title}, sized for stories. Tag {siteConfig.contact.instagramHandle} and the crew will repost.</p>
				<Button variant="shutter" size="sm" className="mt-3" loading={busy} onClick={() => void make()}>
					Download story card
				</Button>
			</div>
		</div>
	);
}
