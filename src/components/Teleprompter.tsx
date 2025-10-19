
// FIX: Changed React import to the default import style to resolve widespread JSX typing errors.
import React from 'react';
import type { Settings } from '../types';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useToast from '../hooks/useToast';
import Toast from './Toast';
import { callApi } from '../utils/geminiApi';

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
const MicOffIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="m14.26 10.41 1.43 1.43c-.11.45-.3.88-.56 1.28l-1.44-1.44c.05-.1.07-.21.07-.32v-.36zm-2.52 4.02-1.41 1.41c.6.43 1.34.66 2.12.66 1.66 0 3-1.34 3-3h-1.7c0 .74-.4 1.38-1 1.73l-1.41-1.41c.21-.11.4-.25.56-.42zM12 14c.28 0 .55-.03.81-.08l-2.2-2.2c-.38.29-.61.72-.61 1.22v.36c0 .35.18.66.45.85.12.08.26.15.4.2zm-1.29-5.71 4.28 4.28L12 15.58c-1.33 0-2.54-.5-3.54-1.3L6.7 12.47c.05.17.1.33.15.5H5c0-1.42.59-2.7 1.53-3.61L7.7 8.18c-.19.43-.3.89-.3 1.38v.44h1.7c0-.28.08-.54.21-.79zm7.59 1.3c0-.18-.02-.36-.05-.53l-1.23 1.23c.15.42.23.86.23 1.31h1.7c0-.75-.22-1.45-.6-2.01zM4.41 2.86 3 4.27l2.04 2.04C5.01 6.58 5 6.79 5 7v4c0 1.42-.59 2.7-1.53 3.61l1.41 1.41C6.01 14.86 7 13.54 7 12.01V12h.7l2.88 2.88c-.37.2-.78.34-1.22.42v3.28h2v-3.28c.98-.13 1.89-.5 2.67-1.01l2.05 2.05 1.41-1.41L4.41 2.86z" /></svg>;
const ExitIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M10.09 15.59 11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2z" /></svg>;
const RecordIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8" /></svg>;
const StopIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z" /></svg>;
const DownloadIcon: React.FC<{className: string}> = ({className}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>;
// Corrected SVG attributes from kebab-case to camelCase for JSX compatibility.
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const SearchIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const SpinnerIcon: React.FC<{ className: string }> = ({ className }) => <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const CoachIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const CloseIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;

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
  const [progress, setProgress] = React.useState(0);

  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = React.useState(false);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState('');
  const [analysisError, setAnalysisError] = React.useState<string | null>(null);
  const { toast, showToast } = useToast();

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);
  const recordedChunks = React.useRef<Blob[]>([]);
  // FIX: Replaced NodeJS.Timeout with number for browser compatibility, as setTimeout returns a number in browser environments.
  const hideControlsTimeout = React.useRef<number | null>(null);
  const speedIndicatorTimeout = React.useRef<number | null>(null);

  const startCountdown = React.useCallback((from: number) => {
    setCountdown(from);
  }, []);

  const resetScroll = React.useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setSessionTime(0);
    setIsSessionActive(false);
    setIsPlaying(false);
    startCountdown(3);
  }, [startCountdown]);

  const handleVoiceCommand = React.useCallback((command: string) => {
    switch (command) {
      case 'play':
        setIsPlaying(p => {
          showToast(p ? 'Playback Paused' : 'Playback Started');
          return !p;
        });
        break;
      case 'pause':
        setIsPlaying(false);
        showToast('Playback Paused');
        break;
      case 'faster':
        setScrollSpeed(s => {
          const newSpeed = Math.min(s + 1, 10);
          showToast(`Speed Increased to ${newSpeed}`);
          setSpeedIndicator(newSpeed);
          return newSpeed;
        });
        break;
      case 'slower':
        setScrollSpeed(s => {
          const newSpeed = Math.max(s - 1, 1);
          showToast(`Speed Decreased to ${newSpeed}`);
          setSpeedIndicator(newSpeed);
          return newSpeed;
        });
        break;
      case 'reset':
        resetScroll();
        showToast('Restarting');
        break;
    }
  }, [showToast, resetScroll]);

  const { isListening, startListening, stopListening, fullTranscript, resetTranscript } = useSpeechRecognition(handleVoiceCommand);

  const togglePlayPause = () => setIsPlaying(p => !p);

  const changeSpeed = (newSpeed: number) => {
    const clampedSpeed = Math.max(1, Math.min(newSpeed, 10));
    setScrollSpeed(clampedSpeed);
    setSpeedIndicator(clampedSpeed);
  };
  
  const displayControls = React.useCallback(() => {
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    setShowControls(true);
    hideControlsTimeout.current = window.setTimeout(() => setShowControls(false), 3000);
  }, []);
  
  React.useEffect(() => {
    displayControls();
  }, [displayControls]);
  
  React.useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else {
      setIsPlaying(true);
      setCountdown(null);
    }
  }, [countdown]);

  React.useEffect(() => {
    if (speedIndicatorTimeout.current) clearTimeout(speedIndicatorTimeout.current);
    if (speedIndicator !== null) {
      speedIndicatorTimeout.current = window.setTimeout(() => setSpeedIndicator(null), 1000);
    }
  }, [speedIndicator]);

  React.useEffect(() => {
    let animationFrameId: number;
    const scrollContent = () => {
      if (isPlaying && scrollRef.current) {
        // FIX: Increased scroll multiplier to ensure smooth scrolling even at low speeds.
        scrollRef.current.scrollTop += scrollSpeed / 4;
        
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollHeight > clientHeight) { // Avoid division by zero
          const currentProgress = (scrollTop / (scrollHeight - clientHeight)) * 100;
          setProgress(Math.min(100, currentProgress));
        }

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
    resetScroll();

    const onFullscreenChange = () => { if (!document.fullscreenElement) onExit(); };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      if (document.fullscreenElement) document.exitFullscreen();
    };
  }, [settings.showCamera, onExit, resetScroll]);
  

  const handleRecordToggle = () => {
    if (recordingStatus === 'recording') {
      mediaRecorderRef.current?.stop();
      stopListening();
      setRecordingStatus('processing'); // Set to processing while blob is created
    } else if (mediaStreamRef.current) { // Covers 'idle' and 'finished' states
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
      const prompt = `Analyze the following speech transcript for pacing, clarity, filler words, and engagement. Provide constructive feedback for improvement. Transcript:\n---\n${fullTranscript}\n---`;
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
    <div ref={containerRef} className="fixed inset-0 bg-slate-900 flex justify-center items-center" onMouseMove={displayControls} onClick={displayControls}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700/50 z-20">
        <div className="h-full bg-cyan-400" style={{ width: `${progress}%` }} />
      </div>
      <video ref={videoRef} className={`absolute w-full h-full object-cover transform scale-x-[-1] ${settings.showCamera ? '' : 'hidden'}`} autoPlay playsInline muted />
      
      {countdown && <div className="absolute inset-0 bg-black/80 flex justify-center items-center z-50"><span className="text-9xl">{countdown}</span></div>}
      
      {speedIndicator !== null && (
        <div className="absolute inset-0 flex justify-center items-center z-50 pointer-events-none">
          <div className="bg-black/50 text-white px-8 py-4 rounded-lg text-4xl font-bold">
            Speed {speedIndicator}
          </div>
        </div>
      )}

      {settings.showGuides && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-full md:w-1/2 border-y-2 border-red-500/50 z-20 pointer-events-none" />}
      
      <div ref={scrollRef} className="w-full h-full overflow-hidden z-10">
        <div style={{ fontSize: `${settings.fontSize}vmin`, lineHeight: settings.lineHeight, fontFamily: settings.fontFamily, color: settings.fontColor, textAlign: settings.textAlign }} className={`w-11/12 max-w-5xl mx-auto py-[50vh] ${settings.isMirrored ? 'scale-x-[-1]' : ''}`}>
          {renderedScript}
        </div>
      </div>
      
      <Toast message={toast.message} isVisible={toast.isVisible} />

      <div className={`absolute inset-0 z-30 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white bg-black/50 p-2 rounded-lg">
          <button aria-label="Decrease speed" onClick={() => changeSpeed(scrollSpeed - 1)}><RewindIcon className="w-8 h-8"/></button>
          <button aria-label={isPlaying ? "Pause" : "Play"} onClick={togglePlayPause}>{isPlaying ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>}</button>
          <button aria-label="Increase speed" onClick={() => changeSpeed(scrollSpeed + 1)}><SpeedUpIcon className="w-8 h-8"/></button>
          <button aria-label="Restart" onClick={resetScroll}><RestartIcon className="w-8 h-8"/></button>
          {settings.showCamera && (
            <button
              aria-label="Record"
              onClick={handleRecordToggle}
              disabled={recordingStatus === 'processing'}
              className={`transition-colors ${recordingStatus === 'recording' ? 'text-red-500' : ''} ${recordingStatus === 'processing' ? 'text-gray-500' : ''}`}
            >
              {recordingStatus === 'recording' && <StopIcon className="w-8 h-8" />}
              {recordingStatus === 'processing' && <SpinnerIcon className="w-8 h-8" />}
              {(recordingStatus === 'idle' || recordingStatus === 'finished') && <RecordIcon className="w-8 h-8" />}
            </button>
          )}
          {videoURL && <a aria-label="Download recording" href={videoURL} download="recording.webm"><DownloadIcon className="w-8 h-8"/></a>}
          {videoURL && <button aria-label="Analyze delivery" onClick={handleAnalyzeDelivery}><CoachIcon className="w-8 h-8"/></button>}
          <button aria-label={isListening ? "Stop voice commands" : "Start voice commands"} onClick={isListening ? stopListening : startListening} className={isListening ? 'text-red-500' : ''}>
            {isListening ? <MicOnIcon className="w-8 h-8"/> : <MicOffIcon className="w-8 h-8"/>}
          </button>
          <button aria-label="Exit teleprompter" onClick={onExit}><ExitIcon className="w-8 h-8"/></button>
        </div>
      </div>

      {isAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] flex flex-col text-white">
            <header className="flex justify-between items-center pb-2 border-b border-gray-700"><h2 className="text-xl font-bold">AI Pitch Analysis</h2><button onClick={() => setIsAnalysisModalOpen(false)}><CloseIcon className="w-6 h-6"/></button></header>
            <div className="py-4 my-4 overflow-y-auto">
              {isAnalyzing ? <SpinnerIcon className="w-10 h-10 mx-auto text-cyan-400"/> : analysisError ? <p className="text-red-400">{analysisError}</p> : <div className="text-gray-300 space-y-4 whitespace-pre-wrap">{analysisResult}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teleprompter;