'use client';

import { useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { useModalOverlay, useMounted } from '@/components/ui/use-overlay';

export function CloseButton({ onClick, tone = 'light', label = 'Close' }: { onClick: () => void; tone?: 'light' | 'night'; label?: string }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			className={clsx(
				'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
				tone === 'light' ? 'text-ink hover:bg-cream-2' : 'text-white hover:bg-white/15',
			)}
		>
			<svg aria-hidden viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
				<path d="M2 2l10 10M12 2 2 12" />
			</svg>
		</button>
	);
}

/**
 * The overlay primitive. `drawer` slides in from the right (the shot list, the
 * menu); `sheet` rises from the bottom on phones and centres from 640px
 * (cancel and move dialogs); `full` covers the screen (the story viewer).
 */
export function Overlay({
	open,
	onClose,
	kind,
	label,
	tone = 'light',
	className,
	children,
}: {
	open: boolean;
	onClose: () => void;
	kind: 'drawer' | 'sheet' | 'full';
	label: string;
	tone?: 'light' | 'night';
	className?: string;
	children: ReactNode;
}) {
	const mounted = useMounted();
	const panelRef = useRef<HTMLDivElement>(null);
	useModalOverlay(open, onClose, panelRef);
	if (!mounted || !open) return null;
	return createPortal(
		<div
			className={clsx(
				'fixed inset-0 z-[70] flex',
				kind === 'full' ? 'bg-night' : 'bg-night/55 backdrop-blur-[2px]',
				kind === 'drawer' ? 'justify-end' : kind === 'sheet' ? 'items-end justify-center sm:items-center sm:p-6' : '',
			)}
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-label={label}
				tabIndex={-1}
				className={clsx(
					'relative flex flex-col outline-none',
					tone === 'light' ? 'bg-cream text-ink' : 'bg-night text-cream',
					kind === 'drawer' && 'drawer-in h-full max-h-[100svh] w-full max-w-[32rem]',
					kind === 'sheet' && 'sheet-up max-h-[92svh] w-full rounded-t-[20px] sm:max-w-xl sm:rounded-[20px]',
					kind === 'full' && 'h-[100svh] w-full',
					className,
				)}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}
