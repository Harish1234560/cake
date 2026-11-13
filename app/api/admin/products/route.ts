import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/auth';
import { productUpdateSchema } from '@/lib/schemas';

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request.headers.get('cookie'))) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }
    const data = parsed.data;

    const updates: Record<string, unknown> = {};
    if (data.in_stock !== undefined) updates.in_stock = data.in_stock;
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.variants !== undefined) updates.variants = data.variants;

    const supabase = getSupabaseServer();
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', data.id);

    if (error) {
      return NextResponse.json({ error: 'Could not update product.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
