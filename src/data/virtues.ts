import type { VirtueId } from "../shared/types";

export interface VirtueMeta {
  id: VirtueId;
  nameKo: string;
  nameEn: string;
  description: string;
  colorVar: string; // CSS variable name defined in index.css
}

export const VIRTUES: VirtueMeta[] = [
  {
    id: "wisdom",
    nameKo: "지혜와 지식",
    nameEn: "Wisdom & Knowledge",
    description: "배움과 지식을 활용해 세상을 더 명확하게 이해하고 문제를 해결하는 힘",
    colorVar: "var(--color-virtue-wisdom)",
  },
  {
    id: "courage",
    nameKo: "용기",
    nameEn: "Courage",
    description: "내외부의 어려움과 저항 속에서도 목표를 이루려는 의지의 힘",
    colorVar: "var(--color-virtue-courage)",
  },
  {
    id: "humanity",
    nameKo: "인간애",
    nameEn: "Humanity",
    description: "다른 사람을 보살피고 친밀한 관계를 맺는 대인관계의 힘",
    colorVar: "var(--color-virtue-humanity)",
  },
  {
    id: "justice",
    nameKo: "정의",
    nameEn: "Justice",
    description: "공동체와 집단을 이롭게 하는 건강한 사회적 관계의 힘",
    colorVar: "var(--color-virtue-justice)",
  },
  {
    id: "temperance",
    nameKo: "절제",
    nameEn: "Temperance",
    description: "지나침을 경계하고 스스로를 다스리는 자기조절의 힘",
    colorVar: "var(--color-virtue-temperance)",
  },
  {
    id: "transcendence",
    nameKo: "초월",
    nameEn: "Transcendence",
    description: "더 큰 의미와 연결되어 삶의 목적을 찾는 초월의 힘",
    colorVar: "var(--color-virtue-transcendence)",
  },
];

export const VIRTUE_MAP: Record<VirtueId, VirtueMeta> = Object.fromEntries(
  VIRTUES.map((v) => [v.id, v])
) as Record<VirtueId, VirtueMeta>;
