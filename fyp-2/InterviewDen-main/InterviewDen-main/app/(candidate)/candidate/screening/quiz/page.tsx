"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, AlertCircle, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { useScreening } from "@/app/context/screening-context";
import { createClient } from "@/utils/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface QuizQuestion {
  question: string;
  options: {
    letter: string;
    text: string;
  }[];
  correct_answer: string;
}

interface QuizData {
  quiz_id: string;
  job_info: {
    job_title: string;
    level: string;
  };
  metadata: {
    question_count: number;
    level: string;
  };
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams?.get("jobId");
  const router = useRouter();
  const supabase = createClient();
  const { updateProgress } = useScreening();

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute per question
  const [isRunning, setIsRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (!jobId) {
      router.push("/candidate/jobs");
      return;
    }
    fetchQuiz();
  }, [jobId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const fetchQuiz = async () => {
    try {
      const { data: jobData, error } = await supabase
        .from("jobs")
        .select("custom_fields")
        .eq("id", jobId)
        .single();

      if (error) throw error;

      const generatedQuiz = jobData?.custom_fields?.generated_quiz;

      if (!generatedQuiz) {
        toast.error("No quiz available for this job");
        router.push("/candidate/jobs");
        return;
      }

      setQuizData(generatedQuiz);
      setIsRunning(true);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    // Auto-move to next question when time is up
    if (currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(60);
    } else {
      // Last question - submit quiz
      handleSubmit();
    }
  };

  const handleAnswerSelect = (answerLetter: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerLetter
    }));
  };

  const handleNext = () => {
    if (!answers[currentQuestionIndex]) {
      toast.error("Please select an answer before proceeding");
      return;
    }

    if (currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(60); // Reset timer for next question
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setTimeLeft(60);
    }
  };

  const calculateScore = () => {
    if (!quizData) return 0;

    let correctAnswers = 0;
    quizData.questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const percentage = (correctAnswers / quizData.questions.length) * 100;
    return Math.round(percentage);
  };

  const handleSubmit = async () => {
    setIsRunning(false);
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);

    // Update progress in context
    if (jobId) {
      updateProgress(jobId, "quiz", {
        answers: Object.values(answers),
        timeLeft: 0,
        completed: true,
        score: finalScore
      } as any);

      // Store quiz results in database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Update application with quiz results
        const passed = finalScore >= 70;
        const { error: updateError } = await supabase
          .from('applications')
          .update({
            quiz_results: {
              score: finalScore,
              answers: Object.values(answers),
              total_questions: quizData?.questions.length,
              completed_at: new Date().toISOString()
            },
            current_stage: passed ? 'interview' : 'rejected', // Only move to interview if passed
            status: passed ? 'qualified' : 'rejected', // Reject application if failed
            updated_at: new Date().toISOString()
          })
          .eq('candidate_id', user.id)
          .eq('job_id', jobId);

        if (updateError) {
          console.error("Error saving quiz results:", updateError);
        } else {
          console.log("Quiz results saved successfully");
        }
      } catch (error) {
        console.error("Error saving quiz results:", error);
      }
    }
  };

  const handleContinue = () => {
    // Navigate to interview step
    router.push(`/candidate/screening/interview?jobId=${jobId}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!quizData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Not Available</CardTitle>
          <CardDescription>
            No quiz has been generated for this position yet.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => router.push("/candidate/jobs")}>
            Back to Jobs
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (showResults) {
    const passed = score >= 70; // Assuming 70% is passing score

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Quiz Completed Successfully!
              </>
            ) : (
              <>
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Quiz Failed
              </>
            )}
          </CardTitle>
          <CardDescription>
            {passed ? 'You have completed the quiz assessment' : 'Your application has been rejected'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Your Score</CardDescription>
                <CardTitle className={`text-4xl ${passed ? 'text-green-600' : 'text-orange-600'}`}>
                  {score}%
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Questions Answered</CardDescription>
                <CardTitle className="text-4xl">
                  {Object.keys(answers).length}/{quizData.questions.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Status</CardDescription>
                <CardTitle className={`text-2xl ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {passed ? 'Passed' : 'Failed'}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {passed ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Great job!</AlertTitle>
              <AlertDescription className="text-green-800">
                You've passed the quiz assessment. Click continue to proceed to the next step.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-900">Quiz Failed - Application Rejected</AlertTitle>
              <AlertDescription className="text-red-800">
                Unfortunately, your score is below the required 70% passing threshold. Your application for this position has been rejected. You may apply for other positions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/candidate/jobs")}>
            {passed ? 'Back to Jobs' : 'Browse Other Jobs'}
          </Button>
          {passed && <Button onClick={handleContinue}>
            Continue to Interview
          </Button>}
        </CardFooter>
      </Card>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{quizData.job_info?.job_title || "Job"} - Quiz Assessment</CardTitle>
              <CardDescription>
                {quizData.metadata?.question_count || 0} questions • {quizData.metadata?.level || "N/A"}
              </CardDescription>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft <= 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
              <Clock className="h-5 w-5" />
              <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {showConfirmation ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Exit Quiz?</AlertTitle>
              <AlertDescription>
                Are you sure you want to exit? Your progress will not be saved.
              </AlertDescription>
              <div className="mt-4 flex gap-2">
                <Button variant="destructive" onClick={() => router.push("/candidate/jobs")}>
                  Yes, Exit Quiz
                </Button>
                <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                  Cancel
                </Button>
              </div>
            </Alert>
          ) : (
            <div className="space-y-6">
              <Card className="bg-slate-50 dark:bg-slate-900 border-2">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {currentQuestion.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[currentQuestionIndex] || ""}
                    onValueChange={handleAnswerSelect}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option) => (
                      <div
                        key={option.letter}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${answers[currentQuestionIndex] === option.letter
                          ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20'
                          : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                          }`}
                      >
                        <RadioGroupItem value={option.letter} id={`option-${option.letter}`} />
                        <Label
                          htmlFor={`option-${option.letter}`}
                          className="flex-1 cursor-pointer"
                        >
                          <span className="font-semibold mr-2">{option.letter}.</span>
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                  {Object.keys(answers).length} of {quizData.questions.length} answered
                </div>

                {currentQuestionIndex === quizData.questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!answers[currentQuestionIndex]}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!answers[currentQuestionIndex]}
                  >
                    Next Question
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            variant="ghost"
            onClick={() => setShowConfirmation(true)}
            className="text-red-600 hover:text-red-700"
          >
            Exit Quiz
          </Button>
          <div className="text-sm text-muted-foreground">
            {timeLeft <= 30 && (
              <span className="text-orange-600 font-medium">
                ⚠️ {timeLeft}s remaining for this question
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
