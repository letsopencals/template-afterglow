import { clsx } from 'clsx';

/**
 * Camera viewfinder overlay: four corner brackets, a REC dot + timecode top left
 * and an exposure readout bottom right. Sits absolutely over a photo or video.
 */
export function Viewfinder({
	rec = true,
	timecode,
	readout,
	inset = 'md',
	tone = 'light',
	className,
}: {
	rec?: boolean;
	timecode?: string;
	readout?: string;
	inset?: 'sm' | 'md' | 'lg';
	tone?: 'light' | 'dark';
	className?: string;
}) {
	const pad = inset === 'sm' ? 'inset-2.5' : inset === 'lg' ? 'inset-6 md:inset-10' : 'inset-4';
	const size = inset === 'sm' ? 'h-4 w-4' : inset === 'lg' ? 'h-10 w-10' : 'h-6 w-6';
	const color = tone === 'light' ? 'border-white/90 text-white' : 'border-night/80 text-night';
	return (
		<div aria-hidden className={clsx('pointer-events-none absolute', pad, className)}>
			<span className={clsx('absolute left-0 top-0 border-l-2 border-t-2', size, color)} />
			<span className={clsx('absolute right-0 top-0 border-r-2 border-t-2', size, color)} />
			<span className={clsx('absolute bottom-0 left-0 border-b-2 border-l-2', size, color)} />
			<span className={clsx('absolute bottom-0 right-0 border-b-2 border-r-2', size, color)} />
			{rec || timecode ? (
				<span className={clsx('absolute flex items-center gap-1.5 font-mono text-[0.68rem] tracking-wider', inset === 'sm' ? 'left-6 top-0.5' : 'left-9 top-1.5', tone === 'light' ? 'text-white' : 'text-night')}>
					{rec ? <span className="rec-blink h-2 w-2 rounded-full bg-[#ff2d55]" /> : null}
					{rec ? 'REC' : null}
					{timecode ? <span className="opacity-85">{timecode}</span> : null}
				</span>
			) : null}
			{readout ? (
				<span className={clsx('absolute font-mono text-[0.66rem] tracking-wider opacity-90', inset === 'sm' ? 'bottom-0.5 right-6' : 'bottom-1.5 right-9', tone === 'light' ? 'text-white' : 'text-night')}>
					{readout}
				</span>
			) : null}
		</div>
	);
}
