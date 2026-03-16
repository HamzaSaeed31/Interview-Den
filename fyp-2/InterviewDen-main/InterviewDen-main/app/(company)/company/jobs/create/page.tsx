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
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

const steps = [
  { id: "job-details", name: "Job Details" },
  { id: "resume-requirements", name: "Resume Requirements" },
  { id: "test-requirements", name: "Test Requirements" },
  { id: "interview-settings", name: "Interview Settings" },
]

interface JobFormData {
  // Step 1 fields
  title: string
  department: string
  description: string
  location: string
  type: string
  requirements: string[]
  benefits: string[]
  salary_min: number | null
  salary_max: number | null
  currency: string
  is_remote: boolean
  has_relocation: boolean

  // Step 2 fields
  overview: string
  responsibilities: string[]
  detailed_requirements: string[]
  detailed_benefits: string[]

  // Step 3 fields
  required_documents: {
    resume: boolean
    cover_letter: boolean
    portfolio: boolean
    references: boolean
  }
  required_skills: Array<{
    name: string
    years: string
  }>
  min_education: string
  ai_screening_enabled: boolean

  // Step 4 fields
  test_requirements: {
    technical_test: boolean
    personality_test: boolean
    cognitive_test: boolean
    language_test: boolean
  }
  technical_test_config: {
    difficulty: string
    duration: string
    topics: string[]
    custom_questions: string
    weightage: number
    passing_score: number
    num_questions: number
  }
  ai_test_generation: boolean

  // Step 5 fields
  interview_stages: {
    ai_screening: boolean
    technical: boolean
    behavioral: boolean
    final: boolean
  }
  ai_interview_config: {
    format: 'video' | 'audio' | 'text'
    duration: string
    custom_questions: string
  }
  automated_scheduling: boolean
  ai_feedback: boolean

  // Common fields
  status: 'draft' | 'published'
  step: number

  // Stage weightages (adjusted - no separate coding test)
  stage_weightages: {
    resume_screening: number
    quiz: number
    interview: number
  }

  // Interview specific fields
  interview_config: {
    format: 'video' | 'audio' | 'text'
    duration: string
    custom_questions: string
    weightage: number
    passing_score: number
  }
}

const isFirstStep = (step: number): step is 0 => step === 0

export default function CreateJobPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftJobId, setDraftJobId] = useState<string | null>(null)
  const [formData, setFormData] = useState<JobFormData>({
    // Step 1 fields
    title: '',
    department: '',
    description: '',
    location: '',
    type: '',
    requirements: [],
    benefits: [],
    salary_min: null,
    salary_max: null,
    currency: 'PKR',
    is_remote: false,
    has_relocation: false,

    // Step 2 fields
    overview: '',
    responsibilities: [],
    detailed_requirements: [],
    detailed_benefits: [],

    // Step 3 fields
    required_documents: {
      resume: true,
      cover_letter: false,
      portfolio: false,
      references: false
    },
    required_skills: [],
    min_education: 'none',
    ai_screening_enabled: true,

    // Step 4 fields
    test_requirements: {
      technical_test: true,
      personality_test: false,
      cognitive_test: false,
      language_test: false
    },
    technical_test_config: {
      difficulty: 'medium',
      duration: '60',
      topics: [],
      custom_questions: '',
      weightage: 30,
      passing_score: 70,
      num_questions: 15
    },
    ai_test_generation: true,

    // Step 5 fields
    interview_stages: {
      ai_screening: true,
      technical: true,
      behavioral: true,
      final: false
    },
    ai_interview_config: {
      format: 'video',
      duration: '30',
      custom_questions: ''
    },
    automated_scheduling: true,
    ai_feedback: true,

    // Common fields
    status: 'draft',
    step: 1,

    // Initialize stage weightages (no coding test - only quiz)
    stage_weightages: {
      resume_screening: 30,
      quiz: 40,
      interview: 30
    },

    // Initialize interview config
    interview_config: {
      format: 'video',
      duration: '45',
      custom_questions: '',
      weightage: 30,
      passing_score: 70
    }
  })

  const supabase = createClient()

  const handleInputChange = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Calculate total weightages
  const getTotalWeightage = () => {
    const { resume_screening, quiz, interview } = formData.stage_weightages
    return resume_screening + quiz + interview
  }

  const isWeightageValid = () => {
    const total = getTotalWeightage()
    return total === 100
  }

  const saveDraft = async () => {
    try {
      setIsSubmitting(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to create a job')
        return
      }

      // Check if company record exists
      const { data: company, error: companyCheckError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', user.id)
        .single()

      if (companyCheckError || !company) {
        console.error('Company record check error:', {
          error: companyCheckError,
          code: companyCheckError?.code,
          message: companyCheckError?.message,
          details: companyCheckError?.details,
          userId: user.id,
          companyExists: !!company
        })

        // If no company record exists (PGRST116 = no rows), create one automatically
        if (companyCheckError?.code === 'PGRST116') {
          console.log('No company record found. Creating one automatically...')
          const { error: createError } = await supabase
            .from('companies')
            .insert({
              id: user.id,
              company_name: 'My Company', // Default name, user can update in profile
              location: null,
              industry: null,
              size: null,
              website: null,
              description: null
            })

          if (createError) {
            console.error('Failed to create company record:', {
              error: createError,
              message: createError.message,
              details: createError.details,
              code: createError.code
            })
            toast.error(`Failed to create company profile: ${createError.message}`)
            return
          }

          toast.success('Company profile created! Continuing with job creation...')
          // Continue with job creation - no return
        } else {
          toast.error('Error checking company profile. Please try again.')
          return
        }
      }

      // Map form data to database schema
      const jobData = {
        company_id: user.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        requirements: formData.requirements,
        benefits: formData.benefits,
        salary_min: formData.salary_min,
        salary_max: formData.salary_max,
        currency: formData.currency,
        status: 'draft',
        step: currentStep + 1,
        // Store all additional config in custom_fields JSONB column
        custom_fields: {
          department: formData.department,
          is_remote: formData.is_remote,
          has_relocation: formData.has_relocation,
          overview: formData.overview,
          responsibilities: formData.responsibilities,
          detailed_requirements: formData.detailed_requirements,
          detailed_benefits: formData.detailed_benefits,
          required_documents: formData.required_documents,
          required_skills: formData.required_skills,
          min_education: formData.min_education,
          ai_screening_enabled: formData.ai_screening_enabled,
          test_requirements: formData.test_requirements,
          quiz_config: formData.technical_test_config, // Quiz configuration
          ai_test_generation: formData.ai_test_generation,
          automated_scheduling: formData.automated_scheduling,
          ai_feedback: formData.ai_feedback,
          stage_weightages: formData.stage_weightages,
          interview_config: formData.interview_config
        },
        // Store interview stages and config
        stages: {
          interview_stages: formData.interview_stages,
          ai_interview_config: formData.ai_interview_config
        }
      }

      // If we have an existing draft, update it; otherwise create a new one
      if (draftJobId) {
        const { error } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', draftJobId)

        if (error) {
          console.error('Supabase update error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          throw new Error(error.message || 'Failed to update draft')
        }

        toast.success('Draft updated successfully')
      } else {
        const { data: insertedJob, error } = await supabase
          .from('jobs')
          .insert(jobData)
          .select()
          .single()

        if (error) {
          console.error('Supabase insert error:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          throw new Error(error.message || 'Failed to save draft')
        }

        // Store the draft ID so subsequent saves update the same record
        if (insertedJob) {
          setDraftJobId(insertedJob.id)
        }

        toast.success('Draft saved successfully')
      }
    } catch (error: any) {
      console.error('Error saving draft:', {
        message: error.message,
        stack: error.stack,
        error: error
      })
      toast.error(error.message || 'Failed to save draft')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = async () => {
    if (currentStep < 3) {
      // Just move to next step without saving draft
      setCurrentStep((currentStep + 1) as 0 | 1 | 2 | 3)
    } else {
      // Submit the final form
      await submitJob()
    }
  }

  const generateQuizForJob = async (jobId: string, jobData: any) => {
    try {
      // Map difficulty to experience level
      const difficultyToLevel: { [key: string]: string } = {
        'easy': 'Entry Level',
        'medium': 'Mid Level',
        'hard': 'Senior',
        'expert': 'Lead/Architect'
      }

      // Extract technical and soft skills from requirements
      const allRequirements = [
        ...jobData.requirements,
        ...(jobData.detailed_requirements || [])
      ]

      // Prepare job JSON for API
      const apiJobData = {
        job_title: jobData.title,
        role_description: jobData.overview || jobData.description,
        experience_required: {
          years_of_experience: "Not specified", // Can be enhanced later
          level: difficultyToLevel[jobData.quiz_config.difficulty] || 'Mid Level'
        },
        skills_required: {
          technical_skills: jobData.quiz_config.topics.map((topic: string) =>
            topic.split('-').map((word: string) =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')
          ),
          soft_skills: allRequirements.filter((req: string) =>
            req.toLowerCase().includes('communication') ||
            req.toLowerCase().includes('teamwork') ||
            req.toLowerCase().includes('problem') ||
            req.toLowerCase().includes('attention')
          )
        },
        job_responsibilities: jobData.responsibilities || []
      }

      console.log('========== QUIZ GENERATION REQUEST (Job Creation) ==========')
      console.log('API Endpoint:', 'http://127.0.0.1:8000/quiz')
      console.log('Job ID:', jobId)
      console.log('Job Data being sent:', JSON.stringify(apiJobData, null, 2))

      // Create FormData for API request
      const formData = new FormData()
      const jobBlob = new Blob([JSON.stringify(apiJobData)], {
        type: 'application/json'
      })
      formData.append('job_json', jobBlob, 'job.json')

      // Use number of questions from quiz config
      const numQuestions = jobData.quiz_config.num_questions || 15
      formData.append('questions', numQuestions.toString())

      console.log('Number of questions requested:', numQuestions)
      console.log('Quiz configuration:', jobData.quiz_config)

      // Call quiz generation API
      console.log('Calling quiz generation API...')
      const response = await fetch('http://127.0.0.1:8000/quiz', {
        method: 'POST',
        body: formData
      })

      console.log('API Response status:', response.status)
      console.log('API Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`API responded with status: ${response.status}`)
      }

      const quizData = await response.json()

      console.log('========== QUIZ GENERATION RESPONSE ==========')
      console.log('Quiz ID:', quizData.quiz_id)
      console.log('Metadata:', quizData.metadata)
      console.log('Number of questions received:', quizData.questions?.length || 0)
      console.log('Full Quiz Data:', JSON.stringify(quizData, null, 2))
      console.log('==============================================')

      // Store the generated quiz in the database
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          custom_fields: {
            ...jobData.custom_fields,
            generated_quiz: {
              quiz_id: quizData.quiz_id,
              metadata: quizData.metadata,
              questions: quizData.questions,
              generated_at: new Date().toISOString()
            }
          }
        })
        .eq('id', jobId)

      if (updateError) throw updateError

      console.log('Quiz generated successfully:', quizData.quiz_id)
      return quizData
    } catch (error) {
      console.error('Error generating quiz:', error)
      // Don't throw - we don't want quiz generation failure to fail job creation
      toast.error('Quiz generation failed. You can regenerate it later.')
    }
  }

  const submitJob = async () => {
    try {
      setIsSubmitting(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to create a job')
        return
      }

      // Check if company record exists
      const { data: company, error: companyCheckError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', user.id)
        .single()

      if (companyCheckError || !company) {
        console.error('Company record check error:', {
          error: companyCheckError,
          code: companyCheckError?.code,
          message: companyCheckError?.message,
          details: companyCheckError?.details,
          userId: user.id,
          companyExists: !!company
        })

        // If no company record exists (PGRST116 = no rows), create one automatically
        if (companyCheckError?.code === 'PGRST116') {
          console.log('No company record found. Creating one automatically...')
          const { error: createError } = await supabase
            .from('companies')
            .insert({
              id: user.id,
              company_name: 'My Company', // Default name, user can update in profile
              location: null,
              industry: null,
              size: null,
              website: null,
              description: null
            })

          if (createError) {
            console.error('Failed to create company record:', {
              error: createError,
              message: createError.message,
              details: createError.details,
              code: createError.code
            })
            toast.error(`Failed to create company profile: ${createError.message}`)
            return
          }

          toast.success('Company profile created! Continuing with job posting...')
          // Continue with job creation - no return
        } else {
          toast.error('Error checking company profile. Please try again.')
          return
        }
      }

      // Map form data to database schema
      const jobData = {
        company_id: user.id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        requirements: formData.requirements,
        benefits: formData.benefits,
        salary_min: formData.salary_min,
        salary_max: formData.salary_max,
        currency: formData.currency,
        status: 'active', // Change to 'active' so it shows in candidate jobs
        step: steps.length,
        // Store all additional config in custom_fields JSONB column
        custom_fields: {
          department: formData.department,
          is_remote: formData.is_remote,
          has_relocation: formData.has_relocation,
          overview: formData.overview,
          responsibilities: formData.responsibilities,
          detailed_requirements: formData.detailed_requirements,
          detailed_benefits: formData.detailed_benefits,
          required_documents: formData.required_documents,
          required_skills: formData.required_skills,
          min_education: formData.min_education,
          ai_screening_enabled: formData.ai_screening_enabled,
          test_requirements: formData.test_requirements,
          quiz_config: formData.technical_test_config, // Quiz configuration
          ai_test_generation: formData.ai_test_generation,
          automated_scheduling: formData.automated_scheduling,
          ai_feedback: formData.ai_feedback,
          stage_weightages: formData.stage_weightages,
          interview_config: formData.interview_config
        },
        // Store interview stages and config
        stages: {
          interview_stages: formData.interview_stages,
          ai_interview_config: formData.ai_interview_config
        }
      }

      const { data: insertedJob, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single()

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw new Error(error.message || 'Failed to post job')
      }

      toast.success('Job posted successfully!')

      // Generate quiz in the background if AI test generation is enabled
      if (formData.ai_test_generation && insertedJob) {
        toast.info('Generating quiz questions...', { duration: 3000 })

        // Pass the complete form data for quiz generation
        await generateQuizForJob(insertedJob.id, {
          title: formData.title,
          description: formData.description,
          overview: formData.overview,
          requirements: formData.requirements,
          responsibilities: formData.responsibilities,
          detailed_requirements: formData.detailed_requirements,
          quiz_config: formData.technical_test_config,
          custom_fields: jobData.custom_fields
        })
      }

      router.push('/company/jobs')
    } catch (error: any) {
      console.error('Error posting job:', {
        message: error.message,
        stack: error.stack,
        error: error
      })
      toast.error(error.message || 'Failed to post job')
    } finally {
      setIsSubmitting(false)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((currentStep - 1) as 0 | 1 | 2 | 3)
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
                className={`w-10 h-10 rounded-full flex items-center justify-center ${index < currentStep
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
                  <Input
                    id="title"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange('department', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Software Engineering</SelectItem>
                      <SelectItem value="frontend">Frontend Development</SelectItem>
                      <SelectItem value="backend">Backend Development</SelectItem>
                      <SelectItem value="mobile">Mobile Development</SelectItem>
                      <SelectItem value="devops">DevOps & Cloud</SelectItem>
                      <SelectItem value="qa">Quality Assurance</SelectItem>
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
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => handleInputChange('location', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="karachi">Karachi</SelectItem>
                      <SelectItem value="lahore">Lahore</SelectItem>
                      <SelectItem value="islamabad">Islamabad</SelectItem>
                      <SelectItem value="hyderabad">Hyderabad</SelectItem>
                      <SelectItem value="peshawar">Peshawar</SelectItem>
                      <SelectItem value="remote">Remote (Pakistan)</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Employment Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
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
                  value={formData.requirements.join('\n')}
                  onChange={(e) => handleInputChange('requirements', e.target.value.split('\n').filter(Boolean))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  placeholder="List the key responsibilities for this role..."
                  className="min-h-[150px]"
                  value={formData.responsibilities.join('\n')}
                  onChange={(e) => handleInputChange('responsibilities', e.target.value.split('\n').filter(Boolean))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits &amp; Perks</Label>
                <Textarea
                  id="benefits"
                  placeholder="Describe the benefits and perks of working at your company..."
                  className="min-h-[150px]"
                  value={formData.benefits.join('\n')}
                  onChange={(e) => handleInputChange('benefits', e.target.value.split('\n').filter(Boolean))}
                />
              </div>

              <div className="space-y-2">
                <Label>Salary Range (PKR)</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Minimum salary"
                    type="number"
                    value={formData.salary_min || ''}
                    onChange={(e) => handleInputChange('salary_min', e.target.value ? Number(e.target.value) : null)}
                  />
                  <Input
                    placeholder="Maximum salary"
                    type="number"
                    value={formData.salary_max || ''}
                    onChange={(e) => handleInputChange('salary_max', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Additional Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remote"
                      checked={formData.is_remote}
                      onCheckedChange={(checked) => handleInputChange('is_remote', checked)}
                    />
                    <Label htmlFor="remote">Remote work allowed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="relocation"
                      checked={formData.has_relocation}
                      onCheckedChange={(checked) => handleInputChange('has_relocation', checked)}
                    />
                    <Label htmlFor="relocation">Relocation assistance available</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} disabled={isFirstStep(currentStep)}>
                Previous
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={saveDraft} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button onClick={nextStep} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Next Step'}
                </Button>
              </div>
            </CardFooter>
          </>
        )}

        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle>Resume Requirements</CardTitle>
              <CardDescription>Specify what you're looking for in candidate resumes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Required Documents</Label>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="resume"
                    checked={true}
                    disabled={true}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="resume" className="cursor-pointer">
                      Resume/CV <span className="text-xs text-muted-foreground">(Required)</span>
                    </Label>
                    <p className="text-sm text-slate-500">Standard resume with work history</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="border rounded-md p-4 space-y-4">
                  {formData.required_skills.map((skill, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`skill-${index}`}>Skill {index + 1}</Label>
                        <Input
                          id={`skill-${index}`}
                          placeholder="e.g. React.js"
                          value={skill.name}
                          onChange={(e) => {
                            const newSkills = [...formData.required_skills]
                            newSkills[index] = { ...skill, name: e.target.value }
                            handleInputChange('required_skills', newSkills)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`skill-${index}-years`}>Years of Experience</Label>
                        <Select
                          value={skill.years}
                          onValueChange={(value) => {
                            const newSkills = [...formData.required_skills]
                            newSkills[index] = { ...skill, years: value }
                            handleInputChange('required_skills', newSkills)
                          }}
                        >
                          <SelectTrigger id={`skill-${index}-years`}>
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
                  ))}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleInputChange('required_skills', [
                      ...formData.required_skills,
                      { name: '', years: 'any' }
                    ])}
                  >
                    + Add Another Skill
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Minimum Education</Label>
                <Select
                  value={formData.min_education}
                  onValueChange={(value) => handleInputChange('min_education', value)}
                >
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
                  <Checkbox
                    id="ai-screening"
                    checked={true}
                    disabled={true}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="ai-screening" className="cursor-pointer">
                      AI Resume Screening <span className="text-xs text-muted-foreground">(Always Enabled)</span>
                    </Label>
                    <p className="text-sm text-slate-500">
                      Our AI will analyze resumes and rank candidates based on your requirements
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep} disabled={isFirstStep(currentStep)}>
                Previous
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={saveDraft} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button onClick={nextStep} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Next Step'}
                </Button>
              </div>
            </CardFooter>
          </>
        )
        }

        {
          currentStep === 2 && (
            <>
              <CardHeader>
                <CardTitle>Test Requirements</CardTitle>
                <CardDescription>Set up skills assessments and tests for candidates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Stage Weightages</Label>
                    <div className={`text-sm font-medium ${getTotalWeightage() === 100 ? 'text-green-600' : getTotalWeightage() > 100 ? 'text-red-600' : 'text-orange-600'}`}>
                      Total: {getTotalWeightage()}%
                      {getTotalWeightage() !== 100 && (
                        <span className="ml-2 text-xs">
                          {getTotalWeightage() > 100 ? '(exceeds 100%)' : '(must equal 100%)'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resume-weightage">Resume Screening Weightage (%)</Label>
                      <Input
                        id="resume-weightage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.stage_weightages.resume_screening}
                        onChange={(e) => handleInputChange('stage_weightages', {
                          ...formData.stage_weightages,
                          resume_screening: Number(e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quiz-weightage">Quiz Assessment Weightage (%)</Label>
                      <Input
                        id="quiz-weightage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.stage_weightages.quiz}
                        onChange={(e) => handleInputChange('stage_weightages', {
                          ...formData.stage_weightages,
                          quiz: Number(e.target.value)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interview-weightage">Interview Weightage (%)</Label>
                      <Input
                        id="interview-weightage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.stage_weightages.interview}
                        onChange={(e) => handleInputChange('stage_weightages', {
                          ...formData.stage_weightages,
                          interview: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                  {!isWeightageValid() && (
                    <p className="text-sm text-red-600 mt-2">
                      ⚠️ The total weightage must equal exactly 100%. Please adjust the values.
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Quiz Configuration</Label>
                  <p className="text-sm text-muted-foreground">Configure the quiz assessment for this position. Quiz questions will be automatically generated based on the job requirements using AI.</p>
                  <div className="border rounded-md p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="test-difficulty">Difficulty Level</Label>
                      <Select
                        value={formData.technical_test_config.difficulty}
                        onValueChange={(value) => handleInputChange('technical_test_config', {
                          ...formData.technical_test_config,
                          difficulty: value
                        })}
                      >
                        <SelectTrigger id="test-difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="medium">Mid Level (2-5 years)</SelectItem>
                          <SelectItem value="hard">Senior Level (5+ years)</SelectItem>
                          <SelectItem value="expert">Lead/Architect Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="test-duration">Test Duration</Label>
                      <Select
                        value={formData.technical_test_config.duration}
                        onValueChange={(value) => handleInputChange('technical_test_config', {
                          ...formData.technical_test_config,
                          duration: value
                        })}
                      >
                        <SelectTrigger id="test-duration">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="num-questions">Number of Questions</Label>
                      <Input
                        id="num-questions"
                        type="number"
                        min="5"
                        max="50"
                        value={formData.technical_test_config.num_questions}
                        onChange={(e) => handleInputChange('technical_test_config', {
                          ...formData.technical_test_config,
                          num_questions: Number(e.target.value)
                        })}
                      />
                      <p className="text-xs text-muted-foreground">Number of questions to generate for the quiz (5-50)</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Test Topics</Label>
                      <p className="text-xs text-muted-foreground mb-2">Add topics for the quiz questions (e.g., JavaScript, React, SQL)</p>
                      <div className="border rounded-md p-4 space-y-3">
                        {formData.technical_test_config.topics.map((topic, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={topic}
                              placeholder="e.g. React.js"
                              onChange={(e) => {
                                const newTopics = [...formData.technical_test_config.topics]
                                newTopics[index] = e.target.value
                                handleInputChange('technical_test_config', {
                                  ...formData.technical_test_config,
                                  topics: newTopics
                                })
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newTopics = formData.technical_test_config.topics.filter((_, i) => i !== index)
                                handleInputChange('technical_test_config', {
                                  ...formData.technical_test_config,
                                  topics: newTopics
                                })
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleInputChange('technical_test_config', {
                            ...formData.technical_test_config,
                            topics: [...formData.technical_test_config.topics, '']
                          })}
                        >
                          + Add Topic
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="technical-passing-score">Passing Score (%)</Label>
                      <Input
                        id="technical-passing-score"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.technical_test_config.passing_score}
                        onChange={(e) => handleInputChange('technical_test_config', {
                          ...formData.technical_test_config,
                          passing_score: Number(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={prevStep} disabled={isFirstStep(currentStep)}>
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={saveDraft} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button onClick={nextStep} disabled={isSubmitting || !isWeightageValid()}>
                    {isSubmitting ? 'Saving...' : 'Next Step'}
                  </Button>
                </div>
              </CardFooter>
            </>
          )
        }

        {
          currentStep === 3 && (
            <>
              <CardHeader>
                <CardTitle>Interview Settings</CardTitle>
                <CardDescription>Configure the interview process for this job position.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="interview-duration">Interview Duration</Label>
                  <Select
                    value={formData.ai_interview_config.duration}
                    onValueChange={(value) => handleInputChange('ai_interview_config', {
                      ...formData.ai_interview_config,
                      duration: value
                    })}
                  >
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
                  <p className="text-xs text-muted-foreground">Duration of the AI screening interview</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interview-questions">Custom Interview Questions</Label>
                  <Textarea
                    id="interview-questions"
                    placeholder="Add any specific questions you'd like to include in the AI interview (one per line)..."
                    className="min-h-[150px]"
                    value={formData.ai_interview_config.custom_questions}
                    onChange={(e) => handleInputChange('ai_interview_config', {
                      ...formData.ai_interview_config,
                      custom_questions: e.target.value
                    })}
                  />
                  <p className="text-xs text-muted-foreground">These questions will be included in the AI screening interview</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={prevStep} disabled={isFirstStep(currentStep)}>
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={saveDraft} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button onClick={nextStep} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Create Job'}
                  </Button>
                </div>
              </CardFooter>
            </>
          )
        }
      </Card >
    </div >
  )
}
