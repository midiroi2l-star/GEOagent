import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { VIRTUES } from "../data/virtues";
import type { VirtueScore } from "../shared/types";

export function RadarChartView({ virtueScores, height = 340 }: { virtueScores: VirtueScore[]; height?: number }) {
  const data = VIRTUES.map((v) => {
    const score = virtueScores.find((s) => s.virtueId === v.id);
    return {
      label: v.nameKo,
      value: score?.percentage ?? 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="#d8dae8" />
        <PolarAngleAxis dataKey="label" tick={{ fill: "#1c1e2b", fontSize: 13, fontWeight: 600 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#9497ab", fontSize: 10 }} axisLine={false} />
        <Radar name="강점 점수" dataKey="value" stroke="#2c2f7a" fill="#2c2f7a" fillOpacity={0.32} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
