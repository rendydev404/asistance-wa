import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isAdminPasswordValid } from '@/lib/auth';

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: '' }));

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_TOKEN) {
    return NextResponse.json({ error: 'Authentication is not configured' }, { status: 503 });
  }

  if (typeof password !== 'string' || !isAdminPasswordValid(password)) {
    return NextResponse.json({ error: 'Password salah' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: process.env.ADMIN_SESSION_TOKEN,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
