"use client"

import { useState } from "react"
import {
  BarChart3,
  Bell,
  Briefcase,
  ChevronRight,
  FileText,
  Filter,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Users,
  Zap,
  Lightbulb,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InterviewDenLogo } from "./logo"

export default function CompanyPortal() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 bg-violet-600 dark:bg-violet-900">
        <div className="flex h-16 items-center px-4 border-b border-violet-500 dark:border-violet-800">
          <div className="flex items-center gap-2 text-white">
            <InterviewDenLogo />
            <h1 className="text-xl font-bold">InterviewDen</h1>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-2 text-sm font-medium">
            <Button
              variant="ghost"
              className="flex justify-start gap-2 px-3 py-2 h-auto text-violet-100 hover:text-white hover:bg-violet-700"
              asChild
            >
              <a href="#" className="text-white">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </a>
            </Button>
            <Button
              variant="ghost"
              className="flex justify-start gap-2 px-3 py-2 h-auto text-violet-100 hover:text-white hover:bg-violet-700"
              asChild
            >
              <a href="#">
                <Briefcase className="h-4 w-4" />
                Job Postings
              </a>
            </Button>
            <Button
              variant="ghost"
              className="flex justify-start gap-2 px-3 py-2 h-auto text-violet-100 hover:text-white hover:bg-violet-700"
              asChild
            >
              <a href="#">
                <Users className="h-4 w-4" />
                Candidates
              </a>
            </Button>
            <Button
              variant="ghost"
              className="flex justify-start gap-2 px-3 py-2 h-auto text-violet-100 hover:text-white hover:bg-violet-700"
              asChild
            >
              <a href="#">
                <FileText className="h-4 w-4" />
                Interviews
              </a>
            </Button>
            <Button
              variant="ghost"
              className="flex justify-start gap-2 px-3 py-2 h-auto text-violet-100 hover:text-white hover:bg-violet-700"
              asChild
            >
              <a href="#">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </a>
            </Button>
            <Button
              variant="ghost"
              className="flex justify-start gap-2 px-3 py-2 h-auto text-violet-100 hover:text-white hover:bg-violet-700"
              asChild
            >
              <a href="#">
                <MessageSquare className="h-4 w-4" />
                Messages
              </a>
            </Button>
            <Button
              variant="ghost"
              className="flex justify-start gap-2 px-3 py-2 h-auto text-violet-100 hover:text-white hover:bg-violet-700"
              asChild
            >
              <a href="#">
                <Settings className="h-4 w-4" />
                Settings
              </a>
            </Button>
          </nav>
        </div>
        <div className="p-4 mt-auto">
          <div className="bg-violet-700 rounded-lg p-4 text-white">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4" /> AI Recruiter
            </h3>
            <p className="text-xs text-violet-200 mb-3">Get AI-powered insights and candidate recommendations</p>
            <Button size="sm" className="w-full bg-white text-violet-700 hover:bg-violet-100">
              Ask AI
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white dark:bg-slate-800 px-4 sm:px-6 shadow-sm">
          <div className="flex-1 flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search candidates, jobs..."
              className="w-full md:w-[300px] h-9 border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="relative border-slate-200">
            <Bell className="h-4 w-4 text-slate-600" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-rose-500"></span>
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback className="bg-violet-100 text-violet-700">TC</AvatarFallback>
          </Avatar>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col gap-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome back, TechCorp!
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Here's what's happening with your recruitment today.
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-100">
                  View Analytics
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                    Active Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">8</div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 rotate-90" /> +2 this month
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-violet-900 dark:text-violet-100">
                    Total Applicants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-violet-700 dark:text-violet-300">124</div>
                  <p className="text-xs text-violet-600 dark:text-violet-400 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 rotate-90" /> +45 this month
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-rose-900 dark:text-rose-100">
                    Interviews Scheduled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-rose-700 dark:text-rose-300">18</div>
                  <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 rotate-90" /> +7 this month
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    Positions Filled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">3</div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 rotate-90" /> +1 this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Tabs */}
            <Tabs defaultValue="candidates" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 h-auto">
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
                <TabsTrigger
                  value="interviews"
                  className="py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-400"
                >
                  Upcoming Interviews
                </TabsTrigger>
              </TabsList>

              {/* Candidates Tab */}
              <TabsContent value="candidates" className="space-y-4 pt-4">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Top Candidates</CardTitle>
                      <CardDescription>AI-ranked candidates based on your job requirements</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Candidate Item */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-emerald-200">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Candidate" />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">JS</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">John Smith</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Senior Frontend Developer • 5 years exp.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border-0">
                            95% Match
                          </Badge>
                          <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                            View Profile
                          </Button>
                        </div>
                      </div>

                      {/* Candidate Item */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-emerald-200">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Candidate" />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">AJ</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">Alice Johnson</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Full Stack Developer • 3 years exp.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border-0">
                            88% Match
                          </Badge>
                          <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                            View Profile
                          </Button>
                        </div>
                      </div>

                      {/* Candidate Item */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-emerald-200">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Candidate" />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700">RP</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">Robert Parker</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Backend Developer • 4 years exp.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border-0">
                            82% Match
                          </Badge>
                          <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      View All Candidates
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Jobs Tab */}
              <TabsContent value="jobs" className="space-y-4 pt-4">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>Active Job Postings</CardTitle>
                    <CardDescription>Your current open positions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Job Item */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">Senior Frontend Developer</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Remote • Posted 5 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">42 applicants</div>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Job Item */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">Full Stack Developer</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hybrid • Posted 2 weeks ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">28 applicants</div>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Job Item */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-md bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">UX/UI Designer</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">On-site • Posted 3 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">15 applicants</div>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      Manage All Jobs
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Interviews Tab */}
              <TabsContent value="interviews" className="space-y-4 pt-4">
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle>Upcoming Interviews</CardTitle>
                    <CardDescription>Scheduled interviews for the next 7 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Interview Item */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-rose-200">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Candidate" />
                            <AvatarFallback className="bg-rose-100 text-rose-700">JS</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">John Smith</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Technical Interview • Tomorrow, 10:00 AM
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select defaultValue="technical">
                            <SelectTrigger className="w-[140px] border-slate-200">
                              <SelectValue placeholder="Interview Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="behavioral">Behavioral</SelectItem>
                              <SelectItem value="ai">AI Assessment</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                            View
                          </Button>
                        </div>
                      </div>

                      {/* Interview Item */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-rose-200">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Candidate" />
                            <AvatarFallback className="bg-rose-100 text-rose-700">AJ</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">Alice Johnson</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              AI Assessment • Friday, 2:00 PM
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select defaultValue="ai">
                            <SelectTrigger className="w-[140px] border-slate-200">
                              <SelectValue placeholder="Interview Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="behavioral">Behavioral</SelectItem>
                              <SelectItem value="ai">AI Assessment</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                            View
                          </Button>
                        </div>
                      </div>

                      {/* Interview Item */}
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-rose-200">
                            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Candidate" />
                            <AvatarFallback className="bg-rose-100 text-rose-700">RP</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">Robert Parker</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Behavioral Interview • Monday, 11:30 AM
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select defaultValue="behavioral">
                            <SelectTrigger className="w-[140px] border-slate-200">
                              <SelectValue placeholder="Interview Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="behavioral">Behavioral</SelectItem>
                              <SelectItem value="ai">AI Assessment</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-200 text-slate-700 hover:bg-slate-100"
                    >
                      View All Interviews
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>

            {/* AI Insights Card */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2"></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" /> AI Recruitment Insights
                </CardTitle>
                <CardDescription>AI-powered analytics to optimize your hiring process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900">
                    <h3 className="font-medium mb-2 text-blue-900 dark:text-blue-300 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Candidate Quality Insights
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                      Your Senior Frontend Developer position is attracting high-quality candidates. 85% of applicants
                      match your required skills, compared to the industry average of 65%.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                    >
                      View Details
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900">
                    <h3 className="font-medium mb-2 text-amber-900 dark:text-amber-300 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Hiring Process Optimization
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                      Your average time-to-hire is 18 days, which is 30% faster than industry average. Consider adding
                      an AI technical assessment to further reduce screening time.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                    >
                      Implement Suggestion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
