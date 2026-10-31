import type { Metadata } from 'next';
import { AccountNav } from '@/components/roll/account-nav';

export const metadata: Metadata = { title: 'Your roll', robots: { index: false, follow: false } };

/** Account shell: the tab row. Data loads on the client through /api/account/*. */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-[70vh]">
			<AccountNav />
			{children}
		</div>
	);
}
