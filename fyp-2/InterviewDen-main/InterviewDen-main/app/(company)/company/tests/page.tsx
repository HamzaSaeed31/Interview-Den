"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, FileText, Clock, CheckCircle, XCircle, Settings, Briefcase } from "lucide-react";
import Link from "next/link";

// Mock data for tests
const mockTests = [
  {
    id: "1",
    title: "Frontend Developer Quiz",
    type: "Quiz",
    duration: 30,
    questions: 20,
    status: "Active",
    jobTitle: "Frontend Developer",
    lastUpdated: "2024-04-05"
  },
  {
    id: "2",
    title: "Software Engineer Technical",
    type: "Technical",
    duration: 60,
    questions: 5,
    status: "Draft",
    jobTitle: "Software Engineer",
    lastUpdated: "2024-04-04"
  },
  // Add more mock tests...
];

export default function TestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newTest, setNewTest] = useState({
    title: "",
    type: "Quiz",
    duration: 30,
    questions: 10,
    description: "",
    jobTitle: ""
  });

  const filteredTests = mockTests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Tests</h1>
        <p className="text-muted-foreground">Create and manage assessment tests</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Test
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Test</DialogTitle>
                <DialogDescription>
                  Set up a new assessment test for your job postings.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Test Title</Label>
                  <Input
                    id="title"
                    value={newTest.title}
                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Test Type</Label>
                  <Select
                    value={newTest.type}
                    onValueChange={(value) => setNewTest({ ...newTest, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quiz">Quiz Assessment</SelectItem>
                      <SelectItem value="Technical">Technical Assessment</SelectItem>
                      <SelectItem value="Video">Video Interview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="jobTitle">Associated Job</Label>
                  <Select
                    value={newTest.jobTitle}
                    onValueChange={(value) => setNewTest({ ...newTest, jobTitle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                      <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                      <SelectItem value="UX Designer">UX Designer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newTest.duration}
                    onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="questions">Number of Questions</Label>
                  <Input
                    id="questions"
                    type="number"
                    value={newTest.questions}
                    onChange={(e) => setNewTest({ ...newTest, questions: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Test Description</Label>
                  <Textarea
                    id="description"
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Test</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTests.map((test) => (
                <Card key={test.id}>
                  <CardHeader>
                    <CardTitle>{test.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {test.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        {test.jobTitle}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {test.duration} minutes
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {test.questions} questions
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Badge variant={test.status === "Active" ? "default" : "secondary"}>
                      {test.status}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/company/tests/${test.id}`}>
                        <Settings className="mr-2 h-4 w-4" />
                        Manage
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 