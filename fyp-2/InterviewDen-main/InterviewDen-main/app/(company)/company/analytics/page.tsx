"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Users, TrendingUp, CheckCircle2, Filter, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createSupabaseBrowserClient } from "@/lib/supabase";

interface JobPerformance {
  id: string;
  title: string;
  applicants: number;
  qualified: number;
  completed: number;
}

interface PipelineStats {
  resume: number;
  quiz: number;
  interview: number;
  completed: number;
  total: number;
}

export default function AnalyticsPage() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    qualifiedApplicants: 0,
  });
  const [jobPerformance, setJobPerformance] = useState<JobPerformance[]>([]);
  const [pipelineStats, setPipelineStats] = useState<PipelineStats>({
    resume: 0,
    quiz: 0,
    interview: 0,
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, title, status')
        .eq('company_id', user.id);

      const jobs = jobsData || [];
      const activeJobs = jobs.filter(job => job.status === 'active' || job.status === 'published').length;

      // Fetch all applications
      const { data: applicationsData } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          status,
          current_stage,
          jobs!inner (
            id,
            title,
            company_id
          )
        `)
        .eq('jobs.company_id', user.id);

      const applications = applicationsData || [];

      // Calculate overview statistics
      const qualifiedApplicants = applications.filter((app: any) =>
        app.status === 'qualified' || app.status === 'accepted'
      ).length;

      setOverview({
        totalJobs: jobs.length,
        activeJobs,
        totalApplicants: applications.length,
        qualifiedApplicants,
      });

      // Calculate job performance
      const jobPerfMap = new Map<string, { id: string; title: string; applicants: number; qualified: number; completed: number }>();
      applications.forEach((app: any) => {
        const jobId = app.job_id;
        const existing = jobPerfMap.get(jobId) || {
          id: jobId,
          title: app.jobs?.title || 'Unknown',
          applicants: 0,
          qualified: 0,
          completed: 0,
        };
        existing.applicants++;
        if (app.status === 'qualified' || app.status === 'accepted') existing.qualified++;
        if (app.current_stage === 'completed') existing.completed++;
        jobPerfMap.set(jobId, existing);
      });

      const jobPerfArray = Array.from(jobPerfMap.values());
      jobPerfArray.sort((a, b) => b.applicants - a.applicants);
      setJobPerformance(jobPerfArray);

      // Calculate pipeline statistics
      const pipeline = {
        resume: 0,
        quiz: 0,
        interview: 0,
        completed: 0,
        total: applications.length,
      };
      applications.forEach((app: any) => {
        if (app.current_stage === 'resume') pipeline.resume++;
        else if (app.current_stage === 'quiz') pipeline.quiz++;
        else if (app.current_stage === 'interview') pipeline.interview++;
        else if (app.current_stage === 'completed') pipeline.completed++;
      });
      setPipelineStats(pipeline);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your recruitment performance</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <span className="ml-3 text-muted-foreground">Loading analytics...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track your recruitment performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activeJobs}</div>
            <p className="text-xs text-muted-foreground">out of {overview.totalJobs} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalApplicants}</div>
            <p className="text-xs text-muted-foreground">Across all jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Qualified Candidates</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.qualifiedApplicants}</div>
            <p className="text-xs text-muted-foreground">Ready for next steps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {pipelineStats.total > 0 ? Math.round((pipelineStats.completed / pipelineStats.total) * 100) : 0}%
              </div>
            </div>
            <Progress
              value={pipelineStats.total > 0 ? (pipelineStats.completed / pipelineStats.total) * 100 : 0}
              className="mt-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {pipelineStats.completed} of {pipelineStats.total} completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Job Performance</TabsTrigger>
          <TabsTrigger value="pipeline">Candidate Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Performance</CardTitle>
              <CardDescription>Application stats per job posting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobPerformance.length > 0 ? (
                jobPerformance.map((job) => (
                  <div key={job.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{job.title}</span>
                      <span className="text-sm text-muted-foreground">{job.applicants} applicants</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Applied</span>
                          <span>{job.applicants}</span>
                        </div>
                        <Progress value={100} className="h-1" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Qualified</span>
                          <span>{job.qualified}</span>
                        </div>
                        <Progress value={job.applicants > 0 ? (job.qualified / job.applicants) * 100 : 0} className="h-1" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Completed</span>
                          <span>{job.completed}</span>
                        </div>
                        <Progress value={job.applicants > 0 ? (job.completed / job.applicants) * 100 : 0} className="h-1" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No applications yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidate Pipeline</CardTitle>
              <CardDescription>Distribution of candidates across stages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Resume Screening</span>
                  <Badge variant="outline">{pipelineStats.resume}</Badge>
                </div>
                <Progress
                  value={pipelineStats.total > 0 ? (pipelineStats.resume / pipelineStats.total) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Quiz Assessment</span>
                  <Badge variant="outline">{pipelineStats.quiz}</Badge>
                </div>
                <Progress
                  value={pipelineStats.total > 0 ? (pipelineStats.quiz / pipelineStats.total) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">AI Interview</span>
                  <Badge variant="outline">{pipelineStats.interview}</Badge>
                </div>
                <Progress
                  value={pipelineStats.total > 0 ? (pipelineStats.interview / pipelineStats.total) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed</span>
                  <Badge className="bg-emerald-100 text-emerald-700">{pipelineStats.completed}</Badge>
                </div>
                <Progress
                  value={pipelineStats.total > 0 ? (pipelineStats.completed / pipelineStats.total) * 100 : 0}
                  className="h-2 [&>div]:bg-emerald-500"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Analytics Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-violet-500" /> Recruitment Summary
          </CardTitle>
          <CardDescription>Key metrics for your hiring process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pipeline Overview */}
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4 text-violet-500" /> Pipeline Overview
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">In Resume Screening</span>
                  <span className="font-medium">{pipelineStats.resume}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">In Quiz Assessment</span>
                  <span className="font-medium">{pipelineStats.quiz}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">In AI Interview</span>
                  <span className="font-medium">{pipelineStats.interview}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Process Completed</span>
                  <span className="font-medium text-emerald-600">{pipelineStats.completed}</span>
                </div>
              </div>
            </div>

            {/* Top Performing Jobs */}
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" /> Top Performing Jobs
              </h3>
              {jobPerformance.length > 0 ? (
                <div className="space-y-2">
                  {jobPerformance.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[180px]">{job.title}</span>
                      <Badge className="bg-blue-100 text-blue-700">{job.applicants} applicants</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500">No applications yet</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}