"use client";
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, ChevronRight, FileText, GraduationCap, Briefcase, Clock, User, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { Avatar } from "@/components/ui/avatar"
import { createSupabaseBrowserClient } from "@/lib/supabase"

export default function CandidatePortal() {
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

  useEffect(() => {
    const fetchProfile = async () => {
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
        .select("name, email, avatar_url")
        .eq("id", userId)
        .single();

      // Fetch from candidates
      const { data: candidate } = await supabase
        .from("candidates")
        .select("experience, skills, resume_url")
        .eq("id", userId)
        .single();

      setProfileData({
        name: profile?.name || "",
        email: profile?.email || user.email || "",
        avatar_url: profile?.avatar_url || "",
        experience: candidate?.experience || "Not specified",
        skills: candidate?.skills || [],
        resume_url: candidate?.resume_url || "",
      });

      setLoading(false);
    };

    fetchProfile();
  }, []);

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "CD";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const firstName = profileData.name.split(" ")[0] || "Candidate";

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Profile Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm">
        <CardContent className="flex items-center gap-6 p-6">
          <Avatar 
            src={profileData.avatar_url || "/avatars/default.png"}
            alt={profileData.name || "User avatar"}
            size="lg"
            className="h-20 w-20"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900">
              {loading ? "Loading..." : profileData.name || "Candidate"}
            </h2>
            <p className="text-gray-600">{profileData.experience}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{profileData.email || "Not provided"}</span>
              </div>
              {profileData.skills.length > 0 && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>{profileData.skills.slice(0, 3).join(", ")}</span>
                </div>
              )}
            </div>
          </div>
          <Button variant="outline" className="bg-white hover:bg-gray-50" asChild>
            <Link href="/candidate/profile">
              Edit Profile
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {loading ? "..." : firstName}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your job applications.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Applications</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-xs text-gray-500">+2 this month</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Interviews</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">4</div>
            <p className="text-xs text-gray-500">+1 this week</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Tests</CardTitle>
            <Briefcase className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">3</div>
            <p className="text-xs text-gray-500">2 pending</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Profile Strength</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">85%</div>
            </div>
            <Progress value={85} className="mt-2 bg-purple-100" />
            <p className="mt-2 text-xs text-gray-500">Complete your profile</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" asChild>
            <Link href="/candidate/jobs">
              View all jobs
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Interview</CardTitle>
              <CardDescription>Google - Software Engineer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CalendarDays className="h-4 w-4" />
                <span>Thursday, April 11, 2024</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>10:00 AM - 11:30 AM</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Prepare for Interview
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Coding Assessment</CardTitle>
              <CardDescription>Microsoft - Frontend Developer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CalendarDays className="h-4 w-4" />
                <span>Friday, April 12, 2024</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Due by 11:59 PM</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Start Assessment
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Software Engineer</CardTitle>
              <CardDescription>Google - Applied on March 28, 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <span className="text-sm font-medium text-green-600">Interview Scheduled</span>
                </div>
                <Progress value={75} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Applied</span>
                  <span>Interview</span>
                  <span>Offer</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Application
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Frontend Developer</CardTitle>
              <CardDescription>Microsoft - Applied on April 2, 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <span className="text-sm font-medium text-blue-600">Assessment Pending</span>
                </div>
                <Progress value={50} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Applied</span>
                  <span>Assessment</span>
                  <span>Offer</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View Application
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="recommended" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Senior Frontend Developer</CardTitle>
              <CardDescription>Amazon - Seattle, WA</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Based on your profile and preferences, this job matches 92% of your skills.
              </p>
              <div className="mt-2 flex items-center">
                <span className="text-sm font-medium text-green-600">92% Match</span>
                <Progress value={92} className="ml-2 h-2 w-24" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Apply Now</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Full Stack Developer</CardTitle>
              <CardDescription>Netflix - Remote</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Based on your profile and preferences, this job matches 85% of your skills.
              </p>
              <div className="mt-2 flex items-center">
                <span className="text-sm font-medium text-green-600">85% Match</span>
                <Progress value={85} className="ml-2 h-2 w-24" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Apply Now</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Improve your chances of getting hired</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Resume</span>
                <span className="text-sm font-medium text-green-600">Completed</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Skills Assessment</span>
                <span className="text-sm font-medium text-yellow-600">In Progress</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Work Experience</span>
                <span className="text-sm font-medium text-green-600">Completed</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Education</span>
                <span className="text-sm font-medium text-red-600">Not Started</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Update Profile
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tests</CardTitle>
            <CardDescription>Prepare for your scheduled assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Coding Assessment</h4>
                <p className="text-sm text-muted-foreground">Microsoft - Frontend Developer</p>
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="mr-1 h-3 w-3" />
                  <span>Due April 12, 2024</span>
                </div>
              </div>
              <Button size="sm">Start</Button>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Technical Knowledge</h4>
                <p className="text-sm text-muted-foreground">Google - Software Engineer</p>
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="mr-1 h-3 w-3" />
                  <span>Due April 10, 2024</span>
                </div>
              </div>
              <Button size="sm">Start</Button>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Behavioral Assessment</h4>
                <p className="text-sm text-muted-foreground">Amazon - Senior Frontend Developer</p>
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="mr-1 h-3 w-3" />
                  <span>Due April 15, 2024</span>
                </div>
              </div>
              <Button size="sm">Start</Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/candidate/tests">View All Tests</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
