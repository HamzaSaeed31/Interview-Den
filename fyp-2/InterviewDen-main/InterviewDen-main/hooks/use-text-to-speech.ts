// Text-to-Speech Hook using Azure Cognitive Services
// Supports visemes for lip syncing

import { useState, useCallback, useRef, useEffect } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

export interface Viseme {
  visemeId: number; // 0-21 representing different mouth shapes
  audioOffset: number; // Time offset in 100-nanosecond units
  timeMs: number; // Converted to milliseconds for easier use
}

interface TTSOptions {
  subscriptionKey?: string;
  region?: string;
  voice?: string; // e.g., 'en-US-JennyNeural'
  onViseme?: (viseme: Viseme) => void;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  onError?: (error: string) => void;
}

export function useTextToSpeech(options: TTSOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [visemes, setVisemes] = useState<Viseme[]>([]);
  
  const synthesizerRef = useRef<sdk.SpeechSynthesizer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Get config from environment or options
  const subscriptionKey = options.subscriptionKey || process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY || '';
  const region = options.region || process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION || 'eastus';
  const voice = options.voice || 'en-US-JennyNeural'; // Neural voice for better quality

  useEffect(() => {
    if (!subscriptionKey || !region) {
      setError('Azure Speech credentials not configured');
      return;
    }

    try {
      // Initialize Azure Speech SDK
      const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
      speechConfig.speechSynthesisVoiceName = voice;
      
      // Use browser audio output
      const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
      
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      
      // Request viseme events
      speechConfig.setProperty(
        sdk.PropertyId.SpeechServiceResponse_RequestSentenceBoundary,
        'true'
      );

      synthesizerRef.current = synthesizer;
      setIsInitialized(true);
      setError(null);
    } catch (err: any) {
      console.error('Failed to initialize Azure TTS:', err);
      setError('Failed to initialize text-to-speech');
      setIsInitialized(false);
    }

    return () => {
      if (synthesizerRef.current) {
        synthesizerRef.current.close();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [subscriptionKey, region, voice]);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!isInitialized || !synthesizerRef.current) {
      setError('Text-to-speech not initialized');
      return Promise.reject(new Error('TTS not initialized'));
    }

    if (isSpeaking) {
      console.warn('Already speaking, canceling previous');
      cancel();
    }

    return new Promise((resolve, reject) => {
      const synthesizer = synthesizerRef.current!;
      const visemeList: Viseme[] = [];

      // Listen for viseme events
      synthesizer.visemeReceived = (s, e) => {
        const viseme: Viseme = {
          visemeId: e.visemeId,
          audioOffset: e.audioOffset,
          timeMs: e.audioOffset / 10000, // Convert to milliseconds
        };
        visemeList.push(viseme);
        options.onViseme?.(viseme);
      };

      // Start speaking
      synthesizer.speakTextAsync(
        text,
        (result) => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            setVisemes(visemeList);
            setIsSpeaking(false);
            options.onSpeakingEnd?.();
            resolve();
          } else if (result.reason === sdk.ResultReason.Canceled) {
            let errorMsg = 'Speech synthesis canceled';
            try {
              if (sdk.SpeechSynthesisCancellationDetails) {
                const cancellation = sdk.SpeechSynthesisCancellationDetails.fromResult(result);
                errorMsg += `: ${cancellation.reason}`;
                if (cancellation.errorDetails) {
                  errorMsg += ` - ${cancellation.errorDetails}`;
                }
              } else {
                 errorMsg += ' (Cancellation details unavailable)';
              }
            } catch (e) {
              console.warn('Error extracting cancellation details:', e);
            }
            console.error(errorMsg);
            setError(errorMsg);
            setIsSpeaking(false);
            options.onError?.(errorMsg);
            reject(new Error(errorMsg));
          }
          result.close();
        },
        (error) => {
          console.error('Speech synthesis error:', error);
          setError(error);
          setIsSpeaking(false);
          options.onError?.(error);
          reject(new Error(error));
        }
      );

      setIsSpeaking(true);
      setError(null);
      options.onSpeakingStart?.();
    });
  }, [isInitialized, isSpeaking, options]);

  const cancel = useCallback(() => {
    if (synthesizerRef.current && isSpeaking) {
      try {
        synthesizerRef.current.close();
        // Reinitialize
        const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
        speechConfig.speechSynthesisVoiceName = voice;
        const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
        synthesizerRef.current = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        setIsSpeaking(false);
      } catch (err) {
        console.error('Error canceling speech:', err);
      }
    }
  }, [isSpeaking, subscriptionKey, region, voice]);

  const pause = useCallback(() => {
    // Azure SDK doesn't support pause/resume directly
    // We would need to implement custom audio control
    cancel();
  }, [cancel]);

  return {
    speak,
    cancel,
    pause,
    isSpeaking,
    isInitialized,
    error,
    visemes,
  };
}

/**
 * Map Azure viseme IDs to mouth shapes/blend shapes
 * Reference: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme
 */
export const VISEME_MAP: Record<number, string> = {
  0: 'sil', // Silence
  1: 'ae', // as in "cat"
  2: 'ah', // as in "father"
  3: 'ao', // as in "caught"
  4: 'aw', // as in "about"
  5: 'ay', // as in "say"
  6: 'b', // B, P, M
  7: 'ch', // CH, J
  8: 'd', // D, T, N
  9: 'eh', // as in "bed"
  10: 'er', // as in "bird"
  11: 'ey', // as in "ate"
  12: 'f', // F, V
  13: 'g', // G, K
  14: 'ih', // as in "sit"
  15: 'iy', // as in "eat"
  16: 'k', // K
  17: 'l', // L
  18: 'ow', // as in "go"
  19: 'oy', // as in "toy"
  20: 'r', // R
  21: 's', // S, Z
};

/**
 * Get a simplified mouth shape for easier animation
 */
export function getSimpleMouthShape(visemeId: number): 'closed' | 'open' | 'wide' | 'rounded' {
  if (visemeId === 0) return 'closed'; // Silence
  if ([1, 2, 9, 14, 15].includes(visemeId)) return 'open'; // Open vowels
  if ([3, 18, 19].includes(visemeId)) return 'rounded'; // Rounded vowels
  if ([2, 5, 11].includes(visemeId)) return 'wide'; // Wide vowels
  return 'closed'; // Consonants
}

