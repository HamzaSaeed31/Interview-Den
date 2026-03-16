"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Briefcase, Clock, Building2, CheckCircle2, AlertCircle, PlayCircle, DollarSign, GraduationCap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useScreening, ScreeningProgress } from "@/app/context/screening-context";
import { Progress } from "@/components/ui/progress";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  posted: string;
  description: string;
  salary: string;
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

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "TechCorp",
    location: "New York, NY",
    type: "Full-time",
    experience: "Mid-level",
    posted: "2 days ago",
    description: "Looking for a skilled frontend developer with experience in React and TypeScript.",
    salary: "$80,000 - $100,000"
  },
  {
    id: "2",
    title: "Backend Engineer",
    company: "DataSystems",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "Senior",
    posted: "1 week ago",
    description: "Seeking a backend engineer with expertise in Node.js and database design.",
    salary: "$90,000 - $120,000"
  },
  {
    id: "3",
    title: "Full Stack Developer",
    company: "WebSolutions",
    location: "Remote",
    type: "Contract",
    experience: "Mid-level",
    posted: "3 days ago",
    description: "Full stack developer needed for a 6-month contract position.",
    salary: "$70 - $90 per hour"
  },
  {
    id: "4",
    title: "UI/UX Designer",
    company: "DesignHub",
    location: "Chicago, IL",
    type: "Full-time",
    experience: "Junior",
    posted: "5 days ago",
    description: "Creative UI/UX designer with experience in Figma and Adobe XD.",
    salary: "$60,000 - $80,000"
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "CloudTech",
    location: "Austin, TX",
    type: "Full-time",
    experience: "Senior",
    posted: "1 day ago",
    description: "DevOps engineer with experience in AWS and Kubernetes.",
    salary: "$100,000 - $130,000"
  }
];

const getScreeningStatus = (progress: ScreeningProgress) => {
  const completedSteps = Object.values(progress.progress).filter(
    (step) => step.completed
  ).length;
  return {
    completedSteps,
    percentage: (completedSteps / 4) * 100,
  };
};

export default function JobsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getProgress, updateProgress } = useScreening();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState<string>("all");
  const [selectedExperience, setSelectedExperience] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  const handleApply = (jobId: string) => {
    try {
      // Initialize screening progress for the job
      updateProgress(jobId, 'resume', {
        answers: [],
        timeLeft: 30 * 60, // 30 minutes
        completed: false,
      });
      // Navigate to the screening page
      router.push(`/candidate/screening/resume?jobId=${jobId}`);
    } catch (error) {
      console.error('Error initializing screening:', error);
      setError('Failed to initialize screening. Please try again.');
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

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch = searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedJobType === "all" || job.type.toLowerCase() === selectedJobType.toLowerCase();
    const matchesExperience = selectedExperience === "all" || job.experience.toLowerCase() === selectedExperience.toLowerCase();
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
        {filteredJobs.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No jobs found matching your criteria</p>
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
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span className="text-sm">{job.experience}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">{job.salary}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {job.description}
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                {job.screeningProgress ? (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{getScreeningStatus(job.screeningProgress).percentage}%</span>
                    </div>
                    <Progress value={getScreeningStatus(job.screeningProgress).percentage} />
                    <Button className="w-full" onClick={() => handleResumeScreening(job.id)}>
                      Resume Screening
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" onClick={() => handleApply(job.id)}>
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