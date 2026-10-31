import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';

/** A circular thumbnail inside a gradient story ring; `seen` dims the ring to a thin line. */
export function StoryRing({ src, alt, size = 72, seen = false, className }: { src: string | null; alt: string; size?: number; seen?: boolean; className?: string }) {
	return (
		<span
			className={clsx('relative inline-flex shrink-0 items-center justify-center rounded-full', seen ? 'bg-line' : 'afterglow', className)}
			style={{ width: size, height: size, padding: seen ? 1.5 : 3 }}
		>
			<span className="relative block h-full w-full overflow-hidden rounded-full border-[3px] border-cream bg-cream">
				<span className="image-placeholder absolute inset-0" />
				<SafeImage src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" />
			</span>
		</span>
	);
}
