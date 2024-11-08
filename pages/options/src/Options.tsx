import React, { useState } from 'react';
import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

import AssistantResponseContent from './components/AssistantResponseContent';
import InputPathSetting from './components/InputPathSetting';
import CodeBase from './components/CodeBase';

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = 'chatgpt-sync.png';
  const [activeContent, setActiveContent] = useState<'input' | 'assistant' | 'codebase'>('input');

  return (
    <div className={`flex h-screen ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      {/* Left Side Menu */}
      <aside className="w-64 bg-gray-200 dark:bg-gray-900 p-4 overflow-auto text-left">
        <div className="mb-6">
          <img src={logo} alt="Logo" className="w-full" />
        </div>
        <button onClick={() => setActiveContent('input')} className="w-full mb-2 p-2 bg-blue-500 text-white">
          Input Path Setting
        </button>
        <button onClick={() => setActiveContent('assistant')} className="w-full mb-2 p-2 bg-green-500 text-white">
          Assistant Response
        </button>
        <button onClick={() => setActiveContent('codebase')} className="w-full p-2 bg-purple-500 text-white">
          CodeBase
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto text-left">
        <div className="flex flex-col items-start justify-start h-full space-y-4">
          <p className="text-gray-500">Select a response from the left menu to view its details.</p>
          {activeContent === 'input' && <InputPathSetting />}
          {activeContent === 'assistant' && <AssistantResponseContent />}
          {activeContent === 'codebase' && <CodeBase />}
        </div>
      </main>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div> Loading ... </div>),
  <div> Error Occur </div>
);
