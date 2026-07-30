import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../lib/adminApi";
import { ReportDocument } from "../../components/ReportDocument";
import { exportReportToPdf } from "../../lib/pdf";
import type { PersonaId, ScoreResult } from "../../shared/types";

export function AdminSubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<{ name: string; persona: PersonaId; scoreResult: ScoreResult } | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const detail = await adminApi.submissionDetail(id);
        setData({ name: detail.name, persona: detail.persona as PersonaId, scoreResult: detail.scoreResult });
      } catch {
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleDownload = async () => {
    if (!containerRef.current || !data) return;
    setDownloading(true);
    try {
      await exportReportToPdf(containerRef.current, `강점나침반_${data.name}_컨설팅리포트.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-sm text-slate-400">불러오는 중...</div>;
  if (!data) return <div className="p-10 text-center text-sm text-slate-400">데이터를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4">
        <Link to="/admin" className="text-xs font-semibold text-slate-500 hover:text-slate-700">
          ← 대시보드로
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
      <ReportDocument ref={containerRef} name={data.name} persona={data.persona} scoreResult={data.scoreResult} />
    </div>
  );
}
