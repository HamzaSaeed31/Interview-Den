"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileText, Loader2, CheckCircle2, Star } from "lucide-react";
import { useScreening } from "@/app/context/screening-context";
import { createClient } from "@/utils/supabase/client";
import { formatJobForParsing, parseJobText, matchResumeWithJob, ParsedResume, MatchResult } from "@/lib/resume-api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StoredResume {
  id: string;
  name: string;
  parsed_data: ParsedResume;
  uploaded_at: string;
  is_default: boolean;
  file_size?: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  type: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  benefits?: string[];
}

export default function ResumeScreeningPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("jobId");
  const router = useRouter();
  const supabase = createClient();
  const { updateProgress } = useScreening();
  
  const [uploadedResumes, setUploadedResumes] = useState<StoredResume[]>([]);
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [jobData, setJobData] = useState<Job | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    if (!jobId) {
      router.push("/candidate/jobs");
      return;
    }
    
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to continue");
        router.push("/login");
        return;
      }

      // Fetch candidate's resumes
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .select('resumes, default_resume_id')
        .eq('id', user.id)
        .single();

      if (candidateError && candidateError.code !== 'PGRST116') {
        throw candidateError;
      }

      if (candidate?.resumes && Array.isArray(candidate.resumes)) {
        setUploadedResumes(candidate.resumes as StoredResume[]);
        
        // Auto-select default resume if available
        const defaultResume = (candidate.resumes as StoredResume[]).find(r => r.is_default);
        if (defaultResume) {
          setSelectedResume(defaultResume.id);
        }
      }

      // Fetch job details
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('id, title, description, requirements, type, location, salary_min, salary_max, currency, benefits')
        .eq('id', jobId)
        .single();

      if (jobError) throw jobError;

      setJobData(job as Job);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResume(resumeId);
    setMatchResult(null); // Reset match result when changing resume
  };

  const handleSubmit = async () => {
    if (!jobId || !selectedResume || !jobData) {
      toast.error('Missing required data');
      return;
    }

    try {
      setMatching(true);
      toast.info('Analyzing your resume against the job requirements...');

      // Get selected resume data
      const resume = uploadedResumes.find(r => r.id === selectedResume);
      if (!resume) {
        toast.error('Selected resume not found');
        return;
      }

      // Format job data for API
      const jobText = formatJobForParsing(jobData);

      // Parse job description
      const parsedJob = await parseJobText(jobText);

      // Match resume with job
      const match = await matchResumeWithJob(resume.parsed_data, parsedJob);

      setMatchResult(match);

      // Check if user passed
      if (match.pass_fail.status === "PASS") {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Create or update application record
        const { error: appError } = await supabase
          .from('applications')
          .upsert({
            candidate_id: user.id,
            job_id: jobId,
            resume_url: resume.name,
            resume_parsed_data: resume.parsed_data,
            ats_score: match.match_score,
            status: 'screening',
            current_stage: 'quiz',
            resume_screening: {
              match_score: match.match_score,
              skill_match_score: match.skill_match_score,
              experience_match_score: match.experience_match_score,
              missing_skills: match.missing_skills,
              comments: match.comments,
              pass_fail: match.pass_fail
            },
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'candidate_id,job_id'
          });

        if (appError) throw appError;

        // Update screening progress
        updateProgress(jobId, "resume", {
          answers: [selectedResume],
          timeLeft: 30 * 60,
          completed: true
        });

        toast.success('Resume screening completed! Proceeding to quiz...');
        
        // Navigate to quiz after a short delay to show success message
        setTimeout(() => {
          router.push(`/candidate/screening/quiz?jobId=${jobId}`);
        }, 2000);
      } else {
        toast.error('Resume did not meet the minimum requirements');
      }
    } catch (error: any) {
      console.error('Error in resume screening:', error);
      toast.error(error.message || 'Failed to process resume screening');
    } finally {
      setMatching(false);
    }
  };

  const handleStopTest = () => {
    if (!jobId) {
      console.error('No jobId provided');
      return;
    }

    if (selectedResume) {
      try {
        updateProgress(jobId, "resume", {
          answers: [selectedResume],
          timeLeft: 30 * 60,
          completed: false
        });
        setShowConfirmation(true);
      } catch (err) {
        console.error('Error in handleStopTest:', err);
      }
    }
  };

  const handleConfirmStop = () => {
    setShowConfirmation(false);
    router.push("/candidate/jobs");
  };

  const handleCancelStop = () => {
    setShowConfirmation(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600 mx-auto" />
          <p className="text-sm text-muted-foreground">Loading resume screening...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Info Card */}
      {jobData && (
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border-violet-200">
          <CardHeader>
            <CardTitle className="text-xl">{jobData.title}</CardTitle>
            <CardDescription className="text-slate-700 dark:text-slate-300">
              {jobData.location} • {jobData.type}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resume Screening</CardTitle>
          <CardDescription>
            Select a resume to analyze against the job requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showConfirmation ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stop Application?</AlertTitle>
              <AlertDescription>
                Are you sure you want to stop the application process? You can resume later.
              </AlertDescription>
              <div className="mt-4 flex gap-2">
                <Button variant="destructive" onClick={handleConfirmStop}>
                  Yes, Stop Application
                </Button>
                <Button variant="outline" onClick={handleCancelStop}>
                  Cancel
                </Button>
              </div>
            </Alert>
          ) : (
            <>
              <div className="space-y-4">
                {uploadedResumes.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Resumes Found</AlertTitle>
                    <AlertDescription>
                      Please upload a resume in your{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => router.push("/candidate/cv")}
                      >
                        CV page
                      </Button>
                      {" "}before applying for jobs.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid gap-4">
                    {uploadedResumes.map((resume) => (
                      <Card
                        key={resume.id}
                        className={`cursor-pointer transition-all ${
                          selectedResume === resume.id
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950 border-2"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleResumeSelect(resume.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <FileText className="h-8 w-8 text-muted-foreground mt-1" />
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{resume.name}</h3>
                                {resume.is_default && (
                                  <Badge variant="default" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                  <span>{resume.parsed_data.Name}</span>
                                </div>
                                <div>
                                  {resume.parsed_data.Skills?.length || 0} skills
                                </div>
                                <div>
                                  {resume.parsed_data.Experience?.["Total Years"] || 0} years exp.
                                </div>
                                <div>
                                  {new Date(resume.uploaded_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Match Results */}
              {matchResult && (
                <Alert className={
                  matchResult.pass_fail.status === "PASS"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }>
                  <CheckCircle2 className={
                    matchResult.pass_fail.status === "PASS"
                      ? "h-4 w-4 text-green-600"
                      : "h-4 w-4 text-red-600"
                  } />
                  <AlertTitle className={
                    matchResult.pass_fail.status === "PASS"
                      ? "text-green-900"
                      : "text-red-900"
                  }>
                    {matchResult.pass_fail.status === "PASS" ? "✅ Screening Passed!" : "❌ Screening Failed"}
                  </AlertTitle>
                  <AlertDescription className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Match</span>
                        <span className="text-lg font-bold">{matchResult.match_score}%</span>
                      </div>
                      <Progress value={matchResult.match_score} className="h-2" />
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Skill Match</p>
                          <p className="text-lg font-semibold">{matchResult.skill_match_score}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Experience Match</p>
                          <p className="text-lg font-semibold">{matchResult.experience_match_score}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-sm font-medium">Feedback:</p>
                      <p className="text-sm">{matchResult.pass_fail.feedback_message}</p>
                    </div>

                    {matchResult.missing_skills.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <p className="text-sm font-medium">Missing Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {matchResult.missing_skills.slice(0, 5).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {matchResult.missing_skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{matchResult.missing_skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleStopTest} disabled={matching}>
            Stop Application
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedResume || showConfirmation || matching || uploadedResumes.length === 0}
          >
            {matching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : matchResult && matchResult.pass_fail.status === "PASS" ? (
              "Continue to Quiz"
            ) : (
              "Analyze Resume"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 