'use client';

import { useEffect, useRef, useState } from 'react';

/** Muted autoplay hero clip: the vertical cut on phones, the wide one from 768px. Poster until it plays. */
export function HeroVideo({ wide, vertical, poster }: { wide: string; vertical?: string; poster: string }) {
	const ref = useRef<HTMLVideoElement>(null);
	const [src, setSrc] = useState<string | null>(null);
	useEffect(() => {
		const mq = window.matchMedia('(min-width: 768px)');
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) return;
		const pick = () => setSrc(mq.matches || !vertical ? wide : vertical);
		pick();
		mq.addEventListener('change', pick);
		return () => mq.removeEventListener('change', pick);
	}, [wide, vertical]);
	useEffect(() => {
		const v = ref.current;
		if (!v || !src) return;
		v.muted = true;
		void v.play().catch(() => undefined);
	}, [src]);
	return (
		<>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
			{src ? <video ref={ref} key={src} src={src} poster={poster} muted playsInline loop autoPlay preload="auto" className="absolute inset-0 h-full w-full object-cover" /> : null}
		</>
	);
}
