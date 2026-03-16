"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Briefcase, MapPin, Clock, Users, Settings, FileText } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  created_at: string;
  status: string;
  description?: string;
  applicant_count: number;
}

export default function JobsPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch jobs for the current company
        const { data: jobsData, error } = await supabase
          .from('jobs')
          .select('id, title, location, type, salary_min, salary_max, currency, created_at, status, description')
          .eq('company_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch applicant counts for each job
        const jobsWithCounts = await Promise.all(
          (jobsData || []).map(async (job) => {
            const { count } = await supabase
              .from('applications')
              .select('*', { count: 'exact', head: true })
              .eq('job_id', job.id);
            return { ...job, applicant_count: count || 0 };
          })
        );

        setJobs(jobsWithCounts);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter jobs by status
  const getFilteredByStatus = (jobsList: Job[]) => {
    if (statusFilter === "all") return jobsList;
    if (statusFilter === "active") {
      return jobsList.filter(job => job.status === "active" || job.status === "published");
    }
    // draft filter - anything that's not active/published
    return jobsList.filter(job => job.status !== "active" && job.status !== "published");
  };

  // Filter jobs by search query and status
  const filteredJobs = getFilteredByStatus(jobs).filter(job =>
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get counts for filter badges
  const activeCount = jobs.filter(job => job.status === "active" || job.status === "published").length;
  const draftCount = jobs.filter(job => job.status !== "active" && job.status !== "published").length;

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Not specified';
    const symbol = currency === 'PKR' ? '₨' : currency === 'USD' ? '$' : currency || '';
    if (min && max) {
      return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    }
    return min ? `${symbol}${min.toLocaleString()}+` : 'Negotiable';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    if (days < 60) return '1 month ago';
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Job Postings</h1>
        <p className="text-muted-foreground">Manage and create job postings for your company</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link href="/company/jobs/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Job
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
            <Badge variant="secondary" className="ml-2">
              {jobs.length}
            </Badge>
          </Button>
          <Button
            variant={statusFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("active")}
          >
            Active
            <Badge variant="secondary" className="ml-2">
              {activeCount}
            </Badge>
          </Button>
          <Button
            variant={statusFilter === "draft" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("draft")}
          >
            Drafts
            <Badge variant="secondary" className="ml-2">
              {draftCount}
            </Badge>
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-muted-foreground">Loading jobs...</span>
            </CardContent>
          </Card>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {jobs.length === 0
                  ? "No jobs posted yet"
                  : searchQuery
                    ? "No jobs match your search"
                    : statusFilter === "active"
                      ? "No active jobs"
                      : statusFilter === "draft"
                        ? "No draft jobs"
                        : "No jobs found"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {jobs.length === 0
                  ? "Create your first job posting to start hiring"
                  : searchQuery
                    ? "Try a different search term"
                    : statusFilter === "active"
                      ? "Publish a draft to see it here"
                      : statusFilter === "draft"
                        ? "All your jobs are published"
                        : "Try adjusting your filters"}
              </p>
              {jobs.length === 0 && (
                <Link href="/company/jobs/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Job
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle>{job.title || 'Untitled Position'}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Posted {getTimeAgo(job.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {job.location || 'Not specified'}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {job.type || 'Full-time'}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="h-4 w-4 text-muted-foreground font-medium">₨</span>
                      {formatSalary(job.salary_min, job.salary_max, job.currency)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {job.applicant_count} applicant{job.applicant_count !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {job.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge variant={job.status === "active" || job.status === "published" ? "default" : "secondary"}>
                    {job.status === "active" || job.status === "published" ? "Active" : job.status || "Draft"}
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/company/jobs/${job.id}`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Manage
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 