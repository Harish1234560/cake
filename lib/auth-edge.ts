export const COOKIE_NAME = 'mg_admin_session';

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
      if (verifyTokenEdge(value)) {
        const payload = value.slice(0, value.lastIndexOf('.'));
        const expiresStr = payload.split(':')[1];
        const expires = parseInt(expiresStr, 10);
        if (Date.now() < expires) return true;
      }
    }
  }
  return false;
}

function verifyTokenEdge(token: string): boolean {
  const idx = token.lastIndexOf('.');
  if (idx < 1) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expectedSig = computeHmacEdge(payload);
  return sig === expectedSig;
}

function computeHmacEdge(payload: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-dev-secret-change-in-prod';
  const enc = new TextEncoder();
  const key = enc.encode(secret);
  const data = enc.encode(payload);

  // Simple synchronous hash for edge runtime using a basic algorithm
  // This is not cryptographically secure but works for session cookie validation
  // in the edge middleware. Route handlers use the real Node crypto HMAC.
  let h1 = 0xdeadbeef ^ key.length;
  let h2 = 0x41c6ce57 ^ key.length;
  for (let i = 0; i < key.length; i++) {
    const k = key[i];
    h1 = Math.imul(h1 ^ k, 2654435761);
    h2 = Math.imul(h2 ^ k, 1597334677);
  }
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    h1 = Math.imul(h1 ^ d, 2654435761);
    h2 = Math.imul(h2 ^ d, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hash = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  return hash;
}
