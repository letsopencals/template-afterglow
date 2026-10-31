import { CheckoutProvider } from '@/contexts/checkout-context';
import { ReleaseForm } from '@/components/checkout/release-form';

export default function CheckoutPage() {
	return (
		<CheckoutProvider>
			<ReleaseForm />
		</CheckoutProvider>
	);
}
