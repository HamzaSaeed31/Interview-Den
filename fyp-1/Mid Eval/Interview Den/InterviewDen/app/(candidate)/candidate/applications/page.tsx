"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, MapPin, Clock, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

const mockApplications = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    appliedDate: "2024-04-08",
    status: "in-progress",
    progress: 50,
    currentStep: "Technical Assessment",
    nextStep: "Soft Skills Interview",
    steps: [
      { name: "Resume Screening", status: "completed", date: "2024-04-09" },
      { name: "AI Quiz", status: "completed", date: "2024-04-10" },
      { name: "Technical Assessment", status: "in-progress", date: "2024-04-12" },
      { name: "Soft Skills Interview", status: "pending", date: "2024-04-15" },
    ],
  },
  {
    id: 2,
    title: "Frontend Developer",
    company: "WebSolutions Ltd",
    location: "Remote",
    appliedDate: "2024-04-05",
    status: "completed",
    progress: 100,
    currentStep: "Completed",
    steps: [
      { name: "Resume Screening", status: "completed", date: "2024-04-06" },
      { name: "AI Quiz", status: "completed", date: "2024-04-07" },
      { name: "Technical Assessment", status: "completed", date: "2024-04-09" },
      { name: "Soft Skills Interview", status: "completed", date: "2024-04-11" },
    ],
  },
];

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applied Jobs</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications
        </p>
      </div>

      <div className="grid gap-4">
        {mockApplications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{application.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {application.company}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    application.status === "completed"
                      ? "default"
                      : application.status === "in-progress"
                      ? "default"
                      : "secondary"
                  }
                  className={
                    application.status === "completed"
                      ? "bg-green-500"
                      : application.status === "in-progress"
                      ? "bg-yellow-500"
                      : ""
                  }
                >
                  {application.status === "completed" ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : application.status === "in-progress" ? (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {application.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Applied on {application.appliedDate}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{application.progress}%</span>
                  </div>
                  <Progress value={application.progress} className="h-2" />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Current Step: {application.currentStep}</p>
                  {application.nextStep && (
                    <p className="text-sm text-muted-foreground">
                      Next Step: {application.nextStep}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {application.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {step.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : step.status === "in-progress" ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span>{step.name}</span>
                      </div>
                      <span className="text-muted-foreground">{step.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 