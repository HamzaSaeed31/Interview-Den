"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileText } from "lucide-react";
import { useScreening } from "@/app/context/screening-context";
import { useRouter } from "next/navigation";

// Mock data for uploaded resumes - replace with actual data from your backend
const uploadedResumes = [
  {
    id: "1",
    title: "Software Engineer Resume",
    uploadedAt: "2024-04-10",
    size: "1.2 MB",
    isDefault: true
  },
  {
    id: "2",
    title: "Full Stack Developer Resume",
    uploadedAt: "2024-04-09",
    size: "1.5 MB",
    isDefault: false
  }
];

export default function ResumeScreeningPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("jobId");
  const router = useRouter();
  const { getProgress, updateProgress } = useScreening();
  
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResume(resumeId);
  };

  const handleSubmit = () => {
    if (!jobId) {
      console.error('No jobId provided');
      return;
    }

    if (selectedResume) {
      try {
        console.log('Updating progress for job:', jobId);
        updateProgress(jobId, "resume", {
          answers: [selectedResume],
          timeLeft: 30 * 60,
          completed: true
        });
        console.log('Navigating to quiz');
        router.push(`/candidate/screening/quiz?jobId=${jobId}`);
      } catch (err) {
        console.error('Error in handleSubmit:', err);
      }
    }
  };

  const handleStopTest = () => {
    if (!jobId) {
      console.error('No jobId provided');
      return;
    }

    if (selectedResume) {
      try {
        updateProgress(jobId, "resume", {
          answers: [selectedResume],
          timeLeft: 30 * 60,
          completed: false
        });
        setShowConfirmation(true);
      } catch (err) {
        console.error('Error in handleStopTest:', err);
      }
    }
  };

  const handleConfirmStop = () => {
    setShowConfirmation(false);
    router.push("/candidate/jobs");
  };

  const handleCancelStop = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Screening</CardTitle>
          <CardDescription>
            Select a resume to use for this job application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showConfirmation ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stop Application?</AlertTitle>
              <AlertDescription>
                Are you sure you want to stop the application process? You can resume later.
              </AlertDescription>
              <div className="mt-4 flex gap-2">
                <Button variant="destructive" onClick={handleConfirmStop}>
                  Yes, Stop Application
                </Button>
                <Button variant="outline" onClick={handleCancelStop}>
                  Cancel
                </Button>
              </div>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {uploadedResumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className={`cursor-pointer transition-colors ${
                      selectedResume === resume.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleResumeSelect(resume.id)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1">
                        <h3 className="font-medium">{resume.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on {resume.uploadedAt} • {resume.size}
                        </p>
                      </div>
                      {resume.isDefault && (
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          Default
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {uploadedResumes.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Resumes Found</AlertTitle>
                  <AlertDescription>
                    Please upload a resume in your profile before applying for jobs.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleStopTest}>
            Stop Application
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedResume || showConfirmation}
          >
            Continue to Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 