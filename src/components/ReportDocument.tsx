import { forwardRef } from "react";
import { PERSONA_MAP } from "../data/personas";
import { STRENGTH_MAP } from "../data/strengths";
import { VIRTUE_MAP } from "../data/virtues";
import { RadarChartView } from "./RadarChartView";
import { buildActionPlan } from "../shared/actionPlan";
import { METHODOLOGY_FOOTER } from "../data/methodology";
import { SHAPE_LABEL, SHAPE_TEXT } from "../data/profileShape";
import type { PersonaId, ScoreResult } from "../shared/types";

interface ReportDocumentProps {
  name: string;
  persona: PersonaId;
  scoreResult: ScoreResult;
}

export const ReportDocument = forwardRef<HTMLDivElement, ReportDocumentProps>(function ReportDocument(
  { name, persona, scoreResult },
  ref
) {
  const personaMeta = PERSONA_MAP[persona];
  const plan = buildActionPlan(persona, scoreResult.topStrengths, scoreResult.growthStrengths);
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div ref={ref} className="mx-auto flex max-w-[210mm] flex-col gap-6 overflow-x-auto px-4">
      {/* PAGE 1: COVER */}
      <section className="report-page relative flex flex-col justify-between overflow-hidden rounded-sm bg-brand-navy p-14 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-indigo/50 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>🧭</span>
            <span>강점나침반</span>
            <span className="text-xs font-medium text-brand-gold">STRENGTH COMPASS</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">PERSONAL STRENGTHS CONSULTING REPORT</p>
        </div>

        <div className="relative">
          <p className="mb-3 inline-block rounded-full border border-brand-gold/40 bg-brand-gold/10 px-4 py-1 text-xs font-semibold text-brand-gold">
            {personaMeta.emoji} {personaMeta.label} 맞춤 컨설팅
          </p>
          <h1 className="text-4xl font-bold leading-tight">강점 발견 워크숍</h1>
          <h2 className="text-2xl font-semibold text-slate-200">개인 맞춤 컨설팅 리포트</h2>
          <div className="mt-10 border-t border-white/15 pt-6">
            <p className="text-xs text-slate-400">FOR</p>
            <p className="text-3xl font-bold">{name} 님</p>
          </div>
        </div>

        <div className="relative flex items-end justify-between text-xs text-slate-400">
          <span>발행일: {today}</span>
          <span className="rounded border border-white/20 px-2 py-1">CONFIDENTIAL · 본인 전용</span>
        </div>
      </section>

      {/* PAGE 2: SUMMARY + RADAR */}
      <section className="report-page flex flex-col rounded-sm bg-white p-14 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">01. Executive Summary</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">나의 강점 지형 한눈에 보기</h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{personaMeta.reportIntro(name)}</p>

        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
          <RadarChartView virtueScores={scoreResult.virtueScores} height={300} />
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-800">프로파일 유형: {SHAPE_LABEL[scoreResult.profileShape]}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{SHAPE_TEXT[scoreResult.profileShape]}</p>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold text-slate-800">대표강점 TOP 5</p>
          <div className="space-y-2">
            {scoreResult.topStrengths.map((s) => {
              const meta = STRENGTH_MAP[s.strengthId];
              const virtue = VIRTUE_MAP[s.virtueId];
              return (
                <div key={s.strengthId} className="flex items-center gap-3 text-xs">
                  <span className="w-16 shrink-0 font-semibold text-slate-700">{meta.nameKo}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${s.percentage}%`, backgroundColor: virtue.colorVar }} />
                  </div>
                  <span className="w-10 shrink-0 text-right font-semibold text-slate-500">{s.percentage}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PAGE 3: TOP 5 DETAIL */}
      <section className="report-page flex flex-col rounded-sm bg-white p-14 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">02. Signature Strengths</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">대표강점 TOP 5 상세 분석</h2>
        <div className="mt-6 space-y-5">
          {scoreResult.topStrengths.map((s, i) => {
            const meta = STRENGTH_MAP[s.strengthId];
            const virtue = VIRTUE_MAP[s.virtueId];
            return (
              <div key={s.strengthId} className="rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: virtue.colorVar }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-base font-bold text-slate-900">{meta.nameKo}</p>
                      <p className="text-[11px] text-slate-400">
                        {meta.nameEn} · {virtue.nameKo}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{s.percentage}점</span>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-600">{meta.longDescription}</p>
                <p className="mt-2 rounded-lg bg-brand-indigo/5 p-3 text-xs leading-relaxed text-brand-indigo">
                  <span className="font-semibold">[{personaMeta.label} 맞춤 활용법] </span>
                  {meta.personaApplications[persona]}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">⚠ 과잉 사용 주의: {meta.overuse}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PAGE 4: GROWTH + FULL RANKING */}
      <section className="report-page flex flex-col rounded-sm bg-white p-14 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">03. Growth Focus</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">보완하면 좋은 성장 영역</h2>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          아래 강점들은 '부족한 것'이 아니라, 상대적으로 덜 사용되고 있어 의식적으로 보완하면 시너지를 낼 수 있는
          영역입니다.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-1">
          {scoreResult.growthStrengths.map((s) => {
            const meta = STRENGTH_MAP[s.strengthId];
            return (
              <div key={s.strengthId} className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">
                  {meta.nameKo} <span className="ml-1 text-xs font-normal text-slate-400">{s.percentage}점</span>
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{meta.underuse}</p>
                <p className="mt-1 text-xs leading-relaxed text-emerald-700">💡 {meta.coachingApproach}</p>
              </div>
            );
          })}
        </div>

        <p className="mb-3 mt-8 text-sm font-semibold text-slate-800">24개 성격강점 전체 순위</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px]">
          {scoreResult.strengthScores.map((s) => {
            const meta = STRENGTH_MAP[s.strengthId];
            const virtue = VIRTUE_MAP[s.virtueId];
            return (
              <div key={s.strengthId} className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-right text-slate-400">{s.rank}</span>
                <span className="w-14 shrink-0 truncate font-medium text-slate-700">{meta.nameKo}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${s.percentage}%`, backgroundColor: virtue.colorVar }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PAGE 5: ACTION PLAN */}
      <section className="report-page flex flex-col rounded-sm bg-white p-14 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">04. Action Plan (GROW Model)</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">90일 실행 액션플랜</h2>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border-l-4 border-brand-indigo bg-slate-50 p-4">
            <p className="text-xs font-bold text-brand-indigo">GOAL 목표</p>
            <p className="mt-1 text-sm text-slate-700">{plan.goal}</p>
          </div>
          <div className="rounded-xl border-l-4 border-slate-300 bg-slate-50 p-4">
            <p className="text-xs font-bold text-slate-500">REALITY 현재 점검</p>
            <p className="mt-1 text-sm text-slate-700">{plan.reality}</p>
          </div>
          <div className="rounded-xl border-l-4 border-brand-gold bg-slate-50 p-4">
            <p className="text-xs font-bold text-amber-600">OPTIONS 강점 활용 옵션</p>
            <ul className="mt-2 space-y-1.5">
              {plan.options.map((o) => (
                <li key={o.strengthId} className="text-sm text-slate-700">
                  <span className="font-semibold">{o.strengthNameKo}</span> — {o.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border-l-4 border-emerald-500 bg-slate-50 p-4">
            <p className="text-xs font-bold text-emerald-600">WILL 실행 마일스톤</p>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-semibold text-emerald-700">D+30 · </span>
                {plan.will.day30}
              </p>
              <p>
                <span className="font-semibold text-emerald-700">D+60 · </span>
                {plan.will.day60}
              </p>
              <p>
                <span className="font-semibold text-emerald-700">D+90 · </span>
                {plan.will.day90}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-10 text-center text-[9px] leading-relaxed text-slate-400">{METHODOLOGY_FOOTER}</div>
      </section>
    </div>
  );
});
