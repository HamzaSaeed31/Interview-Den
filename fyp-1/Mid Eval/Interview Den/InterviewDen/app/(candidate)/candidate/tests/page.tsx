"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar, AlertCircle } from "lucide-react";
import { useScreening } from "@/app/context/screening-context";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export default function TestsPage() {
  const router = useRouter();
  const { progress: screeningProgress } = useScreening();

  const ongoingTests = Object.entries(screeningProgress || {})
    .filter(([_, progress]) => {
      if (!progress || !progress.progress) return false;
      const videoProgress = progress.progress.video;
      return videoProgress && !videoProgress.completed;
    })
    .map(([jobId, progress]) => {
      const currentStep = progress.currentStep;
      const stepProgress = progress.progress[currentStep];
      const deadline = new Date(progress.lastUpdated + 7 * 24 * 60 * 60 * 1000); // 7 days from last update

      return {
        jobId,
        title: `Screening for Job #${jobId}`,
        currentStep,
        progress: stepProgress,
        deadline,
        timeLeft: formatDistanceToNow(deadline, { addSuffix: true })
      };
    });

  const handleResumeTest = (jobId: string) => {
    const test = ongoingTests.find(t => t.jobId === jobId);
    if (test) {
      router.push(`/candidate/screening/${test.currentStep}?jobId=${jobId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ongoing Tests</h1>
        <Button onClick={() => router.push("/candidate/jobs")}>
          Find More Jobs
        </Button>
      </div>

      {ongoingTests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No ongoing tests found</p>
            <Button className="mt-4" onClick={() => router.push("/candidate/jobs")}>
              Apply for Jobs
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ongoingTests.map((test) => (
            <Card key={test.jobId}>
              <CardHeader>
                <CardTitle className="text-xl">{test.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Time remaining: {test.timeLeft}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Current Step</span>
                    <span className="font-medium capitalize">{test.currentStep}</span>
                  </div>
                  <Progress value={test.progress?.completed ? 100 : 50} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Deadline: {test.deadline.toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleResumeTest(test.jobId)}>
                  Resume Test
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 