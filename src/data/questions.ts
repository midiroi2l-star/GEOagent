import type { StrengthId } from "../shared/types";

export interface SurveyQuestion {
  id: string;
  strengthId: StrengthId;
  text: string;
}

// 24 strengths x 2 items = 48 questions, 5-point Likert scale.
export const QUESTIONS: SurveyQuestion[] = [
  { id: "q01", strengthId: "creativity", text: "나는 문제를 해결할 때 남들과 다른 새로운 방법을 자주 떠올린다." },
  { id: "q02", strengthId: "creativity", text: "나는 익숙한 방식보다 색다른 접근을 시도하는 것을 즐긴다." },
  { id: "q03", strengthId: "curiosity", text: "나는 새로운 주제나 경험에 대해 강한 흥미를 느낀다." },
  { id: "q04", strengthId: "curiosity", text: "나는 잘 모르는 것이 있으면 스스로 찾아보고 탐구한다." },
  { id: "q05", strengthId: "judgment", text: "나는 결론을 내리기 전에 여러 관점의 근거를 꼼꼼히 따져본다." },
  { id: "q06", strengthId: "judgment", text: "나는 내 생각과 다른 의견도 열린 마음으로 검토한다." },
  { id: "q07", strengthId: "loveOfLearning", text: "나는 새로운 지식이나 기술을 배우는 과정 자체를 즐긴다." },
  { id: "q08", strengthId: "loveOfLearning", text: "나는 시간이 나면 책이나 강의 등을 통해 스스로 학습한다." },
  { id: "q09", strengthId: "perspective", text: "나는 복잡한 상황에서도 핵심을 파악해 조언할 수 있다." },
  { id: "q10", strengthId: "perspective", text: "주변 사람들은 나에게 인생이나 문제 해결에 대한 조언을 구한다." },
  { id: "q11", strengthId: "bravery", text: "나는 두렵거나 반대에 부딪혀도 옳다고 생각하는 일을 실행한다." },
  { id: "q12", strengthId: "bravery", text: "나는 거절당할 위험이 있어도 필요한 일이면 먼저 시도한다." },
  { id: "q13", strengthId: "perseverance", text: "나는 어려움이 있어도 시작한 일을 끝까지 마무리한다." },
  { id: "q14", strengthId: "perseverance", text: "나는 지루하거나 힘든 과정도 포기하지 않고 견뎌낸다." },
  { id: "q15", strengthId: "honesty", text: "나는 상황이 불리해도 사실을 있는 그대로 말한다." },
  { id: "q16", strengthId: "honesty", text: "나는 나 자신의 가치관에 맞게 진정성 있게 행동하려 노력한다." },
  { id: "q17", strengthId: "zest", text: "나는 하루하루를 활기차고 열정적으로 살아간다." },
  { id: "q18", strengthId: "zest", text: "나는 일이나 활동에 몰입하면 에너지가 넘친다." },
  { id: "q19", strengthId: "love", text: "나는 가까운 사람들과 깊고 친밀한 관계를 맺는다." },
  { id: "q20", strengthId: "love", text: "나는 사랑하는 사람에게 애정을 표현하는 것이 자연스럽다." },
  { id: "q21", strengthId: "kindness", text: "나는 대가를 바라지 않고 다른 사람을 돕는다." },
  { id: "q22", strengthId: "kindness", text: "나는 주변 사람들의 필요를 잘 살피고 배려한다." },
  { id: "q23", strengthId: "socialIntelligence", text: "나는 다른 사람의 감정이나 의도를 빠르게 알아챈다." },
  { id: "q24", strengthId: "socialIntelligence", text: "나는 다양한 사회적 상황에서 어떻게 행동해야 할지 잘 안다." },
  { id: "q25", strengthId: "teamwork", text: "나는 팀의 목표를 위해 내 역할을 성실히 해낸다." },
  { id: "q26", strengthId: "teamwork", text: "나는 혼자 일할 때보다 팀으로 협력할 때 더 좋은 결과를 낸다고 생각한다." },
  { id: "q27", strengthId: "fairness", text: "나는 개인적 감정과 상관없이 모든 사람을 공정하게 대한다." },
  { id: "q28", strengthId: "fairness", text: "나는 사람을 판단할 때 편견 없이 형평성을 중시한다." },
  { id: "q29", strengthId: "leadership", text: "나는 사람들을 이끌어 함께 목표를 이루도록 조직하는 것을 잘한다." },
  { id: "q30", strengthId: "leadership", text: "사람들은 어떤 일을 할 때 내가 방향을 제시해주길 기대한다." },
  { id: "q31", strengthId: "forgiveness", text: "나는 나에게 잘못한 사람이라도 오래 원망하지 않는다." },
  { id: "q32", strengthId: "forgiveness", text: "나는 실수한 사람에게 다시 기회를 주는 편이다." },
  { id: "q33", strengthId: "humility", text: "나는 내가 잘한 일이라도 스스로 내세우지 않는다." },
  { id: "q34", strengthId: "humility", text: "나는 내 성취보다 함께한 사람들의 기여를 먼저 이야기한다." },
  { id: "q35", strengthId: "prudence", text: "나는 결정을 내리기 전에 결과를 신중히 따져본다." },
  { id: "q36", strengthId: "prudence", text: "나는 충동적으로 행동하기보다 계획을 세워 움직인다." },
  { id: "q37", strengthId: "selfRegulation", text: "나는 감정이 격해지는 상황에서도 스스로를 잘 통제한다." },
  { id: "q38", strengthId: "selfRegulation", text: "나는 눈앞의 유혹이 있어도 목표를 위해 절제할 수 있다." },
  { id: "q39", strengthId: "appreciationOfBeauty", text: "나는 자연이나 예술, 뛰어난 성취를 보면 깊은 감동을 느낀다." },
  { id: "q40", strengthId: "appreciationOfBeauty", text: "나는 일상 속 아름다움이나 탁월함을 잘 알아차린다." },
  { id: "q41", strengthId: "gratitude", text: "나는 내가 받은 도움과 혜택에 대해 자주 감사함을 느낀다." },
  { id: "q42", strengthId: "gratitude", text: "나는 감사한 마음을 말이나 행동으로 자주 표현한다." },
  { id: "q43", strengthId: "hope", text: "나는 어려운 상황에서도 앞으로 잘될 것이라 기대한다." },
  { id: "q44", strengthId: "hope", text: "나는 목표를 이루기 위한 방법을 포기하지 않고 계속 찾는다." },
  { id: "q45", strengthId: "humor", text: "나는 상황 속에서 재치나 유머를 잘 찾아낸다." },
  { id: "q46", strengthId: "humor", text: "나는 유머로 주변 분위기를 밝게 만드는 편이다." },
  { id: "q47", strengthId: "spirituality", text: "나는 내 삶과 하는 일에 특별한 의미와 목적이 있다고 느낀다." },
  { id: "q48", strengthId: "spirituality", text: "나는 내 신념과 가치관에 따라 살아가려 노력한다." },
];

export const LIKERT_LABELS = [
  "전혀 그렇지 않다",
  "그렇지 않다",
  "보통이다",
  "그렇다",
  "매우 그렇다",
];
