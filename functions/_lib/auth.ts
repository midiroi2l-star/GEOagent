// Shared admin-session helpers for Cloudflare Pages Functions.
// Files under functions/_lib are ignored by Pages' file-based routing.

const COOKIE_NAME = "sc_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
const DEV_FALLBACK_SECRET = "strength-compass-dev-secret-change-me";

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(signature);
}

export function getAdminCredentials(env: { ADMIN_USERNAME?: string; ADMIN_PASSWORD?: string }) {
  return {
    username: env.ADMIN_USERNAME || "admin",
    password: env.ADMIN_PASSWORD || "admin1004",
  };
}

function getSecret(env: { ADMIN_SESSION_SECRET?: string }): string {
  return env.ADMIN_SESSION_SECRET || DEV_FALLBACK_SECRET;
}

export async function createSessionCookie(env: { ADMIN_SESSION_SECRET?: string }): Promise<string> {
  const payload = JSON.stringify({ role: "admin", exp: Date.now() + SESSION_TTL_SECONDS * 1000 });
  const payloadB64 = toBase64Url(new TextEncoder().encode(payload).buffer as ArrayBuffer);
  const signature = await hmac(getSecret(env), payloadB64);
  const token = `${payloadB64}.${signature}`;
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

export async function isAuthenticated(request: Request, env: { ADMIN_SESSION_SECRET?: string }): Promise<boolean> {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return false;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return false;

  const expected = await hmac(getSecret(env), payloadB64);
  if (expected !== signature) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
