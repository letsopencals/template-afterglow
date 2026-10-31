import { SettingsForm } from '@/components/roll/settings-form';

export const dynamic = 'force-dynamic';

/** Name and phone; the email is the sign-in. */
export default function SettingsPage() {
	return (
		<div className="container-x pt-10">
			<h1 className="font-display text-4xl font-bold">Settings</h1>
			<p className="mb-8 mt-2 text-muted">The name on the class list and a number for same-day changes.</p>
			<SettingsForm />
		</div>
	);
}
