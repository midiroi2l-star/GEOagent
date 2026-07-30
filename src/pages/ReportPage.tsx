import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import { ReportDocument } from "../components/ReportDocument";
import { exportReportToPdf } from "../lib/pdf";

export function ReportPage() {
  const navigate = useNavigate();
  const { name, persona, scoreResult } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!persona || !scoreResult) navigate("/start");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!persona || !scoreResult) return null;

  const handleDownload = async () => {
    if (!containerRef.current) return;
    setDownloading(true);
    try {
      await exportReportToPdf(containerRef.current, `강점나침반_${name}_컨설팅리포트.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-slate-100 py-10">
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4">
        <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-slate-700">
          ← 홈으로
        </Link>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-full bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:brightness-110 disabled:opacity-60"
        >
          {downloading ? "PDF 생성 중..." : "📄 PDF로 다운로드 (A4)"}
        </button>
      </div>

      <ReportDocument ref={containerRef} name={name} persona={persona} scoreResult={scoreResult} />

      <div className="no-print mx-auto mt-8 max-w-[210mm] px-4 text-center">
        <Link to="/start" className="text-xs font-medium text-slate-400 hover:text-slate-600">
          다른 사람으로 다시 진단하기
        </Link>
      </div>
    </div>
  );
}
