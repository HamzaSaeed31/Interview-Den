"use client";
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Briefcase, ChevronRight, FileText, Users } from "lucide-react"
import Link from "next/link"
import { createSupabaseBrowserClient } from "@/lib/supabase"

export default function CompanyPortal() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState({
    company_name: "",
    industry: "",
    size: "",
    location: "",
    website: "",
    description: "",
    email: "",
  });
  const [jobStats, setJobStats] = useState({
    activeJobs: 0,
    draftJobs: 0,
    totalJobs: 0,
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setLoading(false);
        return;
      }
      
      const userId = user.id;
      
      // Fetch from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();
      
      // Fetch from companies
      const { data: company } = await supabase
        .from("companies")
        .select("company_name, industry, size, location, website, description")
        .eq("id", userId)
        .single();
      
      // Fetch jobs statistics
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, title, status, created_at, description")
        .eq("company_id", userId)
        .order("created_at", { ascending: false });

      const activeJobs = jobs?.filter(job => job.status === 'active' || job.status === 'published').length || 0;
      const draftJobs = jobs?.filter(job => job.status === 'draft').length || 0;
      
      setCompanyInfo({
        company_name: company?.company_name || "",
        industry: company?.industry || "",
        size: company?.size || "",
        location: company?.location || "",
        website: company?.website || "",
        description: company?.description || "",
        email: profile?.email || user.email || "",
      });

      setJobStats({
        activeJobs,
        draftJobs,
        totalJobs: jobs?.length || 0,
      });

      setRecentJobs(jobs?.slice(0, 5) || []);
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          {loading ? "Welcome back!" : `Welcome back, ${companyInfo.company_name || "Company"}!`}
        </h1>
        <p className="text-muted-foreground">Here's an overview of your recruitment activities.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : jobStats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">{jobStats.draftJobs} draft{jobStats.draftJobs !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : jobStats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">All job postings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="recent">Recent Jobs</TabsTrigger>
            <TabsTrigger value="shortlisted">Applicants (Coming Soon)</TabsTrigger>
            <TabsTrigger value="interviews">Interviews (Coming Soon)</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" asChild>
            <Link href="/company/jobs">
              View all jobs
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <TabsContent value="recent" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ) : recentJobs.length > 0 ? (
            recentJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>
                    Status: {job.status?.charAt(0).toUpperCase() + job.status?.slice(1) || 'Draft'} • 
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description || "No description available"}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    0 applications • 0 shortlisted
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/company/jobs/${job.id}`}>View Job</Link>
                  </Button>
                  <Button size="sm" disabled>View Applicants</Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">No jobs posted yet</p>
                <div className="mt-4 flex justify-center">
                  <Button asChild>
                    <Link href="/company/jobs/create">Create Your First Job</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="shortlisted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Software Engineer</CardTitle>
              <CardDescription>5 candidates shortlisted</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Alex Johnson</h4>
                  <p className="text-sm text-muted-foreground">5 years experience, React, Node.js</p>
                  <div className="mt-1 text-xs text-muted-foreground">Shortlisted on April 5, 2024</div>
                </div>
                <Button size="sm">Schedule</Button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Michael Brown</h4>
                  <p className="text-sm text-muted-foreground">7 years experience, Vue.js, Java</p>
                  <div className="mt-1 text-xs text-muted-foreground">Shortlisted on April 6, 2024</div>
                </div>
                <Button size="sm">Schedule</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Shortlisted</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="interviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Alex Johnson</h4>
                  <p className="text-sm text-muted-foreground">Software Engineer</p>
                  <div className="mt-1 text-xs text-muted-foreground">April 11, 2024 - 10:00 AM</div>
                </div>
                <Button size="sm" variant="outline">Reschedule</Button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Emily Davis</h4>
                  <p className="text-sm text-muted-foreground">Frontend Developer</p>
                  <div className="mt-1 text-xs text-muted-foreground">April 12, 2024 - 2:00 PM</div>
                </div>
                <Button size="sm" variant="outline">Reschedule</Button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">David Wilson</h4>
                  <p className="text-sm text-muted-foreground">Frontend Developer</p>
                  <div className="mt-1 text-xs text-muted-foreground">April 13, 2024 - 11:00 AM</div>
                </div>
                <Button size="sm" variant="outline">Reschedule</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Interviews</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
            <CardDescription>Your latest jobs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recentJobs.length > 0 ? (
              recentJobs.slice(0, 4).map((job, index) => (
                <div key={job.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium truncate">{job.title}</span>
                    <span className="text-sm text-muted-foreground capitalize">{job.status || 'draft'}</span>
                  </div>
                  <Progress value={job.status === 'active' || job.status === 'published' ? 100 : 50} className="h-2" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No jobs created yet</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/company/jobs">View All Jobs</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates on your jobs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recentJobs.length > 0 ? (
              recentJobs.slice(0, 4).map((job, index) => {
                const colors = ['blue-500', 'green-500', 'purple-500', 'yellow-500'];
                const color = colors[index % colors.length];
                const statusText = job.status === 'active' || job.status === 'published' ? 'Published' : 'Created as Draft';
                
                return (
                  <div key={job.id} className={`border-l-2 border-${color} pl-4`}>
                    <h4 className="font-medium">Job {statusText}</h4>
                    <p className="text-sm text-muted-foreground">{job.title}</p>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="border-l-2 border-gray-300 pl-4">
                <h4 className="font-medium">No Activities Yet</h4>
                <p className="text-sm text-muted-foreground">Create your first job to see activities here</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/company/jobs">Manage Jobs</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-auto flex-col items-start gap-1 p-4 text-left" asChild>
              <Link href="/company/jobs/create">
                <Briefcase className="h-5 w-5 mb-2" />
                <span className="font-medium">Create Job</span>
                <span className="text-xs text-muted-foreground">Post a new job opening</span>
              </Link>
            </Button>
            <Button className="h-auto flex-col items-start gap-1 p-4 text-left" asChild>
              <Link href="/company/interviews/schedule">
                <FileText className="h-5 w-5 mb-2" />
                <span className="font-medium">Schedule Interview</span>
                <span className="text-xs text-muted-foreground">Set up candidate interviews</span>
              </Link>
            </Button>
            <Button className="h-auto flex-col items-start gap-1 p-4 text-left" asChild>
              <Link href="/company/assessments/create">
                <BarChart className="h-5 w-5 mb-2" />
                <span className="font-medium">Create Assessment</span>
                <span className="text-xs text-muted-foreground">Design a new test</span>
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/company/settings">View All Settings</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
