import type { PersonaId, StrengthScore } from "./types";
import { STRENGTH_MAP, type StrengthMeta } from "../data/strengths";

export interface ActionPlanOption {
  strengthId: string;
  strengthNameKo: string;
  text: string;
}

export interface ActionPlan {
  goal: string;
  reality: string;
  options: ActionPlanOption[];
  will: {
    day30: string;
    day60: string;
    day90: string;
  };
}

interface PersonaTemplate {
  goal: (t1: string, t2: string) => string;
  reality: string;
  day30: (t1: string) => string;
  day60: (t2: string, g1: string) => string;
  day90: (t1: string, t2: string, t3: string) => string;
}

const REALITY_TEXT: Record<PersonaId, string> = {
  amway:
    "지금 이 강점들이 상담, 미팅, 팀 관리 과정에서 실제로 얼마나 자주, 얼마나 의식적으로 쓰이고 있는지 점검해 보세요. 아래 강점 활용 옵션 중 이미 실천 중인 것과 아직 시도하지 않은 것을 먼저 구분해 보는 것이 출발점입니다.",
  employee:
    "지금 이 강점들이 실제 업무와 협업 상황에서 얼마나 드러나고 있는지 점검해 보세요. 성과 평가나 동료 피드백 중 이 강점과 연결되는 사례가 있었는지 떠올려 보는 것부터 시작하면 좋습니다.",
  selfEmployed:
    "지금 이 강점들이 매장 운영, 고객 응대, 직원 관리에서 실제로 발휘되고 있는지 점검해 보세요. 최근 매출이나 고객 반응 중 이 강점과 관련된 성공 사례가 있었는지 돌아보는 것이 출발점입니다.",
  homemaker:
    "지금 이 강점들이 가정 안팎에서 얼마나 자주, 얼마나 의식적으로 발휘되고 있는지 점검해 보세요. 최근 가족 관계나 일상 속에서 이 강점 덕분에 잘 풀렸던 순간이 있었는지 떠올려 보세요.",
  jobSeeker:
    "지금 이 강점들이 자기소개서, 면접, 네트워킹 활동에서 실제로 드러나고 있는지 점검해 보세요. 아직 이 강점을 구체적인 경험으로 정리해두지 못했다면, 그것이 바로 첫 실행 과제입니다.",
  student:
    "지금 이 강점들이 학업, 교우관계, 진로 탐색에서 얼마나 활용되고 있는지 점검해 보세요. 최근 잘 풀렸던 일이나 성취 중 이 강점과 관련된 순간이 있었는지 떠올려 보는 것이 출발점입니다.",
};

const PERSONA_TEMPLATES: Record<PersonaId, PersonaTemplate> = {
  amway: {
    goal: (t1, t2) =>
      `앞으로 90일간 ${t1}과 ${t2}를 중심으로 신규 파트너 발굴과 팀 리더십을 강화해, 안정적으로 우상향하는 사업 성장 곡선을 만든다.`,
    reality: REALITY_TEXT.amway,
    day30: (t1) => `첫 30일: ${t1}을 의식적으로 활용해 매주 최소 3명의 신규 잠재 파트너와 접점을 만들고, 상담 스크립트에 이 강점을 녹여보세요.`,
    day60: (t2, g1) => `60일차: 후원 조직 파트너 2~3명에게 ${t2}를 코칭하듯 나누어 팀 전체의 실행력을 끌어올리세요. ${g1} 영역은 체크리스트를 만들어 놓치지 않도록 보완하세요.`,
    day90: (t1, t2, t3) => `90일차: 지난 90일의 활동을 돌아보며 ${t1}·${t2}·${t3} 강점이 신규 파트너 수, 재구매율, 팀 성장에 미친 영향을 기록하고 다음 분기 목표에 반영하세요.`,
  },
  employee: {
    goal: (t1, t2) =>
      `앞으로 90일간 ${t1}과 ${t2}를 활용해 현재 역할에서의 성과를 높이고, 다음 커리어 단계로 나아갈 발판을 마련한다.`,
    reality: REALITY_TEXT.employee,
    day30: (t1) => `첫 30일: 현재 맡은 업무 중 ${t1}을 가장 두드러지게 발휘할 수 있는 과제 하나를 선택해 의식적으로 시도해 보세요.`,
    day60: (t2, g1) => `60일차: ${t2}를 활용해 팀 협업 방식을 하나 개선하고, ${g1} 영역은 동료나 상사의 피드백을 받아 보완 계획을 세우세요.`,
    day90: (t1, t2, t3) => `90일차: 분기 성과 리뷰나 1:1 면담에서 ${t1}·${t2}·${t3} 강점을 활용한 구체적 성과 사례를 이야기하고, 다음 커리어 목표를 논의하세요.`,
  },
  selfEmployed: {
    goal: (t1, t2) =>
      `앞으로 90일간 ${t1}과 ${t2}를 활용해 고객 경험과 사업 운영의 완성도를 높여, 매출과 재방문율을 함께 끌어올린다.`,
    reality: REALITY_TEXT.selfEmployed,
    day30: (t1) => `첫 30일: ${t1}을 활용해 고객 경험이나 매장 운영에서 개선할 지점 한 가지를 정해 실행해 보세요.`,
    day60: (t2, g1) => `60일차: ${t2} 강점으로 직원 또는 협력업체와의 협업 방식을 점검하고, ${g1} 영역은 외부 전문가의 자문을 받아 보완하세요.`,
    day90: (t1, t2, t3) => `90일차: 지난 90일간의 매출·고객 반응을 ${t1}·${t2}·${t3} 강점과 연결지어 분석하고, 다음 분기 사업 전략에 반영하세요.`,
  },
  homemaker: {
    goal: (t1, t2) =>
      `앞으로 90일간 ${t1}과 ${t2}를 활용해 가정 안팎에서 나다운 역할을 확장하고, 새로운 자기계발·도전의 발판을 마련한다.`,
    reality: REALITY_TEXT.homemaker,
    day30: (t1) => `첫 30일: ${t1}을 활용해 가족 관계나 일상 루틴에서 작은 변화 하나를 시도해 보세요.`,
    day60: (t2, g1) => `60일차: ${t2} 강점으로 자기계발이나 커뮤니티 활동의 첫걸음을 시작하고, ${g1} 영역은 가족과 역할을 나누어 보완하세요.`,
    day90: (t1, t2, t3) => `90일차: 지난 90일의 변화를 ${t1}·${t2}·${t3} 강점 관점에서 기록하고, 재취업·학습·창업 등 새로운 도전 계획을 구체화하세요.`,
  },
  jobSeeker: {
    goal: (t1, t2) =>
      `앞으로 90일간 ${t1}과 ${t2}를 중심으로 나에게 맞는 커리어 방향을 명확히 하고, 실제 합격으로 이어지는 지원 전략을 완성한다.`,
    reality: REALITY_TEXT.jobSeeker,
    day30: (t1) => `첫 30일: ${t1} 강점이 드러나는 경험을 자기소개서 소재로 정리하고, 관심 기업·직무 리스트를 작성하세요.`,
    day60: (t2, g1) => `60일차: ${t2} 강점을 살려 모의면접이나 네트워킹 자리에 참여하고, ${g1} 영역은 스터디나 멘토의 피드백으로 보완하세요.`,
    day90: (t1, t2, t3) => `90일차: 그동안의 지원 결과를 ${t1}·${t2}·${t3} 강점 관점에서 되짚어보고, 다음 90일의 지원 전략과 직무 방향을 재조정하세요.`,
  },
  student: {
    goal: (t1, t2) =>
      `앞으로 90일간 ${t1}과 ${t2}를 활용해 학업과 진로 탐색에서 나다운 성장 곡선을 만든다.`,
    reality: REALITY_TEXT.student,
    day30: (t1) => `첫 30일: ${t1} 강점을 가장 잘 발휘할 수 있는 과목이나 활동 하나를 정해 몰입해 보세요.`,
    day60: (t2, g1) => `60일차: ${t2} 강점으로 동아리나 조별활동에서 역할을 맡아보고, ${g1} 영역은 선생님이나 친구의 도움을 받아 보완하세요.`,
    day90: (t1, t2, t3) => `90일차: 지난 90일의 학습과 활동을 ${t1}·${t2}·${t3} 강점과 연결해 기록하고, 다음 학기 목표와 진로 탐색 계획을 세워보세요.`,
  },
};

export function buildActionPlan(
  personaId: PersonaId,
  topStrengths: StrengthScore[],
  growthStrengths: StrengthScore[]
): ActionPlan {
  const template = PERSONA_TEMPLATES[personaId];
  const topMeta: StrengthMeta[] = topStrengths.map((s) => STRENGTH_MAP[s.strengthId]);
  const growthMeta: StrengthMeta[] = growthStrengths.map((s) => STRENGTH_MAP[s.strengthId]);

  const t1 = topMeta[0]?.nameKo ?? "대표강점";
  const t2 = topMeta[1]?.nameKo ?? topMeta[0]?.nameKo ?? "대표강점";
  const t3 = topMeta[2]?.nameKo ?? t2;
  const g1 = growthMeta[0]?.nameKo ?? "보완 영역";

  const options: ActionPlanOption[] = topMeta.map((s) => ({
    strengthId: s.id,
    strengthNameKo: s.nameKo,
    text: s.personaApplications[personaId],
  }));

  return {
    goal: template.goal(t1, t2),
    reality: template.reality,
    options,
    will: {
      day30: template.day30(t1),
      day60: template.day60(t2, g1),
      day90: template.day90(t1, t2, t3),
    },
  };
}
