import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { adminLoginSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const limited = rateLimit(`admin-login:${ip}`, 5, 10 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many login attempts. Try again in 10 minutes.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Password required.' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin not configured.' }, { status: 500 });
    }

    if (parsed.data.password !== adminPassword) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    const cookie = createSessionCookie();
    const res = NextResponse.json({ success: true });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch {
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
