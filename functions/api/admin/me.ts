import type { Env } from "../../_lib/env";
import { isAuthenticated } from "../../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const authenticated = await isAuthenticated(context.request, context.env);
  return new Response(JSON.stringify({ authenticated }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
