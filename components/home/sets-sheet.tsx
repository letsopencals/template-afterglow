import Link from 'next/link';
import { Slate } from '@/components/frame/slate';
import { Viewfinder } from '@/components/frame/viewfinder';
import { SafeImage } from '@/components/ui/safe-image';
import { siteConfig, type SetKey, type SetMeta } from '@/lib/site-config';

/** The sets as a contact sheet: seven frames, each a room you can book into. */
export function SetsSheet() {
	const sets = Object.entries(siteConfig.sets) as Array<[SetKey, SetMeta]>;
	return (
		<section className="bg-night py-20 text-cream sm:py-28">
			<div className="container-x">
				<Slate scene={3} label="The sets" tone="night" title="Seven sets, two buildings" intro="Every room was built to be photographed: neon in Wynwood, Deco pastel and golden hour in South Beach." />
				<ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
					{sets.map(([key, s], i) => (
						<li key={key} className={i === 0 ? 'col-span-2 row-span-2' : i >= 5 ? 'col-span-2' : ''}>
							<Link href={key === 'studio-wall' ? '/shoots?service=studio-wall-hire#book' : `/schedule?site=${s.site}`} className="group block">
								<div className="relative overflow-hidden rounded-[10px] bg-night-2" style={{ aspectRatio: i === 0 ? '4 / 4.35' : i >= 5 ? '16 / 9.6' : '4 / 5' }}>
									<span className="image-placeholder-night absolute inset-0" />
									<SafeImage src={s.image} alt={s.name} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
									<Viewfinder inset="sm" rec={false} readout={s.readout} />
								</div>
								<p className="mt-2 flex items-center justify-between font-mono text-[0.62rem] tracking-[0.18em] text-[#f4a93b]">
									<span>
										{String(i + 1).padStart(2, '0')} ▸ {String(i + 1).padStart(2, '0')}A
									</span>
									<span className="text-cream/45">{s.site === 'wynwood' ? 'WYNWOOD' : 'SOUTH BEACH'}</span>
								</p>
								<p className="mt-1 font-display text-xl font-bold">{s.name}</p>
								<p className="text-sm text-cream/60">{s.light}</p>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
