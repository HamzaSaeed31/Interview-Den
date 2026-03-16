import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Briefcase, ChevronRight, FileText, Users } from "lucide-react"
import Link from "next/link"

export default function CompanyPortal() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome back, TechCorp!</h1>
        <p className="text-muted-foreground">Here's an overview of your recruitment activities.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">+28 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">4 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hiring Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">24%</div>
            </div>
            <Progress value={24} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="recent">Recent Applications</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" asChild>
            <Link href="/company/jobs">
              View all jobs
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Software Engineer</CardTitle>
              <CardDescription>12 new applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Alex Johnson</h4>
                  <p className="text-sm text-muted-foreground">5 years experience, React, Node.js</p>
                  <div className="mt-1 text-xs text-muted-foreground">Applied 2 days ago</div>
                </div>
                <Button size="sm">Review</Button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Sarah Williams</h4>
                  <p className="text-sm text-muted-foreground">3 years experience, Angular, Python</p>
                  <div className="mt-1 text-xs text-muted-foreground">Applied 3 days ago</div>
                </div>
                <Button size="sm">Review</Button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Michael Brown</h4>
                  <p className="text-sm text-muted-foreground">7 years experience, Vue.js, Java</p>
                  <div className="mt-1 text-xs text-muted-foreground">Applied 1 day ago</div>
                </div>
                <Button size="sm">Review</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Applicants</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Frontend Developer</CardTitle>
              <CardDescription>8 new applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Emily Davis</h4>
                  <p className="text-sm text-muted-foreground">4 years experience, React, CSS</p>
                  <div className="mt-1 text-xs text-muted-foreground">Applied 1 day ago</div>
                </div>
                <Button size="sm">Review</Button>
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">David Wilson</h4>
                  <p className="text-sm text-muted-foreground">2 years experience, Vue.js, SCSS</p>
                  <div className="mt-1 text-xs text-muted-foreground">Applied 2 days ago</div>
                </div>
                <Button size="sm">Review</Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Applicants</Button>
            </CardFooter>
          </Card>
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
            <CardTitle>Job Performance</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Software Engineer</span>
                <span className="text-sm font-medium">86 applicants</span>
              </div>
              <Progress value={86} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Frontend Developer</span>
                <span className="text-sm font-medium">42 applicants</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">UX Designer</span>
                <span className="text-sm font-medium">28 applicants</span>
              </div>
              <Progress value={28} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Product Manager</span>
                <span className="text-sm font-medium">14 applicants</span>
              </div>
              <Progress value={14} className="h-2" />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/company/analytics">View Analytics</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates on your jobs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-2 border-blue-500 pl-4">
              <h4 className="font-medium">New Application</h4>
              <p className="text-sm text-muted-foreground">Michael Brown applied for Software Engineer</p>
              <div className="mt-1 text-xs text-muted-foreground">1 hour ago</div>
            </div>
            <div className="border-l-2 border-green-500 pl-4">
              <h4 className="font-medium">Interview Scheduled</h4>
              <p className="text-sm text-muted-foreground">Alex Johnson for Software Engineer</p>
              <div className="mt-1 text-xs text-muted-foreground">3 hours ago</div>
            </div>
            <div className="border-l-2 border-purple-500 pl-4">
              <h4 className="font-medium">Test Completed</h4>
              <p className="text-sm text-muted-foreground">Emily Davis completed Frontend Developer assessment</p>
              <div className="mt-1 text-xs text-muted-foreground">Yesterday</div>
            </div>
            <div className="border-l-2 border-yellow-500 pl-4">
              <h4 className="font-medium">Job Posted</h4>
              <p className="text-sm text-muted-foreground">UX Designer position published</p>
              <div className="mt-1 text-xs text-muted-foreground">2 days ago</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Activities</Button>
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
