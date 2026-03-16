"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, AlertCircle, Loader2, FileText, Briefcase } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface Application {
  id: string;
  job_id: string;
  status: string;
  current_stage: string;
  ats_score: number | null;
  weighted_score: number | null;
  resume_screening: any;
  quiz_results: any;
  interview_results: any;
  applied_at: string;
  updated_at: string;
  completed_at: string | null;
  job: {
    title: string;
    company_name: string;
  };
}

export default function FeedbackPage() {
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

      // Fetch all applications for this candidate with job details
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          status,
          current_stage,
          ats_score,
          weighted_score,
          resume_screening,
          quiz_results,
          interview_results,
          applied_at,
          updated_at,
          completed_at,
          jobs!inner (
            title,
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
          weighted_score: app.weighted_score,
          resume_screening: app.resume_screening,
          quiz_results: app.quiz_results,
          interview_results: app.interview_results,
          applied_at: app.applied_at,
          updated_at: app.updated_at,
          completed_at: app.completed_at,
          job: {
            title: app.jobs?.title || 'Unknown Job',
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

  const getStepData = (app: Application, step: 'resume' | 'quiz' | 'interview') => {
    const status = getStepStatus(app, step);

    switch (step) {
      case 'resume':
        return {
          title: 'Resume Screening',
          status,
          score: app.resume_screening?.match_score || app.ats_score || null,
          feedback: app.resume_screening?.pass_fail?.feedback_message ||
            (app.resume_screening?.comments?.join(' ') || 'Resume analysis pending.'),
          date: status !== 'pending' ? new Date(app.applied_at).toLocaleDateString() : null,
        };
      case 'quiz':
        return {
          title: 'AI Quiz',
          status,
          score: app.quiz_results?.score || null,
          feedback: app.quiz_results?.score
            ? `Scored ${app.quiz_results.score}% on ${app.quiz_results.total_questions || 20} questions.`
            : 'Quiz assessment pending.',
          date: app.quiz_results?.completed_at
            ? new Date(app.quiz_results.completed_at).toLocaleDateString()
            : null,
        };
      case 'interview':
        const evaluation = app.interview_results?.evaluation;
        const strengths = evaluation?.strengths?.slice(0, 3).join(', ') || 'N/A';
        const weaknesses = evaluation?.weaknesses?.slice(0, 3).join(', ') || 'N/A';
        return {
          title: 'AI Interview',
          status,
          score: evaluation?.overall_score || null,
          feedback: evaluation ? '' : 'Interview assessment pending.',
          strengths: evaluation ? strengths : null,
          improvements: evaluation ? weaknesses : null,
          date: app.interview_results?.completed_at
            ? new Date(app.interview_results.completed_at).toLocaleDateString()
            : null,
        };
    }
  };

  const renderStepCard = (step: { title: string; status: string; score: number | null; feedback: string; strengths?: string | null; improvements?: string | null; date: string | null }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">{step.title}</span>
          {step.status === "completed" && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
          {step.status === "in-progress" && (
            <Badge variant="default" className="bg-yellow-500">
              <Clock className="h-3 w-3 mr-1" />
              In Progress
            </Badge>
          )}
          {step.status === "pending" && (
            <Badge variant="secondary">
              <AlertCircle className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          )}
        </div>
        {step.score !== null && (
          <div className="text-right">
            <div className="text-xl font-bold">{step.score}%</div>
            <div className="text-xs text-muted-foreground">Score</div>
          </div>
        )}
      </div>

      {step.score !== null && (
        <Progress value={step.score} className="h-2" />
      )}

      {step.feedback && (
        <p className="text-sm text-muted-foreground">{step.feedback}</p>
      )}

      {step.strengths && (
        <p className="text-sm text-muted-foreground">
          <span className="text-green-600 font-bold">Strengths: </span>
          {step.strengths}
        </p>
      )}

      {step.improvements && (
        <p className="text-sm text-muted-foreground">
          <span className="text-yellow-600 font-bold">Improvements: </span>
          {step.improvements}
        </p>
      )}

      {step.date && (
        <p className="text-xs text-muted-foreground">Completed on {step.date}</p>
      )}
    </div>
  );

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
        <h1 className="text-3xl font-bold">AI Feedback</h1>
        <p className="text-muted-foreground">
          Track your progress and get personalized feedback at each step of the screening process
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Apply to jobs to see your screening feedback here
            </p>
            <Button asChild>
              <Link href="/candidate/jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Browse Jobs
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {app.job.title}
                      <Badge variant={app.current_stage === 'completed' ? 'default' : 'secondary'}>
                        {app.current_stage === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{app.job.company_name}</CardDescription>
                  </div>
                  {app.current_stage === 'completed' && (app.weighted_score || app.ats_score) && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-violet-600">{app.weighted_score || app.ats_score}%</div>
                      <div className="text-xs text-muted-foreground">Overall Score</div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderStepCard(getStepData(app, 'resume'))}
                {renderStepCard(getStepData(app, 'quiz'))}
                {renderStepCard(getStepData(app, 'interview'))}

                {app.current_stage !== 'completed' && (
                  <div className="pt-4 border-t">
                    <Button asChild>
                      <Link href={`/candidate/screening/${app.current_stage}?jobId=${app.job_id}`}>
                        Continue Application
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}