"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, Clock, Building2, CheckCircle2, AlertCircle, PlayCircle, DollarSign, GraduationCap, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useScreening, ScreeningProgress } from "@/app/context/screening-context";
import { Progress } from "@/components/ui/progress";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  company: string;
  company_id?: string;
  location: string;
  type: string;
  experience?: string;
  posted: string;
  description: string;
  salary: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  created_at?: string;
  screeningProgress?: ScreeningProgress;
}

const jobTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

const experienceLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
];

export default function JobsPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const { getProgress, updateProgress } = useScreening();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState<string>("all");
  const [selectedExperience, setSelectedExperience] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Fetch jobs from database
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch already applied job IDs for this candidate
        let appliedJobIds: string[] = [];
        if (user) {
          const { data: applications } = await supabase
            .from('applications')
            .select('job_id')
            .eq('candidate_id', user.id);

          appliedJobIds = applications?.map(app => app.job_id) || [];
        }

        // Fetch active/published jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("id, title, company_id, description, location, type, salary_min, salary_max, currency, created_at")
          .in("status", ["active", "published"])
          .order("created_at", { ascending: false });

        if (jobsError) throw jobsError;

        if (jobsData && jobsData.length > 0) {
          // Filter out already applied jobs
          const availableJobs = jobsData.filter(job => !appliedJobIds.includes(job.id));

          // Fetch company names
          const companyIds = availableJobs.map(job => job.company_id).filter(Boolean);
          const { data: companies } = await supabase
            .from("companies")
            .select("id, company_name")
            .in("id", companyIds);

          const companyMap = new Map(companies?.map(c => [c.id, c.company_name]) || []);

          // Format jobs with company names and salary
          const formattedJobs: Job[] = availableJobs.map(job => {
            const createdDate = new Date(job.created_at);
            const daysAgo = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            const posted = daysAgo === 0 ? "Today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;

            let salary = "Not specified";
            if (job.salary_min && job.salary_max) {
              const currency = job.currency || "USD";
              const symbol = currency === "USD" ? "$" : currency;
              salary = `${symbol}${job.salary_min.toLocaleString()} - ${symbol}${job.salary_max.toLocaleString()}`;
            }

            return {
              id: job.id,
              title: job.title || "Untitled Position",
              company: companyMap.get(job.company_id) || "Unknown Company",
              company_id: job.company_id,
              location: job.location || "Not specified",
              type: job.type || "Full-time",
              description: job.description || "No description available",
              salary,
              salary_min: job.salary_min,
              salary_max: job.salary_max,
              currency: job.currency,
              posted,
              created_at: job.created_at,
            };
          });

          setJobs(formattedJobs);
        } else {
          setJobs([]);
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = async (jobId: string) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to apply for jobs");
        router.push("/login");
        return;
      }

      // Check if user has uploaded resumes
      const { data: candidate } = await supabase
        .from('candidates')
        .select('resumes')
        .eq('id', user.id)
        .single();

      if (!candidate?.resumes || (candidate.resumes as any[]).length === 0) {
        toast.error("Please upload a resume before applying");
        router.push("/candidate/cv");
        return;
      }

      // Create initial application record
      const { error: appError } = await supabase
        .from('applications')
        .insert({
          candidate_id: user.id,
          job_id: jobId,
          status: 'applied',
          current_stage: 'resume',
          applied_at: new Date().toISOString(),
        });

      // If application already exists, that's okay (unique constraint will prevent duplicate)
      if (appError && appError.code !== '23505') { // 23505 = unique violation
        throw appError;
      }

      // Initialize screening progress for the job
      updateProgress(jobId, 'resume', {
        answers: [],
        timeLeft: 30 * 60, // 30 minutes
        completed: false,
      });

      // Navigate to the screening page
      router.push(`/candidate/screening/resume?jobId=${jobId}`);
    } catch (error: any) {
      console.error('Error initializing screening:', error);
      toast.error(error.message || 'Failed to initialize screening. Please try again.');
    }
  };

  const handleResumeScreening = (jobId: string) => {
    try {
      const progress = getProgress(jobId);
      if (!progress) {
        setError('No screening progress found. Please apply for the job first.');
        return;
      }
      // Navigate to the current step in the screening process
      router.push(`/candidate/screening/${progress.currentStep}?jobId=${jobId}`);
    } catch (error) {
      console.error('Error resuming screening:', error);
      setError('Failed to resume screening. Please try again.');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedJobType === "all" || job.type.toLowerCase().includes(selectedJobType.toLowerCase());
    const matchesExperience = selectedExperience === "all" || job.experience?.toLowerCase().includes(selectedExperience.toLowerCase());
    return matchesSearch && matchesType && matchesExperience;
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Find Jobs</h1>
        <Button onClick={() => router.push("/candidate/tests")}>
          View Ongoing Tests
        </Button>
      </div>

      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search job titles or keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {jobTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading jobs...</p>
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">
                {jobs.length === 0 ? "No jobs available at the moment" : "No jobs found matching your criteria"}
              </p>
              {jobs.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">Check back later for new opportunities</p>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <CardDescription className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm">{job.type}</span>
                  </div>
                  {job.experience && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span className="text-sm">{job.experience}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">{job.posted}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {job.description}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push(`/candidate/jobs/${job.id}`)}>
                  View Job
                </Button>
                {job.screeningProgress ? (
                  <Button onClick={() => handleResumeScreening(job.id)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Resume Screening
                  </Button>
                ) : (
                  <Button onClick={() => handleApply(job.id)}>
                    Apply Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 