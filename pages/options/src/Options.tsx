import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage, assistantResponseStorage, nativeAppPathStorage } from '@extension/storage';
import { Button } from '@extension/ui';
import React, { useState, useMemo, useEffect } from 'react';

import AssistantResponseContent from './components/AssistantResponseContent';

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = 'chatgpt-sync.png';
  const goGithubSite = () =>
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  // Retrieve and set native app path
  const storedNativeAppPath = useStorage(nativeAppPathStorage);
  const [inputPath, setInputPath] = useState<string>(storedNativeAppPath?.path || '');
  
  useEffect(() => {
    // Load the nativeAppPath on component mount
    const loadPath = async () => {
      const savedPathObj = await nativeAppPathStorage.get();
      console.log('loaded nativeAppPath', savedPathObj);
      setInputPath(savedPathObj.path);
    };
    loadPath();
  }, []);

  const saveNativeAppPath = async () => {
    console.log('inputPath', inputPath);
    await nativeAppPathStorage.setAppPath(inputPath);
    console.log('Saved inputPath', inputPath);
    alert('Native app path saved successfully!');
  };

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
          <div className="w-full max-w-md">
            <label htmlFor="nativeAppPath" className="block text-sm font-medium text-gray-700">
              Native App Path
            </label>
            <input
              type="text"
              id="nativeAppPath"
              name="nativeAppPath"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="C:\\path\\to\\native_app.exe"
            />
            <Button onClick={saveNativeAppPath} className="mt-2 text-left" theme={theme}>
              Save Path
            </Button>
          </div>
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