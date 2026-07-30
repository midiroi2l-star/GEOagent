import type { Env } from "../../_lib/env";
import { isAuthenticated, unauthorizedResponse } from "../../_lib/auth";
import type { ScoreResult } from "../../../src/shared/types";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (!(await isAuthenticated(request, env))) return unauthorizedResponse();

  const url = new URL(request.url);
  const persona = url.searchParams.get("persona");
  const search = url.searchParams.get("q");
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 100), 500);

  let query = "SELECT id, name, persona, created_at, score_result FROM submissions";
  const conditions: string[] = [];
  const params: string[] = [];
  if (persona) {
    conditions.push("persona = ?");
    params.push(persona);
  }
  if (search) {
    conditions.push("name LIKE ?");
    params.push(`%${search}%`);
  }
  if (conditions.length) query += ` WHERE ${conditions.join(" AND ")}`;
  query += " ORDER BY created_at DESC LIMIT ?";
  params.push(String(limit));

  const { results } = await env.DB.prepare(query)
    .bind(...params)
    .all<{ id: string; name: string; persona: string; created_at: string; score_result: string }>();

  const rows = (results ?? []).map((row) => {
    const scoreResult = JSON.parse(row.score_result) as ScoreResult;
    return {
      id: row.id,
      name: row.name,
      persona: row.persona,
      createdAt: row.created_at,
      topStrength: scoreResult.topStrengths[0]?.strengthId ?? null,
      profileShape: scoreResult.profileShape,
    };
  });

  return new Response(JSON.stringify({ submissions: rows }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
