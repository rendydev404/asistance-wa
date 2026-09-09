import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from './lib/auth';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApi = pathname.startsWith('/api/settings') || pathname.startsWith('/api/knowledge') || pathname.startsWith('/api/logs');

  if (!isAdminRoute && !isAdminApi) return NextResponse.next();

  const expectedToken = process.env.ADMIN_SESSION_TOKEN;
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authorized = Boolean(expectedToken && sessionToken === expectedToken);

  if (authorized) return NextResponse.next();

  if (isAdminApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/settings/:path*', '/api/knowledge/:path*', '/api/logs/:path*'],
};
