"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useScreening } from "@/app/context/screening-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Editor from "@monaco-editor/react";

interface TestCase {
  input: any[];
  expected: any;
}

interface Problem {
  id: number;
  title: string;
  description: string;
  example: string;
  timeLimit: number;
}

interface TestResult {
  passed: boolean;
  input: any[];
  expected: any;
  actual: any;
  error?: string;
}

interface TechnicalProgress {
  currentProblem: number;
  code: string;
  timeLeft: number;
  testResults: TestResult[];
  completed?: boolean;
}

const problems: Problem[] = [
  {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
    timeLimit: 30 * 60, // 30 minutes
  },
  {
    id: 2,
    title: "Reverse String",
    description: "Write a function that reverses a string. The input string is given as an array of characters s.",
    example: "Input: s = [\"h\",\"e\",\"l\",\"l\",\"o\"]\nOutput: [\"o\",\"l\",\"l\",\"e\",\"h\"]",
    timeLimit: 20 * 60, // 20 minutes
  },
  {
    id: 3,
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters \"(\", \")\", \"{\", \"}\", \"[\" and \"]\", determine if the input string is valid.",
    example: "Input: s = \"()[]{}\"\nOutput: true",
    timeLimit: 25 * 60, // 25 minutes
  },
];

export default function TechnicalAssessmentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getProgress, updateProgress } = useScreening();
  const jobId = searchParams?.get('jobId') || '';

  const [currentProblem, setCurrentProblem] = useState(0);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(problems[0]?.timeLimit || 0);
  const [isRunning, setIsRunning] = useState(true);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Use refs to track the latest state values
  const currentProblemRef = useRef(currentProblem);
  const codeRef = useRef(code);
  const timeLeftRef = useRef(timeLeft);
  const testResultsRef = useRef(testResults);
  const isRunningRef = useRef(isRunning);

  // Update refs when state changes
  useEffect(() => {
    currentProblemRef.current = currentProblem;
    codeRef.current = code;
    timeLeftRef.current = timeLeft;
    testResultsRef.current = testResults;
    isRunningRef.current = isRunning;
  }, [currentProblem, code, timeLeft, testResults, isRunning]);

  // Load saved progress only once when component mounts
  useEffect(() => {
    if (jobId) {
      const progress = getProgress(jobId);
      if (progress?.progress?.technical) {
        const { currentProblem: savedProblem, code: savedCode, timeLeft: savedTime, testResults: savedResults } = progress.progress.technical;
        setCurrentProblem(savedProblem || 0);
        setCode(savedCode || '');
        setTimeLeft(savedTime || (problems[0]?.timeLimit || 0));
        setTestResults(savedResults || []);
      }
    }
  }, [jobId]);

  // Save progress when relevant state changes
  useEffect(() => {
    if (jobId && !isRunningRef.current) {
      updateProgress(jobId, 'technical', {
        currentProblem: currentProblemRef.current,
        code: codeRef.current,
        timeLeft: timeLeftRef.current,
        testResults: testResultsRef.current,
      });
    }
  }, [jobId, isRunningRef.current]);

  // Timer effect
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

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleRunTests = () => {
    // Mock test results
    const results = [
      {
        passed: Math.random() > 0.5,
        input: [2, 7, 11, 15],
        expected: [0, 1],
        actual: [0, 1],
      },
      {
        passed: Math.random() > 0.5,
        input: [3, 2, 4],
        expected: [1, 2],
        actual: [1, 2],
      },
    ];
    setTestResults(results);
  };

  const handleSubmit = () => {
    if (jobId) {
      setIsRunning(false);
      updateProgress(jobId, 'technical', {
        currentProblem: currentProblemRef.current,
        code: codeRef.current,
        timeLeft: timeLeftRef.current,
        testResults: testResultsRef.current,
        completed: true,
      });
      router.push(`/candidate/screening/video?jobId=${jobId}`);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setShowStopDialog(true);
  };

  const handleConfirmStop = () => {
    setShowStopDialog(false);
    router.push('/candidate/dashboard');
  };

  const handleCancelStop = () => {
    setIsRunning(true);
    setShowStopDialog(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Technical Assessment</h1>
          <div className="flex items-center gap-4">
            <span className="text-lg font-medium">{formatTime(timeLeft)}</span>
            <Button variant="outline" onClick={handleStop}>
              Stop Test
            </Button>
          </div>
        </div>

        {problems[currentProblem] && (
          <>
            <Progress value={(timeLeft / problems[currentProblem].timeLimit) * 100} className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">{problems[currentProblem].title}</h2>
                <p className="mb-4">{problems[currentProblem].description}</p>
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <pre className="whitespace-pre-wrap">{problems[currentProblem].example}</pre>
                </div>
              </div>

              <div>
                <textarea
                  value={code}
                  onChange={handleCodeChange}
                  className="w-full h-64 p-4 border rounded-lg font-mono"
                  placeholder="Write your code here..."
                />
                <div className="mt-4 flex gap-4">
                  <Button onClick={handleRunTests}>Run Tests</Button>
                  <Button variant="outline" onClick={handleSubmit}>
                    Submit
                  </Button>
                </div>

                {testResults.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Test Results</h3>
                    {testResults.map((result, index) => (
                      <Alert key={index} variant={result.passed ? 'default' : 'destructive'} className="mb-2">
                        <AlertDescription>
                          Test {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      <AlertDialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop the Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved, and you can resume later. Are you sure you want to stop?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelStop}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStop}>Stop Test</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 