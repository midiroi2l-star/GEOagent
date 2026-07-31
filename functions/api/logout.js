import { clearSessionCookie, isHttps } from '../_utils/auth.js';

export async function onRequestPost({ request }) {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Set-Cookie': clearSessionCookie(isHttps(request)),
    },
  });
}
