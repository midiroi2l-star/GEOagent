import { Link } from "react-router-dom";
import { PERSONAS } from "../data/personas";
import { VIRTUES } from "../data/virtues";
import { METHODOLOGY_FOOTER } from "../data/methodology";

export function LandingPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand-indigo/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <p className="mb-4 inline-block rounded-full border border-brand-gold/40 bg-brand-gold/10 px-4 py-1 text-xs font-semibold tracking-wide text-brand-gold">
            강점 발견 워크숍 · 개인 맞춤 컨설팅 리포트
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            나의 강점을 데이터로 증명하고,
            <br />
            실행 가능한 액션플랜까지 받아보세요
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
            48문항의 정교한 자기보고식 진단으로 24개 성격강점을 측정하고, 레이더 차트로 나의 강점 지형을 한눈에
            확인한 뒤, 상황(암웨이 사업자·직장인·자영업자·주부·취준생·학생)에 맞춘 컨설팅 리포트와 90일 액션플랜을
            받아보세요.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/start"
              className="rounded-full bg-brand-gold px-8 py-3.5 text-sm font-semibold text-brand-navy shadow-lg shadow-brand-gold/20 transition hover:brightness-110"
            >
              무료로 강점 진단 시작하기 →
            </Link>
            <Link
              to="/coach-guide"
              className="rounded-full border border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              코치용 가이드 보기
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">약 10~15분 소요 · 48문항 · PDF 리포트 즉시 다운로드</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">이런 분들을 위한 진단입니다</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-500">
          같은 강점이라도 처한 상황에 따라 발휘되는 방식과 실행 전략이 다릅니다. 진단 시작 전 자신의 상황을 선택하면,
          그 맥락에 맞춘 컨설팅 리포트를 받아볼 수 있습니다.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PERSONAS.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 p-5 text-center transition hover:border-brand-indigo/40 hover:shadow-md">
              <div className="text-3xl">{p.emoji}</div>
              <div className="mt-2 text-sm font-semibold text-slate-800">{p.label}</div>
              <div className="mt-1 text-xs text-slate-500">{p.tagline}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            24개 성격강점 · 6개 핵심 덕목으로 보는 나의 강점 지형
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
            {VIRTUES.map((v) => (
              <div key={v.id} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-2 h-1.5 w-10 rounded-full" style={{ backgroundColor: v.colorVar }} />
                <div className="text-base font-semibold text-slate-900">{v.nameKo}</div>
                <div className="mt-1 text-xs text-slate-500">{v.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">리포트에는 이런 내용이 담깁니다</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "강점 레이더 차트", desc: "6개 핵심 덕목 점수를 직관적으로 시각화" },
            { title: "대표강점 TOP 5", desc: "나의 상황에 맞춘 강점 활용 전략" },
            { title: "성장 보완 영역", desc: "긍정적으로 해석하는 보완 포인트" },
            { title: "90일 액션플랜", desc: "GROW 코칭모델 기반 실행 설계" },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 p-6">
              <div className="text-sm font-bold text-brand-indigo">{f.title}</div>
              <div className="mt-2 text-sm text-slate-500">{f.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link
            to="/start"
            className="rounded-full bg-brand-navy px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
          >
            지금 바로 시작하기 →
          </Link>
        </div>
      </section>

      <p className="mx-auto max-w-4xl px-6 pb-10 text-center text-[11px] leading-relaxed text-slate-400">
        {METHODOLOGY_FOOTER}
      </p>
    </div>
  );
}
