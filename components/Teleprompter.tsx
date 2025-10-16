import React from 'react';
import type { Settings } from '../types';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

interface TeleprompterProps {
  script: string;
  settings: Settings;
  onExit: () => void;
}

const PlayIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>;
const PauseIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;
const RewindIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6 8.5 6V6l-8.5 6z" /></svg>;
const SpeedUpIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="m4 18 8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" /></svg>;
const RestartIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>;
const MicOnIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" /></svg>;
const MicOffIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1.3-11.7c0-.28.22-.5.5-.5s.5.22.5.5V5h-1V2.3zM11 5v6c0 1.1.9 2 2 2s2-.9 2-2V5c0-1.1-.9-2-2-2h-1.2c.13.31.2.65.2 1zM19 11h-1.7c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72z" /></svg>;
const ExitIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M10.09 15.59 11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2z" /></svg>;
const RecordIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8" /></svg>;
const StopIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z" /></svg>;
const DownloadIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>;
// Corrected SVG attributes from kebab-case to camelCase for JSX compatibility.
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility.
const SearchIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLineCap="round" strokeLineJoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
const SpinnerIcon: React.FC<{ className: string }> = ({ className }) => <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility.
const CoachIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLineCap="round" strokeLineJoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility.
const CloseIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLineCap="round" strokeLineJoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

const RENDER_BACKEND_URL = 'https://maistermind-teleprompter.onrender.com';

async function callApi(prompt: string) {
  const body = { model: 'gemini-2.5-flash', contents: prompt };
  const apiUrl = import.meta.env.DEV ? '/api/generate' : `${RENDER_BACKEND_URL}/api/generate`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'API request failed');
  }
  const data = await response.json();
  return data.text;
}

const Teleprompter: React.FC<TeleprompterProps> = ({ script, settings, onExit }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [scrollSpeed, setScrollSpeed] = React.useState(settings.scrollSpeed);
  const [showControls, setShowControls] = React.useState(true);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [sessionTime, setSessionTime] = React.useState(0);
  const [isSessionActive, setIsSessionActive] = React.useState(false);
  const [videoURL, setVideoURL] = React.useState<string | null>(null);
  const [isSearchVisible, setIsSearchVisible] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [matchCount, setMatchCount] = React.useState(0);
  const [speedIndicator, setSpeedIndicator] = React.useState<number | null>(null);
  const [recordingStatus, setRecordingStatus] = React.useState<'idle' | 'recording' | 'processing' | 'finished'>('idle');

  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState('');
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const recordedChunks = React.useRef<Blob[]>([]);

  const handleVoiceCommand = React.useCallback((command: string) => {
    switch (command) {
      case 'play': setIsPlaying(p => !p); break;
      case 'pause': setIsPlaying(false); break;
      case 'faster': setScrollSpeed(s => Math.min(s + 1, 10)); break;
      case 'slower': setScrollSpeed(s => Math.max(s - 1, 1)); break;
      case 'reset': resetScroll(); break;
    }
  }, []);

  const { isListening, startListening, stopListening, fullTranscript, resetTranscript } = useSpeechRecognition(handleVoiceCommand);

  const togglePlayPause = () => setIsPlaying(p => !p);

  const changeSpeed = (newSpeed: number) => {
    const clampedSpeed = Math.max(1, Math.min(newSpeed, 10));
    setScrollSpeed(clampedSpeed);
    setSpeedIndicator(clampedSpeed);
  };
  
  const resetScroll = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setSessionTime(0);
    setIsSessionActive(false);
    setIsPlaying(false);
    resetTranscript();
    startCountdown(3);
  };
  
  const displayControls = React.useCallback(() => {
    setShowControls(true);
    // You'll need to manage the timeout with a ref
  }, []);
  
  React.useEffect(() => {
    let animationFrameId: number;
    const scrollContent = () => {
      if (isPlaying && scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed / 10;
        animationFrameId = requestAnimationFrame(scrollContent);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(scrollContent);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, scrollSpeed]);

  React.useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await containerRef.current?.requestFullscreen();
        if (settings.showCamera) {
          mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if(videoRef.current) videoRef.current.srcObject = mediaStreamRef.current;
        }
      } catch (err) { console.error(err); }
    };
    enterFullscreen();
    startCountdown(3);

    const onFullscreenChange = () => { if (!document.fullscreenElement) onExit(); };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      if (document.fullscreenElement) document.exitFullscreen();
    };
  }, [settings.showCamera, onExit]);
  
  const startCountdown = (from: number) => {
    setCountdown(from);
    if (from > 0) {
      const timer = setInterval(() => {
        setCountdown(c => (c !== null && c > 1) ? c - 1 : null);
        if (from === 1) {
          clearInterval(timer);
          setIsPlaying(true);
        }
        from--;
      }, 1000);
    } else {
      setIsPlaying(true);
    }
  };

  const handleRecordToggle = () => {
    if (recordingStatus === 'recording') {
      mediaRecorderRef.current?.stop();
      stopListening();
    } else if (mediaStreamRef.current) {
      recordedChunks.current = [];
      setVideoURL(null);
      resetTranscript();
      startListening();
      mediaRecorderRef.current = new MediaRecorder(mediaStreamRef.current, { mimeType: 'video/webm' });
      mediaRecorderRef.current.ondataavailable = e => { if (e.data.size > 0) recordedChunks.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        setVideoURL(URL.createObjectURL(blob));
        setRecordingStatus('finished');
      };
      mediaRecorderRef.current.start();
      setRecordingStatus('recording');
    }
  };

  const handleAnalyzeDelivery = async () => {
    if (!fullTranscript.trim()) {
      alert("No speech was detected to analyze.");
      return;
    }
    setIsAnalysisModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const prompt = `Analyze the following speech transcript for pacing, clarity, filler words, and engagement... Transcript:\n---\n${fullTranscript}\n---`;
      const result = await callApi(prompt);
      setAnalysisResult(result);
    } catch (err: any) {
      setAnalysisError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const renderedScript = React.useMemo(() => {
    const lines = script.split('\n');
    return lines.map((line, index) => (
      <p key={index} className={line.trim() === '' ? 'h-[1em]' : ''}>
        <span style={{ backgroundColor: settings.textBackgroundColor, padding: '0.1em 0.2em' }}>
          {line || ' '}
        </span>
      </p>
    ));
  }, [script, settings.textBackgroundColor]);


  return (
    <div ref={containerRef} className="fixed inset-0 bg-slate-900 flex justify-center items-center">
      <video ref={videoRef} className={`absolute w-full h-full object-cover transform scale-x-[-1] ${settings.showCamera ? '' : 'hidden'}`} autoPlay playsInline muted />
      
      {countdown && <div className="absolute inset-0 bg-black/80 flex justify-center items-center z-50"><span className="text-9xl">{countdown}</span></div>}
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-full md:w-1/2 border-y-2 border-red-500/50 z-20 pointer-events-none" />
      
      <div ref={scrollRef} className="w-full h-full overflow-hidden z-10">
        <div style={{ fontSize: `${settings.fontSize}vmin`, lineHeight: settings.lineHeight, fontFamily: settings.fontFamily, color: settings.fontColor, textAlign: settings.textAlign }} className={`w-11/12 max-w-5xl mx-auto py-[50vh] ${settings.isMirrored ? 'scale-x-[-1]' : ''}`}>
          {renderedScript}
        </div>
      </div>
      
      <div className={`absolute inset-0 z-30 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Controls UI */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white bg-black/50 p-2 rounded-lg">
          <button onClick={() => changeSpeed(scrollSpeed - 1)}><RewindIcon className="w-8 h-8"/></button>
          <button onClick={togglePlayPause}>{isPlaying ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>}</button>
          <button onClick={() => changeSpeed(scrollSpeed + 1)}><SpeedUpIcon className="w-8 h-8"/></button>
          {settings.showCamera && <button onClick={handleRecordToggle} className={recordingStatus === 'recording' ? 'text-red-500' : ''}>{recordingStatus === 'recording' ? <StopIcon className="w-8 h-8"/> : <RecordIcon className="w-8 h-8"/>}</button>}
          {videoURL && <a href={videoURL} download="recording.webm"><DownloadIcon className="w-8 h-8"/></a>}
          {videoURL && <button onClick={handleAnalyzeDelivery}><CoachIcon className="w-8 h-8"/></button>}
          <button onClick={isListening ? stopListening : startListening} className={isListening ? 'text-red-500' : ''}><MicOnIcon className="w-8 h-8"/></button>
          <button onClick={onExit}><ExitIcon className="w-8 h-8"/></button>
        </div>
      </div>

      {isAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] flex flex-col text-white">
            <header className="flex justify-between items-center pb-2 border-b"><h2 className="text-xl">AI Pitch Analysis</h2><button onClick={() => setIsAnalysisModalOpen(false)}><CloseIcon className="w-6 h-6"/></button></header>
            <div className="py-4 overflow-y-auto">
              {isAnalyzing ? <SpinnerIcon className="w-10 h-10 mx-auto"/> : analysisError ? <p className="text-red-400">{analysisError}</p> : <pre className="whitespace-pre-wrap font-sans">{analysisResult}</pre>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teleprompter;