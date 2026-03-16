// Speech-to-Text Hook using Web Speech API
// Browser-native speech recognition (Chrome/Edge)

import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState<boolean | null>(null); // null = checking
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const manuallyStoppedRef = useRef(false); // Track if user manually stopped
  
  // Use refs for callbacks to avoid stale closure issue
  const onResultRef = useRef(options.onResult);
  const onErrorRef = useRef(options.onError);
  const onEndRef = useRef(options.onEnd);

  // Keep refs updated with latest callbacks
  useEffect(() => {
    onResultRef.current = options.onResult;
    onErrorRef.current = options.onError;
    onEndRef.current = options.onEnd;
  }, [options.onResult, options.onError, options.onEnd]);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    console.log('[STT] Checks for Speech Recognition:', {
        SpeechRecognition: !!(window as any).SpeechRecognition,
        webkitSpeechRecognition: !!(window as any).webkitSpeechRecognition,
        Final: !!SpeechRecognition
    });

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      
      recognition.continuous = options.continuous ?? true;
      recognition.interimResults = options.interimResults ?? true;
      recognition.lang = options.lang || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        console.log('[STT] Speech recognition started');
      };

      // Diagnostic: Audio detection events
      recognition.onaudiostart = () => {
        console.log('[STT] Audio capturing started - microphone is receiving audio');
      };

      recognition.onaudioend = () => {
        console.log('[STT] Audio capturing ended');
      };

      recognition.onsoundstart = () => {
        console.log('[STT] Sound detected - you are speaking!');
      };

      recognition.onsoundend = () => {
        console.log('[STT] Sound ended - silence detected');
      };

      recognition.onspeechstart = () => {
        console.log('[STT] Speech detected - recognizable speech is being heard');
      };

      recognition.onspeechend = () => {
        console.log('[STT] Speech ended');
      };

      recognition.onresult = (event: any) => {
        console.log('[STT] === RESULT EVENT FIRED ===');
        console.log('[STT] Event details:', {
          resultIndex: event.resultIndex,
          resultsLength: event.results.length,
          results: Array.from(event.results).map((r: any, i: number) => ({
            index: i,
            isFinal: r.isFinal,
            transcript: r[0]?.transcript,
            confidence: r[0]?.confidence
          }))
        });

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const resultTranscript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += resultTranscript + ' ';
          } else {
            interim += resultTranscript;
          }
        }

        console.log('[STT] Parsed result:', { interim, final });

        if (final) {
          const newFinalTranscript = finalTranscriptRef.current + final;
          finalTranscriptRef.current = newFinalTranscript;
          setTranscript(newFinalTranscript.trim());
          console.log('[STT] Calling onResult with FINAL:', newFinalTranscript.trim());
          onResultRef.current?.(newFinalTranscript.trim(), true);
        }

        setInterimTranscript(interim);
        if (interim && !final) {
          console.log('[STT] Calling onResult with INTERIM:', interim);
          onResultRef.current?.(interim, false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('[STT] Speech recognition error:', event.error, event);
        const errorMessage = getErrorMessage(event.error);
        setError(errorMessage);
        setIsListening(false);
        onErrorRef.current?.(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
        const wasManualStop = manuallyStoppedRef.current;
        console.log('[STT] Speech recognition ended.', {
          finalTranscript: finalTranscriptRef.current || '(empty)',
          wasManualStop
        });
        // Only call onEnd if NOT manually stopped (let the page decide whether to restart)
        if (!wasManualStop) {
          onEndRef.current?.();
        }
        // Reset the flag for next time
        manuallyStoppedRef.current = false;
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []); // Empty dependency array - only initialize once

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not supported or not initialized');
      return;
    }

    try {
        finalTranscriptRef.current = '';
        manuallyStoppedRef.current = false; // Reset manual stop flag
        setTranscript('');
        setInterimTranscript('');
        setError(null);
        console.log('[STT] Starting recognition...');
        // Sometimes isListening state lags, so we try-catch the start
        recognitionRef.current.start();
    } catch (error: any) {
        if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
            setError('Microphone permission denied.');
        } else if (error.name === 'InvalidStateError' || error.message.includes('already started')) {
            console.log('Recognition already started (ignore)');
            setIsListening(true);
        } else {
            console.error('Error starting recognition:', error);
            setError('Failed to start speech recognition');
        }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        manuallyStoppedRef.current = true; // Mark as manual stop
        console.log('[STT] Manually stopping recognition...');
        recognitionRef.current.stop();
      } catch (error: any) {
        console.error('Error stopping recognition:', error);
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

function getErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return 'No speech detected. Please try again.';
    case 'audio-capture':
      return 'No microphone found. Please check your device.';
    case 'not-allowed':
      return 'Microphone permission denied. Please allow microphone access.';
    case 'network':
      return 'Network error occurred. Please check your connection.';
    case 'aborted':
      return 'Speech recognition was aborted.';
    default:
      return `Speech recognition error: ${error}`;
  }
}

