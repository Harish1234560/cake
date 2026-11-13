import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';

const MAX_SIZE = 5 * 1024 * 1024;
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const limited = rateLimit(`upload:${ip}`, 20, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many uploads.' }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5 MB.' }, { status: 400 });
    }

    if (!VALID_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WebP allowed.' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from('reference-photos')
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error || !data) {
      return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('reference-photos')
      .getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
