"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Loader2, CheckCircle2, AlertCircle, Play, Pause } from 'lucide-react';
import { useScreening } from '@/app/context/screening-context';
import { createClient } from '@/utils/supabase/client';
import { InterviewSession, FinalContext, InterviewEvaluation } from '@/lib/interview-api';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useWebSpeechTTS } from '@/hooks/use-web-speech-tts';
import InterviewAvatar, { Avatar2D } from './components/InterviewAvatar';
import TranscriptDisplay from './components/TranscriptDisplay';
// Import microphone test utility - enables testMic() in browser console
import '@/utils/test-microphone';

type InterviewState = 'not_started' | 'starting' | 'in_progress' | 'finished' | 'grading' | 'completed' | 'error';

// Loading fallback for Suspense
function InterviewLoading() {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Loading Interview...</h2>
        <p className="text-muted-foreground">Preparing your interview session</p>
      </CardContent>
    </Card>
  );
}

// Main export with Suspense wrapper
export default function InterviewPage() {
  return (
    <Suspense fallback={<InterviewLoading />}>
      <InterviewPageContent />
    </Suspense>
  );
}

function InterviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams?.get('jobId');
  const supabase = createClient();
  const { updateProgress } = useScreening();

  // Web Speech API TTS - instant, no network latency
  const tts = useWebSpeechTTS({
    onEnded: () => {
      // Automatically start listening for candidate's response
      if (state === 'in_progress') {
        setTimeout(() => speechRecognition.startListening(), 300); // Reduced delay for faster response
      }
    },
    rate: 1.0,  // Normal speed (can be 0.1 to 10)
    pitch: 1.0, // Normal pitch (can be 0 to 2)
  });

  // Interview state
  const [state, setState] = useState<InterviewState>('not_started');
  const [interviewSession] = useState(() => new InterviewSession());
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');

  // STT setup - use continuous mode to keep listening
  const speechRecognition = useSpeechRecognition({
    continuous: true,  // Keep listening until explicitly stopped
    interimResults: true,
    onResult: (transcript, isFinal) => {
      console.log('[Interview] STT Result:', { transcript, isFinal });
      if (isFinal && transcript.trim()) {
        handleCandidateResponse(transcript);
      } else {
        setInterimTranscript(transcript);
      }
    },
    onError: (err) => {
      console.error('[Interview] Speech recognition error:', err);
      // Don't show mic error immediately, just log
    },
    onEnd: () => {
      // Auto-restart listening if we're still in interview and AI isn't speaking
      console.log('[Interview] STT ended, state:', state, 'tts.isPlaying:', tts.isPlaying);
      if (state === 'in_progress' && !tts.isPlaying) {
        console.log('[Interview] Auto-restarting speech recognition...');
        setTimeout(() => speechRecognition.startListening(), 300);
      }
    },
  });

  // Check browser support - only set error when we've confirmed it's not supported
  useEffect(() => {
    // isSupported is null initially while checking, true if supported, false if not
    if (speechRecognition.isSupported === false) {
      console.log('[Interview] Speech recognition confirmed NOT supported');
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    } else if (speechRecognition.isSupported === true) {
      console.log('[Interview] Speech recognition confirmed SUPPORTED');
    }
  }, [speechRecognition.isSupported]);

  // Start interview
  const startInterview = useCallback(async () => {
    if (!jobId) {
      setError('No job ID provided');
      return;
    }

    setState('starting');
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch application data (resume and job)
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select(`
          resume_parsed_data,
          jobs!inner (
            description,
            requirements,
            title
          )
        `)
        .eq('candidate_id', user.id)
        .eq('job_id', jobId)
        .single();

      if (appError || !application) {
        throw new Error('Application not found');
      }

      const jobJSON = {
        job_title: application.jobs.title,
        role_description: application.jobs.description,
        skills_required: {
          technical_skills: application.jobs.requirements || [],
          soft_skills: []
        }
      };

      const resumeJSON = application.resume_parsed_data;

      // Start interview session
      const greeting = await interviewSession.start(jobJSON, resumeJSON);

      // Speak greeting
      tts.speak(greeting);

      setState('in_progress');

      updateProgress(jobId, 'interview', {
        session_id: interviewSession.getSessionId(),
        completed: false,
      });

    } catch (err: any) {
      console.error('Error starting interview:', err);
      setError(err.message || 'Failed to start interview');
      setState('error');
    }
  }, [jobId, supabase, interviewSession, tts, updateProgress]);

  // Handle candidate's response
  const handleCandidateResponse = useCallback(async (response: string) => {
    if (!response.trim() || state !== 'in_progress') return;

    setInterimTranscript('');
    speechRecognition.resetTranscript();
    tts.stop(); // Stop any previous speech

    try {
      const { message, isFinished } = await interviewSession.sendMessage(response);

      // Speak AI's response
      tts.speak(message);

      if (isFinished) {
        setState('finished');
        speechRecognition.stopListening();

        // Grade the interview
        setState('grading');
        const grading = await interviewSession.getGrading();
        setEvaluation(grading);

        // Save results to database
        await saveInterviewResults(grading);

        setState('completed');
      }

    } catch (err: any) {
      console.error('Error processing response:', err);
      setError(err.message || 'Failed to process your response');
    }
  }, [state, interviewSession, tts, speechRecognition]);

  // Save results to database
  const saveInterviewResults = async (grading: InterviewEvaluation) => {
    if (!jobId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const finalContext = interviewSession.getFinalContext();

      // Fetch the job's stage_weightages and application's previous scores
      const { data: applicationData } = await supabase
        .from('applications')
        .select(`
          ats_score,
          resume_screening,
          quiz_results,
          jobs!inner (
            custom_fields
          )
        `)
        .eq('candidate_id', user.id)
        .eq('job_id', jobId)
        .single();

      // Calculate weighted score
      let weightedScore = 0;
      if (applicationData) {
        const stageWeightages = (applicationData.jobs as any)?.custom_fields?.stage_weightages || {};
        const weights = {
          resume: stageWeightages.resume_screening || 40,
          quiz: stageWeightages.quiz || 30,
          interview: stageWeightages.interview || 30
        };

        const resumeScore = applicationData.resume_screening?.match_score || applicationData.ats_score || 0;
        const quizScore = applicationData.quiz_results?.score || 0;
        const interviewScore = grading.evaluation.overall_score || 0;

        // Calculate weighted score (all stages complete at this point)
        weightedScore = Math.round(
          (resumeScore * weights.resume +
            quizScore * weights.quiz +
            interviewScore * weights.interview) / 100
        );

        console.log('Calculated weighted score:', {
          resumeScore, quizScore, interviewScore, weights, weightedScore
        });
      }

      await supabase
        .from('applications')
        .update({
          interview_results: {
            session_id: interviewSession.getSessionId(),
            transcript: interviewSession.getTranscript(),
            evaluation: grading.evaluation,
            final_context: finalContext,
            completed_at: new Date().toISOString(),
          },
          current_stage: 'completed',
          status: grading.evaluation.overall_score >= 70 ? 'qualified' : 'under_review',
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          weighted_score: weightedScore, // Store the calculated weighted score
        })
        .eq('candidate_id', user.id)
        .eq('job_id', jobId);

      // Update screening progress
      updateProgress(jobId, 'interview', {
        session_id: interviewSession.getSessionId(),
        transcript: interviewSession.getTranscript(),
        completed: true,
        evaluation: grading.evaluation,
      });

      console.log('Interview results saved successfully with weighted_score:', weightedScore);
    } catch (err) {
      console.error('Error saving interview results:', err);
    }
  };


  // Render based on state
  if (!jobId) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">No job ID provided</p>
          <Button onClick={() => router.push('/candidate/jobs')}>
            Back to Jobs
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (state === 'error' || error) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Interview Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => router.push('/candidate/jobs')}>
              Back to Jobs
            </Button>
            <Button onClick={() => {
              setError(null);
              setState('not_started');
            }}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Completed state
  if (state === 'completed' && evaluation) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            <div>
              <CardTitle>Interview Completed!</CardTitle>
              <CardDescription>Your interview has been evaluated</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score */}
          <div className="text-center p-6 bg-gradient-to-br from-violet-50 to-blue-50 rounded-lg">
            <div className="text-5xl font-bold text-violet-600 mb-2">
              {evaluation.evaluation.overall_score}%
            </div>
            <p className="text-lg font-medium text-slate-700">Overall Score</p>
            <Badge
              variant={evaluation.evaluation.overall_score >= 70 ? 'default' : 'secondary'}
              className="mt-2"
            >
              {evaluation.evaluation.hiring_recommendation}
            </Badge>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-green-700">✓ Strengths</h3>
            <ul className="space-y-2">
              {evaluation.evaluation.strengths.map((strength, idx) => (
                <li key={idx} className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div>
            <h3 className="font-semibold text-lg mb-3 text-orange-700">⚠ Areas for Improvement</h3>
            <ul className="space-y-2">
              {evaluation.evaluation.weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push('/candidate/jobs')}>
            Back to Jobs
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Not started state
  if (state === 'not_started') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Interview</CardTitle>
          <CardDescription>
            Have a conversation with our AI interviewer about your skills and experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Before you begin:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Find a quiet place with good internet connection</li>
                <li>Allow microphone access when prompted</li>
                <li>Speak clearly and naturally</li>
                <li>The interview will take 10-15 minutes</li>
              </ul>
            </AlertDescription>
          </Alert>

          {!speechRecognition.isSupported && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Speech recognition is not supported in your browser. Please use Chrome or Edge.
              </AlertDescription>
            </Alert>
          )}

        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={startInterview}
            disabled={state === 'starting'}
          >
            {state === 'starting' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Interview...
              </>
            ) : (
              'Start Interview'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // In progress / grading state
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
      {/* Left: Avatar */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Interviewer</CardTitle>
              <CardDescription>
                {state === 'grading' ? 'Evaluating your responses...' : 'Listen and respond naturally'}
              </CardDescription>
            </div>
            <Badge variant={tts.isPlaying ? 'default' : speechRecognition.isListening ? 'secondary' : 'outline'}>
              {tts.isPlaying ? 'Speaking' : speechRecognition.isListening ? 'Listening' : 'Idle'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="h-full w-full">
            <InterviewAvatar
              isSpeaking={tts.isPlaying}
              audioUrl={null}
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {/* Microphone status */}
          {/* Microphone status and Controls */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-md">
              <div className="flex items-center gap-2">
                {speechRecognition.isListening ? (
                  <>
                    <Mic className="h-5 w-5 text-red-500 animate-pulse" />
                    <span className="text-red-600 font-medium text-sm">Listening...</span>
                  </>
                ) : (
                  <>
                    <MicOff className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-500 font-medium text-sm">Mic is Off</span>
                  </>
                )}
              </div>

              <Button
                size="sm"
                variant={speechRecognition.isListening ? "destructive" : "default"}
                onClick={() => {
                  if (speechRecognition.isListening) {
                    speechRecognition.stopListening();
                  } else {
                    speechRecognition.startListening();
                  }
                }}
                disabled={tts.isPlaying || state === 'grading'}
              >
                {speechRecognition.isListening ? 'Stop' : 'Start Mic'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Mic auto-starts after AI speaks, or toggle manually above.
            </p>
          </div>

          {state === 'grading' && (
            <div className="w-full space-y-2">
              <Progress value={undefined} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Analyzing your interview performance...
              </p>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Right: Transcript */}
      <TranscriptDisplay
        transcript={interviewSession.getTranscript()}
        currentInterimText={interimTranscript}
      />
    </div>
  );
}

