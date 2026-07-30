import { LIKERT_LABELS } from "../data/questions";

export function LikertQuestion({
  index,
  text,
  value,
  onChange,
}: {
  index: number;
  text: string;
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-medium text-slate-800">
        <span className="mr-2 text-slate-400">Q{index}.</span>
        {text}
      </p>
      <div className="grid grid-cols-5 gap-2">
        {LIKERT_LABELS.map((label, i) => {
          const v = i + 1;
          const selected = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2.5 text-[11px] leading-tight transition-colors ${
                selected
                  ? "border-brand-indigo bg-brand-indigo text-white"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-brand-indigo/50"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                  selected ? "border-white/60" : "border-slate-300"
                }`}
              >
                {v}
              </span>
              <span className="hidden text-center sm:block">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
