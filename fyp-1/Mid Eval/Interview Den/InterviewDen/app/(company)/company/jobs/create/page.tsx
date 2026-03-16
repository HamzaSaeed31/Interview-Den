"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, DollarSign, MapPin } from "lucide-react"

const steps = [
  { id: "job-details", name: "Job Details" },
  { id: "job-description", name: "Job Description" },
  { id: "resume-requirements", name: "Resume Requirements" },
  { id: "test-requirements", name: "Test Requirements" },
  { id: "interview-settings", name: "Interview Settings" },
]

export default function CreateJobPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Submit the form
      router.push("/company/jobs")
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Create New Job Posting
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Fill in the details below to create a new job posting. Our AI will help optimize it for better visibility.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep
                    ? "bg-violet-600 text-white"
                    : index === currentStep
                      ? "bg-violet-100 text-violet-700 border-2 border-violet-600"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {index < currentStep ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-xs mt-2 ${index === currentStep ? "text-violet-700 font-medium" : "text-slate-500"}`}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-1 bg-slate-200"></div>
          </div>
          <div
            className="absolute inset-0 flex items-center"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          >
            <div className="w-full h-1 bg-violet-600"></div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-slate-200 shadow-sm">
        {currentStep === 0 && (
          <>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>Basic information about the position</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" placeholder="e.g. Senior Frontend Developer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g. New York, NY or Remote" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Employment Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the required skills, experience, and qualifications..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits & Perks</Label>
                <Textarea
                  id="benefits"
                  placeholder="Describe the benefits and perks of working at your company..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Salary Range</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input placeholder="Minimum salary" type="number" />
                  <Input placeholder="Maximum salary" type="number" />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Additional Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remote" />
                    <Label htmlFor="remote">Remote work allowed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="relocation" />
                    <Label htmlFor="relocation">Relocation assistance available</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sponsorship" />
                    <Label htmlFor="sponsorship">Visa sponsorship available</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                Provide detailed information about the job responsibilities and requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="overview">Job Overview</Label>
                <Textarea
                  id="overview"
                  placeholder="Provide a brief overview of the role and your company..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  placeholder="List the key responsibilities for this role..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the skills, qualifications, and experience required..."
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits & Perks</Label>
                <Textarea
                  id="benefits"
                  placeholder="Describe the benefits and perks offered with this position..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle>Resume Requirements</CardTitle>
              <CardDescription>Specify what you're looking for in candidate resumes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Required Documents</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="resume" defaultChecked />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="resume" className="cursor-pointer">
                        Resume/CV
                      </Label>
                      <p className="text-sm text-slate-500">Standard resume with work history</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="cover-letter" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="cover-letter" className="cursor-pointer">
                        Cover Letter
                      </Label>
                      <p className="text-sm text-slate-500">Personalized letter explaining interest</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="portfolio" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="portfolio" className="cursor-pointer">
                        Portfolio
                      </Label>
                      <p className="text-sm text-slate-500">Link to work samples or portfolio</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="references" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="references" className="cursor-pointer">
                        References
                      </Label>
                      <p className="text-sm text-slate-500">Professional references</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="skill-1">Skill 1</Label>
                      <Input id="skill-1" placeholder="e.g. React.js" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skill-1-years">Years of Experience</Label>
                      <Select>
                        <SelectTrigger id="skill-1-years">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="1">1+ years</SelectItem>
                          <SelectItem value="2">2+ years</SelectItem>
                          <SelectItem value="3">3+ years</SelectItem>
                          <SelectItem value="5">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="skill-2">Skill 2</Label>
                      <Input id="skill-2" placeholder="e.g. TypeScript" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skill-2-years">Years of Experience</Label>
                      <Select>
                        <SelectTrigger id="skill-2-years">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="1">1+ years</SelectItem>
                          <SelectItem value="2">2+ years</SelectItem>
                          <SelectItem value="3">3+ years</SelectItem>
                          <SelectItem value="5">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    + Add Another Skill
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Minimum Education</Label>
                <Select>
                  <SelectTrigger id="education">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific requirement</SelectItem>
                    <SelectItem value="high-school">High School Diploma</SelectItem>
                    <SelectItem value="associate">Associate's Degree</SelectItem>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD or Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-screening">AI Resume Screening</Label>
                <div className="flex items-start space-x-2">
                  <Checkbox id="ai-screening" defaultChecked />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="ai-screening" className="cursor-pointer">
                      Enable AI Resume Screening
                    </Label>
                    <p className="text-sm text-slate-500">
                      Our AI will analyze resumes and rank candidates based on your requirements
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle>Test Requirements</CardTitle>
              <CardDescription>Set up skills assessments and tests for candidates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Assessment Types</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="technical-test" defaultChecked />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="technical-test" className="cursor-pointer">
                        Technical Skills Test
                      </Label>
                      <p className="text-sm text-slate-500">Coding challenges and technical questions</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="personality-test" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="personality-test" className="cursor-pointer">
                        Personality Assessment
                      </Label>
                      <p className="text-sm text-slate-500">Evaluate cultural fit and work style</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="cognitive-test" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="cognitive-test" className="cursor-pointer">
                        Cognitive Ability Test
                      </Label>
                      <p className="text-sm text-slate-500">Problem-solving and critical thinking</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox id="language-test" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="language-test" className="cursor-pointer">
                        Language Proficiency
                      </Label>
                      <p className="text-sm text-slate-500">Assess language skills</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Technical Skills Test Configuration</Label>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-difficulty">Difficulty Level</Label>
                    <Select>
                      <SelectTrigger id="test-difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-duration">Test Duration</Label>
                    <Select>
                      <SelectTrigger id="test-duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Test Topics</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-algorithms" />
                        <Label htmlFor="topic-algorithms" className="cursor-pointer">
                          Algorithms
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-data-structures" />
                        <Label htmlFor="topic-data-structures" className="cursor-pointer">
                          Data Structures
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-frontend" defaultChecked />
                        <Label htmlFor="topic-frontend" className="cursor-pointer">
                          Frontend Development
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-backend" />
                        <Label htmlFor="topic-backend" className="cursor-pointer">
                          Backend Development
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-database" />
                        <Label htmlFor="topic-database" className="cursor-pointer">
                          Database
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="topic-system-design" />
                        <Label htmlFor="topic-system-design" className="cursor-pointer">
                          System Design
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-questions">Custom Questions</Label>
                    <Textarea
                      id="custom-questions"
                      placeholder="Add any specific questions you'd like to include in the test..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-test-generation">AI Test Generation</Label>
                <div className="flex items-start space-x-2">
                  <Checkbox id="ai-test-generation" defaultChecked />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="ai-test-generation" className="cursor-pointer">
                      Enable AI Test Generation
                    </Label>
                    <p className="text-sm text-slate-500">
                      Our AI will generate relevant test questions based on the job requirements
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {currentStep === 4 && (
          <>
            <CardHeader>
              <CardTitle>Interview Settings</CardTitle>
              <CardDescription>Configure the interview process for this job position.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Interview Stages</Label>
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="ai-screening-interview" defaultChecked />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="ai-screening-interview" className="cursor-pointer">
                        AI Screening Interview
                      </Label>
                      <p className="text-sm text-slate-500">
                        Initial automated interview to assess basic qualifications
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="technical-interview" defaultChecked />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="technical-interview" className="cursor-pointer">
                        Technical Interview
                      </Label>
                      <p className="text-sm text-slate-500">In-depth assessment of technical skills</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="behavioral-interview" defaultChecked />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="behavioral-interview" className="cursor-pointer">
                        Behavioral Interview
                      </Label>
                      <p className="text-sm text-slate-500">Assess soft skills and cultural fit</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox id="final-interview" />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="final-interview" className="cursor-pointer">
                        Final Interview with Leadership
                      </Label>
                      <p className="text-sm text-slate-500">Final round with senior team members</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>AI Screening Interview Configuration</Label>
                <div className="border rounded-md p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="interview-format">Interview Format</Label>
                    <RadioGroup defaultValue="video" className="flex flex-col gap-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="video" id="video" />
                        <Label htmlFor="video" className="cursor-pointer">
                          Video Interview
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="audio" id="audio" />
                        <Label htmlFor="audio" className="cursor-pointer">
                          Audio Interview
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="text" id="text" />
                        <Label htmlFor="text" className="cursor-pointer">
                          Text-based Interview
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interview-duration">Interview Duration</Label>
                    <Select>
                      <SelectTrigger id="interview-duration">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interview-questions">Custom Interview Questions</Label>
                    <Textarea
                      id="interview-questions"
                      placeholder="Add any specific questions you'd like to include in the AI interview..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interview-scheduling">Interview Scheduling</Label>
                <div className="flex items-start space-x-2">
                  <Checkbox id="interview-scheduling" defaultChecked />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="interview-scheduling" className="cursor-pointer">
                      Enable Automated Scheduling
                    </Label>
                    <p className="text-sm text-slate-500">
                      Allow candidates to book interview slots based on your team's availability
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interview-feedback">Interview Feedback</Label>
                <div className="flex items-start space-x-2">
                  <Checkbox id="interview-feedback" defaultChecked />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="interview-feedback" className="cursor-pointer">
                      Enable AI Interview Analysis
                    </Label>
                    <p className="text-sm text-slate-500">
                      Our AI will analyze interview responses and provide objective feedback
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={nextStep} className="bg-violet-600 hover:bg-violet-700">
            {currentStep === steps.length - 1 ? "Create Job" : "Next"}
            {currentStep !== steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
