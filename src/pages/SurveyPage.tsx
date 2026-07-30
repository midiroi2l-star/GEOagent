import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QUESTIONS } from "../data/questions";
import { VIRTUES } from "../data/virtues";
import { STRENGTH_MAP } from "../data/strengths";
import { LikertQuestion } from "../components/LikertQuestion";
import { ProgressBar } from "../components/ProgressBar";
import { useSession } from "../context/SessionContext";
import { computeScores } from "../shared/scoring";
import { submitSurvey } from "../lib/api";
import type { SurveyAnswer } from "../shared/types";

export function SurveyPage() {
  const navigate = useNavigate();
  const { name, persona, setAnswers, setResult } = useSession();
  const [pageIndex, setPageIndex] = useState(0);
  const [values, setValues] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!persona || !name) navigate("/start");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pages = useMemo(
    () => VIRTUES.map((v) => QUESTIONS.filter((q) => STRENGTH_MAP[q.strengthId].virtueId === v.id)),
    []
  );

  const currentQuestions = pages[pageIndex] ?? [];
  const currentVirtue = VIRTUES[pageIndex];
  const totalAnswered = Object.keys(values).length;

  const handleSelect = (questionId: string, value: number) => {
    setValues((prev) => ({ ...prev, [questionId]: value }));
    setError("");
  };

  const goNext = async () => {
    const missing = currentQuestions.some((q) => values[q.id] === undefined);
    if (missing) {
      setError("모든 문항에 응답해 주세요.");
      return;
    }
    if (pageIndex < pages.length - 1) {
      setPageIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!persona) return;
    setSubmitting(true);
    const answers: SurveyAnswer[] = QUESTIONS.map((q) => ({
      questionId: q.id,
      strengthId: q.strengthId,
      value: values[q.id],
    }));
    const result = computeScores(answers);
    setAnswers(answers);
    setResult(result, null);

    const submission = await submitSurvey({ name, persona, answers });
    if (submission?.id) setResult(result, submission.id);

    setSubmitting(false);
    navigate("/report");
  };

  const goPrev = () => {
    if (pageIndex === 0) return;
    setPageIndex((i) => i - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <ProgressBar current={pageIndex + 1} total={pages.length} />
        <p className="mt-3 text-center text-xs text-slate-400">
          전체 {QUESTIONS.length}문항 중 {totalAnswered}문항 응답 완료
        </p>
      </div>

      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">
          {pageIndex + 1}. {currentVirtue?.nameKo}
        </p>
        <p className="mt-1 text-xs text-slate-400">{currentVirtue?.description}</p>
      </div>

      <div className="space-y-4">
        {currentQuestions.map((q, i) => (
          <LikertQuestion
            key={q.id}
            index={pageIndex * 8 + i + 1}
            text={q.text}
            value={values[q.id]}
            onChange={(v) => handleSelect(q.id, v)}
          />
        ))}
      </div>

      {error && <p className="mt-4 text-center text-sm font-medium text-rose-500">{error}</p>}

      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={pageIndex === 0}
          className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 disabled:opacity-40"
        >
          이전
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={submitting}
          className="flex-1 rounded-xl bg-brand-navy py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? "결과 분석 중..." : pageIndex < pages.length - 1 ? "다음" : "결과 확인하기 →"}
        </button>
      </div>
    </div>
  );
}
