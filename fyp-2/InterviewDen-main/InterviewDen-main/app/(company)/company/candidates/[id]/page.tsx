"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Mail, Briefcase, Calendar, Loader2, Star, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface CandidateData {
  id: string;
  name: string;
  email: string;
  experience: string | null;
  skills: string[] | null;
  resumes: any[];
}

interface ApplicationData {
  id: string;
  job_id: string;
  status: string;
  current_stage: string;
  ats_score: number | null;
  applied_at: string;
  resume_screening: any;
  quiz_results: any;
  interview_results: any;
  job_title: string;
  weightages: {
    resume: number;
    quiz: number;
    interview: number;
  };
  weightedScore: number;
}

export default function CandidateProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const candidateId = params.id as string;
  const jobId = searchParams?.get('job_id');
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null);

  // Calculate weighted score - MUST match jobs/[id]/page.tsx exactly
  const calculateWeightedScore = (applicant: any, weights: { resume: number; quiz: number; interview: number }) => {
    let totalScore = 0;
    let appliedWeight = 0;

    // Resume screening score
    if (applicant.resume_screening?.match_score) {
      totalScore += (applicant.resume_screening.match_score * weights.resume) / 100;
      appliedWeight += weights.resume;
    } else if (applicant.ats_score) {
      totalScore += (applicant.ats_score * weights.resume) / 100;
      appliedWeight += weights.resume;
    }

    // Quiz score
    if (applicant.quiz_results?.score) {
      totalScore += (applicant.quiz_results.score * weights.quiz) / 100;
      appliedWeight += weights.quiz;
    }

    // Interview score
    const interviewScore = applicant.interview_results?.evaluation?.overall_score;
    if (interviewScore) {
      totalScore += (interviewScore * weights.interview) / 100;
      appliedWeight += weights.interview;
    }

    // Normalize if not all stages complete
    if (appliedWeight > 0 && appliedWeight < 100) {
      totalScore = (totalScore / appliedWeight) * 100;
    }

    return Math.round(totalScore);
  };

  useEffect(() => {
    async function fetchCandidateData() {
      try {
        setLoading(true);

        // Fetch candidate profile
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select(`
            id,
            experience,
            skills,
            resumes,
            profiles!inner (
              name,
              email
            )
          `)
          .eq('id', candidateId)
          .single();

        if (candidateError) {
          console.error('Error fetching candidate:', candidateError);
          return;
        }

        setCandidate({
          id: candidateData.id,
          name: (candidateData as any).profiles?.name || 'Unknown',
          email: (candidateData as any).profiles?.email || '',
          experience: candidateData.experience,
          skills: candidateData.skills,
          resumes: candidateData.resumes || [],
        });

        // Fetch applications for this candidate with job details
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select(`
            id,
            job_id,
            status,
            current_stage,
            ats_score,
            weighted_score,
            applied_at,
            resume_screening,
            quiz_results,
            interview_results,
            jobs!inner (
              title,
              custom_fields
            )
          `)
          .eq('candidate_id', candidateId)
          .order('applied_at', { ascending: false });

        if (applicationsError) {
          console.error('Error fetching applications:', applicationsError);
          return;
        }

        const transformedApps = (applicationsData || []).map((app: any) => {
          const stageWeightages = app.jobs?.custom_fields?.stage_weightages || {};
          const weightages = {
            resume: stageWeightages.resume_screening || 40,
            quiz: stageWeightages.quiz || 30,
            interview: stageWeightages.interview || 30,
          };

          const isComplete = !!(app.interview_results?.evaluation?.overall_score || app.current_stage === 'completed');

          // Use stored weighted_score for completed applications, fall back to dynamic calculation
          const score = isComplete && app.weighted_score != null
            ? app.weighted_score
            : calculateWeightedScore(app, weightages);

          return {
            id: app.id,
            job_id: app.job_id,
            status: app.status,
            current_stage: app.current_stage,
            ats_score: app.ats_score,
            applied_at: app.applied_at,
            resume_screening: app.resume_screening,
            quiz_results: app.quiz_results,
            interview_results: app.interview_results,
            job_title: app.jobs?.title || 'Unknown Job',
            weightages,
            weightedScore: score,
          };
        });


        setApplications(transformedApps);

        // Select the application matching the job_id from URL, or the first one
        if (jobId && transformedApps.length > 0) {
          const matchingApp = transformedApps.find(app => app.job_id === jobId);
          setSelectedApplication(matchingApp || transformedApps[0]);
        } else if (transformedApps.length > 0) {
          setSelectedApplication(transformedApps[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (candidateId) {
      fetchCandidateData();
    }
  }, [candidateId, jobId]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      'applied': { label: 'Applied', variant: 'outline' },
      'pending': { label: 'Pending', variant: 'outline' },
      'screening': { label: 'In Screening', variant: 'secondary' },
      'qualified': { label: 'Qualified', variant: 'default' },
      'under_review': { label: 'Under Review', variant: 'secondary' },
      'shortlisted': { label: 'Shortlisted', variant: 'default' },
      'rejected': { label: 'Rejected', variant: 'destructive' },
      'accepted': { label: 'Accepted', variant: 'default' },
    };
    return statusMap[status] || { label: status, variant: 'outline' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Candidate not found</p>
        <Button asChild>
          <Link href="/company/candidates">Back to Candidates</Link>
        </Button>
      </div>
    );
  }

  const statusInfo = selectedApplication ? getStatusBadge(selectedApplication.status) : null;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{candidate.name}</h1>
            <p className="text-muted-foreground">
              {candidate.experience ? `${candidate.experience} experience` : 'Candidate Profile'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {statusInfo && (
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            )}
            {selectedApplication && (
              <div className="text-right">
                <div className="text-2xl font-bold text-violet-600">{selectedApplication.weightedScore}%</div>
                <div className="text-xs text-muted-foreground">Weighted Score</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Selector (if multiple applications) */}
      {applications.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applications</CardTitle>
            <CardDescription>This candidate has applied to multiple jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {applications.map((app) => (
                <Button
                  key={app.id}
                  variant={selectedApplication?.id === app.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedApplication(app)}
                >
                  {app.job_title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
          <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.email}</span>
              </div>
              {candidate.experience && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{candidate.experience} experience</span>
                </div>
              )}
              {selectedApplication && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Applied on {new Date(selectedApplication.applied_at).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No skills listed</p>
              )}
            </CardContent>
          </Card>

          {selectedApplication && (
            <Card>
              <CardHeader>
                <CardTitle>Application for: {selectedApplication.job_title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <p className="text-muted-foreground capitalize">{selectedApplication.status}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Stage</Label>
                    <p className="text-muted-foreground capitalize">{selectedApplication.current_stage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          {selectedApplication ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Assessment Results</CardTitle>
                    <CardDescription>Overall Weighted Score: {selectedApplication.weightedScore}%</CardDescription>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Weightages: Resume {selectedApplication.weightages.resume}% | Quiz {selectedApplication.weightages.quiz}% | Interview {selectedApplication.weightages.interview}%
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Resume Screening */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Resume Screening</span>
                      <span className="font-medium">
                        {selectedApplication.resume_screening?.match_score || selectedApplication.ats_score || 'N/A'}%
                      </span>
                    </div>
                    <Progress value={selectedApplication.resume_screening?.match_score || selectedApplication.ats_score || 0} />
                  </div>

                  {/* Quiz Assessment */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Quiz Assessment</span>
                      <span className="font-medium">{selectedApplication.quiz_results?.score || 'N/A'}%</span>
                    </div>
                    <Progress value={selectedApplication.quiz_results?.score || 0} />
                  </div>

                  {/* Interview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>AI Interview</span>
                      <span className="font-medium">
                        {selectedApplication.interview_results?.evaluation?.overall_score || 'N/A'}%
                      </span>
                    </div>
                    <Progress value={selectedApplication.interview_results?.evaluation?.overall_score || 0} />
                  </div>
                </div>

                {/* Overall Progress */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">Application Progress</span>
                    <span>
                      {selectedApplication.current_stage === 'completed' ? '100%' :
                        selectedApplication.current_stage === 'interview' ? '67%' :
                          selectedApplication.current_stage === 'quiz' ? '33%' : '0%'}
                    </span>
                  </div>
                  <Progress value={
                    selectedApplication.current_stage === 'completed' ? 100 :
                      selectedApplication.current_stage === 'interview' ? 67 :
                        selectedApplication.current_stage === 'quiz' ? 33 : 0
                  } className="h-3" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No application data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {selectedApplication?.interview_results?.evaluation ? (
            <>
              {/* AI Hiring Recommendation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-violet-600" />
                    AI Hiring Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Badge
                      className={`text-lg px-4 py-2 ${selectedApplication.interview_results.evaluation.hiring_recommendation?.toLowerCase().includes('strong hire')
                        ? 'bg-green-500 text-white'
                        : selectedApplication.interview_results.evaluation.hiring_recommendation?.toLowerCase().includes('hire')
                          ? 'bg-emerald-500 text-white'
                          : selectedApplication.interview_results.evaluation.hiring_recommendation?.toLowerCase().includes('no hire')
                            ? 'bg-red-500 text-white'
                            : 'bg-yellow-500 text-white'
                        }`}
                    >
                      {selectedApplication.interview_results.evaluation.hiring_recommendation || 'Pending Evaluation'}
                    </Badge>
                    <span className="text-muted-foreground">
                      Based on AI interview analysis
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths */}
              {selectedApplication.interview_results.evaluation.strengths &&
                selectedApplication.interview_results.evaluation.strengths.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        Strengths
                      </CardTitle>
                      <CardDescription>Key strengths identified during the AI interview</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {selectedApplication.interview_results.evaluation.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <span className="text-green-500 font-bold mt-0.5">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Weaknesses */}
              {selectedApplication.interview_results.evaluation.weaknesses &&
                selectedApplication.interview_results.evaluation.weaknesses.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertCircle className="h-5 w-5" />
                        Areas for Improvement
                      </CardTitle>
                      <CardDescription>Areas where the candidate could improve</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {selectedApplication.interview_results.evaluation.weaknesses.map((weakness: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <span className="text-red-500 font-bold mt-0.5">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

              {/* Interview Score Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Interview Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Overall Interview Score</span>
                    <div className="text-3xl font-bold text-violet-600">
                      {selectedApplication.interview_results.evaluation.overall_score}%
                    </div>
                  </div>
                  <Progress
                    value={selectedApplication.interview_results.evaluation.overall_score}
                    className="h-4 mt-4"
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  AI analytics will be available after the candidate completes their interview assessment.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-start">
        <Button variant="outline" asChild>
          <Link href="/company/candidates">← Back to Candidates</Link>
        </Button>
      </div>
    </div>
  );
}