import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { PersonaId, ScoreResult, SurveyAnswer } from "../shared/types";

interface SessionState {
  name: string;
  persona: PersonaId | null;
  answers: SurveyAnswer[];
  scoreResult: ScoreResult | null;
  submissionId: string | null;
}

interface SessionContextValue extends SessionState {
  setIntake: (name: string, persona: PersonaId) => void;
  setAnswers: (answers: SurveyAnswer[]) => void;
  setResult: (result: ScoreResult, submissionId: string | null) => void;
  reset: () => void;
}

const STORAGE_KEY = "strength-compass-session";

function loadInitialState(): SessionState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SessionState;
  } catch {
    // ignore corrupted storage
  }
  return { name: "", persona: null, answers: [], scoreResult: null, submissionId: null };
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(loadInitialState);

  const persist = (next: SessionState) => {
    setState(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable, ignore
    }
  };

  const value = useMemo<SessionContextValue>(
    () => ({
      ...state,
      setIntake: (name, persona) => persist({ ...state, name, persona }),
      setAnswers: (answers) => persist({ ...state, answers }),
      setResult: (scoreResult, submissionId) => persist({ ...state, scoreResult, submissionId }),
      reset: () => persist({ name: "", persona: null, answers: [], scoreResult: null, submissionId: null }),
    }),
    [state]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
