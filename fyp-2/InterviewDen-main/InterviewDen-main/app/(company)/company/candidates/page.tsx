"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Briefcase, Mail, Phone, MapPin, Calendar, Loader2, CheckCircle2, Clock, XCircle, FileText, Video, Star } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Progress } from "@/components/ui/progress";

interface Job {
  id: string;
  title: string;
}

interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  current_stage: string;
  ats_score: number | null;
  applied_at: string;
  updated_at: string;
  resume_screening: any;
  quiz_results: any;
  interview_results: any;
  candidate: {
    name: string;
    email: string;
    experience: string | null;
    skills: string[] | null;
  };
  job: {
    title: string;
    weightages: {
      resume: number;
      quiz: number;
      interview: number;
    };
  };
  weightedScore: number;
  rank: number;
  totalApplicants: number;
  isComplete: boolean;
}

export default function CandidatesPage() {
  const supabase = createClient();
  const [selectedJob, setSelectedJob] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate weighted score for an applicant - MUST match jobs/[id]/page.tsx exactly
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch jobs for the current company
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('company_id', user.id)
        .in('status', ['active', 'published'])
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);

      // Fetch jobs with weightages for score calculation
      const { data: jobsWithWeightages } = await supabase
        .from('jobs')
        .select('id, custom_fields')
        .eq('company_id', user.id);

      const weightagesMap = new Map<string, { resume: number; quiz: number; interview: number }>();
      (jobsWithWeightages || []).forEach((job: any) => {
        const stageWeightages = job.custom_fields?.stage_weightages || {};
        weightagesMap.set(job.id, {
          resume: stageWeightages.resume_screening || 40,
          quiz: stageWeightages.quiz || 30,
          interview: stageWeightages.interview || 30
        });
      });

      // Fetch applications with candidate and job details
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          id,
          candidate_id,
          job_id,
          status,
          current_stage,
          ats_score,
          weighted_score,
          applied_at,
          updated_at,
          resume_screening,
          quiz_results,
          interview_results,
          candidates!inner (
            resumes,
            experience,
            skills,
            profiles!inner (
              name,
              email
            )
          ),
          jobs!inner (
            title,
            company_id
          )
        `)
        .eq('jobs.company_id', user.id)
        .order('applied_at', { ascending: false });

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
      } else {
        // Transform the data to match our interface
        const transformedApplications = (applicationsData || []).map((app: any) => {
          const weightages = weightagesMap.get(app.job_id) || {
            resume: 40,
            quiz: 30,
            interview: 30
          };

          const isComplete = !!(app.interview_results?.evaluation?.overall_score || app.current_stage === 'completed');

          // Use stored weighted_score for completed applications, fall back to dynamic calculation
          const score = isComplete && app.weighted_score != null
            ? app.weighted_score
            : calculateWeightedScore(app, weightages);

          return {
            id: app.id,
            candidate_id: app.candidate_id,
            job_id: app.job_id,
            status: app.status,
            current_stage: app.current_stage,
            ats_score: app.ats_score,
            applied_at: app.applied_at,
            updated_at: app.updated_at,
            resume_screening: app.resume_screening,
            quiz_results: app.quiz_results,
            interview_results: app.interview_results,
            candidate: {
              name: app.candidates?.profiles?.name || 'Unknown',
              email: app.candidates?.profiles?.email || '',
              experience: app.candidates?.experience || null,
              skills: app.candidates?.skills || null,
            },
            job: {
              title: app.jobs?.title || 'Unknown Job',
              weightages,
            },
            weightedScore: score,
            rank: 0,
            totalApplicants: 0,
            isComplete,
          };
        });


        // Calculate rankings per job (completed first, then by score)
        const jobGroups = new Map<string, typeof transformedApplications>();
        transformedApplications.forEach(app => {
          const group = jobGroups.get(app.job_id) || [];
          group.push(app);
          jobGroups.set(app.job_id, group);
        });

        // Sort each group by completion status, then weighted score
        jobGroups.forEach((apps) => {
          const sorted = [...apps].sort((a, b) => {
            // Completed applications first
            if (a.isComplete !== b.isComplete) {
              return a.isComplete ? -1 : 1;
            }
            // Then by weighted score
            return b.weightedScore - a.weightedScore;
          });
          sorted.forEach((app, idx) => {
            app.rank = idx + 1;
            app.totalApplicants = sorted.length;
          });
        });

        setApplications(transformedApplications);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
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

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'resume': return <FileText className="h-4 w-4" />;
      case 'quiz': return <Clock className="h-4 w-4" />;
      case 'interview': return <Video className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesJob = selectedJob === 'all' || app.job_id === selectedJob;
    const matchesSearch = searchQuery === '' ||
      app.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesJob && matchesSearch;
  });

  const allApplications = filteredApplications;
  // Qualified includes both 'qualified' and 'accepted' status
  const qualifiedApplications = filteredApplications.filter(app =>
    app.status === 'qualified' || app.status === 'accepted'
  );
  const pendingApplications = filteredApplications.filter(app =>
    app.status === 'pending' || app.status === 'applied'
  );
  const underReviewApplications = filteredApplications.filter(app =>
    app.status === 'under_review' || app.status === 'screening'
  );
  const shortlistedApplications = filteredApplications.filter(app =>
    app.status === 'shortlisted'
  );
  const rejectedApplications = filteredApplications.filter(app =>
    app.status === 'rejected'
  );

  const renderApplicationCard = (app: Application) => {
    const statusInfo = getStatusBadge(app.status);
    const quizScore = app.quiz_results?.score || 0;
    const interviewScore = app.interview_results?.evaluation?.overall_score || 0;
    const hiringRecommendation = app.interview_results?.evaluation?.hiring_recommendation;

    return (
      <Card key={app.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-12 w-12 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold">
                {app.candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{app.candidate.name}</h3>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  {app.isComplete && (
                    <Badge className="bg-green-500 text-white">Completed</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{app.candidate.email}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{app.job.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Applied {getTimeAgo(app.applied_at)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-violet-600">{app.weightedScore}%</div>
              <div className="text-xs text-muted-foreground">Weighted Score</div>
              {app.rank > 0 && app.totalApplicants > 0 && (
                <Badge variant="outline" className="mt-1 text-xs">
                  Rank #{app.rank} of {app.totalApplicants}
                </Badge>
              )}
            </div>
          </div>

          {/* Skills */}
          {app.candidate.skills && app.candidate.skills.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {app.candidate.skills.slice(0, 5).map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {app.candidate.skills.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{app.candidate.skills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">
                  {app.current_stage === 'completed' ? '100%' :
                    app.current_stage === 'interview' ? '67%' :
                      app.current_stage === 'quiz' ? '33%' : '0%'}
                </span>
              </div>
              <Progress value={
                app.current_stage === 'completed' ? 100 :
                  app.current_stage === 'interview' ? 67 :
                    app.current_stage === 'quiz' ? 33 : 0
              } className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Resume Screening */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Resume</span>
                  <span className="font-medium">{app.resume_screening?.match_score || app.ats_score || 0}%</span>
                </div>
                <Progress value={app.resume_screening?.match_score || app.ats_score || 0} className="h-1.5" />
              </div>

              {/* Quiz */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quiz</span>
                  <span className="font-medium">{quizScore}%</span>
                </div>
                <Progress value={quizScore} className="h-1.5" />
              </div>

              {/* Interview */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Interview</span>
                  <span className="font-medium">{interviewScore}%</span>
                </div>
                <Progress value={interviewScore} className="h-1.5" />
              </div>
            </div>
          </div>

          {/* AI Hiring Recommendation */}
          {hiringRecommendation && (
            <div className="flex items-center gap-2 mb-4 p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
              <Star className="h-4 w-4 text-violet-600" />
              <span className="text-sm text-muted-foreground">AI Recommendation:</span>
              <Badge
                className={
                  hiringRecommendation.toLowerCase().includes('strong hire')
                    ? 'bg-green-500 text-white'
                    : hiringRecommendation.toLowerCase().includes('hire')
                      ? 'bg-emerald-500 text-white'
                      : hiringRecommendation.toLowerCase().includes('no hire')
                        ? 'bg-red-500 text-white'
                        : 'bg-yellow-500 text-white'
                }
              >
                {hiringRecommendation}
              </Badge>
            </div>
          )}

          {/* Current Stage */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getStageIcon(app.current_stage)}
              <span>
                {app.current_stage === 'resume' && 'Resume Screening'}
                {app.current_stage === 'quiz' && 'Quiz Assessment'}
                {app.current_stage === 'interview' && 'AI Interview'}
                {app.current_stage === 'completed' && 'Application Complete'}
              </span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/company/candidates/${app.candidate_id}?job_id=${app.job_id}`}>
                View Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = (icon: React.ReactNode, message: string) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        {icon}
        <p className="text-muted-foreground mt-4">{message}</p>
      </CardContent>
    </Card>
  );

  const renderTabContent = (apps: Application[], emptyIcon: React.ReactNode, emptyMessage: string) => {
    if (loading) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-violet-600 mb-4" />
            <p className="text-muted-foreground">Loading applications...</p>
          </CardContent>
        </Card>
      );
    }

    if (apps.length === 0) {
      return renderEmptyState(emptyIcon, emptyMessage);
    }

    return (
      <div className="grid gap-4">
        {apps.map(renderApplicationCard)}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <p className="text-muted-foreground">Manage and review candidate applications</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">
              All ({allApplications.length})
            </TabsTrigger>
            <TabsTrigger value="qualified">
              Qualified ({qualifiedApplications.length})
            </TabsTrigger>
            <TabsTrigger value="shortlisted">
              Shortlisted ({shortlistedApplications.length})
            </TabsTrigger>
            <TabsTrigger value="under_review">
              Under Review ({underReviewApplications.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingApplications.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedApplications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderTabContent(
              allApplications,
              <Users className="h-16 w-16 text-muted-foreground" />,
              'No applications yet'
            )}
          </TabsContent>

          <TabsContent value="qualified" className="space-y-4">
            {renderTabContent(
              qualifiedApplications,
              <CheckCircle2 className="h-16 w-16 text-muted-foreground" />,
              'No qualified candidates yet'
            )}
          </TabsContent>

          <TabsContent value="shortlisted" className="space-y-4">
            {renderTabContent(
              shortlistedApplications,
              <Star className="h-16 w-16 text-muted-foreground" />,
              'No shortlisted candidates yet'
            )}
          </TabsContent>

          <TabsContent value="under_review" className="space-y-4">
            {renderTabContent(
              underReviewApplications,
              <Clock className="h-16 w-16 text-muted-foreground" />,
              'No candidates under review'
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {renderTabContent(
              pendingApplications,
              <Clock className="h-16 w-16 text-muted-foreground" />,
              'No pending candidates'
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {renderTabContent(
              rejectedApplications,
              <XCircle className="h-16 w-16 text-muted-foreground" />,
              'No rejected candidates'
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}