"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useScreening } from "@/app/context/screening-context";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";

const questions = [
  {
    id: 1,
    question: "I prefer working in a team rather than alone.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  },
  {
    id: 2,
    question: "I am comfortable taking on leadership roles.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  },
  {
    id: 3,
    question: "I enjoy solving complex problems.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  },
  {
    id: 4,
    question: "I prefer a structured work environment.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  },
  {
    id: 5,
    question: "I am comfortable with frequent changes in my work.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  }
];

export default function QuizPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const router = useRouter();
  const { progress: screeningProgress, updateProgress } = useScreening();
  
  if (!jobId) {
    router.push("/candidate/jobs");
    return null;
  }

  const jobProgress = screeningProgress[jobId];
  const quizProgress = jobProgress?.progress.quiz;
  const [answers, setAnswers] = useState<string[]>(quizProgress?.answers || []);
  const [timeLeft, setTimeLeft] = useState(quizProgress?.timeLeft || 15 * 60); // 15 minutes
  const [isRunning, setIsRunning] = useState(!quizProgress?.completed);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value.toString();
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (jobId) {
      updateProgress(jobId, "quiz", {
        answers,
        timeLeft,
        completed: true
      });
      setIsRunning(false);
      router.push(`/candidate/screening/technical?jobId=${jobId}`);
    }
  };

  const handleStopTest = () => {
    if (jobId) {
      updateProgress(jobId, "quiz", {
        answers,
        timeLeft,
        completed: false
      });
      setShowConfirmation(true);
    }
  };

  const handleConfirmStop = () => {
    setIsRunning(false);
    setShowConfirmation(false);
    router.push("/candidate/jobs");
  };

  const handleCancelStop = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
          <CardDescription>
            Please answer the following questions honestly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-lg font-medium">{formatTime(timeLeft)}</span>
            </div>
            <Progress value={(timeLeft / (15 * 60)) * 100} className="w-[200px]" />
          </div>

          {showConfirmation ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stop Test?</AlertTitle>
              <AlertDescription>
                Are you sure you want to stop the test? Your progress will be saved, but you'll need to complete it later.
              </AlertDescription>
              <div className="mt-4 flex gap-2">
                <Button variant="destructive" onClick={handleConfirmStop}>
                  Yes, Stop Test
                </Button>
                <Button variant="outline" onClick={handleCancelStop}>
                  Cancel
                </Button>
              </div>
            </Alert>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">
                  Question {currentQuestion + 1} of {questions.length}
                </h3>
                <p className="text-lg">{questions[currentQuestion].question}</p>
                <div className="pt-4">
                  <Slider
                    value={[Number(answers[currentQuestion] || 0)]}
                    onValueChange={([value]) => handleAnswerChange(value)}
                    min={0}
                    max={4}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    {questions[currentQuestion].options.map((option, index) => (
                      <span key={index}>{option}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                {currentQuestion === questions.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={!isRunning}>
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleStopTest}>
            Stop Test
          </Button>
          <div className="flex items-center gap-2">
            {answers.length} of {questions.length} questions answered
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 