import { createSessionCookie, getAdminCreds, isHttps } from '../_utils/auth.js';
import { json } from '../_utils/events.js';

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: '잘못된 요청입니다.' }, 400);
  }

  const { username, password } = body || {};
  const creds = getAdminCreds(env);

  if (username === creds.username && password === creds.password) {
    const cookie = await createSessionCookie(env, isHttps(request));
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': cookie,
      },
    });
  }

  return json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, 401);
}
