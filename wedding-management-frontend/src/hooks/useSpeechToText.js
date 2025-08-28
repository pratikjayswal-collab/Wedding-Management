import { useState, useRef, useCallback, useEffect } from 'react';

export default function useSpeechToText({ lang, onResult, silenceThreshold = 2000, minRecordingDuration = 1000 } = {}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const chunksRef = useRef([]);
  const isRecordingRef = useRef(false);
  const animationFrameRef = useRef(null);
  const recordingStartTimeRef = useRef(null);
  const lastRequestTimeRef = useRef(0);
  const requestCountRef = useRef(0);

  useEffect(() => {
    // Support if MediaRecorder and getUserMedia exist
    const hasSupport = typeof navigator !== 'undefined' && !!navigator.mediaDevices && typeof window !== 'undefined' && 'MediaRecorder' in window;
    setSupported(!!hasSupport);
  }, []);

  const getLang = useCallback(() => {
    return lang || (typeof navigator !== 'undefined' ? navigator.language : 'en-IN') || 'en-IN';
  }, [lang]);

  const stop = useCallback(() => {
    try {
      console.log('Stopping recording...');
      isRecordingRef.current = false;
      
      // Clear silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Check minimum recording duration
      const recordingDuration = Date.now() - recordingStartTimeRef.current;
      if (recordingDuration < minRecordingDuration) {
        console.log('Recording too short, discarding...');
        setListening(false);
        return;
      }
      
      // Stop MediaRecorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
      
      // Clean up Web Audio API
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      microphoneRef.current = null;
      
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  }, [minRecordingDuration]);

  const detectSilence = useCallback(() => {
    if (!audioContextRef.current || !analyserRef.current || !microphoneRef.current) {
      console.log('Audio context not ready for silence detection');
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const checkAudioLevel = () => {
      if (!isRecordingRef.current) return;
      
      try {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        // Check minimum recording duration before allowing silence detection
        const recordingDuration = Date.now() - recordingStartTimeRef.current;
        if (recordingDuration < minRecordingDuration) {
          if (isRecordingRef.current) {
            animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
          }
          return;
        }
        
        // If audio level is very low (silence)
        if (average < 20) {
          if (!silenceTimerRef.current) {
            console.log('Silence detected, starting timer...');
            silenceTimerRef.current = setTimeout(() => {
              console.log('Silence threshold reached, stopping...');
              if (isRecordingRef.current) {
                stop();
              }
            }, silenceThreshold);
          }
        } else {
          // Reset silence timer if there's sound
          if (silenceTimerRef.current) {
            console.log('Sound detected, clearing silence timer');
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
        
        if (isRecordingRef.current) {
          animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
        }
      } catch (err) {
        console.error('Error in audio analysis:', err);
      }
    };
    
    checkAudioLevel();
  }, [silenceThreshold, stop, minRecordingDuration]);

  const start = useCallback(async () => {
    if (listening) return;
    if (!supported) {
      setError('Microphone access not supported');
      return;
    }
    
    // Check rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    
    // Rate limit: max 1 request per 2 seconds
    if (timeSinceLastRequest < 2000) {
      setError('Please wait a moment before trying again.');
      return;
    }
    
    // Check if we're currently rate limited
    if (isRateLimited) {
      setError('API quota exceeded. Please wait a moment and try again.');
      return;
    }
    
    console.log('Starting recording...');
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      // Set up MediaRecorder for recording with better quality
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      // Set up Web Audio API for silence detection
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder stopped, processing...');
        try {
          // Check if we have enough audio data
          const totalSize = chunksRef.current.reduce((total, chunk) => total + chunk.size, 0);
          if (totalSize < 1000) { // Less than 1KB
            console.log('Audio file too small, discarding...');
            setListening(false);
            return;
          }
          
          const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
          const fd = new FormData();
          fd.append('audio', blob, 'speech.webm');
          fd.append('lang', getLang());
          
          // Update request tracking
          lastRequestTimeRef.current = Date.now();
          requestCountRef.current++;
          
          const res = await fetch('http://localhost:5000/api/users/transcribe', {
            method: 'POST',
            body: fd,
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const errorMessage = errorData.message || `HTTP ${res.status}: ${res.statusText}`;
            
            // Handle specific API quota errors
            if (errorMessage.includes('quota exceeded') || res.status === 429) {
              setIsRateLimited(true);
              // Auto-reset rate limit after 30 seconds
              setTimeout(() => setIsRateLimited(false), 30000);
              throw new Error('API quota exceeded. Please wait 30 seconds and try again.');
            }
            
            throw new Error(errorMessage);
          }
          
          const data = await res.json();
          if (data?.text && typeof onResult === 'function') {
            onResult(data.text);
          } else if (!data?.text) {
            setError('No speech detected. Please try speaking more clearly.');
          }
        } catch (e) {
          console.error('Transcription error:', e);
          setError(e.message || 'Voice transcription error. Please try again.');
        } finally {
          setListening(false);
          isRecordingRef.current = false;
        }
      };

      mediaRecorder.start();
      setListening(true);
      isRecordingRef.current = true;
      
      // Start silence detection after a short delay
      setTimeout(() => {
        detectSilence();
      }, 200);
      
    } catch (e) {
      console.error('Error starting recording:', e);
      setError('Microphone permission denied or not available');
      setListening(false);
    }
  }, [listening, supported, getLang, onResult, detectSilence, minRecordingDuration, isRateLimited]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    start,
    stop,
    isListening: listening,
    supported,
    error,
    isRateLimited,
  };
}


