import type { SubmissionInput } from "../shared/types";

export async function submitSurvey(input: SubmissionInput): Promise<{ id: string } | null> {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return null;
    return (await res.json()) as { id: string };
  } catch {
    return null;
  }
}
