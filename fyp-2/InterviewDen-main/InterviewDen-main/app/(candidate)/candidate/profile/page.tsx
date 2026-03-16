"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User, Mail, MapPin, Briefcase, Loader2, Camera, X, Plus,
  FileText, RefreshCw, ExternalLink, CheckCircle2, Star
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"
import Link from "next/link"

interface ProfileData {
  name: string
  email: string
  avatar_url: string | null
}

interface CandidateData {
  experience: string
  skills: string[]
  resumes: any[]
  profile_metadata: {
    phone?: string
    location?: string
    current_position?: string
    company?: string
    linkedin?: string
    portfolio?: string
    bio?: string
  } | null
}

interface StoredResume {
  id: string
  name: string
  parsed_data: {
    Name?: string
    Contact?: {
      Email?: string
      Phone?: string
      Location?: string
      LinkedIn?: string
    }
    Skills?: string[]
    Experience?: {
      "Total Years"?: number
      Positions?: Array<{
        Title?: string
        Company?: string
      }>
    }
    Summary?: string
  }
  is_default: boolean
}

export default function ProfilePage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    avatar_url: null
  })

  const [candidate, setCandidate] = useState<CandidateData>({
    experience: "",
    skills: [],
    resumes: [],
    profile_metadata: null
  })

  const [newSkill, setNewSkill] = useState("")
  const [metadata, setMetadata] = useState({
    phone: "",
    location: "",
    current_position: "",
    company: "",
    linkedin: "",
    portfolio: "",
    bio: ""
  })

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to view your profile")
        return
      }

      setUserId(user.id)

      // Fetch profile and candidate data in parallel
      const [profileResult, candidateResult] = await Promise.all([
        supabase.from("profiles").select("name, email, avatar_url").eq("id", user.id).single(),
        supabase.from("candidates").select("experience, skills, resumes, profile_metadata").eq("id", user.id).single()
      ])

      if (profileResult.data) {
        setProfile({
          name: profileResult.data.name || "",
          email: profileResult.data.email || user.email || "",
          avatar_url: profileResult.data.avatar_url
        })
      }

      if (candidateResult.data) {
        setCandidate({
          experience: candidateResult.data.experience || "",
          skills: candidateResult.data.skills || [],
          resumes: candidateResult.data.resumes || [],
          profile_metadata: candidateResult.data.profile_metadata
        })

        // Populate metadata form
        const meta = candidateResult.data.profile_metadata || {}
        setMetadata({
          phone: meta.phone || "",
          location: meta.location || "",
          current_position: meta.current_position || "",
          company: meta.company || "",
          linkedin: meta.linkedin || "",
          portfolio: meta.portfolio || "",
          bio: meta.bio || ""
        })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userId) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB")
      return
    }

    setUploadingAvatar(true)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        // Provide more helpful error message
        if (uploadError.message?.includes("Bucket not found")) {
          throw new Error("Storage bucket 'avatars' not found. Please create it in Supabase.")
        }
        throw new Error(uploadError.message || "Failed to upload image")
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId)

      if (updateError) throw new Error(updateError.message || "Failed to update profile")

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
      toast.success("Profile picture updated!")
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      toast.error(error.message || "Failed to upload profile picture. Make sure the 'avatars' bucket exists in Supabase Storage.")
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSetDefaultResume = async (resumeId: string) => {
    if (!userId) return

    try {
      const updatedResumes = candidate.resumes.map((resume: StoredResume) => ({
        ...resume,
        is_default: resume.id === resumeId
      }))

      setCandidate(prev => ({ ...prev, resumes: updatedResumes }))

      const { error } = await supabase
        .from("candidates")
        .update({
          resumes: updatedResumes,
          default_resume_id: resumeId
        })
        .eq("id", userId)

      if (error) throw error

      toast.success("Default resume updated!")
    } catch (error: any) {
      console.error("Error setting default resume:", error)
      toast.error(error.message || "Failed to update default resume")
    }
  }

  const handleSaveProfile = async () => {
    if (!userId) return

    setSaving(true)

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name: profile.name })
        .eq("id", userId)

      if (profileError) throw profileError

      // Update candidates table
      const { error: candidateError } = await supabase
        .from("candidates")
        .update({
          experience: candidate.experience,
          skills: candidate.skills,
          profile_metadata: metadata
        })
        .eq("id", userId)

      if (candidateError) throw candidateError

      toast.success("Profile saved successfully!")
    } catch (error: any) {
      console.error("Error saving profile:", error)
      toast.error(error.message || "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = () => {
    const skill = newSkill.trim()
    if (!skill) return

    if (candidate.skills.includes(skill)) {
      toast.error("Skill already exists")
      return
    }

    setCandidate(prev => ({
      ...prev,
      skills: [...prev.skills, skill]
    }))
    setNewSkill("")
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setCandidate(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSyncFromResume = () => {
    const defaultResume = candidate.resumes.find((r: StoredResume) => r.is_default) || candidate.resumes[0]

    if (!defaultResume) {
      toast.error("No resume found. Please upload a resume first.")
      return
    }

    const parsed = defaultResume.parsed_data
    if (!parsed) {
      toast.error("Resume data not available")
      return
    }

    // Update profile name if available
    if (parsed.Name) {
      setProfile(prev => ({ ...prev, name: parsed.Name || prev.name }))
    }

    // Update skills
    if (parsed.Skills && parsed.Skills.length > 0) {
      setCandidate(prev => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...parsed.Skills])]
      }))
    }

    // Update metadata from contact info
    const contact = parsed.Contact || {}
    const experience = parsed.Experience || {}
    const positions = experience.Positions || []
    const currentPosition = positions[0] || {}

    setMetadata(prev => ({
      ...prev,
      phone: contact.Phone || prev.phone,
      location: contact.Location || prev.location,
      linkedin: contact.LinkedIn || prev.linkedin,
      current_position: currentPosition.Title || prev.current_position,
      company: currentPosition.Company || prev.company,
      bio: parsed.Summary || prev.bio
    }))

    // Update experience
    if (experience["Total Years"]) {
      setCandidate(prev => ({
        ...prev,
        experience: `${experience["Total Years"]} years of experience`
      }))
    }

    toast.success("Profile synced with resume data!")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Profile Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your personal and professional information
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload a photo to personalize your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
                  <AvatarFallback className="text-lg bg-violet-100 text-violet-700">
                    {getInitials(profile.name) || <User className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {uploadingAvatar ? "Uploading..." : "Change Photo"}
                </Button>
                <p className="text-xs text-slate-500">JPEG, PNG or GIF. Max 10MB.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={profile.email}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500">Email cannot be changed</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={metadata.phone}
                  onChange={(e) => setMetadata(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={metadata.location}
                  onChange={(e) => setMetadata(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, Country"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>Update your work details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Current Position</Label>
                <Input
                  value={metadata.current_position}
                  onChange={(e) => setMetadata(prev => ({ ...prev, current_position: e.target.value }))}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={metadata.company}
                  onChange={(e) => setMetadata(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company Name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Experience Summary</Label>
              <Input
                value={candidate.experience}
                onChange={(e) => setCandidate(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="e.g., 5 years of experience in software development"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>LinkedIn Profile</Label>
                <Input
                  value={metadata.linkedin}
                  onChange={(e) => setMetadata(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="linkedin.com/in/yourprofile"
                />
              </div>
              <div className="space-y-2">
                <Label>Portfolio Website</Label>
                <Input
                  value={metadata.portfolio}
                  onChange={(e) => setMetadata(prev => ({ ...prev, portfolio: e.target.value }))}
                  placeholder="yourwebsite.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={metadata.bio}
                onChange={(e) => setMetadata(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Write a brief bio about yourself..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Add your technical and professional skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
              />
              <Button onClick={handleAddSkill} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {candidate.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 flex items-center gap-1"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No skills added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Resume Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Resumes</CardTitle>
              <CardDescription>Your uploaded resumes</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSyncFromResume}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync from Resume
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/candidate/cv">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage Resumes
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {candidate.resumes.length > 0 ? (
              <div className="space-y-3">
                {candidate.resumes.map((resume: StoredResume) => (
                  <div
                    key={resume.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${resume.is_default ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20" : "border-slate-200"
                      }`}
                  >
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{resume.name}</p>
                      <p className="text-xs text-slate-500">
                        {resume.parsed_data?.Skills?.length || 0} skills • {resume.parsed_data?.Experience?.["Total Years"] || 0} years exp.
                      </p>
                    </div>
                    {resume.is_default ? (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefaultResume(resume.id)}
                        title="Set as default"
                        className="text-slate-400 hover:text-violet-600"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No resumes uploaded yet</p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/candidate/cv">Upload your first resume</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveProfile} disabled={saving} className="min-w-[120px]">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}