import type { ScoreResult, StrengthScore, SurveyAnswer, VirtueId, VirtueScore } from "./types";
import { STRENGTH_MAP } from "../data/strengths";
import { VIRTUES } from "../data/virtues";

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function toPercentage(rawAverage: number): number {
  // rawAverage is 1-5 -> map to 0-100
  return Math.round(((rawAverage - 1) / 4) * 1000) / 10;
}

function standardDeviation(values: number[]): number {
  const mean = average(values);
  const variance = average(values.map((v) => (v - mean) ** 2));
  return Math.sqrt(variance);
}

export function computeScores(answers: SurveyAnswer[]): ScoreResult {
  const byStrength = new Map<string, number[]>();
  for (const answer of answers) {
    const list = byStrength.get(answer.strengthId) ?? [];
    list.push(answer.value);
    byStrength.set(answer.strengthId, list);
  }

  const unranked: Omit<StrengthScore, "rank">[] = [];
  for (const [strengthId, values] of byStrength.entries()) {
    const meta = STRENGTH_MAP[strengthId as keyof typeof STRENGTH_MAP];
    const rawAverage = average(values);
    unranked.push({
      strengthId: strengthId as StrengthScore["strengthId"],
      virtueId: meta.virtueId,
      rawAverage,
      percentage: toPercentage(rawAverage),
    });
  }

  const sorted = [...unranked].sort((a, b) => b.percentage - a.percentage);
  const strengthScores: StrengthScore[] = sorted.map((s, index) => ({ ...s, rank: index + 1 }));

  const virtueScores: VirtueScore[] = VIRTUES.map((virtue) => {
    const members = strengthScores.filter((s) => s.virtueId === virtue.id);
    const rawAverage = average(members.map((m) => m.rawAverage));
    return {
      virtueId: virtue.id as VirtueId,
      rawAverage,
      percentage: toPercentage(rawAverage),
    };
  });

  const topStrengths = strengthScores.slice(0, 5);
  const growthStrengths = [...strengthScores].slice(-3).reverse();

  const virtueSpread = standardDeviation(virtueScores.map((v) => v.percentage));
  const profileShape: ScoreResult["profileShape"] =
    virtueSpread >= 18 ? "spiky" : virtueSpread <= 8 ? "balanced" : "moderate";

  return {
    strengthScores,
    virtueScores,
    topStrengths,
    growthStrengths,
    profileShape,
  };
}
