export interface SubmissionListItem {
  id: string;
  name: string;
  persona: string;
  createdAt: string;
  topStrength: string | null;
  profileShape: string;
}

export interface AdminStats {
  total: number;
  last7Days: number;
  last30Days: number;
  personaCounts: Record<string, number>;
  shapeCounts: Record<string, number>;
  virtueAverages: { virtueId: string; nameKo: string; average: number }[];
  topStrengthsRanked: { strengthId: string; count: number }[];
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`request_failed:${res.status}`);
  return (await res.json()) as T;
}

export const adminApi = {
  login: (username: string, password: string) =>
    req<{ ok: true }>("/api/admin/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => req<{ ok: true }>("/api/admin/logout", { method: "POST" }),
  me: () => req<{ authenticated: boolean }>("/api/admin/me"),
  submissions: (params?: { persona?: string; q?: string }) => {
    const search = new URLSearchParams();
    if (params?.persona) search.set("persona", params.persona);
    if (params?.q) search.set("q", params.q);
    const qs = search.toString();
    return req<{ submissions: SubmissionListItem[] }>(`/api/admin/submissions${qs ? `?${qs}` : ""}`);
  },
  submissionDetail: (id: string) =>
    req<{ id: string; name: string; persona: string; createdAt: string; scoreResult: import("../shared/types").ScoreResult }>(
      `/api/admin/submissions/${id}`
    ),
  stats: () => req<AdminStats>("/api/admin/stats"),
};
