import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, type OrderStatus } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import { orderStatusSchema } from '@/lib/schemas';

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request.headers.get('cookie'))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('orders')
      .update({ status: parsed.data.status as OrderStatus, updated_at: new Date().toISOString() })
      .eq('id', parsed.data.orderId);

    if (error) {
      return NextResponse.json({ error: 'Could not update order.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
