"use client"

import { useEffect, useState } from "react"
import { ChevronRight, Filter, Briefcase, Plus, TrendingUp, CheckCircle2, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { Progress } from "@/components/ui/progress"

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  created_at: string;
  status: string;
  applicant_count?: number;
}

interface TopCandidate {
  id: string;
  candidate_id: string;
  job_id: string;
  name: string;
  email: string;
  job_title: string;
  status: string;
  applied_at: string;
  weightedScore: number;
  resumeScore: number;
  quizScore: number;
  interviewScore: number;
  rank: number;
}

// Calculate weighted score for an applicant - consistent with candidates/page.tsx
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

// Top Candidates Tab Component
function TopCandidatesTabContent() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [topCandidates, setTopCandidates] = useState<TopCandidate[]>([]);

  useEffect(() => {
    fetchTopCandidates();
  }, []);

  const fetchTopCandidates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch jobs with weightages
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

      // Fetch all applications
      const { data, error } = await supabase
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
          resume_screening,
          quiz_results,
          interview_results,
          jobs!inner (
            title,
            company_id
          ),
          candidates!inner (
            profiles!inner (
              name,
              email
            )
          )
        `)
        .eq('jobs.company_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
      } else {
        // Calculate weighted scores and rank
        const candidatesWithScores = (data || []).map((app: any) => {
          const weightages = weightagesMap.get(app.job_id) || {
            resume: 40,
            quiz: 30,
            interview: 30
          };

          const resumeScore = app.resume_screening?.match_score || app.ats_score || 0;
          const quizScore = app.quiz_results?.score || 0;
          const interviewScore = app.interview_results?.evaluation?.overall_score || 0;

          const isComplete = !!(interviewScore || app.current_stage === 'completed');

          // Use stored weighted_score for completed applications, fall back to dynamic calculation
          const score = isComplete && app.weighted_score != null
            ? app.weighted_score
            : calculateWeightedScore(app, weightages);

          return {
            id: app.id,
            candidate_id: app.candidate_id,
            job_id: app.job_id,
            name: app.candidates?.profiles?.name || 'Unknown',
            email: app.candidates?.profiles?.email || '',
            job_title: app.jobs?.title || 'Unknown',
            status: app.status,
            applied_at: app.applied_at,
            weightedScore: score,
            resumeScore,
            quizScore,
            interviewScore,
            rank: 0,
          };
        });


        // Sort by weighted score descending
        candidatesWithScores.sort((a, b) => b.weightedScore - a.weightedScore);

        // Assign ranks
        candidatesWithScores.forEach((c, idx) => {
          c.rank = idx + 1;
        });

        // Take top 5
        setTopCandidates(candidatesWithScores.slice(0, 5));
      }
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'qualified': 'default',
      'under_review': 'secondary',
      'rejected': 'destructive',
      'screening': 'outline',
    };
    return variants[status] || 'outline';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </CardContent>
      </Card>
    );
  }

  if (topCandidates.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Top Candidates</CardTitle>
          <CardDescription>Ranked by weighted score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-slate-500 text-sm mb-4">
              Candidates will appear here once they start applying to your jobs
            </p>
            <Link href="/company/candidates">
              <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100">
                View Candidates Page
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Top Candidates</CardTitle>
        <CardDescription>Ranked by weighted score across all jobs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCandidates.map((candidate) => (
            <div key={candidate.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-violet-600 text-white font-bold text-sm">
                #{candidate.rank}
              </div>
              <div className="h-10 w-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold text-sm">
                {candidate.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{candidate.name}</h4>
                  <Badge variant={getStatusBadge(candidate.status)} className="text-xs">
                    {candidate.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {candidate.job_title} • {getTimeAgo(candidate.applied_at)}
                </p>
                <div className="flex gap-3 mt-2">
                  <div className="text-xs">
                    <span className="text-slate-500">Resume: </span>
                    <span className="font-medium">{candidate.resumeScore}%</span>
                  </div>
                  {candidate.quizScore > 0 && (
                    <div className="text-xs">
                      <span className="text-slate-500">Quiz: </span>
                      <span className="font-medium">{candidate.quizScore}%</span>
                    </div>
                  )}
                  {candidate.interviewScore > 0 && (
                    <div className="text-xs">
                      <span className="text-slate-500">Interview: </span>
                      <span className="font-medium">{candidate.interviewScore}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-violet-600">{candidate.weightedScore}%</div>
                <div className="text-xs text-slate-500">Weighted</div>
              </div>
              <Link href={`/company/candidates/${candidate.candidate_id}?job_id=${candidate.job_id}`}>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/company/candidates" className="w-full">
          <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100">
            View All Candidates
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function CompanyDashboard() {
  const supabase = createSupabaseBrowserClient();
  const [companyInfo, setCompanyInfo] = useState({
    company_name: "",
    industry: "",
    size: "",
    location: "",
    website: "",
    description: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobStats, setJobStats] = useState({
    activeJobs: 0,
    draftJobs: 0,
    totalJobs: 0,
    totalApplicants: 0,
    qualifiedApplicants: 0,
  });
  const [topJobs, setTopJobs] = useState<{ title: string; count: number }[]>([]);
  const [pipelineStats, setPipelineStats] = useState({
    resume: 0,
    quiz: 0,
    interview: 0,
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        return;
      }

      const userId = user.id;

      // Fetch all data in parallel
      const [companyResult, jobsResult, applicationsResult] = await Promise.all([
        supabase
          .from("companies")
          .select("company_name, industry, size, location, website, description")
          .eq("id", userId)
          .single(),
        supabase
          .from("jobs")
          .select("id, title, location, type, created_at, status")
          .eq("company_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("applications")
          .select(`
            id,
            job_id,
            status,
            current_stage,
            jobs!inner (
              title,
              company_id
            )
          `)
          .eq('jobs.company_id', userId)
      ]);

      const company = companyResult.data;
      const jobsData = jobsResult.data || [];
      const applicationsData = applicationsResult.data || [];

      // Calculate job statistics
      const activeJobs = jobsData.filter(job => job.status === 'active' || job.status === 'published').length;
      const draftJobs = jobsData.filter(job => job.status === 'draft').length;

      // Calculate applicant counts per job
      const jobApplicantCounts = new Map<string, number>();
      applicationsData.forEach((app: any) => {
        const count = jobApplicantCounts.get(app.job_id) || 0;
        jobApplicantCounts.set(app.job_id, count + 1);
      });

      // Add applicant counts to jobs
      const jobsWithCounts = jobsData.map(job => ({
        ...job,
        applicant_count: jobApplicantCounts.get(job.id) || 0
      }));

      // Calculate qualified applicants
      const qualifiedApplicants = applicationsData.filter((app: any) =>
        app.status === 'qualified' || app.status === 'accepted'
      ).length;

      // Calculate pipeline stats
      const pipelineCounts = {
        resume: 0,
        quiz: 0,
        interview: 0,
        completed: 0,
        total: applicationsData.length,
      };
      applicationsData.forEach((app: any) => {
        if (app.current_stage === 'resume') pipelineCounts.resume++;
        else if (app.current_stage === 'quiz') pipelineCounts.quiz++;
        else if (app.current_stage === 'interview') pipelineCounts.interview++;
        else if (app.current_stage === 'completed') pipelineCounts.completed++;
      });
      setPipelineStats(pipelineCounts);

      // Get top performing jobs (by applicant count)
      const jobCounts: { title: string; count: number }[] = [];
      jobApplicantCounts.forEach((count, jobId) => {
        const job = jobsData.find(j => j.id === jobId);
        if (job) {
          jobCounts.push({ title: job.title, count });
        }
      });
      jobCounts.sort((a, b) => b.count - a.count);
      setTopJobs(jobCounts.slice(0, 3));

      setCompanyInfo({
        company_name: company?.company_name || "",
        industry: company?.industry || "",
        size: company?.size || "",
        location: company?.location || "",
        website: company?.website || "",
        description: company?.description || "",
        email: user.email || "",
      });

      setJobs(jobsWithCounts);
      setJobStats({
        activeJobs,
        draftJobs,
        totalJobs: jobsData.length,
        totalApplicants: applicationsData.length,
        qualifiedApplicants,
      });

      setLoading(false);
    };

    fetchData();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 14) return '1 week ago';
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {loading ? "Welcome back!" : `Welcome back, ${companyInfo.company_name || "Company"}!`}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your recruitment today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/company/jobs/create">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
          <Link href="/company/analytics">
            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100">
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards - 3 cards now */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
              {loading ? "..." : jobStats.activeJobs}
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">
              {jobStats.draftJobs} draft{jobStats.draftJobs !== 1 ? 's' : ''} • {jobStats.totalJobs} total
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-900 dark:text-rose-100">Total Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-700 dark:text-rose-300">
              {loading ? "..." : jobStats.totalApplicants}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Across all jobs
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
              Qualified Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              {loading ? "..." : jobStats.qualifiedApplicants}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Ready for next steps
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Tabs - 2 tabs now */}
      <Tabs defaultValue="candidates" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 h-auto">
          <TabsTrigger
            value="candidates"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400"
          >
            Top Candidates
          </TabsTrigger>
          <TabsTrigger
            value="jobs"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400"
          >
            Active Jobs
          </TabsTrigger>
        </TabsList>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-4 pt-4">
          <TopCandidatesTabContent />
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Active Job Postings</CardTitle>
              <CardDescription>Your current open positions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-slate-500">Loading jobs...</p>
              ) : jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">{job.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {job.location || 'Not specified'} • Posted {getTimeAgo(job.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {job.applicant_count || 0} applicant{(job.applicant_count || 0) !== 1 ? 's' : ''}
                        </div>
                        <Link href={`/company/jobs/${job.id}`}>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No jobs posted yet</p>
                  <Link href="/company/jobs/create">
                    <Button className="mt-4 bg-violet-600 hover:bg-violet-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Job
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/company/jobs" className="w-full">
                <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100">
                  Manage All Jobs
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recruitment Analytics Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet-500" /> Recruitment Analytics
          </CardTitle>
          <CardDescription>Key metrics and insights for your hiring process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Candidate Pipeline */}
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4 text-violet-500" /> Candidate Pipeline
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Resume Screening</span>
                  <Badge variant="outline">{pipelineStats.resume}</Badge>
                </div>
                <Progress value={pipelineStats.total > 0 ? (pipelineStats.resume / pipelineStats.total) * 100 : 0} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Quiz Assessment</span>
                  <Badge variant="outline">{pipelineStats.quiz}</Badge>
                </div>
                <Progress value={pipelineStats.total > 0 ? (pipelineStats.quiz / pipelineStats.total) * 100 : 0} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">AI Interview</span>
                  <Badge variant="outline">{pipelineStats.interview}</Badge>
                </div>
                <Progress value={pipelineStats.total > 0 ? (pipelineStats.interview / pipelineStats.total) * 100 : 0} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Completed</span>
                  <Badge className="bg-emerald-100 text-emerald-700">{pipelineStats.completed}</Badge>
                </div>
                <Progress value={pipelineStats.total > 0 ? (pipelineStats.completed / pipelineStats.total) * 100 : 0} className="h-2 bg-slate-200 [&>div]:bg-emerald-500" />
              </div>
            </div>

            {/* Top Performing Jobs */}
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" /> Top Performing Jobs
              </h3>
              {topJobs.length > 0 ? (
                <div className="space-y-3">
                  {topJobs.map((job, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[180px]">{job.title}</span>
                      <Badge className="bg-blue-100 text-blue-700">{job.count} applicant{job.count !== 1 ? 's' : ''}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500">No applications yet</p>
                </div>
              )}
            </div>

            {/* Application Stats */}
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800 md:col-span-2">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Application Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{jobStats.totalApplicants}</div>
                  <div className="text-xs text-slate-500">Total Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">{jobStats.qualifiedApplicants}</div>
                  <div className="text-xs text-slate-500">Qualified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-600">{pipelineStats.completed}</div>
                  <div className="text-xs text-slate-500">Completed Process</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{jobStats.activeJobs}</div>
                  <div className="text-xs text-slate-500">Active Jobs</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
