import { getSupabaseServer, type OrderRow, type OrderStatus } from '@/lib/supabase';
import { AdminOrdersClient } from '@/components/admin/AdminOrdersClient';

const STATUS_TABS: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'received', label: 'Received' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default async function AdminOrdersPage() {
  let orders: OrderRow[] = [];
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      orders = data as OrderRow[];
    }
  } catch {
    // database not yet configured
  }

  const today = new Date().toISOString().split('T')[0];
  const todays = orders.filter((o) => o.delivery_date === today);

  return <AdminOrdersClient orders={orders} todays={todays} statusTabs={STATUS_TABS} />;
}
