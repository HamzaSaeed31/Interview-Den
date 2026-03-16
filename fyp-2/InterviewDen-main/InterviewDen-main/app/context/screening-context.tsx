"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ScreeningStep = "resume" | "quiz" | "interview";

export interface ScreeningProgress {
  jobId: string;
  currentStep: ScreeningStep;
  progress: {
    resume: {
      answers: string[];
      timeLeft: number;
      completed: boolean;
    };
    quiz: {
      answers: string[];
      timeLeft: number;
      completed: boolean;
      score?: number;
    };
    technical: {
      currentProblem: number;
      code: string;
      timeLeft: number;
      testResults: any[];
      completed: boolean;
    };
    interview: {
      session_id: string | null;
      transcript: any[];
      timeLeft: number;
      completed: boolean;
      evaluation: any | null;
    };
  };
  lastUpdated: number;
}

interface ScreeningContextType {
  progress: Record<string, ScreeningProgress>;
  updateProgress: (jobId: string, step: ScreeningStep, data: Partial<ScreeningProgress["progress"][ScreeningStep]>) => void;
  getProgress: (jobId: string) => ScreeningProgress | undefined;
}

const ScreeningContext = createContext<ScreeningContextType | undefined>(undefined);

export function ScreeningProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Record<string, ScreeningProgress>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("screeningProgress");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("screeningProgress", JSON.stringify(progress));
  }, [progress]);

  const updateProgress = (
    jobId: string,
    step: ScreeningStep,
    data: Partial<ScreeningProgress["progress"][ScreeningStep]>
  ) => {
    setProgress((prev) => {
      const current = prev[jobId] || {
        jobId,
        currentStep: step,
        progress: {
          resume: { answers: [], timeLeft: 30 * 60, completed: false },
          quiz: { answers: [], timeLeft: 20 * 60, completed: false },
          technical: { currentProblem: 0, code: "", timeLeft: 30 * 60, testResults: [], completed: false },
          interview: { session_id: null, transcript: [], timeLeft: 30 * 60, completed: false, evaluation: null },
        },
        lastUpdated: Date.now(),
      };

      return {
        ...prev,
        [jobId]: {
          ...current,
          currentStep: step,
          progress: {
            ...current.progress,
            [step]: {
              ...current.progress[step],
              ...data,
            },
          },
          lastUpdated: Date.now(),
        },
      };
    });
  };

  const getProgress = (jobId: string) => progress[jobId];

  return (
    <ScreeningContext.Provider value={{ progress, updateProgress, getProgress }}>
      {children}
    </ScreeningContext.Provider>
  );
}

export function useScreening() {
  const context = useContext(ScreeningContext);
  if (context === undefined) {
    throw new Error("useScreening must be used within a ScreeningProvider");
  }
  return context;
} 