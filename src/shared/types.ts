// Shared types used by both the frontend app and the Cloudflare Pages Functions backend.

export type PersonaId =
  | "amway"
  | "employee"
  | "selfEmployed"
  | "homemaker"
  | "jobSeeker"
  | "student";

export type VirtueId =
  | "wisdom"
  | "courage"
  | "humanity"
  | "justice"
  | "temperance"
  | "transcendence";

export type StrengthId =
  | "creativity"
  | "curiosity"
  | "judgment"
  | "loveOfLearning"
  | "perspective"
  | "bravery"
  | "perseverance"
  | "honesty"
  | "zest"
  | "love"
  | "kindness"
  | "socialIntelligence"
  | "teamwork"
  | "fairness"
  | "leadership"
  | "forgiveness"
  | "humility"
  | "prudence"
  | "selfRegulation"
  | "appreciationOfBeauty"
  | "gratitude"
  | "hope"
  | "humor"
  | "spirituality";

export interface SurveyAnswer {
  questionId: string;
  strengthId: StrengthId;
  value: number; // 1-5 Likert
}

export interface StrengthScore {
  strengthId: StrengthId;
  virtueId: VirtueId;
  rawAverage: number; // 1-5
  percentage: number; // 0-100
  rank: number; // 1 = highest
}

export interface VirtueScore {
  virtueId: VirtueId;
  rawAverage: number;
  percentage: number;
}

export interface ScoreResult {
  strengthScores: StrengthScore[]; // sorted by rank
  virtueScores: VirtueScore[];
  topStrengths: StrengthScore[]; // top 5
  growthStrengths: StrengthScore[]; // bottom 3
  profileShape: "spiky" | "balanced" | "moderate";
}

export interface SubmissionInput {
  name: string;
  persona: PersonaId;
  answers: SurveyAnswer[];
}

export interface SubmissionRecord {
  id: string;
  name: string;
  persona: PersonaId;
  createdAt: string;
  answers: SurveyAnswer[];
  scoreResult: ScoreResult;
}
