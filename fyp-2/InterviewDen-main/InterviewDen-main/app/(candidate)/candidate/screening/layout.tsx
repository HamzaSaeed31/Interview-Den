"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useScreening } from "@/app/context/screening-context";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

type ScreeningStep = "resume" | "quiz" | "interview";

const steps: { id: ScreeningStep; label: string }[] = [
  { id: "resume", label: "Resume Screening" },
  { id: "quiz", label: "Quiz Assessment" },
  { id: "interview", label: "AI Interview" },
];

function ScreeningLoading() {
  return (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ScreeningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<ScreeningLoading />}>
      <ScreeningLayoutContent>{children}</ScreeningLayoutContent>
    </Suspense>
  );
}

function ScreeningLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("jobId");
  const { getProgress } = useScreening();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!jobId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">Error</h2>
          <p className="text-muted-foreground">No job ID provided. Please return to the jobs page and try again.</p>
        </Card>
      </div>
    );
  }

  const progress = mounted ? getProgress(jobId) : undefined;
  const currentStepIndex = progress ? steps.findIndex(step => step.id === progress.currentStep) : 0;
  const completedSteps = progress ? Object.entries(progress.progress).filter(([_, value]) => value?.completed).length : 0;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Screening Process</h1>
        <p className="text-muted-foreground">
          Complete all steps to finish your application
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps} of {totalSteps} steps completed
              </span>
            </div>
            <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />

          <div className="grid grid-cols-3 gap-4">
            {steps.map((step, index) => {
              const isCompleted = progress?.progress[step.id]?.completed;
              const isCurrent = index === currentStepIndex;
              const isPast = index < currentStepIndex;

              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isCompleted ? "bg-green-100 text-green-600" :
                      isCurrent ? "bg-primary text-primary-foreground" :
                        isPast ? "bg-muted text-muted-foreground" :
                          "bg-muted text-muted-foreground"
                    }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-sm text-center ${isCurrent ? "font-medium" : "text-muted-foreground"
                    }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {children}
    </div>
  );
} 