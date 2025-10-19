/ (including all other existing functions and UI here, omitted for brevity - unc



 const handleGenerateScript = async (promptText: string) => {
  if (script.trim()) {
    const confirmed = window.confirm("This will replace your current script. Are you sure?");
    if (!confirmed) {
      closeModal();
      return; // Exit and close modal if user cancels
    }
  }
  // DON'T close modal here - it's already in processing state from button click
  setScript('');

  const fullPrompt = `You are a professional scriptwriter. Write a script based on the following topic. The script should be engaging, clear, and well-structured. Topic: "${promptText}"`;
  
  handleApiCallWrapper(
    fullPrompt,
    {},
    (chunk) => setScript(prev => prev + chunk),
    () => closeModal() // Close modal when generation completes
  );
};
  
  const handleSideBySideAction = (prompt: string, type: NonNullable<ModalState['type']>) => {
    setOriginalScript(script);
    setAiGeneratedScript('');
    setModalState({ type, step: 'processing' });
  
    handleApiCallWrapper(
      prompt,
      {},
      (chunk) => setAiGeneratedScript(prev => prev + chunk),
      () => setModalState(prev => ({ ...prev, step: 'result' }))
    );
  };
  
  const executePolish = (customInstructions: string) => {
    const basePrompt = `Polish the following script for clarity, conciseness, and impact. Fix any grammatical errors or awkward phrasing.`;
    const fullPrompt = customInstructions.trim()
      ? `${basePrompt}\n\nAdditional instructions: ${customInstructions}\n\n---\n${script}\n---`
      : `${basePrompt}\n---\n${script}\n---`;
    handleSideBySideAction(fullPrompt, 'polish');
  };

  const executeCoach = (customInstructions: string) => {
    const basePrompt = `Add delivery cues to the following script. Include notes on pacing, tone, emphasis, and suggested pauses (e.g., [pause], [emphasize], [slower]).`;
    const fullPrompt = customInstructions.trim()
      ? `${basePrompt}\n\nAdditional instructions: ${customInstructions}\n\n---\n${script}\n---`
      : `${basePrompt}\n---\n${script}\n---`;
    handleSideBySideAction(fullPrompt, 'coach');
  };

  const executeSummarize = (customInstructions: string) => {
    const basePrompt = `Summarize the following script into key talking points suitable for a social media post or video description.`;
    const fullPrompt = customInstructions.trim()
      ? `${basePrompt}\n\nAdditional instructions: ${customInstructions}\n\n---\n${script}\n---`
      : `${basePrompt}\n---\n${script}\n---`;
    handleSideBySideAction(fullPrompt, 'summarize');
  };

  // FIX: Refactored to correctly handle streaming JSON. It now accumulates chunks and parses the complete response once, fixing a logical bug and potential parsing errors.
  const executeToneAnalysis = () => {
    const prompt = `Analyze the tone of the following script. Break it down by section or paragraph, identifying the primary tone (e.g., "inspirational," "humorous," "formal," "urgent"). Return the analysis as a JSON array where each object has "section" (a short quote from the text) and "tone" keys. Script:\n---\n${script}\n---`;
    setModalState({ type: 'tone', step: 'processing' });
    let fullText = '';
    
    handleApiCallWrapper(
      prompt,
      { responseMimeType: 'application/json', responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { section: { type: Type.STRING }, tone: { type: Type.STRING } } } } },
      (textChunk) => { 
        fullText += textChunk;
      },
      () => { // onComplete
        try {
          // Clean the text before parsing
          const cleanText = fullText.replace(/```json\n?|```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          setModalState({ type: 'tone', step: 'result', data: parsed });
        } catch (err: any) {
          setModalState({ type: 'error', data: `Failed to parse tone analysis. Raw response: ${fullText}` });
        }
      }
    );
  };
  
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => setScript(e.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleFileExport = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'script.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderModal = () => {
    if (!modalState.type) return null;

    let title = '';
    let content: React.ReactNode = null;
    let footer: React.ReactNode = null;

    switch(modalState.type) {
   case 'generate':
  if (modalState.step === 'processing') {
    title = 'AI is Writing Your Script...';
    content = (
      <div className="flex flex-col items-center justify-center py-12">
        <SpinnerIcon className="w-12 h-12 text-cyan-400 mb-4" />
        <p className="text-gray-300">Your script is being generated...</p>
      </div>
    );
  } else {
    title = 'Ask AI to Write a Script';
    content = (
      <textarea
        ref={generatePromptRef}
        placeholder="Describe the script you want (e.g., 'A motivational speech for entrepreneurs')"
        className="w-full h-32 p-3 border border-gray-700 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && generatePromptRef.current?.value.trim()) {
            setModalState({ type: 'generate', step: 'processing' });
            handleGenerateScript(generatePromptRef.current.value);
          }
        }}
      />
    );
    footer = (
      <>
        <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md transition-colors">
          Cancel
        </button>
        <button 
          onClick={() => {
            if (generatePromptRef.current && generatePromptRef.current.value.trim()) {
              setModalState({ type: 'generate', step: 'processing' });
              handleGenerateScript(generatePromptRef.current.value);
            } else {
              generatePromptRef.current?.focus();
            }
          }}
          className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-md transition-colors font-semibold"
        >
          Generate Script
        </button>
      </>
    );
  }
  break;

        
    case 'polish':
    case 'coach':
    case 'summarize':
        const actionText = { polish: 'Polish Script', coach: 'Add Delivery Cues', summarize: 'Summarize' }[modalState.type];
        const placeholderText = { polish: 'e.g., Make it sound more conversational', coach: 'e.g., Focus on a confident tone', summarize: 'e.g., Create bullet points' }[modalState.type];
        const executor = { polish: executePolish, coach: executeCoach, summarize: executeSummarize }[modalState.type];

        if (modalState.step === 'result') {
          title = "Review AI Suggestions";
          content = (
            <div className="grid grid-cols-2 gap-4 h-64">
              <div><h4 className="font-semibold mb-2">Original</h4><div className="bg-gray-900 p-2 h-full overflow-y-auto rounded-md text-sm whitespace-pre-wrap">{originalScript}</div></div>
              <div><h4 className="font-semibold mb-2">Suggested</h4><div className="bg-gray-900 p-2 h-full overflow-y-auto rounded-md text-sm whitespace-pre-wrap">{aiGeneratedScript}</div></div>
            </div>
          );
          footer = <>
            <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md transition-colors">Cancel</button>
            <button onClick={() => { setScript(aiGeneratedScript); closeModal(); }} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-md transition-colors font-semibold">Accept Changes</button>
          </>;
        } else if (modalState.step === 'processing') {
            title = `AI is working...`;
            content = <div className="flex justify-center items-center h-24"><SpinnerIcon className="w-10 h-10 text-cyan-400" /></div>;
        } else {
          title = `Refine with AI: ${actionText}`;
          content = (
            <textarea
              ref={customInstructionsRef}
              placeholder={`Optional instructions. ${placeholderText}`}
              className="w-full h-24 bg-gray-700 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); executor(customInstructionsRef.current?.value || ''); } }}
            />
          );
          footer = <>
            <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md transition-colors">Cancel</button>
            <button onClick={() => { executor(customInstructionsRef.current?.value || ''); }} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-md transition-colors font-semibold">{actionText}</button>
          </>;
        }
        break;
        
    case 'tone':
        title = "AI Tone Analysis";
        if (modalState.step === 'processing') {
            content = <div className="flex justify-center items-center h-24"><SpinnerIcon className="w-10 h-10 text-cyan-400" /></div>;
        } else {
            content = <div className="max-h-80 overflow-y-auto space-y-2">{Array.isArray(modalState.data) ? modalState.data.map((item: ToneAnalysisItem, i: number) => <div key={i} className="bg-gray-700 p-2 rounded-md"><p className="font-semibold text-cyan-300">{item.tone}</p><p className="text-sm text-gray-400 italic">"{item.section}"</p></div>) : <p>No analysis available.</p>}</div>;
            footer = <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md transition-colors">Close</button>;
        }
        break;
        
    case 'error':
        title = "An Error Occurred";
        content = <p className="text-red-400 bg-red-900/50 p-3 rounded-md break-words">{String(modalState.data)}</p>;
        footer = <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md transition-colors">Close</button>;
        break;
    }

    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={closeModal}>
        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full flex flex-col text-white shadow-2xl" onClick={e => e.stopPropagation()}>
         <header className="flex flex-wrap sm:flex-nowrap items-center justify-between pb-2 mb-4 border-b border-gray-700 overflow-x-auto scrollbar-hide">
  <h2 className="text-xl font-bold whitespace-nowrap">{title}</h2>
  <button onClick={closeModal} className="flex-shrink-0 ml-2">
    <CloseIcon className="w-6 h-6" />
  </button>
</header>
  <div className="flex-grow">{content}</div>
          {footer && <footer className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-700">{footer}</footer>}
        </div>
      </div>
    );
  };

  return (
    <main className="flex flex-col h-screen bg-slate-900">
      <header className="flex items-center justify-between p-3 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="mAIstermind Logo" className="w-10 h-10 rounded-md" />
          <h1 className="text-2xl font-bold text-white">mAIstermind <span className="font-light text-gray-400">Teleprompter</span></h1>
        </div>
        <button onClick={onStart} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-transform hover:scale-105">
          Start Prompter
        </button>
      </header>
      
      <div className="p-3 flex gap-2 border-b border-gray-700/50">
        <label className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md cursor-pointer transition-colors flex items-center gap-2"><UploadIcon className="w-4 h-4" /> Import <input type="file" className="hidden" accept=".txt" onChange={handleFileImport} /></label>
        <button onClick={handleFileExport} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"><DownloadIcon className="w-4 h-4" /> Export</button>
        <button onClick={() => setModalState({ type: 'generate', step: 'input' })} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"><SparkleIcon className="w-4 h-4" /> Ask AI</button>
        <div className="relative group">
         <button className="text-xs sm:text-sm md:text-base bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 w-full">
  <PencilIcon className="w-4 h-4" /> AI Tools
</button>
 <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 w-auto max-w-[90vw] opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible overflow-x-hidden">
  ...
</div>
             <a onClick={() => setModalState({ type: 'polish', step: 'input' })} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Polish Script</a>
              <a onClick={() => setModalState({ type: 'coach', step: 'input' })} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Delivery Coach</a>
              <a onClick={() => setModalState({ type: 'summarize', step: 'input' })} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Summarize</a>
              <a onClick={executeToneAnalysis} className="block px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer">Tone Analysis</a>
          </div>
        </div>
        <button onClick={() => setIsFindReplaceVisible(v => !v)} className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"><SearchIcon className="w-4 h-4" /> F&R</button>
      </div>
      
      {isFindReplaceVisible && <FindReplace
        onFind={(term) => {
          if (!term) return 0;
          const matches = script.match(new RegExp(term, 'gi'));
          return matches ? matches.length : 0;
        }}
        onReplace={(find, replace) => {
          const regex = new RegExp(find, 'i'); // Case-insensitive single replace
          setScript(s => s.replace(regex, replace));
        }}
        onReplaceAll={(find, replace) => {
          const regex = new RegExp(find, 'gi'); // Case-insensitive global replace
          setScript(s => s.replace(regex, replace));
        }}
        onClose={() => setIsFindReplaceVisible(false)}
      />}

      <div className="flex flex-grow overflow-hidden">
        <div className="w-full md:w-2/3 flex flex-col">
          <textarea
            ref={textareaRef}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="w-full h-full p-6 bg-slate-800 text-lg leading-relaxed focus:outline-none resize-none"
            placeholder="Paste your script here..."
          />
          <footer className="p-2 bg-slate-900 border-t border-gray-700/50 text-xs text-gray-400 flex justify-end gap-4">
            <span>{wordCount} words</span>
            <span>~{readingTime} min read</span>
          </footer>
        </div>
        <aside className="hidden md:block w-1/3 p-4 bg-slate-900 border-l border-gray-700/50 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          <div className="space-y-4">
            <div><label>Scroll Speed: {settings.scrollSpeed}</label><input type="range" min="1" max="10" value={settings.scrollSpeed} onChange={e => setSettings(s => ({...s, scrollSpeed: +e.target.value}))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>
            <div><label>Font Size (vmin): {settings.fontSize}</label><input type="range" min="2" max="12" step="0.5" value={settings.fontSize} onChange={e => setSettings(s => ({...s, fontSize: +e.target.value}))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>
            <div><label>Line Height: {settings.lineHeight}</label><input type="range" min="1" max="2.5" step="0.1" value={settings.lineHeight} onChange={e => setSettings(s => ({...s, lineHeight: +e.target.value}))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>
            <div>
              <label>Font Family</label>
              <select value={settings.fontFamily} onChange={e => setSettings(s => ({...s, fontFamily: e.target.value}))} className="w-full bg-gray-700 rounded-md p-1.5">
                {fonts.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font, fontSize: '1rem' }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <div><label>Text Align</label><select value={settings.textAlign} onChange={e => setSettings(s => ({...s, textAlign: e.target.value as any}))} className="w-full bg-gray-700 rounded-md p-1.5"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
            <div className="flex items-center justify-between">
              <label htmlFor="fontColor">Font Color</label>
              <input type="color" id="fontColor" value={settings.fontColor} onChange={e => setSettings(s => ({...s, fontColor: e.target.value}))} className="w-10 h-8 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <label htmlFor="bgColor">Text BG Color</label>
              <input type="color" id="bgColor" value={settings.textBackgroundColor === 'transparent' ? '#000000' : settings.textBackgroundColor} onChange={e => setSettings(s => ({...s, textBackgroundColor: e.target.value}))} className="w-10 h-8 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" id="mirror" checked={settings.isMirrored} onChange={e => setSettings(s => ({...s, isMirrored: e.target.checked}))} /><label htmlFor="mirror">Mirror Text</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="guides" checked={settings.showGuides} onChange={e => setSettings(s => ({...s, showGuides: e.target.checked}))} /><label htmlFor="guides">Show Video Guides</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="camera" checked={settings.showCamera} onChange={e => setSettings(s => ({...s, showCamera: e.target.checked}))} /><label htmlFor="camera">Show Camera Feed</label></div>
          </div>
        </aside>
      </div>
      {renderModal()}
    </main>
  );
};

export default Editor;
