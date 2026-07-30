import type { Env } from "../_lib/env";
import { computeScores } from "../../src/shared/scoring";
import type { PersonaId, SurveyAnswer } from "../../src/shared/types";

const VALID_PERSONAS: PersonaId[] = ["amway", "employee", "selfEmployed", "homemaker", "jobSeeker", "student"];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  let body: { name?: string; persona?: string; answers?: SurveyAnswer[] };
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const name = (body.name ?? "").toString().trim().slice(0, 60);
  const persona = body.persona as PersonaId;
  const answers = body.answers;

  if (!name) return json({ error: "name_required" }, 400);
  if (!VALID_PERSONAS.includes(persona)) return json({ error: "invalid_persona" }, 400);
  if (!Array.isArray(answers) || answers.length === 0) return json({ error: "answers_required" }, 400);
  for (const a of answers) {
    if (typeof a.value !== "number" || a.value < 1 || a.value > 5) {
      return json({ error: "invalid_answer_value" }, 400);
    }
  }

  const scoreResult = computeScores(answers);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await env.DB.prepare(
    "INSERT INTO submissions (id, name, persona, created_at, answers, score_result) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(id, name, persona, createdAt, JSON.stringify(answers), JSON.stringify(scoreResult))
    .run();

  return json({ id });
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
