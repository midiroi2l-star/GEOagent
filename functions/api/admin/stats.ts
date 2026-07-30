import type { Env } from "../../_lib/env";
import { isAuthenticated, unauthorizedResponse } from "../../_lib/auth";
import type { ScoreResult } from "../../../src/shared/types";
import { VIRTUES } from "../../../src/data/virtues";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (!(await isAuthenticated(request, env))) return unauthorizedResponse();

  const { results } = await env.DB.prepare("SELECT persona, created_at, score_result FROM submissions").all<{
    persona: string;
    created_at: string;
    score_result: string;
  }>();

  const rows = results ?? [];
  const total = rows.length;

  const personaCounts: Record<string, number> = {};
  const shapeCounts: Record<string, number> = {};
  const strengthFrequency: Record<string, number> = {};
  const virtueSums: Record<string, number> = Object.fromEntries(VIRTUES.map((v) => [v.id, 0]));

  for (const row of rows) {
    personaCounts[row.persona] = (personaCounts[row.persona] ?? 0) + 1;
    const scoreResult = JSON.parse(row.score_result) as ScoreResult;
    shapeCounts[scoreResult.profileShape] = (shapeCounts[scoreResult.profileShape] ?? 0) + 1;
    for (const top of scoreResult.topStrengths) {
      strengthFrequency[top.strengthId] = (strengthFrequency[top.strengthId] ?? 0) + 1;
    }
    for (const v of scoreResult.virtueScores) {
      virtueSums[v.virtueId] = (virtueSums[v.virtueId] ?? 0) + v.percentage;
    }
  }

  const virtueAverages = VIRTUES.map((v) => ({
    virtueId: v.id,
    nameKo: v.nameKo,
    average: total > 0 ? Math.round((virtueSums[v.id] / total) * 10) / 10 : 0,
  }));

  const topStrengthsRanked = Object.entries(strengthFrequency)
    .map(([strengthId, count]) => ({ strengthId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const last7Days = rows.filter((r) => Date.now() - new Date(r.created_at).getTime() <= 7 * 86400000).length;
  const last30Days = rows.filter((r) => Date.now() - new Date(r.created_at).getTime() <= 30 * 86400000).length;

  return new Response(
    JSON.stringify({
      total,
      last7Days,
      last30Days,
      personaCounts,
      shapeCounts,
      virtueAverages,
      topStrengthsRanked,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
