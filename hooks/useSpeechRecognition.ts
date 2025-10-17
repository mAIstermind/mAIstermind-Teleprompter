import * as React from 'react';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: () => void;
  onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  readonly length: number;
}

interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative;
  readonly isFinal: boolean;
  readonly length: number;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

interface SpeechRecognitionHook {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  fullTranscript: string;
  resetTranscript: () => void;
}

const useSpeechRecognition = (onCommand: (command: string) => void): SpeechRecognitionHook => {
  const [isListening, setIsListening] = React.useState(false);
  const [fullTranscript, setFullTranscript] = React.useState('');
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);
  const manualStopRef = React.useRef(false);

  const resetTranscript = () => setFullTranscript('');

  const startListening = React.useCallback(() => {
    if (recognitionRef.current && !isListening) {
      manualStopRef.current = false;
      try { recognitionRef.current.start(); } catch (e) { console.error(e); }
    }
  }, [isListening]);

  const stopListening = React.useCallback(() => {
    if (recognitionRef.current && isListening) {
      manualStopRef.current = true;
      recognitionRef.current.stop();
    }
  }, [isListening]);

  React.useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
        setIsListening(false);
        // Only restart if it wasn't a manual stop
        if (!manualStopRef.current) {
            startListening();
        }
    };
    recognition.onerror = (event) => console.error(event.error);

    recognition.onresult = (event) => {
      let finalChunk = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalChunk += event.results[i][0].transcript;
        }
      }
      if (finalChunk) {
        setFullTranscript(prev => prev + finalChunk + ' ');
        const command = finalChunk.trim().toLowerCase();
        if (['start', 'play', 'go'].some(c => command.includes(c))) onCommand('play');
        else if (['stop', 'pause', 'hold'].some(c => command.includes(c))) onCommand('pause');
        else if (['faster', 'speed up'].some(c => command.includes(c))) onCommand('faster');
        else if (['slower', 'slow down'].some(c => command.includes(c))) onCommand('slower');
        else if (['reset', 'restart'].some(c => command.includes(c))) onCommand('reset');
      }
    };
    recognitionRef.current = recognition;
    return () => { 
        manualStopRef.current = true;
        recognition.stop(); 
    };
  }, [onCommand, startListening]);

  return { isListening, startListening, stopListening, fullTranscript, resetTranscript };
};

export default useSpeechRecognition;