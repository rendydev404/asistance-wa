export const ADMIN_SESSION_COOKIE = 'admin_session';

function readCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : undefined;
}

export function isAdminAuthorized(request: Request): boolean {
  const expectedToken = process.env.ADMIN_SESSION_TOKEN;
  if (!expectedToken) return false;

  const bearerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const sessionToken = bearerToken || readCookie(request, ADMIN_SESSION_COOKIE);
  return sessionToken === expectedToken;
}

export function isAdminPasswordValid(password: string): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD);
}
