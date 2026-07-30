import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PERSONAS } from "../data/personas";
import { useSession } from "../context/SessionContext";
import type { PersonaId } from "../shared/types";

export function IntakePage() {
  const navigate = useNavigate();
  const { setIntake } = useSession();
  const [persona, setPersona] = useState<PersonaId | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!persona) {
      setError("먼저 나의 상황을 선택해 주세요.");
      return;
    }
    if (!name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    setIntake(name.trim(), persona);
    navigate("/survey");
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-indigo">STEP 1 / 3</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">진단을 시작하기 전에</h1>
        <p className="mt-2 text-sm text-slate-500">
          현재 자신의 상황을 선택하면, 그 맥락에 꼭 맞는 컨설팅 리포트를 받아볼 수 있습니다.
        </p>
      </div>

      <div className="mb-10">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">1. 나의 현재 상황을 선택해 주세요</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPersona(p.id);
                setError("");
              }}
              className={`rounded-2xl border p-5 text-center transition ${
                persona === p.id
                  ? "border-brand-indigo bg-brand-indigo/5 ring-2 ring-brand-indigo"
                  : "border-slate-200 hover:border-brand-indigo/40"
              }`}
            >
              <div className="text-3xl">{p.emoji}</div>
              <div className="mt-2 text-sm font-semibold text-slate-800">{p.label}</div>
              <div className="mt-1 text-[11px] text-slate-500">{p.tagline}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">2. 이름을 입력해 주세요</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="예: 홍길동"
          maxLength={30}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-brand-indigo focus:ring-2 focus:ring-brand-indigo/20"
        />
        <p className="mt-2 text-[11px] text-slate-400">
          입력하신 이름은 리포트 표지와 관리자 조회용으로만 사용되며, 외부에 공개되지 않습니다.
        </p>
      </div>

      {error && <p className="mb-4 text-sm font-medium text-rose-500">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full rounded-xl bg-brand-navy py-3.5 text-sm font-semibold text-white transition hover:brightness-110"
      >
        설문 시작하기 →
      </button>
    </div>
  );
}
