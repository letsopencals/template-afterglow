export function AccountLoading({ label }: { label: string }) {
	return (
		<div aria-busy="true" aria-label={label} className="space-y-3 py-6">
			<div className="h-10 w-1/3 animate-pulse rounded-[10px] bg-cream-2" />
			<div className="h-28 animate-pulse rounded-[14px] bg-cream-2" />
			<div className="h-28 animate-pulse rounded-[14px] bg-cream-2" />
		</div>
	);
}

export function AccountError({ what, onRetry }: { what: string; onRetry: () => void }) {
	return (
		<div className="rounded-[12px] border-l-4 border-danger bg-white p-5">
			<p className="font-medium">We couldn&rsquo;t load {what}.</p>
			<button type="button" onClick={onRetry} className="mt-2 text-sm underline underline-offset-4">
				Try again
			</button>
		</div>
	);
}
