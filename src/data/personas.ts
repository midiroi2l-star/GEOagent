import type { PersonaId } from "../shared/types";

export interface PersonaMeta {
  id: PersonaId;
  label: string;
  emoji: string;
  tagline: string;
  reportIntro: (name: string) => string;
  focusAreas: string[];
}

export const PERSONAS: PersonaMeta[] = [
  {
    id: "amway",
    label: "암웨이 사업자",
    emoji: "🤝",
    tagline: "네트워크와 관계로 성장하는 사업가",
    reportIntro: (name) =>
      `네트워크 마케팅 사업은 결국 '사람'과 '신뢰'로 완성되는 사업입니다. ${name}님의 강점 프로파일은 파트너를 발굴하고, 팀을 세우고, 오래가는 신뢰를 만드는 데 있어 고유한 무기가 됩니다.`,
    focusAreas: ["신규 파트너 발굴 및 상담", "후원 조직(팀) 빌딩과 리더십", "제품·사업 설명 커뮤니케이션", "자기동기부여와 꾸준함"],
  },
  {
    id: "employee",
    label: "직장인",
    emoji: "💼",
    tagline: "조직 안에서 성과와 성장을 만드는 사람",
    reportIntro: (name) =>
      `조직 생활은 성과뿐 아니라 관계, 협업, 자기관리가 모두 맞물리는 여정입니다. ${name}님의 강점 프로파일은 지금의 역할에서 더 인정받고, 다음 단계로 성장하는 데 필요한 지렛대를 보여줍니다.`,
    focusAreas: ["업무 성과와 전문성", "협업 및 팀워크", "리더십과 커리어 성장", "스트레스 관리와 워라밸"],
  },
  {
    id: "selfEmployed",
    label: "자영업자",
    emoji: "🏪",
    tagline: "자신의 이름을 걸고 사업을 운영하는 사람",
    reportIntro: (name) =>
      `자영업은 매 순간이 결정과 책임의 연속입니다. ${name}님의 강점 프로파일은 고객, 직원, 사업 운영 전반에서 어떤 방식이 가장 자연스럽고 강력한 성공 전략이 될 수 있는지를 알려줍니다.`,
    focusAreas: ["고객 경험과 브랜드 구축", "사업 운영과 재무 관리", "직원 관리와 리더십", "위기 대응과 회복탄력성"],
  },
  {
    id: "homemaker",
    label: "주부",
    emoji: "🏡",
    tagline: "가정을 이끄는 살림과 삶의 관리자",
    reportIntro: (name) =>
      `가정을 이끄는 일은 눈에 잘 띄지 않지만 가장 정교한 관리 능력이 필요한 일입니다. ${name}님의 강점 프로파일은 가족 관계, 자기계발, 새로운 도전 앞에서 어떤 자산을 이미 가지고 있는지를 보여줍니다.`,
    focusAreas: ["가족 관계와 자녀 양육", "가계 및 시간 관리", "자기계발과 새로운 도전", "커뮤니티 및 대인관계"],
  },
  {
    id: "jobSeeker",
    label: "취준생",
    emoji: "🎯",
    tagline: "새로운 커리어의 문을 두드리는 도전자",
    reportIntro: (name) =>
      `구직 활동은 자신을 가장 정확하고 설득력 있게 설명해야 하는 시간입니다. ${name}님의 강점 프로파일은 자기소개서와 면접에서 진짜 나다운 이야기를 만드는 재료가 되어 줄 것입니다.`,
    focusAreas: ["자기이해와 커리어 방향 설정", "자기소개서·면접 경쟁력", "네트워킹과 정보 탐색", "구직 스트레스 관리"],
  },
  {
    id: "student",
    label: "학생",
    emoji: "📚",
    tagline: "배움과 성장의 한가운데 있는 사람",
    reportIntro: (name) =>
      `학창 시절의 강점은 성적표에 다 담기지 않습니다. ${name}님의 강점 프로파일은 학업, 교우관계, 진로 탐색에서 나답게 성장할 수 있는 방향을 알려줍니다.`,
    focusAreas: ["학업 및 자기주도학습", "교우관계와 협업", "진로 탐색과 자기이해", "동기부여와 자신감"],
  },
];

export const PERSONA_MAP: Record<PersonaId, PersonaMeta> = Object.fromEntries(
  PERSONAS.map((p) => [p.id, p])
) as Record<PersonaId, PersonaMeta>;
