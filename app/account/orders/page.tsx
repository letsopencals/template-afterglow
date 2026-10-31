import { OrdersView } from '@/components/roll/orders-view';

export const dynamic = 'force-dynamic';

export default function OrdersPage() {
	return (
		<div className="container-x pt-10">
			<h1 className="font-display text-4xl font-bold mb-6">Orders</h1>
			<OrdersView />
		</div>
	);
}
