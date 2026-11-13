import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { enquirySchema } from '@/lib/schemas';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const limited = rateLimit(`enquiry:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const supabase = getSupabaseServer();
    const { error } = await supabase.from('enquiries').insert({
      name: data.name,
      phone: data.phone,
      occasion: data.occasion,
      message: data.message,
    });

    if (error) {
      return NextResponse.json({ error: 'Could not save enquiry.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
