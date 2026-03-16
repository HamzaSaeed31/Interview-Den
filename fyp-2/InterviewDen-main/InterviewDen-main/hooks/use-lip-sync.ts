import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SMOOTHING_FACTOR = 0.1; // Lower = smoother but lazier, Higher = snappier

export function useLipSync({ nodes, audioUrl, isPlaying }: { nodes: any, audioUrl: string | null, isPlaying: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // 1. Setup Audio Context
  useEffect(() => {
    if (!audioUrl) return;

    if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.crossOrigin = "anonymous";
    } else {
        audioRef.current.src = audioUrl;
    }

    const audio = audioRef.current;
    
    let audioContext: AudioContext;
    try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
        console.error("Web Audio API not supported", e);
        return;
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512; // Detail level of analysis

    let source: MediaElementAudioSourceNode;
    try {
         source = audioContext.createMediaElementSource(audio);
    } catch(e) {
        // Source already connected case or other error
        // We can't reconnect same element to different context easily if strict
        // But in React useEffect cleanup should handle closing context usually.
        // For safety/simplicity in this hook, we assume fresh element or handle error.
        console.warn("MediaElementAudioSourceNode error:", e);
        return;
    }
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    if (isPlaying) {
        audio.play().catch(e => console.error("Auto-play blocked:", e));
    }

    return () => {
      audio.pause();
      if (audioContext.state !== 'closed') {
         audioContext.close();
      }
    };
  }, [audioUrl]);

  // Handle Play/Pause changes separately
  useEffect(() => {
      if(audioRef.current && audioRef.current.src) {
          if (isPlaying) audioRef.current.play().catch(e => console.error("Play error:", e));
          else audioRef.current.pause();
      }
  }, [isPlaying]);

  // 2. The Animation Loop (60FPS)
  useFrame(() => {
    if (!analyserRef.current || !dataArrayRef.current || !nodes.Wolf3D_Head) return;

    // Get audio data
    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // Calculate "Loudness" (Average volume of lower frequencies)
    // We focus on lower frequencies (bins 5-20) because that's where human voice power sits
    const values = dataArrayRef.current.slice(5, 20); 
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Normalize to 0.0 - 1.0 (clamped)
    const targetOpenness = Math.min(1, average / 100); 

    // 3. TARGET THE MORPH TARGETS (The "Muscles")
    // We use "jawOpen" (ARKit) or "mouthOpen" (Oculus)
    const head = nodes.Wolf3D_Head;
    const dictionary = head.morphTargetDictionary;
    const influences = head.morphTargetInfluences;

    // 4. APPLY SMOOTHING (Lerp) - This prevents "Jitter"
    // Instead of setting value directly, we move 10% towards the target per frame
    if (dictionary && influences) {
        const mouthOpenIndex = dictionary["mouthOpen"] !== undefined ? dictionary["mouthOpen"] : dictionary["jawOpen"];
        
        if (mouthOpenIndex !== undefined) {
            const currentOpenness = influences[mouthOpenIndex] || 0;
            influences[mouthOpenIndex] = THREE.MathUtils.lerp(
                currentOpenness, 
                targetOpenness, 
                SMOOTHING_FACTOR
            );
        }
        
        // Optional: Add a little "smile" when talking to look friendly
        if (dictionary["mouthSmile"] !== undefined) {
             influences[dictionary["mouthSmile"]] = 0.1;
        }
    }
  });
}
