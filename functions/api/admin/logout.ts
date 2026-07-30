import type { Env } from "../../_lib/env";
import { clearSessionCookie } from "../../_lib/auth";

export const onRequestPost: PagesFunction<Env> = async () => {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Set-Cookie": clearSessionCookie() },
  });
};
