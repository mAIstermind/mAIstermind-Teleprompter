// FIX: Changed React import style to resolve JSX typing issues.
import * as React from 'react';
import type { Settings } from '../types';
import { Type } from "@google/genai";
import FindReplace from './FindReplace';
import { callApi } from '../utils/geminiApi';

interface EditorProps {
  script: string;
  setScript: (value: string | ((prev: string) => string)) => void;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  onStart: () => void;
}

type ToneAnalysisItem = {
  section: string;
  tone: string;
};

const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];
const LOGO_URL = 'https://storage.googleapis.com/msgsndr/kEw4VxNKNryYe46sjAUc/media/68e8192a2bf4ec19a054e0ff.jpeg';

// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const UploadIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const DownloadIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const SparkleIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const PencilIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const CoachIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const SummarizeIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>;
const SpinnerIcon: React.FC<{ className: string }> = ({ className }) => <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const HelpIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const CloseIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const ClockIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const FindReplaceIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const ToneIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const ExpandIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m-9 6-5.25 5.25m0 0v-4.5m0 4.5h4.5M20.25 20.25v-4.5m0 4.5h-4.5m0 0L15 15" /></svg>;
// FIX: Corrected SVG attributes from kebab-case to camelCase for JSX compatibility (e.g. stroke-linecap -> strokeLinecap).
const ChevronDownIcon: React.FC<{className: string}> = ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>;

const Editor: React.FC<EditorProps> = ({ script, setScript, settings, setSettings, onStart }) => {
  const [readingTime, setReadingTime] = React.useState('0 sec read');
  const [modal, setModal] = React.useState<{ type: string | null; data?: any }>({ type: null });
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isFindReplaceVisible, setIsFindReplaceVisible] = React.useState(false);
  const [selection, setSelection] = React.useState<{ start: number, end: number, text: string } | null>(null);
  const [toolbarPosition, setToolbarPosition] = React.useState<{ top: number, left: number } | null>(null);
  const [isAiMenuOpen, setIsAiMenuOpen] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const aiMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const words = script.trim().split(/\s+/).filter(Boolean).length;
    if (words === 0) {
      setReadingTime('0 sec read');
      return;
    }
    const wordsPerMinute = 150;
    const minutes = words / wordsPerMinute;
    const displayTime = minutes < 1 ? `${Math.round(minutes * 60)} sec read` : `${Math.ceil(minutes)} min read`;
    setReadingTime(displayTime);
  }, [script]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aiMenuRef.current && !aiMenuRef.current.contains(event.target as Node)) {
        setIsAiMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectionChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);

    if (selectedText.trim().length > 0) {
      setSelection({ start: selectionStart, end: selectionEnd, text: selectedText });
      const { x, y, height } = textarea.getBoundingClientRect();
      const textBeforeSelection = value.substring(0, selectionStart);
      const lines = textBeforeSelection.split('\n');
      const lastLine = lines[lines.length - 1];
      const tempDiv = document.createElement('div');
      tempDiv.style.font = window.getComputedStyle(textarea).font;
      tempDiv.style.visibility = 'hidden';
      tempDiv.textContent = lastLine;
      document.body.appendChild(tempDiv);
      const textWidth = tempDiv.getBoundingClientRect().width;
      document.body.removeChild(tempDiv);

      const top = y + (lines.length * 28) - (height / 2) - 50; // Approximations
      const left = x + textWidth + 20;

      setToolbarPosition({ top: y + 20, left: x + (textarea.clientWidth / 2) });
    } else {
      setSelection(null);
      setToolbarPosition(null);
    }
  };

  const handleInlineAIAction = async (action: 'rephrase' | 'shorten' | 'expand') => {
    if (!selection) return;

    const prompts = {
      rephrase: `Rephrase the following text: "${selection.text}"`,
      shorten: `Make the following text more concise: "${selection.text}"`,
      expand: `Expand on the following text with more detail: "${selection.text}"`,
    };
    
    setIsProcessing(true);
    setToolbarPosition(null); // Hide toolbar during processing

    const result = await handleApiCallWrapper(prompts[action]);
    if (result) {
      const newScript = script.substring(0, selection.start) + result + script.substring(selection.end);
      setScript(newScript);
    } else {
       setError("AI action failed.");
    }
    
    setIsProcessing(false);
    setSelection(null);
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setScript(e.target?.result as string);
      reader.readAsText(file);
      event.target.value = '';
    }
  };

  const handleFileExport = () => {
    const blob = new Blob([script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teleprompter-script.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSettingChange = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleApiCallWrapper = async (prompt: string, config?: any) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await callApi(prompt, config);
      return result;
    } catch (err: any) {
      console.error("API call failed:", err);
      setError(err.message || "An unknown error occurred.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateScript = async (promptText: string) => {
    if (script.trim() && !window.confirm("This will replace your current script. Are you sure?")) return;
    const fullPrompt = `You are a professional scriptwriter. Write a script based on the following topic. The script should be engaging, clear, and well-structured. Topic: "${promptText}"`;
    const result = await handleApiCallWrapper(fullPrompt);
    if (result) {
      setScript(result);
      closeModal();
    } else {
      setModal({ type: 'error' });
    }
  };
  
  const handleSideBySideAction = async (prompt: string, modalType: string) => {
    setModal({ type: modalType });
    const result = await handleApiCallWrapper(prompt);
    if (result) {
      setModal({ type: modalType, data: result });
    } else {
      setModal({ type: 'error' });
    }
  };

  const handlePolishScript = () => handleSideBySideAction(`Polish the following script for clarity, conciseness, and impact. Fix any grammatical errors or awkward phrasing.:\n---\n${script}\n---`, 'polish');
  const handleCoachScript = () => handleSideBySideAction(`Add delivery cues to the following script. Include notes on pacing, tone, emphasis, and suggested pauses (e.g., [pause], [emphasize], [slower]).:\n---\n${script}\n---`, 'coach');
  const handleSummarizeScript = () => handleSideBySideAction(`Summarize the following script into key talking points suitable for a social media post or video description.:\n---\n${script}\n---`, 'summarize');
  const handleExpandScript = () => handleSideBySideAction(`Expand the following script, adding more detail, examples, or explanations where appropriate to make it more comprehensive.:\n---\n${script}\n---`, 'expand');

  const handleToneAnalysis = async () => {
    setModal({ type: 'tone' });
    const prompt = `Analyze the tone of the following script. Break the script into logical sections and identify the primary tone for each (e.g., "Informative," "Inspirational," "Humorous," "Urgent"). Provide the output as a JSON array of objects, where each object has a "section" (the text) and a "tone" (the analysis). Script:\n---\n${script}\n---`;
    const config = { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { section: { type: Type.STRING }, tone: { type: Type.STRING } } } } };
    const result = await handleApiCallWrapper(prompt, config);
    if (result) {
      try {
        setModal({ type: 'tone', data: JSON.parse(result) });
      } catch (e) {
        setError("AI returned an invalid format for tone analysis.");
        setModal({ type: 'error' });
      }
    } else {
      setModal({ type: 'error' });
    }
  };

  const acceptChanges = (newScript: string) => {
    setScript(newScript);
    closeModal();
  };

  const closeModal = () => {
    setModal({ type: null });
    setError(null);
    setIsProcessing(false);
  };

  const handleFind = (term: string): number => {
    if (!term) return 0;
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return (script.match(regex) || []).length;
  };
  const handleReplace = (find: string, replace: string) => {
    const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    setScript(s => s.replace(regex, replace));
  };
  const handleReplaceAll = (find: string, replace: string) => {
    const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    setScript(s => s.replace(regex, replace));
  };
  
  const renderHelpContent = () => (
    <div className="text-gray-300 space-y-4">
      <div>
        <h3 className="font-bold text-cyan-400 mb-2">Keyboard Shortcuts (In Prompter)</h3>
        <ul className="list-disc list-inside space-y-1">
          <li><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-300 rounded-md">Spacebar</kbd>: Play / Pause scrolling</li>
          <li><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-300 rounded-md">Up Arrow</kbd>: Increase speed</li>
          <li><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-300 rounded-md">Down Arrow</kbd>: Decrease speed</li>
          <li><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-300 rounded-md">R</kbd>: Reset scroll to the top</li>
          <li><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-300 rounded-md">Escape</kbd>: Exit the teleprompter</li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-cyan-400 mb-2">Voice Commands (In Prompter)</h3>
        <p className="text-sm text-gray-400 mb-2">Activate by clicking the microphone icon.</p>
        <ul className="list-disc list-inside space-y-1">
          <li>"start" / "play" / "go": <span className="text-gray-400">Start scrolling</span></li>
          <li>"stop" / "pause" / "hold": <span className="text-gray-400">Pause scrolling</span></li>
          <li>"faster" / "speed up": <span className="text-gray-400">Increase scroll speed</span></li>
          <li>"slower" / "slow down": <span className="text-gray-400">Decrease scroll speed</span></li>
          <li>"reset" / "restart": <span className="text-gray-400">Return to the top of the script</span></li>
        </ul>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!modal.type) return null;

    let title = '', content: React.ReactNode = null, footer: React.ReactNode = null, widthClass = 'max-w-lg';

    if (isProcessing) {
        title = 'AI Processing';
        content = <div className="flex flex-col items-center justify-center h-48 space-y-4"><SpinnerIcon className="w-10 h-10 text-cyan-400" /><p className="text-gray-400">Your AI assistant is working...</p></div>;
    } else if (modal.type === 'error' || error) {
      title = 'Error';
      content = <div className="text-red-400 p-4 bg-red-900/20 rounded-md">{error || 'An unknown error occurred.'}</div>;
      footer = <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md transition-colors">Close</button>;
    } else if (modal.type === 'generate') {
      title = 'Generate Script with AI';
      content = <textarea id="ai-prompt-textarea" placeholder="e.g., A 2-minute YouTube video intro about the benefits of hydration." className="w-full h-32 bg-gray-900 text-gray-200 p-3 rounded-md focus:ring-1 focus:ring-cyan-500 focus:outline-none"></textarea>;
      footer = <><button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md transition-colors">Cancel</button><button onClick={() => handleGenerateScript((document.getElementById('ai-prompt-textarea') as HTMLTextAreaElement).value)} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-md transition-colors font-semibold">Generate</button></>;
    } else if (['polish', 'coach', 'summarize', 'expand'].includes(modal.type)) {
      widthClass = 'max-w-5xl';
      title = { polish: 'Polish Script', coach: 'Delivery Coach', summarize: 'Summarize Script', expand: 'Expand Script' }[modal.type]!;
      content = (
        <div className="grid md:grid-cols-2 gap-4 h-[60vh]">
            <div>
                <h3 className="font-bold mb-2 text-gray-400">Original</h3>
                <pre className="bg-gray-900 p-3 rounded-md whitespace-pre-wrap overflow-y-auto h-full font-mono text-sm border border-gray-700">{script}</pre>
            </div>
            <div>
                <h3 className="font-bold mb-2 text-cyan-400">AI Suggestion</h3>
                <pre className="bg-cyan-900/20 p-3 rounded-md whitespace-pre-wrap overflow-y-auto h-full font-mono text-sm border border-cyan-700/50">{modal.data}</pre>
            </div>
        </div>
      );
      footer = <><button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md transition-colors">Cancel</button><button onClick={() => acceptChanges(modal.data)} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-md transition-colors font-semibold">Accept Changes</button></>;
    } else if (modal.type === 'tone' && modal.data) {
      title = 'Tone Analysis';
      content = <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">{(modal.data as ToneAnalysisItem[]).map((item, i) => <div key={i} className="p-3 bg-gray-900/50 rounded-md"><strong className="text-cyan-400 font-semibold">{item.tone}:</strong> <p className="text-gray-300 mt-1">{item.section}</p></div>)}</div>;
      footer = <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md transition-colors">Close</button>;
    } else if (modal.type === 'help') {
        title = 'Help & Controls';
        content = renderHelpContent();
        footer = <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md transition-colors">Close</button>;
    }

    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={closeModal}>
        <div className={`bg-gray-800 rounded-lg shadow-2xl p-6 w-full ${widthClass} flex flex-col max-h-[90vh]`} onClick={e => e.stopPropagation()}>
          <header className="flex justify-between items-center pb-3 border-b border-gray-700">
            <h2 className="text-xl font-bold text-gray-100">{title}</h2>
            <button onClick={closeModal} className="text-gray-500 hover:text-white transition-colors"><CloseIcon className="w-6 h-6"/></button>
          </header>
          <div className="py-4 my-4 overflow-y-auto flex-grow">{content}</div>
          {footer && <footer className="flex justify-end gap-3 pt-3 border-t border-gray-700">{footer}</footer>}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-gradient-to-b from-slate-900 to-blue-900 min-h-screen">
      {renderModal()}
      <main className="container mx-auto p-4 flex flex-col space-y-4 min-h-screen">
        <header className="text-center my-4">
            <img src={LOGO_URL} alt="mAIstermind Logo" className="mx-auto h-12 md:h-16 w-auto mb-2" />
            <p className="text-gray-400">Craft your perfect delivery.</p>
        </header>

        <div className="flex-grow flex flex-col bg-gray-800 rounded-lg border border-gray-700 relative">
          <div className="flex justify-between items-center p-2 border-b border-gray-700 flex-wrap gap-2">
            <div className="flex items-center space-x-3"><span className="px-2 text-sm">Script Editor</span><div className="flex items-center space-x-1.5 text-xs text-cyan-400"><ClockIcon className="w-4 h-4" /><span>{readingTime}</span></div></div>
            <div className="flex items-center flex-wrap gap-2">
                <button onClick={() => setModal({type: 'generate'})} className="flex items-center space-x-2 bg-cyan-600 p-2 rounded-md text-sm font-semibold hover:bg-cyan-500 transition-colors"><SparkleIcon className="w-4 h-4"/><span>Ask AI</span></button>
                
                <div className="relative" ref={aiMenuRef}>
                    <button onClick={() => setIsAiMenuOpen(prev => !prev)} className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md text-sm hover:bg-gray-600 transition-colors">
                        <SparkleIcon className="w-4 h-4 text-cyan-400" />
                        <span>AI Tools</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isAiMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isAiMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20">
                        <ul className="py-1">
                            <li><button onClick={() => { handlePolishScript(); setIsAiMenuOpen(false); }} disabled={!script.trim()} className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><PencilIcon className="w-4 h-4"/><span>Polish Script</span></button></li>
                            <li><button onClick={() => { handleCoachScript(); setIsAiMenuOpen(false); }} disabled={!script.trim()} className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><CoachIcon className="w-4 h-4"/><span>Delivery Coach</span></button></li>
                            <li><button onClick={() => { handleToneAnalysis(); setIsAiMenuOpen(false); }} disabled={!script.trim()} className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><ToneIcon className="w-4 h-4"/><span>Tone Analysis</span></button></li>
                            <li><button onClick={() => { handleSummarizeScript(); setIsAiMenuOpen(false); }} disabled={!script.trim()} className="w-full text-left flex items-center space-x-3 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"><SummarizeIcon className="w-4 h-4"/><span>Summarize</span></button></li>
                        </ul>
                        </div>
                    )}
                </div>

                <button onClick={() => setIsFindReplaceVisible(v => !v)} className="bg-gray-700 p-2 rounded-md hover:bg-gray-600"><FindReplaceIcon className="w-4 h-4" /></button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md text-sm hover:bg-gray-600"><UploadIcon className="w-4 h-4"/><span>Import</span></button>
                <button onClick={handleFileExport} className="flex items-center space-x-2 bg-gray-700 p-2 rounded-md text-sm hover:bg-gray-600"><DownloadIcon className="w-4 h-4"/><span>Export</span></button>
                <button onClick={() => setModal({ type: 'help' })} className="bg-gray-700 p-2 rounded-md hover:bg-gray-600"><HelpIcon className="w-4 h-4"/></button>
                <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".txt,.md,text/plain" className="hidden" />
            </div>
          </div>
          {isFindReplaceVisible && <FindReplace onFind={handleFind} onReplace={handleReplace} onReplaceAll={handleReplaceAll} onClose={() => setIsFindReplaceVisible(false)} />}
          {toolbarPosition && (
              <div
                  className="absolute z-10 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-1 flex gap-1"
                  style={{ top: toolbarPosition.top, left: toolbarPosition.left, transform: 'translateX(-50%)' }}
              >
                  <button onClick={() => handleInlineAIAction('rephrase')} className="text-xs hover:bg-gray-700 px-2 py-1 rounded">Rephrase</button>
                  <button onClick={() => handleInlineAIAction('shorten')} className="text-xs hover:bg-gray-700 px-2 py-1 rounded">Shorten</button>
                  <button onClick={() => handleInlineAIAction('expand')} className="text-xs hover:bg-gray-700 px-2 py-1 rounded">Expand</button>
              </div>
          )}
          <textarea
              ref={textareaRef}
              onMouseUp={handleSelectionChange}
              onKeyUp={handleSelectionChange}
              placeholder="Paste your script here..."
              className="w-full flex-grow bg-transparent p-4 text-lg"
              value={script}
              onChange={(e) => setScript(e.target.value)}
          />
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-bold text-cyan-400 mb-6">Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {/* Scroll Speed */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="scrollSpeed" className="text-sm font-medium text-gray-300">Scroll Speed: <span className="font-bold text-cyan-400">{settings.scrollSpeed}</span></label>
              <input id="scrollSpeed" type="range" min="1" max="10" value={settings.scrollSpeed} onChange={e => handleSettingChange('scrollSpeed', +e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>

            {/* Font Size */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="fontSize" className="text-sm font-medium text-gray-300">Font Size: <span className="font-bold text-cyan-400">{settings.fontSize}</span></label>
              <input id="fontSize" type="range" min="2" max="20" value={settings.fontSize} onChange={e => handleSettingChange('fontSize', +e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>

            {/* Line Spacing */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="lineHeight" className="text-sm font-medium text-gray-300">Line Spacing: <span className="font-bold text-cyan-400">{settings.lineHeight}</span></label>
              <input id="lineHeight" type="range" min="1" max="3" step="0.1" value={settings.lineHeight} onChange={e => handleSettingChange('lineHeight', +e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
            </div>

            {/* Font Family */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="fontFamily" className="text-sm font-medium text-gray-300">Font</label>
              <select id="fontFamily" value={settings.fontFamily} onChange={e => handleSettingChange('fontFamily', e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5">
                {fonts.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            {/* Font Color */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="fontColor" className="text-sm font-medium text-gray-300">Font Color</label>
              <div className="relative">
                <input id="fontColor" type="color" value={settings.fontColor} onChange={e => handleSettingChange('fontColor', e.target.value)} className="p-1 h-10 w-full block bg-gray-700 border border-gray-600 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none" />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 uppercase text-xs font-semibold text-gray-400">{settings.fontColor}</span>
              </div>
            </div>
            
            {/* Text BG Color */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="textBackgroundColor" className="text-sm font-medium text-gray-300">Text BG Color</label>
              <div className="relative">
                <input id="textBackgroundColor" type="color" value={settings.textBackgroundColor} onChange={e => handleSettingChange('textBackgroundColor', e.target.value)} className="p-1 h-10 w-full block bg-gray-700 border border-gray-600 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none" />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 uppercase text-xs font-semibold text-gray-400">{settings.textBackgroundColor}</span>
              </div>
            </div>

            {/* Alignment */}
            <div className="lg:col-span-3">
              <label className="block mb-2 text-sm font-medium text-gray-300">Alignment</label>
              <div className="flex rounded-md shadow-sm" role="group">
                {(['left', 'center', 'right'] as const).map((a, i) => (
                  <button
                    key={a}
                    onClick={() => handleSettingChange('textAlign', a)}
                    className={`px-4 py-2 text-sm font-medium capitalize border-t border-b border-gray-600 focus:z-10 focus:ring-2 focus:ring-cyan-500 focus:text-white transition-colors duration-150
                      ${settings.textAlign === a ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                      ${i === 0 ? 'rounded-l-lg border-l' : ''}
                      ${i === 2 ? 'rounded-r-lg border-r' : ''}
                    `}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Toggles */}
            <div className="flex items-center gap-6 md:col-span-2 lg:col-span-3">
                <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-300">
                  <input type="checkbox" checked={settings.isMirrored} onChange={e => handleSettingChange('isMirrored', e.target.checked)} className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-offset-gray-800 focus:ring-2" />
                  <span>Mirror Text</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-300">
                  <input type="checkbox" checked={settings.showGuides} onChange={e => handleSettingChange('showGuides', e.target.checked)} className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-offset-gray-800 focus:ring-2" />
                  <span>Show Guides</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-300">
                  <input type="checkbox" checked={settings.showCamera} onChange={e => handleSettingChange('showCamera', e.target.checked)} className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-offset-gray-800 focus:ring-2" />
                  <span>Show Camera</span>
                </label>
            </div>
          </div>
        </div>
        <button onClick={onStart} className="w-full bg-cyan-500 hover:bg-cyan-600 transition-colors p-4 rounded-lg text-xl font-bold text-white shadow-lg">Start Prompter</button>
      </main>
    </div>
  );
};

export default Editor;