import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import React from 'react';

import AssistantResponseContent from './components/AssistantResponseContent';
import InputPathSetting from './components/InputPathSetting';

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = 'chatgpt-sync.png';
  return (
    <div className={`flex h-screen ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      {/* Left Side Menu */}
      <aside className="w-64 bg-gray-200 dark:bg-gray-900 p-4 overflow-auto text-left">
        <div className="mb-6">
          <img src={logo} alt="Logo" className="w-full" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto text-left">
        <div className="flex flex-col items-start justify-start h-full space-y-4">
          <p className="text-gray-500">Select a response from the left menu to view its details.</p>
          <InputPathSetting />
          <AssistantResponseContent />
        </div>
      </main>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div> Loading ... </div>),
  <div> Error Occur </div>
);
