import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { adminApi, type AdminStats, type SubmissionListItem } from "../../lib/adminApi";
import { PERSONA_MAP, PERSONAS } from "../../data/personas";
import { STRENGTH_MAP } from "../../data/strengths";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [personaFilter, setPersonaFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const me = await adminApi.me();
        if (!me.authenticated) {
          navigate("/admin/login");
          return;
        }
        setChecking(false);
        const [s, list] = await Promise.all([adminApi.stats(), adminApi.submissions()]);
        setStats(s);
        setSubmissions(list.submissions);
      } catch {
        navigate("/admin/login");
      }
    })();
  }, [navigate]);

  const refetchSubmissions = async (persona: string, q: string) => {
    const list = await adminApi.submissions({ persona: persona || undefined, q: q || undefined });
    setSubmissions(list.submissions);
  };

  const handleLogout = async () => {
    await adminApi.logout();
    navigate("/admin/login");
  };

  if (checking) return <div className="p-10 text-center text-sm text-slate-400">확인 중...</div>;

  const personaChartData = PERSONAS.map((p) => ({ name: p.label, count: stats?.personaCounts[p.id] ?? 0 }));
  const virtueChartData = (stats?.virtueAverages ?? []).map((v) => ({ name: v.nameKo, average: v.average }));

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧭</span>
          <span className="text-sm font-bold text-slate-900">강점나침반 관리자 대시보드</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link to="/coach-guide" target="_blank" className="font-semibold text-brand-indigo hover:underline">
            📄 코칭 매뉴얼 PDF 다운로드
          </Link>
          <button onClick={handleLogout} className="rounded-full border border-slate-300 px-4 py-1.5 font-semibold text-slate-500 hover:bg-slate-50">
            로그아웃
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "전체 참여자", value: stats?.total ?? 0 },
            { label: "최근 7일", value: stats?.last7Days ?? 0 },
            { label: "최근 30일", value: stats?.last30Days ?? 0 },
            { label: "균형형 비율", value: stats ? `${Math.round(((stats.shapeCounts.balanced ?? 0) / Math.max(stats.total, 1)) * 100)}%` : "0%" },
          ].map((c) => (
            <div key={c.label} className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-400">{c.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-bold text-slate-800">대상군별 참여 분포</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={personaChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2c2f7a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-bold text-slate-800">전체 평균 6대 덕목 점수</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={virtueChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="average" fill="#c9a24b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-bold text-slate-800">가장 많이 대표강점으로 나타난 강점 TOP 10</p>
          <div className="flex flex-wrap gap-2">
            {(stats?.topStrengthsRanked ?? []).map((s) => (
              <span key={s.strengthId} className="rounded-full bg-brand-indigo/10 px-3 py-1 text-xs font-semibold text-brand-indigo">
                {STRENGTH_MAP[s.strengthId as keyof typeof STRENGTH_MAP]?.nameKo ?? s.strengthId} · {s.count}명
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-800">개인별 설문·컨설팅 결과 조회</p>
            <div className="flex gap-2">
              <select
                value={personaFilter}
                onChange={(e) => {
                  setPersonaFilter(e.target.value);
                  refetchSubmissions(e.target.value, search);
                }}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              >
                <option value="">전체 대상군</option>
                {PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="이름 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && refetchSubmissions(personaFilter, search)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400">
                  <th className="py-2 pr-3 font-medium">이름</th>
                  <th className="py-2 pr-3 font-medium">대상군</th>
                  <th className="py-2 pr-3 font-medium">대표강점</th>
                  <th className="py-2 pr-3 font-medium">프로파일</th>
                  <th className="py-2 pr-3 font-medium">제출일시</th>
                  <th className="py-2 pr-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-3 font-semibold text-slate-700">{row.name}</td>
                    <td className="py-2 pr-3 text-slate-500">
                      {PERSONA_MAP[row.persona as keyof typeof PERSONA_MAP]?.label ?? row.persona}
                    </td>
                    <td className="py-2 pr-3 text-slate-500">
                      {row.topStrength ? STRENGTH_MAP[row.topStrength as keyof typeof STRENGTH_MAP]?.nameKo : "-"}
                    </td>
                    <td className="py-2 pr-3 text-slate-500">{row.profileShape}</td>
                    <td className="py-2 pr-3 text-slate-400">{new Date(row.createdAt).toLocaleString("ko-KR")}</td>
                    <td className="py-2 pr-3">
                      <Link to={`/admin/submissions/${row.id}`} className="font-semibold text-brand-indigo hover:underline">
                        상세보기 →
                      </Link>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      아직 제출된 설문이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
