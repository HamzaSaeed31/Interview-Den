"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, FileText, Plus, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { useState } from "react"

interface ResumeFile {
  id: string
  name: string
  url: string
  atsScore: number
}

export default function ResumePage() {
  const [uploadedResumes, setUploadedResumes] = useState<ResumeFile[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // Handle multiple files
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newResume: ResumeFile = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          url: e.target?.result as string,
          atsScore: Math.floor(Math.random() * 30) + 70 // Random score between 70-100 for demo
        }
        setUploadedResumes(prev => [...prev, newResume])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDeleteResume = (id: string) => {
    setUploadedResumes(prev => prev.filter(resume => resume.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          My Resume
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Create and manage your resumes. Upload multiple versions or build one using our form.
        </p>
      </div>

      <Tabs defaultValue="upload">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="form">Create Resume</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Resumes</CardTitle>
              <CardDescription>Upload multiple versions of your resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                <FileText className="h-12 w-12 text-slate-400 mb-4" />
                <p className="text-sm text-slate-500 mb-4">
                  {uploadedResumes.length === 0 
                    ? "No resumes uploaded yet" 
                    : `${uploadedResumes.length} resume${uploadedResumes.length > 1 ? 's' : ''} uploaded`}
                </p>
                <div className="flex gap-4">
                  <div>
                    <input
                      id="resume-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      multiple
                      onChange={handleFileUpload}
                    />
                    <Button onClick={() => document.getElementById('resume-upload')?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Resume
                    </Button>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </div>

              {uploadedResumes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Uploaded Resumes</h3>
                  <div className="grid gap-4">
                    {uploadedResumes.map(resume => (
                      <Card key={resume.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <FileText className="h-8 w-8 text-slate-400" />
                            <div>
                              <p className="font-medium">{resume.name}</p>
                              <p className="text-sm text-slate-500">ATS Score: {resume.atsScore}%</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteResume(resume.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Create Resume</CardTitle>
              <CardDescription>Fill in your details to create a professional resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="john.doe@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="San Francisco, CA" />
                </div>
                <div className="space-y-2">
                  <Label>Professional Summary</Label>
                  <Textarea
                    placeholder="Write a brief summary of your professional background..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Work Experience</Label>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Job Title</Label>
                          <Input placeholder="Senior Software Engineer" />
                        </div>
                        <div className="space-y-2">
                          <Label>Company</Label>
                          <Input placeholder="TechCorp" />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input type="date" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Describe your responsibilities and achievements..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Another Experience
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Education</Label>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Degree</Label>
                          <Input placeholder="Bachelor of Science in Computer Science" />
                        </div>
                        <div className="space-y-2">
                          <Label>Institution</Label>
                          <Input placeholder="University of Technology" />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input type="date" />
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Another Education
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <Input placeholder="JavaScript, React, Node.js, etc." />
                </div>
              </div>
              <Button className="w-full">Generate Resume</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 