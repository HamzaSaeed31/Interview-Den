"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Clock, Building2, DollarSign, GraduationCap, Calendar, Users, FileText } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useScreening } from "@/app/context/screening-context";

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
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  department: string;
  teamSize: string;
  applicationDeadline: string;
}

// Mock job data - in a real app, this would come from an API
const mockJob: Job = {
  id: "1",
  title: "Frontend Developer",
  company: "TechCorp",
  location: "New York, NY",
  type: "Full-time",
  experience: "Mid-level",
  posted: "2 days ago",
  description: "Looking for a skilled frontend developer with experience in React and TypeScript. The ideal candidate will be responsible for building user interfaces and implementing features for our web applications.",
  salary: "$80,000 - $100,000",
  requirements: [
    "3+ years of experience in frontend development",
    "Strong proficiency in React and TypeScript",
    "Experience with modern frontend build tools",
    "Understanding of responsive design principles",
    "Familiarity with RESTful APIs"
  ],
  responsibilities: [
    "Develop new user-facing features",
    "Build reusable components and libraries",
    "Optimize applications for maximum speed and scalability",
    "Collaborate with backend developers and designers",
    "Ensure the technical feasibility of UI/UX designs"
  ],
  benefits: [
    "Competitive salary and benefits package",
    "Flexible work hours and remote work options",
    "Health insurance and wellness programs",
    "Professional development opportunities",
    "Team building activities and events"
  ],
  skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Git"],
  department: "Engineering",
  teamSize: "5-10 people",
  applicationDeadline: "2024-05-01"
};

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getProgress } = useScreening();
  const [job, setJob] = useState<Job | null>(null);
  const [screeningProgress, setScreeningProgress] = useState<any>(null);

  useEffect(() => {
    // In a real app, fetch job details using the id from params
    setJob(mockJob);
    const progress = getProgress(params.id as string);
    setScreeningProgress(progress);
  }, [params.id, getProgress]);

  const handleApply = () => {
    router.push(`/candidate/screening/resume?jobId=${params.id}`);
  };

  const handleResumeScreening = () => {
    if (screeningProgress) {
      router.push(`/candidate/screening/${screeningProgress.currentStep}?jobId=${params.id}`);
    }
  };

  if (!job) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Details</h1>
        <Button onClick={() => router.push("/candidate/jobs")}>
          Back to Jobs
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{job.title}</CardTitle>
          <CardDescription className="text-lg">{job.company}</CardDescription>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary">
              <MapPin className="w-4 h-4 mr-1" />
              {job.location}
            </Badge>
            <Badge variant="secondary">
              <Briefcase className="w-4 h-4 mr-1" />
              {job.type}
            </Badge>
            <Badge variant="secondary">
              <GraduationCap className="w-4 h-4 mr-1" />
              {job.experience}
            </Badge>
            <Badge variant="secondary">
              <DollarSign className="w-4 h-4 mr-1" />
              {job.salary}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Building2 className="w-4 h-4 mr-2" />
                Department: {job.department}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2" />
                Team Size: {job.teamSize}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                Posted: {job.posted}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                Application Deadline: {job.applicationDeadline}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Job Description</h2>
            <p className="text-muted-foreground">{job.description}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Requirements</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {job.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Responsibilities</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {job.responsibilities.map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Benefits</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {job.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            {screeningProgress ? (
              <Button onClick={handleResumeScreening}>
                <FileText className="w-4 h-4 mr-2" />
                Resume Screening
              </Button>
            ) : (
              <Button onClick={handleApply}>
                Apply Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 