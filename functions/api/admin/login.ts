import type { Env } from "../../_lib/env";
import { createSessionCookie, getAdminCredentials } from "../../_lib/auth";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }

  const { username, password } = getAdminCredentials(env);
  if (body.username !== username || body.password !== password) {
    return new Response(JSON.stringify({ error: "invalid_credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cookie = await createSessionCookie(env);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
  });
};
