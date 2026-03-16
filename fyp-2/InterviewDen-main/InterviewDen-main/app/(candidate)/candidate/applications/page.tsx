"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, MapPin, Clock, CheckCircle2, AlertCircle, XCircle, Loader2, Briefcase } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Application {
  id: string;
  job_id: string;
  status: string;
  current_stage: string;
  ats_score: number | null;
  resume_screening: any;
  quiz_results: any;
  interview_results: any;
  applied_at: string;
  completed_at: string | null;
  job: {
    title: string;
    location: string;
    company_name: string;
  };
}

export default function ApplicationsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          status,
          current_stage,
          ats_score,
          resume_screening,
          quiz_results,
          interview_results,
          applied_at,
          completed_at,
          jobs!inner (
            title,
            location,
            company_id,
            companies!inner (
              company_name
            )
          )
        `)
        .eq('candidate_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
      } else {
        const transformedApps = (data || []).map((app: any) => ({
          id: app.id,
          job_id: app.job_id,
          status: app.status,
          current_stage: app.current_stage,
          ats_score: app.ats_score,
          resume_screening: app.resume_screening,
          quiz_results: app.quiz_results,
          interview_results: app.interview_results,
          applied_at: app.applied_at,
          completed_at: app.completed_at,
          job: {
            title: app.jobs?.title || 'Unknown Job',
            location: app.jobs?.location || 'Remote',
            company_name: app.jobs?.companies?.company_name || 'Unknown Company',
          },
        }));
        setApplications(transformedApps);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (stage: string) => {
    switch (stage) {
      case 'resume': return 0;
      case 'quiz': return 33;
      case 'interview': return 66;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStepStatus = (app: Application, step: 'resume' | 'quiz' | 'interview') => {
    const stageOrder = ['resume', 'quiz', 'interview', 'completed'];
    const currentIndex = stageOrder.indexOf(app.current_stage);
    const stepIndex = stageOrder.indexOf(step);

    if (stepIndex < currentIndex || app.current_stage === 'completed') {
      return 'completed';
    } else if (stepIndex === currentIndex) {
      return 'in-progress';
    }
    return 'pending';
  };

  const getSteps = (app: Application) => [
    {
      name: 'Resume Screening',
      status: getStepStatus(app, 'resume'),
      date: app.resume_screening ? new Date(app.applied_at).toLocaleDateString() : null,
    },
    {
      name: 'AI Quiz',
      status: getStepStatus(app, 'quiz'),
      date: app.quiz_results?.completed_at
        ? new Date(app.quiz_results.completed_at).toLocaleDateString()
        : null,
    },
    {
      name: 'AI Interview',
      status: getStepStatus(app, 'interview'),
      date: app.interview_results?.completed_at
        ? new Date(app.interview_results.completed_at).toLocaleDateString()
        : null,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applied Jobs</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Start applying to jobs to track your progress here
            </p>
            <Button asChild>
              <Link href="/candidate/jobs">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => {
            const progress = getProgress(application.current_stage);
            const steps = getSteps(application);

            return (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{application.job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {application.job.company_name}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        application.current_stage === "completed"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        application.current_stage === "completed"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }
                    >
                      {application.current_stage === "completed" ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {application.current_stage === "completed" ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Applied on {new Date(application.applied_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Current Step: {
                          application.current_stage === 'completed' ? 'Application Complete' :
                            application.current_stage === 'interview' ? 'AI Interview' :
                              application.current_stage === 'quiz' ? 'AI Quiz' : 'Resume Screening'
                        }
                      </p>
                    </div>

                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {step.status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : step.status === "in-progress" ? (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span>{step.name}</span>
                          </div>
                          <span className="text-muted-foreground">{step.date || '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {application.current_stage !== 'completed' ? (
                    <Button asChild>
                      <Link href={`/candidate/screening/${application.current_stage}?jobId=${application.job_id}`}>
                        Continue Application
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" asChild>
                      <Link href="/candidate/feedback">View Feedback</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}