"use client"

import { useState } from "react"
import { ChevronRight, FileText, Briefcase, Calendar, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function CandidateDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back, John!</h1>
          <p className="text-slate-500 dark:text-slate-400">Here's what's happening with your job search today.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-indigo-600 hover:bg-indigo-700">Find Jobs</Button>
          <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100">
            Update Resume
          </Button>
        </div>
      </div>

      {/* Profile Completion */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2">
          <div className="bg-white h-2 w-[25%]"></div>
        </div>
        <CardHeader className="pb-3">
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Increase your chances of getting hired by completing your profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm font-medium">75%</span>
            </div>
            <Progress
              value={75}
              className="h-2 bg-slate-100"
              indicatorClassName="bg-gradient-to-r from-indigo-600 to-violet-600"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-400">Resume</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-500">Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900 dark:text-emerald-400">Personal Info</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-500">Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-400">Skills Assessment</p>
                  <p className="text-xs text-amber-700 dark:text-amber-500">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100">
            Complete Your Profile
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
            value="interviews"
            className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400"
          >
            Upcoming Interviews
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
              <div className="space-y-4">
                {/* Application Item */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Senior Frontend Developer</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">TechCorp Inc.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                    >
                      In Review
                    </Badge>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Application Item */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Full Stack Developer</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">InnovateSoft</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                    >
                      Test Pending
                    </Badge>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Application Item */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">UX/UI Designer</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">DesignHub</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                    >
                      Interview Scheduled
                    </Badge>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100">
                View All Applications
              </Button>
            </CardFooter>
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
              <div className="space-y-4">
                {/* Job Item */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">React Developer</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">WebTech Solutions • Remote</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">95% Match</Badge>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Job Item */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Frontend Engineer</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">TechGrowth Inc. • Hybrid</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">88% Match</Badge>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Job Item */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">UI Developer</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">CreativeTech • On-site</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">82% Match</Badge>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100">
                View All Recommendations
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Interviews Tab */}
        <TabsContent value="interviews" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Your scheduled interviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Interview Item */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Technical Interview</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">TechCorp Inc. • Tomorrow, 10:00 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Prepare
                    </Button>
                  </div>
                </div>

                {/* Interview Item */}
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">AI-Powered Assessment</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">InnovateSoft • Friday, 2:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Prepare
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100">
                View All Interviews
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">12</div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <ChevronRight className="h-3 w-3 rotate-90" /> +3 this month
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-violet-900 dark:text-violet-100">Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-700 dark:text-violet-300">4</div>
            <p className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1">
              <ChevronRight className="h-3 w-3 rotate-90" /> +2 this month
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-rose-900 dark:text-rose-100">Profile Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-700 dark:text-rose-300">28</div>
            <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <ChevronRight className="h-3 w-3 rotate-90" /> +15 this month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
