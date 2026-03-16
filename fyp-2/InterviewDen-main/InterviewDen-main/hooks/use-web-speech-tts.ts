import { useState, useCallback, useEffect, useRef } from 'react';

interface UseWebSpeechTTSOptions {
  onEnded?: () => void;
  voice?: string; // Preferred voice name
  rate?: number;  // Speech rate (0.1 to 10, default 1)
  pitch?: number; // Speech pitch (0 to 2, default 1)
}

export function useWebSpeechTTS({ 
  onEnded, 
  voice: preferredVoiceName,
  rate = 1,
  pitch = 1 
}: UseWebSpeechTTSOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check support and load voices
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      return;
    }

    const synth = window.speechSynthesis;
    if (!synth) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Load voices - they may load async
    const loadVoices = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        console.log('[WebSpeechTTS] Loaded voices:', voices.map(v => `${v.name} (${v.lang})`));
      }
    };

    // Try immediately
    loadVoices();

    // Some browsers load voices asynchronously
    synth.onvoiceschanged = loadVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  // Select the best voice
  const selectVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (availableVoices.length === 0) return null;

    // Priority order for voice selection
    const priorities = [
      // If user specified a voice
      (v: SpeechSynthesisVoice) => preferredVoiceName && v.name.includes(preferredVoiceName),
      // Microsoft voices (usually higher quality on Windows/Edge)
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.name.includes('Online') && v.lang.startsWith('en'),
      // Google voices (usually higher quality on Chrome)
      (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en'),
      // Any Microsoft English voice
      (v: SpeechSynthesisVoice) => v.name.includes('Microsoft') && v.lang.startsWith('en'),
      // Any English US voice
      (v: SpeechSynthesisVoice) => v.lang === 'en-US',
      // Any English voice
      (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
    ];

    for (const check of priorities) {
      const match = availableVoices.find(check);
      if (match) return match;
    }

    // Fallback to first voice
    return availableVoices[0];
  }, [availableVoices, preferredVoiceName]);

  const speak = useCallback((text: string) => {
    if (!text || !isSupported) return;

    const synth = window.speechSynthesis;

    // Cancel any ongoing speech immediately
    synth.cancel();
    
    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure voice
    const selectedVoice = selectVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('[WebSpeechTTS] Using voice:', selectedVoice.name);
    }

    // Configure rate and pitch
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Event handlers
    utterance.onstart = () => {
      console.log('[WebSpeechTTS] Started speaking');
      setIsPlaying(true);
    };

    utterance.onend = () => {
      console.log('[WebSpeechTTS] Finished speaking');
      setIsPlaying(false);
      onEnded?.();
    };

    utterance.onerror = (event) => {
      // Ignore 'interrupted' errors - they happen when we cancel speech intentionally
      if (event.error === 'interrupted' || event.error === 'canceled') {
        console.log('[WebSpeechTTS] Speech interrupted/canceled');
        return;
      }
      console.error('[WebSpeechTTS] Error:', event.error);
      setIsPlaying(false);
    };

    // IMPORTANT: Chrome has a bug where speech synthesis can stop after ~15 seconds
    // This is a workaround that keeps it alive by pausing/resuming
    let resumeTimeout: NodeJS.Timeout | null = null;
    
    const keepAlive = () => {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        synth.resume();
        resumeTimeout = setTimeout(keepAlive, 10000);
      }
    };
    
    // Start keep-alive for long texts (only on Chrome-like browsers)
    if (text.length > 100) {
      resumeTimeout = setTimeout(keepAlive, 10000);
    }

    utterance.onend = () => {
      if (resumeTimeout) clearTimeout(resumeTimeout);
      console.log('[WebSpeechTTS] Finished speaking');
      setIsPlaying(false);
      onEnded?.();
    };

    // Speak immediately - no network latency!
    setIsPlaying(true);
    synth.speak(utterance);
  }, [isSupported, selectVoice, rate, pitch, onEnded]);

  const stop = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const pause = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.resume();
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isPlaying,
    isSupported,
    availableVoices,
    // No loading state needed - Web Speech API is instant!
    isLoading: false,
  };
}
