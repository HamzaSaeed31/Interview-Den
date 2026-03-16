"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const screeningSteps = [
  {
    title: "Resume Screening",
    status: "completed",
    score: 85,
    feedback: "Your resume shows strong technical skills and relevant experience. The formatting and structure are excellent.",
    date: "2024-04-10",
  },
  {
    title: "AI Quiz",
    status: "completed",
    score: 78,
    feedback: "Good performance in technical questions. Could improve in system design concepts.",
    date: "2024-04-11",
  },
  {
    title: "Technical Assessment",
    status: "in-progress",
    score: null,
    feedback: "Currently in progress. You have 45 minutes remaining.",
    date: "2024-04-12",
  },
  {
    title: "Soft Skills Interview",
    status: "pending",
    score: null,
    feedback: "Scheduled for April 15, 2024",
    date: "2024-04-15",
  },
];

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Feedback</h1>
        <p className="text-muted-foreground">
          Track your progress and get personalized feedback at each step of the screening process
        </p>
      </div>

      <div className="grid gap-6">
        {screeningSteps.map((step, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {step.title}
                    {step.status === "completed" && (
                      <Badge variant="default" className="ml-2 bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {step.status === "in-progress" && (
                      <Badge variant="default" className="ml-2 bg-yellow-500">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                      </Badge>
                    )}
                    {step.status === "pending" && (
                      <Badge variant="secondary" className="ml-2">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>Completed on {step.date}</CardDescription>
                </div>
                {step.score !== null && (
                  <div className="text-right">
                    <div className="text-2xl font-bold">{step.score}%</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {step.score !== null && (
                  <Progress value={step.score} className="h-2" />
                )}
                <p className="text-sm">{step.feedback}</p>
                {step.status === "in-progress" && (
                  <div className="flex gap-2">
                    <Button variant="outline">Pause Test</Button>
                    <Button variant="destructive">End Test</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 