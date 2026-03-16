"use client"

import { useState, useEffect } from "react"
import { ChevronRight, FileText, Briefcase, MessageSquare, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import Link from "next/link"

export default function CandidateDashboard() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar_url: "",
    experience: "",
    skills: [] as string[],
    resume_url: "",
  });
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<{ strengths: string[]; improvements: string[] }>({ strengths: [], improvements: [] });
  const [stats, setStats] = useState({ inProgress: 0, availableJobs: 0, completed: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        return;
      }

      const userId = user.id;

      // Fetch all data in parallel for efficiency
      const [profileResult, candidateResult, jobsResult, applicationsResult, allApplicationsResult] = await Promise.all([
        supabase.from("profiles").select("name, email, avatar_url").eq("id", userId).single(),
        supabase.from("candidates").select("experience, skills, resumes").eq("id", userId).single(),
        supabase.from("jobs").select("id, title, company_id, description, location, type, salary_min, salary_max, currency, created_at, requirements").in("status", ["active", "published"]).order("created_at", { ascending: false }),
        supabase.from("applications").select(`
          id, job_id, status, current_stage, ats_score, applied_at,
          jobs!inner (title, company_id, companies!inner (company_name))
        `).eq("candidate_id", userId).order("applied_at", { ascending: false }).limit(5),
        // Use simple query without inner join to get ALL applications
        supabase.from("applications").select("id, job_id, interview_results, current_stage").eq("candidate_id", userId)
      ]);

      const profile = profileResult.data;
      const candidate = candidateResult.data;
      const jobs = jobsResult.data || [];
      const allApplications = allApplicationsResult.data || [];

      // Debug logging - include errors
      console.log('Dashboard Debug:', {
        totalJobs: jobs.length,
        jobsError: jobsResult.error,
        jobStatuses: jobs.map(j => ({ id: j.id, status: j.status, title: j.title })),
        totalApplications: allApplications.length,
        appliedJobIds: allApplications.map(a => a.job_id),
      });

      // Get list of already applied job IDs
      const appliedJobIds = new Set(allApplications.map((app: any) => app.job_id));

      // Calculate stats
      const completedApps = allApplications.filter((app: any) => app.current_stage === 'completed');
      const inProgressApps = allApplications.filter((app: any) => app.current_stage !== 'completed');
      const availableJobsCount = jobs.filter(job => !appliedJobIds.has(job.id)).length;

      console.log('Dashboard Stats:', {
        completedApps: completedApps.length,
        inProgressApps: inProgressApps.length,
        availableJobsCount,
        appliedJobIdsSet: Array.from(appliedJobIds),
      });

      setStats({
        inProgress: inProgressApps.length,
        availableJobs: availableJobsCount,
        completed: completedApps.length,
      });

      // Calculate profile completion - check for resumes array
      const hasResume = candidate?.resumes && Array.isArray(candidate.resumes) && candidate.resumes.length > 0;
      const fields = {
        name: profile?.name,
        email: profile?.email,
        experience: candidate?.experience,
        skills: candidate?.skills?.length > 0,
        resume: hasResume,
      };
      const completedFields = Object.values(fields).filter(Boolean).length;
      const completion = Math.round((completedFields / Object.keys(fields).length) * 100);

      setProfileData({
        name: profile?.name || "",
        email: profile?.email || user.email || "",
        avatar_url: profile?.avatar_url || "",
        experience: candidate?.experience || "",
        skills: candidate?.skills || [],
        resume_url: hasResume ? "Has resume" : "", // Keep for display compatibility
      });

      // Extract feedback summary from completed applications
      const allStrengths: string[] = [];
      const allImprovements: string[] = [];
      allApplications.forEach((app: any) => {
        const evaluation = app.interview_results?.evaluation;
        if (evaluation) {
          if (evaluation.strengths) allStrengths.push(...evaluation.strengths);
          if (evaluation.weaknesses) allImprovements.push(...evaluation.weaknesses);
        }
      });
      // Get unique strengths and improvements (limit to top 5 each)
      const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
      const uniqueImprovements = [...new Set(allImprovements)].slice(0, 5);
      setFeedbackSummary({ strengths: uniqueStrengths, improvements: uniqueImprovements });

      // Fetch company names for jobs and filter/sort by skill match
      if (jobs.length > 0) {
        const companyIds = jobs.map(job => job.company_id).filter(Boolean);
        const { data: companies } = await supabase
          .from("companies")
          .select("id, company_name")
          .in("id", companyIds);

        const companyMap = new Map(companies?.map(c => [c.id, c.company_name]) || []);
        const candidateSkills = (candidate?.skills || []).map((s: string) => s.toLowerCase());

        // Filter out already applied jobs and calculate skill match score
        const jobsWithScores = jobs
          .filter(job => !appliedJobIds.has(job.id))
          .map(job => {
            // Use requirements field for matching (it's a text array)
            const jobRequirements = (job.requirements || []).map((s: string) => s.toLowerCase());
            const matchingSkills = candidateSkills.filter((skill: string) =>
              jobRequirements.some((req: string) => req.includes(skill) || skill.includes(req))
            );
            const matchScore = jobRequirements.length > 0 ? matchingSkills.length / jobRequirements.length : 0;
            return {
              ...job,
              company_name: companyMap.get(job.company_id) || "Unknown Company",
              matchScore,
            };
          })
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 5);

        setRecommendedJobs(jobsWithScores);
      }

      // Set applications
      if (applicationsResult.data) {
        const apps = applicationsResult.data.map((app: any) => ({
          id: app.id,
          job_id: app.job_id,
          status: app.status,
          current_stage: app.current_stage,
          ats_score: app.ats_score,
          applied_at: app.applied_at,
          job_title: app.jobs?.title || 'Unknown Job',
          company_name: app.jobs?.companies?.company_name || 'Unknown Company',
        }));
        setRecentApplications(apps);
      }

      setProfileCompletion(completion);
      setLoading(false);
    };

    fetchData();
  }, []);

  const firstName = profileData.name.split(" ")[0] || "Candidate";

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {loading ? "..." : firstName}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your job search today.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
            <Link href="/candidate/jobs">Find Jobs</Link>
          </Button>
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100" asChild>
            <Link href="/candidate/cv">Update Resume</Link>
          </Button>
        </div>
      </div>

      {/* Profile Completion */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2">
          <div className="bg-white h-2" style={{ width: `${100 - profileCompletion}%` }}></div>
        </div>
        <CardHeader className="pb-3">
          <CardTitle>{profileCompletion === 100 ? "🎉 Profile Complete!" : "Complete Your Profile"}</CardTitle>
          <CardDescription>
            {profileCompletion === 100
              ? "Great job! Your profile is fully optimized. You're ready to apply for jobs and stand out to employers."
              : "Increase your chances of getting hired by completing your profile."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm font-medium">{loading ? "..." : `${profileCompletion}%`}</span>
            </div>
            <Progress
              value={profileCompletion}
              className="h-2 bg-slate-100"
              indicatorClassName="bg-gradient-to-r from-indigo-600 to-violet-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${profileData.resume_url ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${profileData.resume_url ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-amber-100 dark:bg-amber-900'}`}>
                  {profileData.resume_url ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${profileData.resume_url ? 'text-emerald-900 dark:text-emerald-400' : 'text-amber-900 dark:text-amber-400'}`}>Resume</p>
                  <p className={`text-xs ${profileData.resume_url ? 'text-emerald-700 dark:text-emerald-500' : 'text-amber-700 dark:text-amber-500'}`}>
                    {profileData.resume_url ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${profileData.name && profileData.email ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${profileData.name && profileData.email ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-amber-100 dark:bg-amber-900'}`}>
                  {profileData.name && profileData.email ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${profileData.name && profileData.email ? 'text-emerald-900 dark:text-emerald-400' : 'text-amber-900 dark:text-amber-400'}`}>Personal Info</p>
                  <p className={`text-xs ${profileData.name && profileData.email ? 'text-emerald-700 dark:text-emerald-500' : 'text-amber-700 dark:text-amber-500'}`}>
                    {profileData.name && profileData.email ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg ${profileData.skills.length > 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${profileData.skills.length > 0 ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-amber-100 dark:bg-amber-900'}`}>
                  {profileData.skills.length > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${profileData.skills.length > 0 ? 'text-emerald-900 dark:text-emerald-400' : 'text-amber-900 dark:text-amber-400'}`}>Skills</p>
                  <p className={`text-xs ${profileData.skills.length > 0 ? 'text-emerald-700 dark:text-emerald-500' : 'text-amber-700 dark:text-amber-500'}`}>
                    {profileData.skills.length > 0 ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100" asChild>
            <Link href="/candidate/profile">
              {profileCompletion === 100 ? "View Your Profile" : "Complete Your Profile"}
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 h-auto">
          <TabsTrigger
            value="applications"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400"
          >
            Applications
          </TabsTrigger>
          <TabsTrigger
            value="recommended"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400"
          >
            Recommended Jobs
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400"
          >
            Feedback Summary
          </TabsTrigger>
        </TabsList>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Track the status of your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-slate-500 py-4">Loading...</p>
              ) : recentApplications.length > 0 ? (
                <div className="space-y-4">
                  {recentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">{app.job_title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {app.company_name} • {app.current_stage === 'completed' ? 'Completed' : `Stage: ${app.current_stage}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={app.current_stage === 'completed' ? 'default' : 'secondary'}>
                          {app.current_stage === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={app.current_stage === 'completed' ? '/candidate/feedback' : `/candidate/screening/${app.current_stage}?jobId=${app.job_id}`}>
                            {app.current_stage === 'completed' ? 'View' : 'Continue'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No applications yet</p>
                  <p className="text-sm text-slate-400 mt-1">Start applying to jobs to see them here</p>
                  <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700" asChild>
                    <Link href="/candidate/jobs">Browse Jobs</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommended Jobs Tab */}
        <TabsContent value="recommended" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>Jobs matching your skills and experience</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-slate-500 py-4">Loading jobs...</p>
              ) : recommendedJobs.length > 0 ? (
                <div className="space-y-4">
                  {recommendedJobs.slice(0, 3).map((job, index) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-md bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">{job.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {job.company_name} • {job.location || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" asChild>
                          <Link href={`/candidate/jobs/${job.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No active jobs available at the moment</p>
                  <p className="text-sm text-slate-400 mt-1">Check back later for new opportunities</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100" asChild>
                <Link href="/candidate/jobs">View All Jobs</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Feedback Summary Tab */}
        <TabsContent value="feedback" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Feedback Summary</CardTitle>
              <CardDescription>Aggregated feedback from your completed applications</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-slate-500 py-4">Loading feedback...</p>
              ) : feedbackSummary.strengths.length > 0 || feedbackSummary.improvements.length > 0 ? (
                <div className="space-y-6">
                  {feedbackSummary.strengths.length > 0 && (
                    <div>
                      <h3 className="text-green-600 font-bold mb-2">Strengths:</h3>
                      <ul className="space-y-2">
                        {feedbackSummary.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {feedbackSummary.improvements.length > 0 && (
                    <div>
                      <h3 className="text-yellow-600 font-bold mb-2">Areas for Improvement:</h3>
                      <ul className="space-y-2">
                        {feedbackSummary.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No feedback available yet</p>
                  <p className="text-sm text-slate-400 mt-1">Complete interviews to see your feedback summary</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100" asChild>
                <Link href="/candidate/feedback">View Detailed Feedback</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900 dark:text-indigo-100">In Progress Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
              {loading ? "..." : stats.inProgress}
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">Currently active</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-violet-900 dark:text-violet-100">Available Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-700 dark:text-violet-300">
              {loading ? "..." : stats.availableJobs}
            </div>
            <p className="text-xs text-violet-600 dark:text-violet-400">Open positions</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Completed Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              {loading ? "..." : stats.completed}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              {stats.completed > 0 ? "Well done!" : "Keep applying!"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
