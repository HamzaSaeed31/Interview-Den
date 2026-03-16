"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, AlertCircle, Video, Mic, MicOff, VideoOff, CheckCircle2 } from "lucide-react";

const questions = [
  {
    id: 1,
    question: "Tell us about yourself and your experience.",
    timeLimit: 120 // 2 minutes
  },
  {
    id: 2,
    question: "What interests you about this position?",
    timeLimit: 90 // 1.5 minutes
  },
  {
    id: 3,
    question: "Describe a challenging project you worked on and how you handled it.",
    timeLimit: 150 // 2.5 minutes
  }
];

export default function VideoInterviewPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(questions[0].timeLimit);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [recordedAnswers, setRecordedAnswers] = useState<{ [key: number]: boolean }>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleStopRecording();
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        // Handle recorded data
        console.log("Recording data available:", event.data);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsRunning(true);
      setTimeLeft(questions[currentQuestion].timeLimit);
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsRunning(false);
      setRecordedAnswers(prev => ({
        ...prev,
        [currentQuestion]: true
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(questions[currentQuestion + 1].timeLimit);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setTimeLeft(questions[currentQuestion - 1].timeLimit);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Video Interview</h1>
        <p className="text-muted-foreground">
          Record your answers to the following questions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Interview Test</CardTitle>
          <CardDescription>
            Please record your answers to each question within the time limit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-lg font-medium">{formatTime(timeLeft)}</span>
            </div>
            <Progress 
              value={(timeLeft / questions[currentQuestion].timeLimit) * 100} 
              className="w-[200px]" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Question {currentQuestion + 1} of {questions.length}</h3>
                {recordedAnswers[currentQuestion] && (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Recorded
                  </span>
                )}
              </div>
              <p className="text-lg">{questions[currentQuestion].question}</p>
              <p className="text-sm text-muted-foreground">
                Time limit: {Math.floor(questions[currentQuestion].timeLimit / 60)} minutes
              </p>
            </div>

            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleVideo}
                  className={!isVideoEnabled ? "bg-muted" : ""}
                >
                  {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleAudio}
                  className={!isAudioEnabled ? "bg-muted" : ""}
                >
                  {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
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
            {isRecording ? (
              <Button variant="destructive" onClick={handleStopRecording}>
                Stop Recording
              </Button>
            ) : (
              <Button onClick={startRecording} disabled={recordedAnswers[currentQuestion]}>
                Start Recording
              </Button>
            )}
            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestion === questions.length - 1 || !recordedAnswers[currentQuestion]}
            >
              Next
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setShowConfirmation(true)}>
            Exit Interview
          </Button>
          <Button disabled={Object.keys(recordedAnswers).length !== questions.length}>
            Submit Interview
          </Button>
        </CardFooter>
      </Card>

      {showConfirmation && (
        <Alert className="fixed top-4 right-4 w-96">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Exit Interview?</AlertTitle>
          <AlertDescription>
            Are you sure you want to exit? Your progress will be saved, but you'll need to complete the interview later.
          </AlertDescription>
          <div className="mt-4 flex gap-2">
            <Button variant="destructive" onClick={() => setShowConfirmation(false)}>
              Yes, Exit
            </Button>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
          </div>
        </Alert>
      )}
    </div>
  );
} 