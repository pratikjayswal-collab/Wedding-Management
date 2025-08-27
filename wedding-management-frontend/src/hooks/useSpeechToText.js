import { useState, useRef, useCallback } from 'react';

export default function useSpeechToText({ lang, onResult } = {}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Check browser support on initialization
  useState(() => {
    const SpeechRecognition = (typeof window !== 'undefined') && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    setSupported(!!SpeechRecognition);
  });

  const getLang = useCallback(() => {
    return lang || (typeof navigator !== 'undefined' ? navigator.language : 'en-IN') || 'en-IN';
  }, [lang]);

  const start = useCallback(() => {
    const SpeechRecognition = (typeof window !== 'undefined') && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    
    if (!SpeechRecognition || listening) return;

    setError(null);
    setListening(true);

    const rec = new SpeechRecognition();
    recognitionRef.current = rec;

    rec.lang = getLang();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    rec.onstart = () => {
      setListening(true);
      setError(null);
    };

    rec.onresult = (event) => {
      try {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const result = finalTranscript || interimTranscript;
        if (result.trim() && typeof onResult === 'function') {
          onResult(result.trim());
        }
      } catch (e) {
        setError(e.message || 'Recognition error');
      }
    };

    rec.onerror = (e) => {
      const errorMsg = e && e.error ? e.error : 'speech_error';
      setError(errorMsg);
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      rec.start();
    } catch (err) {
      setError('Failed to start recognition');
      setListening(false);
    }
  }, [listening, getLang, onResult]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  }, []);

  return { 
    start, 
    stop, 
    isListening: listening, 
    supported, 
    error 
  };
}


