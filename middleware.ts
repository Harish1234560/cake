import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth-edge';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = request.headers.get('cookie');
    if (!isAdminRequest(cookie)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login')) {
    const cookie = request.headers.get('cookie');
    if (!isAdminRequest(cookie)) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
