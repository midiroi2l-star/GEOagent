const encoder = new TextEncoder();
const SESSION_MAX_AGE = 60 * 60 * 12; // 12시간

async function hmac(key, message) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function getSecret(env) {
  return env.SESSION_SECRET || 'please-set-SESSION_SECRET-as-a-secret';
}

export function getAdminCreds(env) {
  return {
    username: env.ADMIN_USERNAME || 'ffadmin',
    password: env.ADMIN_PASSWORD || 'freedom',
  };
}

export async function createSessionCookie(env, secureFlag) {
  const payload = JSON.stringify({ role: 'admin', exp: Date.now() + SESSION_MAX_AGE * 1000 });
  const encoded = btoa(unescape(encodeURIComponent(payload)));
  const sig = await hmac(getSecret(env), encoded);
  const value = `${encoded}.${sig}`;
  const secure = secureFlag ? '; Secure' : '';
  return `session=${value}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie(secureFlag) {
  const secure = secureFlag ? '; Secure' : '';
  return `session=; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function isAdminRequest(request, env) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
  if (!match) return false;
  const [encoded, sig] = match[1].split('.');
  if (!encoded || !sig) return false;
  const expected = await hmac(getSecret(env), encoded);
  if (expected !== sig) return false;
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    if (payload.role !== 'admin') return false;
    if (!payload.exp || payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function isHttps(request) {
  return new URL(request.url).protocol === 'https:';
}
