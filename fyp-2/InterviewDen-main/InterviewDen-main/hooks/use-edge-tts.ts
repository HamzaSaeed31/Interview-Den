import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'http://127.0.0.1:8000';

interface UseEdgeTTSOptions {
    onEnded?: () => void;
}

export function useEdgeTTS({ onEnded }: UseEdgeTTSOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    
    const handleEnded = () => {
        setIsPlaying(false);
        onEnded?.();
    };

    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
        audioRef.current?.removeEventListener('ended', handleEnded);
        audioRef.current?.pause();
        audioRef.current = null;
    };
  }, [onEnded]);

  const speakNative = useCallback((text: string) => {
    console.warn("Falling back to native browser TTS");
    // Cancel any current speaking
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
        setIsPlaying(false);
        onEnded?.();
    };
    utterance.onerror = (e) => {
        console.error("Native TTS Error", e);
        setIsPlaying(false);
    };
    
    // Try to select a decent voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Microsoft Zira') || v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  }, [onEnded]);

  const speak = useCallback(async (text: string, voice = "en-US-AriaNeural") => {
    if (!text) return;
    
    try {
        setIsLoading(true);
        
        // 1. Stream from Python Backend
        // We use GET for streaming endpoint as per user design
        const params = new URLSearchParams({
            text: text,
            voice: voice || 'en-US-AriaNeural'
        });
        
        const response = await fetch(`${API_BASE_URL}/api/voice?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`TTS API Error: ${response.status}`);
        }

        const blob = await response.blob();
        if (blob.size < 100) {
            throw new Error("Received empty/invalid audio blob");
        }
        
        const url = URL.createObjectURL(blob);
        // Expose this URL for the Avatar component
        if (audioRef.current) {
            audioRef.current.src = url;
            // Avatar will pick up 'src' change or we can expose it via hook return if needed
            // For now, let's play it.
             try {
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (playError: any) {
                 if (playError.name === 'AbortError' || playError.message?.includes('interrupted')) {
                    console.log('Audio playback interrupted');
                } else {
                    throw playError;
                }
            }
        }
    } catch (e) {
        console.error("Fluent TTS fallback logic/Error:", e);
        speakNative(text);
    } finally {
        setIsLoading(false);
    }
  }, [speakNative]);

  const stop = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    audioElement: audioRef.current // Expose for the visualizer
  };
}
