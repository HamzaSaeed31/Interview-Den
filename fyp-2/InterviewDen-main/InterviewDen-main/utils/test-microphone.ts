// Microphone diagnostic utility
// This will test if the browser is actually receiving audio from the microphone

// Only run in browser environment
const isBrowser = typeof window !== 'undefined';

export async function testMicrophoneAudio(): Promise<{
  hasAccess: boolean;
  isReceivingAudio: boolean;
  peakLevel: number;
  error?: string;
}> {
  try {
    console.log('[Mic Test] Requesting microphone access...');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('[Mic Test] Microphone access granted');

    return new Promise((resolve) => {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let peakLevel = 0;
      let samplesWithSound = 0;
      const totalSamples = 30; // Test for ~3 seconds (30 samples at 100ms intervals)
      let samplesTaken = 0;

      console.log('[Mic Test] Listening for audio input for 3 seconds...');
      console.log('[Mic Test] Please speak into your microphone now!');

      const interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        if (average > peakLevel) {
          peakLevel = average;
        }
        
        if (average > 10) {
          samplesWithSound++;
          console.log(`[Mic Test] Sound detected! Level: ${average.toFixed(1)}`);
        }

        samplesTaken++;
        
        if (samplesTaken >= totalSamples) {
          clearInterval(interval);
          
          // Cleanup
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();

          const isReceivingAudio = samplesWithSound > 3;
          console.log('[Mic Test] Test complete:', {
            samplesWithSound,
            totalSamples,
            peakLevel: peakLevel.toFixed(1),
            isReceivingAudio
          });

          resolve({
            hasAccess: true,
            isReceivingAudio,
            peakLevel
          });
        }
      }, 100);
    });
  } catch (error: any) {
    console.error('[Mic Test] Error:', error);
    return {
      hasAccess: false,
      isReceivingAudio: false,
      peakLevel: 0,
      error: error.message
    };
  }
}

// Quick test function - call from browser console: testMic()
if (isBrowser) {
  (window as any).testMic = async () => {
    const result = await testMicrophoneAudio();
    console.log('[Mic Test] Final Result:', result);
    
    if (!result.hasAccess) {
      console.log('%c❌ Microphone access denied!', 'color: red; font-size: 16px');
    } else if (!result.isReceivingAudio) {
      console.log('%c⚠️ Microphone access OK but NO AUDIO detected!', 'color: orange; font-size: 16px');
      console.log('Possible causes:');
      console.log('1. Microphone is muted in Windows/OS settings');
      console.log('2. Wrong microphone selected in browser');
      console.log('3. Microphone hardware issue');
      console.log('4. Another app is using the microphone exclusively');
    } else {
      console.log('%c✅ Microphone is working correctly!', 'color: green; font-size: 16px');
    }
    
    return result;
  };
}

export default testMicrophoneAudio;

