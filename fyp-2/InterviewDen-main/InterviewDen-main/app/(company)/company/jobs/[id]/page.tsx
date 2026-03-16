"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Briefcase, Users, Settings, Download, Star, Calendar, Loader2, Edit, Save, X, Send, Trophy, MessageSquare } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  postedDate: string;
  applicants: number;
  status: string;
  description: string;
  requirements: string[];
  benefits: string[];
  testWeightages: {
    resume: number;
    quiz: number;
    interview: number;
  };
  department?: string;
  is_remote?: boolean;
  has_relocation?: boolean;
  overview?: string;
  responsibilities?: string[];
  detailed_requirements?: string[];
  detailed_benefits?: string[];
  generated_quiz?: {
    quiz_id: string;
    metadata: {
      question_count: number;
      level: string;
    };
    questions: any[];
    generated_at: string;
  };
  quizConfig?: {
    difficulty: string;
    duration: string;
    num_questions: number;
    passing_score: number;
    topics: string[];
  };
}

interface Applicant {
  id: string;
  candidate_id: string;
  job_id: string;
  status: string;
  current_stage: string;
  ats_score: number | null;
  applied_at: string;
  resume_screening: any;
  quiz_results: any;
  interview_results: any;
  candidate: {
    name: string;
    email: string;
    experience: string | null;
    skills: string[] | null;
  };
  weightedScore: number;
  rank: number;
  isComplete: boolean;
}

export default function ManageJobPage() {
  const params = useParams();
  const jobId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicantFilter, setApplicantFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editableJobDetails, setEditableJobDetails] = useState<Partial<JobDetails>>({});
  const [messageInputs, setMessageInputs] = useState<{ [key: string]: string }>({});

  const [weightages, setWeightages] = useState({
    resume: 40,
    quiz: 30,
    interview: 30
  });

  const [quizConfig, setQuizConfig] = useState({
    difficulty: 'medium',
    duration: '45',
    num_questions: 15,
    passing_score: 70,
    topics: [] as string[]
  });

  const handleWeightageChange = (key: string, value: number) => {
    setWeightages({ ...weightages, [key]: value });
  };

  const getTotalWeightage = () => {
    return weightages.resume + weightages.quiz + weightages.interview;
  };

  const isWeightageValid = () => {
    return getTotalWeightage() === 100;
  };

  // Calculate weighted score for an applicant
  const calculateWeightedScore = (applicant: any, weights: typeof weightages) => {
    let totalScore = 0;
    let appliedWeight = 0;

    // Resume screening score
    if (applicant.resume_screening?.match_score) {
      totalScore += (applicant.resume_screening.match_score * weights.resume) / 100;
      appliedWeight += weights.resume;
    } else if (applicant.ats_score) {
      totalScore += (applicant.ats_score * weights.resume) / 100;
      appliedWeight += weights.resume;
    }

    // Quiz score
    if (applicant.quiz_results?.score) {
      totalScore += (applicant.quiz_results.score * weights.quiz) / 100;
      appliedWeight += weights.quiz;
    }

    // Interview score
    const interviewScore = applicant.interview_results?.evaluation?.overall_score;
    if (interviewScore) {
      totalScore += (interviewScore * weights.interview) / 100;
      appliedWeight += weights.interview;
    }

    // Normalize if not all stages complete
    if (appliedWeight > 0 && appliedWeight < 100) {
      totalScore = (totalScore / appliedWeight) * 100;
    }

    return Math.round(totalScore);
  };

  // Fetch applicants for this job
  const fetchApplicants = async (weightagesOverride?: { resume: number; quiz: number; interview: number }) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          candidate_id,
          job_id,
          status,
          current_stage,
          ats_score,
          weighted_score,
          applied_at,
          resume_screening,
          quiz_results,
          interview_results,
          candidates!inner (
            profiles!inner (
              name,
              email
            )
          )
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching applicants:', error);
        return;
      }

      if (data) {
        // Transform and calculate scores
        const transformedApplicants = data.map((app: any) => {
          const isComplete = !!(app.interview_results?.evaluation?.overall_score || app.current_stage === 'completed');
          // Use stored weighted_score for completed applications, fall back to dynamic calculation
          const score = isComplete && app.weighted_score != null
            ? app.weighted_score
            : calculateWeightedScore(app, weightagesOverride || weightages);

          return {
            id: app.id,
            candidate_id: app.candidate_id,
            job_id: app.job_id,
            status: app.status,
            current_stage: app.current_stage,
            ats_score: app.ats_score,
            applied_at: app.applied_at,
            resume_screening: app.resume_screening,
            quiz_results: app.quiz_results,
            interview_results: app.interview_results,
            candidate: {
              name: app.candidates?.profiles?.name || 'Unknown',
              email: app.candidates?.profiles?.email || '',
              experience: null,
              skills: null
            },
            weightedScore: score,
            rank: 0,
            isComplete
          };
        });


        // Sort: completed applications first, then by weighted score (highest first)
        transformedApplicants.sort((a, b) => {
          // Completed applications rank higher
          if (a.isComplete !== b.isComplete) {
            return a.isComplete ? -1 : 1;
          }
          // Then sort by weighted score
          return b.weightedScore - a.weightedScore;
        });

        // Assign ranks
        transformedApplicants.forEach((app, index) => {
          app.rank = index + 1;
        });

        setApplicants(transformedApplicants);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
    }
  };

  // Update applicant status
  const handleUpdateApplicantStatus = async (applicantId: string, newStatus: string, candidateId: string) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', applicantId);

      if (error) throw error;

      // Create notification for candidate
      await supabase.from('notifications').insert({
        user_id: candidateId,
        type: 'status_update',
        title: 'Application Status Updated',
        message: `Your application for ${jobDetails?.title} has been ${newStatus}`,
        read: false,
        created_at: new Date().toISOString()
      });

      // Update local state
      setApplicants(prev => prev.map(app =>
        app.id === applicantId ? { ...app, status: newStatus } : app
      ));

      toast.success(`Applicant status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update applicant status');
    } finally {
      setSaving(false);
    }
  };

  // Send message to applicant
  const handleSendMessage = async (applicantId: string, candidateId: string) => {
    const message = messageInputs[applicantId];
    if (!message?.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSaving(true);

      // Create notification for candidate
      await supabase.from('notifications').insert({
        user_id: candidateId,
        type: 'message',
        title: `Message from ${jobDetails?.company}`,
        message: message,
        read: false,
        created_at: new Date().toISOString()
      });

      // Clear message input
      setMessageInputs(prev => ({ ...prev, [applicantId]: '' }));

      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSaving(false);
    }
  };

  // Save job details
  const handleSaveJobDetails = async () => {
    try {
      if (!jobDetails) return;
      setSaving(true);

      // Get current custom fields
      const { data: currentJob } = await supabase
        .from("jobs")
        .select("custom_fields")
        .eq("id", jobId)
        .single();

      const currentCustomFields = currentJob?.custom_fields || {};

      const { error } = await supabase
        .from("jobs")
        .update({
          title: editableJobDetails.title || jobDetails.title,
          description: editableJobDetails.description || jobDetails.description,
          location: editableJobDetails.location || jobDetails.location,
          type: editableJobDetails.type || jobDetails.type,
          salary_min: editableJobDetails.salary_min,
          salary_max: editableJobDetails.salary_max,
          requirements: editableJobDetails.requirements || jobDetails.requirements,
          benefits: editableJobDetails.benefits || jobDetails.benefits,
          custom_fields: {
            ...currentCustomFields,
            responsibilities: editableJobDetails.responsibilities || jobDetails.responsibilities,
            overview: editableJobDetails.overview || jobDetails.overview
          }
        })
        .eq("id", jobId);

      if (error) throw error;

      // Update local state
      setJobDetails({
        ...jobDetails,
        ...editableJobDetails
      });

      setIsEditing(false);
      toast.success("Job details updated successfully");
    } catch (error) {
      console.error("Error saving job details:", error);
      toast.error("Failed to save job details");
    } finally {
      setSaving(false);
    }
  };

  // Save all settings (weightages + quiz config)
  const handleSaveSettings = async () => {
    try {
      if (!jobDetails) return;

      if (!isWeightageValid()) {
        toast.error("Total weightage must equal 100%");
        return;
      }

      setSaving(true);

      const { data: currentJob } = await supabase
        .from("jobs")
        .select("custom_fields")
        .eq("id", jobId)
        .single();

      const currentCustomFields = currentJob?.custom_fields || {};

      const dbWeightages = {
        resume_screening: weightages.resume,
        quiz: weightages.quiz,
        interview: weightages.interview
      };

      const { error } = await supabase
        .from("jobs")
        .update({
          custom_fields: {
            ...currentCustomFields,
            stage_weightages: dbWeightages,
            quiz_config: quizConfig
          }
        })
        .eq("id", jobId);

      if (error) throw error;

      setJobDetails({
        ...jobDetails,
        testWeightages: weightages,
        quizConfig: quizConfig
      });

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivateJob = async () => {
    try {
      if (!jobDetails) return;

      const newStatus = jobDetails.status === "Active" ? "closed" : "active";

      const { error } = await supabase
        .from("jobs")
        .update({ status: newStatus })
        .eq("id", jobId);

      if (error) throw error;

      setJobDetails({
        ...jobDetails,
        status: newStatus === "active" ? "Active" : "Closed"
      });

      toast.success(
        newStatus === "active"
          ? "Job posting activated successfully"
          : "Job posting deactivated successfully"
      );
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status");
    }
  };

  const handleDeleteJob = async () => {
    try {
      if (!jobDetails) return;

      if (!confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
        return;
      }

      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      toast.success("Job posting deleted successfully");

      setTimeout(() => {
        window.location.href = "/company/jobs";
      }, 1500);
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job posting");
    }
  };

  const handleRegenerateQuiz = async () => {
    try {
      if (!jobDetails) return;

      setSaving(true);
      toast.info('Regenerating quiz questions...', { duration: 3000 });

      // Fetch current job data (latest version)
      const { data: currentJob, error: fetchError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (fetchError) throw fetchError;

      const customFields = currentJob.custom_fields || {};
      // Use the current quizConfig state which has the latest settings
      const quizCfg = quizConfig;

      const difficultyToLevel: { [key: string]: string } = {
        'easy': 'Entry Level',
        'medium': 'Mid Level',
        'hard': 'Senior',
        'expert': 'Lead/Architect'
      };

      const apiJobData = {
        job_title: currentJob.title,
        role_description: customFields.overview || currentJob.description,
        experience_required: {
          years_of_experience: "Not specified",
          level: difficultyToLevel[quizCfg.difficulty] || 'Mid Level'
        },
        skills_required: {
          technical_skills: quizCfg.topics.map((topic: string) =>
            topic.split('-').map((word: string) =>
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')
          ),
          soft_skills: (currentJob.requirements || []).filter((req: string) =>
            req.toLowerCase().includes('communication') ||
            req.toLowerCase().includes('teamwork') ||
            req.toLowerCase().includes('problem') ||
            req.toLowerCase().includes('attention')
          )
        },
        job_responsibilities: customFields.responsibilities || []
      };

      console.log('========== QUIZ GENERATION REQUEST ==========');
      console.log('Quiz Config:', quizCfg);
      console.log('Number of questions:', quizCfg.num_questions);

      const formData = new FormData();
      const jobBlob = new Blob([JSON.stringify(apiJobData)], {
        type: 'application/json'
      });
      formData.append('job_json', jobBlob, 'job.json');
      formData.append('questions', quizCfg.num_questions.toString());

      const response = await fetch('http://127.0.0.1:8000/quiz', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API responded with status: ${response.status}`);
      }

      const quizData = await response.json();

      console.log('Quiz Generated:', quizData.metadata?.question_count, 'questions');

      const { error: updateError } = await supabase
        .from("jobs")
        .update({
          custom_fields: {
            ...customFields,
            quiz_config: quizCfg,
            generated_quiz: {
              quiz_id: quizData.quiz_id,
              metadata: quizData.metadata,
              questions: quizData.questions,
              generated_at: new Date().toISOString()
            }
          }
        })
        .eq("id", jobId);

      if (updateError) throw updateError;

      toast.success(`Quiz regenerated successfully! (${quizData.metadata.question_count} questions)`);

      window.location.reload();
    } catch (error) {
      console.error("Error regenerating quiz:", error);
      toast.error("Failed to regenerate quiz");
    } finally {
      setSaving(false);
    }
  };

  // Add topic
  const handleAddTopic = () => {
    setQuizConfig(prev => ({
      ...prev,
      topics: [...prev.topics, '']
    }));
  };

  // Remove topic
  const handleRemoveTopic = (index: number) => {
    setQuizConfig(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  // Update topic
  const handleUpdateTopic = (index: number, value: string) => {
    setQuizConfig(prev => ({
      ...prev,
      topics: prev.topics.map((t, i) => i === index ? value : t)
    }));
  };

  useEffect(() => {
    async function fetchJobDetails() {
      try {
        setLoading(true);

        const { data: jobData, error: jobError } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", jobId)
          .single();

        if (jobError) throw jobError;

        if (!jobData) {
          toast.error("Job not found");
          return;
        }

        const { data: companyData } = await supabase
          .from("companies")
          .select("company_name")
          .eq("id", jobData.company_id)
          .single();

        const customFields = jobData.custom_fields || {};

        let salary = "Not specified";
        if (jobData.salary_min || jobData.salary_max) {
          const currency = jobData.currency || "PKR";
          const symbol = currency === 'PKR' ? '₨' : '$';
          const min = jobData.salary_min ? `${symbol}${jobData.salary_min.toLocaleString()}` : "";
          const max = jobData.salary_max ? `${symbol}${jobData.salary_max.toLocaleString()}` : "";
          if (min && max) {
            salary = `${min} - ${max}`;
          } else {
            salary = min || max;
          }
        }

        const dbWeightages = customFields.stage_weightages || {};
        const mappedWeightages = {
          resume: dbWeightages.resume_screening || 40,
          quiz: dbWeightages.quiz || 30,
          interview: dbWeightages.interview || 30
        };

        const dbQuizConfig = customFields.quiz_config || {};
        const mappedQuizConfig = {
          difficulty: dbQuizConfig.difficulty || 'medium',
          duration: dbQuizConfig.duration || '45',
          num_questions: dbQuizConfig.num_questions || 15,
          passing_score: dbQuizConfig.passing_score || 70,
          topics: dbQuizConfig.topics || []
        };

        // Count applicants
        const { count } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', jobId);

        const details: JobDetails = {
          id: jobData.id,
          title: jobData.title || "Untitled Job",
          company: companyData?.company_name || "Company Name",
          location: jobData.location || "Not specified",
          type: jobData.type || "Full-time",
          salary,
          salary_min: jobData.salary_min,
          salary_max: jobData.salary_max,
          currency: jobData.currency || "PKR",
          postedDate: jobData.created_at,
          applicants: count || 0,
          status: jobData.status === "active" ? "Active" : jobData.status === "draft" ? "Draft" : "Closed",
          description: jobData.description || "No description provided",
          requirements: jobData.requirements || [],
          benefits: jobData.benefits || [],
          testWeightages: mappedWeightages,
          department: customFields.department,
          is_remote: customFields.is_remote,
          has_relocation: customFields.has_relocation,
          overview: customFields.overview,
          responsibilities: customFields.responsibilities,
          detailed_requirements: customFields.detailed_requirements,
          detailed_benefits: customFields.detailed_benefits,
          generated_quiz: customFields.generated_quiz,
          quizConfig: mappedQuizConfig
        };

        setJobDetails(details);
        setEditableJobDetails(details);
        setWeightages(mappedWeightages);
        setQuizConfig(mappedQuizConfig);

        // Fetch applicants with the calculated weightages (not state, which may not be updated yet)
        await fetchApplicants(mappedWeightages);
      } catch (error) {
        console.error("Error fetching job details:", error);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    }

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  // Recalculate applicant scores when weightages change
  useEffect(() => {
    if (applicants.length > 0) {
      const recalculated = applicants.map(app => ({
        ...app,
        weightedScore: calculateWeightedScore(app, weightages)
      }));
      recalculated.sort((a, b) => b.weightedScore - a.weightedScore);
      recalculated.forEach((app, index) => {
        app.rank = index + 1;
      });
      setApplicants(recalculated);
    }
  }, [weightages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!jobDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Job not found</p>
        <Button asChild>
          <Link href="/company/jobs">Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'shortlisted': return 'secondary';
      default: return 'outline';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white"><Trophy className="h-3 w-3 mr-1" />#1</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 text-white">#2</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 text-white">#3</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{jobDetails.title}</h1>
            <p className="text-muted-foreground">{jobDetails.company} • {jobDetails.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={jobDetails.status === "Active" ? "default" : "secondary"}>
              {jobDetails.status}
            </Badge>
            <Button
              variant="outline"
              onClick={handleDeactivateJob}
              className={jobDetails.status === "Active" ? "border-orange-500 text-orange-600 hover:bg-orange-50" : "border-green-500 text-green-600 hover:bg-green-50"}
            >
              {jobDetails.status === "Active" ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteJob}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="applicants">Applicants ({applicants.length})</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Job Description</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    setEditableJobDetails(jobDetails);
                  }
                  setIsEditing(!isEditing);
                }}
              >
                {isEditing ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><Edit className="h-4 w-4 mr-2" />Edit</>}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={editableJobDetails.title || ''}
                      onChange={(e) => setEditableJobDetails({ ...editableJobDetails, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editableJobDetails.description || ''}
                      onChange={(e) => setEditableJobDetails({ ...editableJobDetails, description: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={editableJobDetails.location || ''}
                        onChange={(e) => setEditableJobDetails({ ...editableJobDetails, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={editableJobDetails.type}
                        onValueChange={(value) => setEditableJobDetails({ ...editableJobDetails, type: value })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Minimum Salary (PKR)</Label>
                      <Input
                        type="number"
                        value={editableJobDetails.salary_min || ''}
                        onChange={(e) => setEditableJobDetails({ ...editableJobDetails, salary_min: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Salary (PKR)</Label>
                      <Input
                        type="number"
                        value={editableJobDetails.salary_max || ''}
                        onChange={(e) => setEditableJobDetails({ ...editableJobDetails, salary_max: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Requirements (one per line)</Label>
                    <Textarea
                      value={(editableJobDetails.requirements || []).join('\n')}
                      onChange={(e) => setEditableJobDetails({ ...editableJobDetails, requirements: e.target.value.split('\n').filter(Boolean) })}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Responsibilities (one per line)</Label>
                    <Textarea
                      value={(editableJobDetails.responsibilities || []).join('\n')}
                      onChange={(e) => setEditableJobDetails({ ...editableJobDetails, responsibilities: e.target.value.split('\n').filter(Boolean) })}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Benefits & Perks (one per line)</Label>
                    <Textarea
                      value={(editableJobDetails.benefits || []).join('\n')}
                      onChange={(e) => setEditableJobDetails({ ...editableJobDetails, benefits: e.target.value.split('\n').filter(Boolean) })}
                      className="min-h-[100px]"
                      placeholder="e.g. Health Insurance, Flexible Hours, Remote Work..."
                    />
                  </div>
                  <Button onClick={handleSaveJobDetails} disabled={saving}>
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground">{jobDetails.description}</p>
                  {jobDetails.overview && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Overview</h4>
                      <p className="text-muted-foreground">{jobDetails.overview}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {!isEditing && jobDetails.responsibilities && jobDetails.responsibilities.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Responsibilities</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  {jobDetails.responsibilities.map((resp, index) => (
                    <li key={index} className="text-muted-foreground">{resp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {!isEditing && (
            <Card>
              <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
              <CardContent>
                {jobDetails.requirements.length > 0 && (
                  <ul className="list-disc pl-6 space-y-2">
                    {jobDetails.requirements.map((req, index) => (
                      <li key={index} className="text-muted-foreground">{req}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {!isEditing && (
            <Card>
              <CardHeader><CardTitle>Job Information</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {jobDetails.department && (
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <p className="text-muted-foreground">{jobDetails.department}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <p className="text-muted-foreground">{jobDetails.type}</p>
                </div>
                <div className="space-y-2">
                  <Label>Salary Range</Label>
                  <p className="text-muted-foreground">{jobDetails.salary}</p>
                </div>
                <div className="space-y-2">
                  <Label>Posted Date</Label>
                  <p className="text-muted-foreground">{new Date(jobDetails.postedDate).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="applicants" className="space-y-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={applicantFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setApplicantFilter('all')}
            >
              All ({applicants.length})
            </Button>
            <Button
              variant={applicantFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setApplicantFilter('completed')}
            >
              Completed ({applicants.filter(a => a.isComplete).length})
            </Button>
            <Button
              variant={applicantFilter === 'in_progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setApplicantFilter('in_progress')}
            >
              In Progress ({applicants.filter(a => !a.isComplete).length})
            </Button>
          </div>

          {applicants.filter(a => {
            if (applicantFilter === 'completed') return a.isComplete;
            if (applicantFilter === 'in_progress') return !a.isComplete;
            return true;
          }).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {applicantFilter === 'all' ? 'No applicants yet' :
                    applicantFilter === 'completed' ? 'No completed applications' :
                      'No in-progress applications'}
                </p>
              </CardContent>
            </Card>
          ) : (
            applicants.filter(a => {
              if (applicantFilter === 'completed') return a.isComplete;
              if (applicantFilter === 'in_progress') return !a.isComplete;
              return true;
            }).map((applicant) => (
              <Card key={applicant.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getRankBadge(applicant.rank)}
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {applicant.candidate.name}
                          <Badge variant={getStatusBadgeVariant(applicant.status)}>
                            {applicant.status}
                          </Badge>
                          {applicant.isComplete ? (
                            <Badge className="bg-green-500 text-white">Completed</Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">In Progress</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {applicant.candidate.email} • Applied on {new Date(applicant.applied_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Weighted Score</div>
                      <div className="text-2xl font-bold text-violet-600">{applicant.weightedScore}%</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Resume Screening</span>
                          <span className="font-medium">
                            {applicant.resume_screening?.match_score || applicant.ats_score || 'N/A'}%
                          </span>
                        </div>
                        <Progress value={applicant.resume_screening?.match_score || applicant.ats_score || 0} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Quiz Assessment</span>
                          <span className="font-medium">{applicant.quiz_results?.score || 'N/A'}%</span>
                        </div>
                        <Progress value={applicant.quiz_results?.score || 0} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Interview</span>
                          <span className="font-medium">{applicant.interview_results?.evaluation?.overall_score || 'N/A'}%</span>
                        </div>
                        <Progress value={applicant.interview_results?.evaluation?.overall_score || 0} />
                      </div>
                    </div>

                    {/* AI Interview Evaluation */}
                    {applicant.interview_results?.evaluation && (
                      <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-violet-600" />
                          <span className="text-sm font-semibold text-violet-900 dark:text-violet-100">
                            AI Interview Evaluation
                          </span>
                          {applicant.interview_results.evaluation.hiring_recommendation && (
                            <Badge
                              className={
                                applicant.interview_results.evaluation.hiring_recommendation.toLowerCase().includes('strong hire')
                                  ? 'bg-green-500 text-white'
                                  : applicant.interview_results.evaluation.hiring_recommendation.toLowerCase().includes('hire')
                                    ? 'bg-emerald-500 text-white'
                                    : applicant.interview_results.evaluation.hiring_recommendation.toLowerCase().includes('no hire')
                                      ? 'bg-red-500 text-white'
                                      : 'bg-yellow-500 text-white'
                              }
                            >
                              {applicant.interview_results.evaluation.hiring_recommendation}
                            </Badge>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {/* Strengths */}
                          {applicant.interview_results.evaluation.strengths &&
                            applicant.interview_results.evaluation.strengths.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-green-700 dark:text-green-400">Strengths</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {applicant.interview_results.evaluation.strengths.map((strength: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1">
                                      <span className="text-green-500 mt-0.5">✓</span>
                                      <span>{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          {/* Weaknesses */}
                          {applicant.interview_results.evaluation.weaknesses &&
                            applicant.interview_results.evaluation.weaknesses.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">Areas for Improvement</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {applicant.interview_results.evaluation.weaknesses.map((weakness: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-1">
                                      <span className="text-red-500 mt-0.5">•</span>
                                      <span>{weakness}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Label>Status:</Label>
                        <Select
                          value={applicant.status}
                          onValueChange={(value) => handleUpdateApplicantStatus(applicant.id, value, applicant.candidate_id)}
                        >
                          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="shortlisted">Shortlisted</SelectItem>
                            {applicant.isComplete && (
                              <>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        {!applicant.isComplete && (
                          <span className="text-xs text-muted-foreground">
                            (Accept/Reject available after completion)
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <Input
                          placeholder="Send a message to candidate..."
                          value={messageInputs[applicant.id] || ''}
                          onChange={(e) => setMessageInputs(prev => ({ ...prev, [applicant.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSendMessage(applicant.id, applicant.candidate_id)}
                          disabled={saving}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Button variant="outline" asChild>
                        <Link href={`/company/candidates/${applicant.candidate_id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Quiz Management Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Configuration</CardTitle>
              <CardDescription>Configure quiz settings for this job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select
                    value={quizConfig.difficulty}
                    onValueChange={(value) => setQuizConfig({ ...quizConfig, difficulty: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Entry Level (0-2 years)</SelectItem>
                      <SelectItem value="medium">Mid Level (2-5 years)</SelectItem>
                      <SelectItem value="hard">Senior Level (5+ years)</SelectItem>
                      <SelectItem value="expert">Lead/Architect Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Test Duration</Label>
                  <Select
                    value={quizConfig.duration}
                    onValueChange={(value) => setQuizConfig({ ...quizConfig, duration: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Input
                    type="number"
                    min="5"
                    max="50"
                    value={quizConfig.num_questions}
                    onChange={(e) => setQuizConfig({ ...quizConfig, num_questions: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={quizConfig.passing_score}
                    onChange={(e) => setQuizConfig({ ...quizConfig, passing_score: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Test Topics</Label>
                <div className="border rounded-md p-4 space-y-3">
                  {quizConfig.topics.map((topic, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={topic}
                        placeholder="e.g. React.js"
                        onChange={(e) => handleUpdateTopic(index, e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={() => handleRemoveTopic(index)}>Remove</Button>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={handleAddTopic}>+ Add Topic</Button>
                </div>
              </div>

              {jobDetails.generated_quiz ? (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">Quiz Generated</p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {jobDetails.generated_quiz.metadata?.question_count || 0} questions •
                      {jobDetails.generated_quiz.metadata?.level || 'N/A'}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Generated: {new Date(jobDetails.generated_quiz.generated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleRegenerateQuiz}
                    disabled={saving}
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Regenerating...</> : 'Regenerate Quiz'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">No Quiz Generated</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Generate a quiz to enable candidate assessments
                    </p>
                  </div>
                  <Button onClick={handleRegenerateQuiz} disabled={saving} className="bg-orange-600 hover:bg-orange-700">
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</> : 'Generate Quiz'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Weightages Card */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Weightages</CardTitle>
              <CardDescription>Adjust the weightage for each assessment type (must total 100%)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <span className="text-sm font-medium">Total Weightage</span>
                <div className={`text-lg font-bold ${getTotalWeightage() === 100 ? 'text-green-600' : getTotalWeightage() > 100 ? 'text-red-600' : 'text-orange-600'}`}>
                  {getTotalWeightage()}%
                  {getTotalWeightage() !== 100 && (
                    <span className="ml-2 text-xs font-normal">
                      {getTotalWeightage() > 100 ? '(exceeds 100%)' : '(must equal 100%)'}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Resume Screening</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[weightages.resume]}
                      onValueChange={(value) => handleWeightageChange("resume", value[0])}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{weightages.resume}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Quiz Assessment</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[weightages.quiz]}
                      onValueChange={(value) => handleWeightageChange("quiz", value[0])}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{weightages.quiz}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Interview</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[weightages.interview]}
                      onValueChange={(value) => handleWeightageChange("interview", value[0])}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right">{weightages.interview}%</span>
                  </div>
                </div>
              </div>

              {!isWeightageValid() && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <span className="text-red-600 dark:text-red-400 text-sm">
                    ⚠️ The total weightage must equal exactly 100%. Please adjust the values.
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={!isWeightageValid() || saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save All Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}