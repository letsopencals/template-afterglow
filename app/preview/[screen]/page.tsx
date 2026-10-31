import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CallSheet } from '@/components/callsheet/call-sheet';
import { YourRollView } from '@/components/roll/your-roll';
import { callSheetFixture, rollFixture } from '@/lib/preview-fixtures';
import { formatPrice } from '@/lib/format';

export const metadata: Metadata = { title: 'Preview', robots: { index: false, follow: false } };

type Params = Promise<{ screen: string }>;

/**
 * Post-booking screens with fixture data, for design review and screenshots:
 * /preview/call-sheet and /preview/roll. Off in production unless AFTERGLOW_PREVIEW=1.
 */
export default async function PreviewPage({ params }: { params: Params }) {
	if (process.env.NODE_ENV === 'production' && process.env.AFTERGLOW_PREVIEW !== '1') notFound();
	const { screen } = await params;
	if (screen === 'call-sheet') return <CallSheet orderName="#AG2041" name="Gabriela Ortiz" email="gabriela.ortiz@example.com" views={callSheetFixture()} total={formatPrice(331.6)} />;
	if (screen === 'roll') return <YourRollView views={rollFixture()} loading={false} name="Gabriela" />;
	notFound();
}
