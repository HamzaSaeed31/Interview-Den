"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, AlertCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const questions = [
  {
    id: 1,
    question: "I enjoy working in a team environment",
    scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  },
  {
    id: 2,
    question: "I prefer to work independently",
    scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  },
  {
    id: 3,
    question: "I am comfortable taking on leadership roles",
    scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  },
  {
    id: 4,
    question: "I adapt well to changing situations",
    scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  },
  {
    id: 5,
    question: "I prefer structured and predictable work environments",
    scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
  }
];

export default function PersonalityAssessmentPage() {
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isRunning, setIsRunning] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleStopTest = () => {
    setShowConfirmation(true);
  };

  const handleConfirmStop = () => {
    setIsRunning(false);
    setShowConfirmation(false);
  };

  const handleCancelStop = () => {
    setShowConfirmation(false);
  };

  const handleAnswerSelect = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Personality Assessment</h1>
        <p className="text-muted-foreground">
          Help us understand your work style and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personality Assessment Test</CardTitle>
          <CardDescription>
            Please rate how strongly you agree or disagree with each statement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-lg font-medium">{formatTime(timeLeft)}</span>
            </div>
            <Progress value={(timeLeft / (30 * 60)) * 100} className="w-[200px]" />
          </div>

          {showConfirmation ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stop Test?</AlertTitle>
              <AlertDescription>
                Are you sure you want to stop the test? This action cannot be undone.
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Question {currentQuestion + 1} of {questions.length}</h3>
                  <span className="text-sm text-muted-foreground">
                    {answers[currentQuestion] !== undefined ? "Answered" : "Not answered"}
                  </span>
                </div>
                <p className="text-lg">{questions[currentQuestion].question}</p>
                <div className="space-y-4">
                  <Slider
                    value={[answers[currentQuestion] ?? 2]}
                    onValueChange={(value) => handleAnswerSelect(questions[currentQuestion].id, value[0])}
                    min={0}
                    max={4}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    {questions[currentQuestion].scale.map((label, index) => (
                      <span key={index}>{label}</span>
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
                <Button
                  onClick={handleNextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleStopTest}>
            Stop Test
          </Button>
          <Button>Submit Assessment</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 