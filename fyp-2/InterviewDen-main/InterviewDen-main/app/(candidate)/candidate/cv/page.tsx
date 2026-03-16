"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, FileText, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Star } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { parseResume, ParsedResume } from "@/lib/resume-api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface StoredResume {
  id: string
  name: string
  parsed_data: ParsedResume
  uploaded_at: string
  is_default: boolean
  file_size?: string
}

export default function ResumePage() {
  const supabase = createClient()
  const [uploadedResumes, setUploadedResumes] = useState<StoredResume[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [candidateId, setCandidateId] = useState<string | null>(null)

  // Fetch candidate profile and resumes
  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to manage resumes")
        return
      }

      setCandidateId(user.id)

      // Fetch candidate profile with resumes
      const { data: candidate, error } = await supabase
        .from('candidates')
        .select('resumes, default_resume_id')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (candidate?.resumes) {
        setUploadedResumes(candidate.resumes as StoredResume[])
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
      toast.error('Failed to load resumes')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (!candidateId) {
      toast.error("Please sign in to upload resumes")
      return
    }

    setUploading(true)

    try {
      // Process files one by one
      for (const file of Array.from(files)) {
        // Validate file type
        if (file.type !== 'application/pdf') {
          toast.error(`${file.name} is not a PDF file`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Max size is 5MB`)
          continue
        }

        toast.info(`Parsing ${file.name}...`)

        // Parse resume using API
        const parsedData = await parseResume(file)

        // Check for fraud
        if (parsedData.is_fraudulent) {
          toast.error(`Resume appears fraudulent: ${parsedData.fraud_type}`)
          continue
        }

        // Create new resume object
        const newResume: StoredResume = {
          id: crypto.randomUUID(),
          name: file.name,
          parsed_data: parsedData,
          uploaded_at: new Date().toISOString(),
          is_default: uploadedResumes.length === 0, // First resume is default
          file_size: `${(file.size / 1024).toFixed(1)} KB`
        }

        // Add to state
        const updatedResumes = [...uploadedResumes, newResume]
        setUploadedResumes(updatedResumes)

        // Save to database
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ 
            resumes: updatedResumes,
            default_resume_id: uploadedResumes.length === 0 ? newResume.id : undefined
          })
          .eq('id', candidateId)

        if (updateError) throw updateError

        toast.success(`✅ ${file.name} uploaded and parsed successfully!`)
      }
    } catch (error: any) {
      console.error('Error uploading resume:', error)
      toast.error(error.message || 'Failed to upload resume')
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleDeleteResume = async (id: string) => {
    if (!candidateId) return

    try {
      const updatedResumes = uploadedResumes.filter(resume => resume.id !== id)
      setUploadedResumes(updatedResumes)

      // If deleted resume was default, set first resume as default
      const deletedResume = uploadedResumes.find(r => r.id === id)
      const newDefaultId = deletedResume?.is_default && updatedResumes.length > 0
        ? updatedResumes[0].id
        : undefined

      if (newDefaultId) {
        updatedResumes[0].is_default = true
      }

      const { error } = await supabase
        .from('candidates')
        .update({ 
          resumes: updatedResumes,
          default_resume_id: newDefaultId
        })
        .eq('id', candidateId)

      if (error) throw error

      toast.success('Resume deleted')
    } catch (error) {
      console.error('Error deleting resume:', error)
      toast.error('Failed to delete resume')
    }
  }

  const handleSetDefault = async (id: string) => {
    if (!candidateId) return

    try {
      const updatedResumes = uploadedResumes.map(resume => ({
        ...resume,
        is_default: resume.id === id
      }))
      
      setUploadedResumes(updatedResumes)

      const { error } = await supabase
        .from('candidates')
        .update({ 
          resumes: updatedResumes,
          default_resume_id: id
        })
        .eq('id', candidateId)

      if (error) throw error

      toast.success('Default resume updated')
    } catch (error) {
      console.error('Error setting default:', error)
      toast.error('Failed to update default resume')
    }
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
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <Loader2 className="h-12 w-12 animate-spin text-violet-600 mb-4" />
                  <p className="text-sm text-slate-500">Loading your resumes...</p>
                </div>
              ) : (
                <>
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
                          accept=".pdf"
                          multiple
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        <Button 
                          onClick={() => document.getElementById('resume-upload')?.click()}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Resume
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      PDF files only, max 5MB. Resume will be automatically parsed.
                    </p>
                  </div>

                  {uploadedResumes.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Uploaded Resumes</h3>
                      <div className="grid gap-4">
                        {uploadedResumes.map(resume => (
                          <Card key={resume.id} className={resume.is_default ? "border-violet-500 border-2" : ""}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                  <FileText className="h-8 w-8 text-slate-400 mt-1" />
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">{resume.name}</p>
                                      {resume.is_default && (
                                        <Badge variant="default" className="text-xs">
                                          <Star className="h-3 w-3 mr-1" />
                                          Default
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-500">
                                      <div className="flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                        <span>{resume.parsed_data.Name}</span>
                                      </div>
                                      <div>
                                        <span>{resume.parsed_data.Skills?.length || 0} skills</span>
                                      </div>
                                      <div>
                                        <span>{resume.parsed_data.Experience?.["Total Years"] || 0} years exp.</span>
                                      </div>
                                      <div>
                                        <span>{new Date(resume.uploaded_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                    {resume.file_size && (
                                      <p className="text-xs text-slate-400">{resume.file_size}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                  {!resume.is_default && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSetDefault(resume.id)}
                                      title="Set as default"
                                    >
                                      <Star className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteResume(resume.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
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