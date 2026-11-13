import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.ADMIN_SESSION_SECRET || 'fallback-dev-secret-change-in-prod';
export const COOKIE_NAME = 'mg_admin_session';

export function signToken(payload: string): string {
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): boolean {
  const idx = token.lastIndexOf('.');
  if (idx < 1) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expectedSig = createHmac('sha256', SECRET).update(payload).digest('hex');
  try {
    if (sig.length !== expectedSig.length) return false;
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

export function createSessionCookie(): string {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const payload = `admin:${expires.getTime()}`;
  const token = signToken(payload);
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=${expires.toUTCString()}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function getCookieName(): string {
  return COOKIE_NAME;
}

export function isAdminRequest(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const c of cookies) {
    const [name, ...valueParts] = c.split('=');
    if (name === COOKIE_NAME) {
      const value = valueParts.join('=');
      if (verifyToken(value)) {
        const payload = value.slice(0, value.lastIndexOf('.'));
        const expiresStr = payload.split(':')[1];
        const expires = parseInt(expiresStr, 10);
        if (Date.now() < expires) return true;
      }
    }
  }
  return false;
}
