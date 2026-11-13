import { getSupabaseServer, type Product } from '@/lib/supabase';
import { AdminProductsClient } from '@/components/admin/AdminProductsClient';

export default async function AdminProductsPage() {
  let products: Product[] = [];
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) {
      products = data as Product[];
    }
  } catch {
    // database not yet configured
  }

  return <AdminProductsClient products={products} />;
}
