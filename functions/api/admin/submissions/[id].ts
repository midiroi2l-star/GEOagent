import type { Env } from "../../../_lib/env";
import { isAuthenticated, unauthorizedResponse } from "../../../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  if (!(await isAuthenticated(request, env))) return unauthorizedResponse();

  const id = params.id as string;
  const row = await env.DB.prepare(
    "SELECT id, name, persona, created_at, answers, score_result FROM submissions WHERE id = ?"
  )
    .bind(id)
    .first<{ id: string; name: string; persona: string; created_at: string; answers: string; score_result: string }>();

  if (!row) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      id: row.id,
      name: row.name,
      persona: row.persona,
      createdAt: row.created_at,
      answers: JSON.parse(row.answers),
      scoreResult: JSON.parse(row.score_result),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
