import { useRef, useState } from "react";
import { VIRTUES } from "../data/virtues";
import { STRENGTHS } from "../data/strengths";
import { PERSONAS } from "../data/personas";
import { PERSONA_COACHING_NOTES } from "../data/coachNotes";
import { METHODOLOGY_LONG } from "../data/methodology";
import { exportReportToPdf } from "../lib/pdf";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function CoachGuidePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!containerRef.current) return;
    setDownloading(true);
    try {
      await exportReportToPdf(containerRef.current, "강점나침반_코치용_컨설팅매뉴얼.pdf");
    } finally {
      setDownloading(false);
    }
  };

  const virtuePairs = chunk(VIRTUES, 2);

  return (
    <div className="bg-slate-100 py-10">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] items-center justify-between px-4">
        <p className="text-xs font-semibold text-slate-500">코치 · 워크숍 진행자 전용 매뉴얼</p>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-full bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:brightness-110 disabled:opacity-60"
        >
          {downloading ? "PDF 생성 중..." : "📄 코칭 매뉴얼 PDF 다운로드"}
        </button>
      </div>

      <div ref={containerRef} className="mx-auto flex max-w-[210mm] flex-col gap-6 px-4">
        {/* COVER */}
        <section className="report-page relative flex flex-col justify-between overflow-hidden rounded-sm bg-brand-navy p-14 text-white shadow-xl">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span>🧭</span>
            <span>강점나침반</span>
            <span className="text-xs font-medium text-brand-gold">STRENGTH COMPASS</span>
          </div>
          <div>
            <p className="mb-3 inline-block rounded-full border border-brand-gold/40 bg-brand-gold/10 px-4 py-1 text-xs font-semibold text-brand-gold">
              COACH MANUAL
            </p>
            <h1 className="text-4xl font-bold leading-tight">코치용 강점 컨설팅 매뉴얼</h1>
            <p className="mt-3 max-w-md text-sm text-slate-300">
              24개 성격강점, 6개 대상군(암웨이 사업자·직장인·자영업자·주부·취준생·학생)별 코칭 포인트와 GROW
              세션 진행법을 담았습니다.
            </p>
          </div>
          <p className="text-xs text-slate-400">내부 코치 교육용 · 참가자에게 배포하지 않습니다.</p>
        </section>

        {/* FRAMEWORK OVERVIEW */}
        <section className="report-page rounded-sm bg-white p-14 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">Part 1</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">프레임워크 개요 &amp; 리포트 해석법</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{METHODOLOGY_LONG.analysis.paragraphs[0]}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {VIRTUES.map((v) => (
              <div key={v.id} className="rounded-xl border border-slate-200 p-3">
                <div className="mb-1 h-1.5 w-8 rounded-full" style={{ backgroundColor: v.colorVar }} />
                <p className="text-sm font-bold text-slate-800">{v.nameKo}</p>
                <p className="text-[11px] text-slate-500">{v.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <p className="text-sm font-bold text-slate-800">레이더 차트 프로파일 유형 해석</p>
            <ul className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600">
              <li>
                <b>뾰족한 강점형(Spiky):</b> 특정 덕목이 유독 두드러짐. 그 강점을 더 자주, 더 새롭게 쓰도록 구체적 실행
                과제를 좁혀서 제안하세요.
              </li>
              <li>
                <b>균형형(Balanced):</b> 6개 덕목이 고르게 발달. 다재다능한 만큼 '무엇에 먼저 집중할지' 우선순위를
                함께 정하는 것이 코칭의 핵심입니다.
              </li>
              <li>
                <b>중간형(Moderate):</b> 대표강점은 있으나 편차가 크지 않음. 대표강점 중심의 작은 성공 경험을 쌓아
                점차 확신을 강화하세요.
              </li>
            </ul>
          </div>
        </section>

        {/* STRENGTH REFERENCE PAGES */}
        {virtuePairs.map((pair, pageIdx) => (
          <section key={pageIdx} className="report-page rounded-sm bg-white p-14 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">
              Part 2 · 강점별 코칭 레퍼런스 ({pageIdx + 1}/{virtuePairs.length})
            </p>
            <div className="mt-4 space-y-6">
              {pair.map((virtue) => (
                <div key={virtue.id}>
                  <p className="mb-2 text-base font-bold text-slate-900" style={{ color: virtue.colorVar }}>
                    {virtue.nameKo}
                  </p>
                  <div className="space-y-3">
                    {STRENGTHS.filter((s) => s.virtueId === virtue.id).map((s) => (
                      <div key={s.id} className="rounded-lg border border-slate-200 p-3">
                        <p className="text-sm font-bold text-slate-800">
                          {s.nameKo} <span className="ml-1 text-[10px] font-normal text-slate-400">{s.nameEn}</span>
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{s.longDescription}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-rose-500">과잉: {s.overuse}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">과소: {s.underuse}</p>
                        <p className="mt-1 text-[11px] font-medium leading-relaxed text-emerald-700">
                          코칭: {s.coachingApproach}
                        </p>
                        <p className="mt-1 text-[11px] italic leading-relaxed text-brand-indigo">
                          Q. {s.coachingQuestions[0]} / {s.coachingQuestions[1]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* PERSONA COACHING NOTES */}
        <section className="report-page rounded-sm bg-white p-14 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">Part 3</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">대상군별 코칭 포인트</h2>
          <div className="mt-5 space-y-4">
            {PERSONAS.map((p) => {
              const notes = PERSONA_COACHING_NOTES[p.id];
              return (
                <div key={p.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-bold text-slate-800">
                    {p.emoji} {p.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                    <b>배경:</b> {notes.background}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-emerald-700">
                    <b>코칭 접근:</b> {notes.approach}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                    주요 초점 영역: {p.focusAreas.join(" · ")}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* GROW MODEL + SESSION FLOW + METHODOLOGY */}
        <section className="report-page flex flex-col rounded-sm bg-white p-14 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">Part 4</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">GROW 코칭 세션 진행 가이드</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{METHODOLOGY_LONG.consulting.paragraphs[0]}</p>

          <div className="mt-5 space-y-2 text-xs leading-relaxed text-slate-600">
            <p><b>① 오프닝 (5분):</b> 라포 형성 및 리포트를 처음 본 소감 질문 ("어떤 부분이 가장 놀라웠나요?")</p>
            <p><b>② 레이더 리뷰 (10분):</b> 프로파일 유형 설명, 6개 덕목 중 공감되는 부분과 의외인 부분 확인</p>
            <p><b>③ 대표강점 심화 (15분):</b> TOP5 강점별 코칭 질문 활용, 최근 실제 발휘 사례 끌어내기</p>
            <p><b>④ 성장영역 논의 (10분):</b> 결핍이 아닌 '보완 시 시너지'로 프레이밍, 방어적 반응에 유의</p>
            <p><b>⑤ 액션플랜 확정 (15분):</b> GROW Options 중 실제 실행할 1~2개를 선택하게 하고 Will(30·60·90일)을 참가자 언어로 재작성</p>
            <p><b>⑥ 클로징 (5분):</b> 핵심 한 문장 요약, 다음 체크인 일정 확정</p>
          </div>

          <div className="mt-auto space-y-1 pt-10 text-[9px] leading-relaxed text-slate-400">
            <p className="font-semibold text-slate-500">참고문헌</p>
            {METHODOLOGY_LONG.references.map((r) => (
              <p key={r}>{r}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
