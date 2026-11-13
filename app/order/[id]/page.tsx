import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSupabaseServer, type OrderRow } from '@/lib/supabase';
import { OrderDetail } from '@/components/order/OrderDetail';
import { SHOP } from '@/lib/config';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order ${id.slice(0, 12)} — ${SHOP.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params;

  let order: OrderRow | null = null;
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      notFound();
    }
    order = data as OrderRow;
  } catch {
    notFound();
  }

  return <OrderDetail order={order!} />;
}
