import React from 'react';
import Editor from './components/Editor';
import Teleprompter from './components/Teleprompter';
import useLocalStorage from './hooks/useLocalStorage';
import type { Settings } from './types';

const App: React.FC = () => {
  const [script, setScript] = useLocalStorage<string>('teleprompter-script', 'Welcome to your personal teleprompter. Paste your script here to get started!');
  const [settings, setSettings] = useLocalStorage<Settings>('teleprompter-settings', {
    scrollSpeed: 3,
    fontSize: 6,
    lineHeight: 1.5,
    isMirrored: false,
    fontFamily: 'Arial',
    showGuides: false,
    textAlign: 'center',
    showCamera: false,
    fontColor: '#FFFFFF',
    textBackgroundColor: 'transparent',
  });
  const [isPrompterActive, setIsPrompterActive] = React.useState(false);

  const startPrompter = () => {
    setIsPrompterActive(true);
  };

  const stopPrompter = () => {
    setIsPrompterActive(false);
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col antialiased">
      {isPrompterActive ? (
        <Teleprompter script={script} settings={settings} onExit={stopPrompter} />
      ) : (
        <Editor
          script={script}
          setScript={setScript}
          settings={settings}
          setSettings={setSettings}
          onStart={startPrompter}
        />
      )}
    </div>
  );
};

export default App;
