import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage, assistantResponseStorage, nativeAppPathStorage } from '@extension/storage';
import { Button } from '@extension/ui';
import React, { useState, useMemo, useEffect } from 'react';
import { htmlToText } from 'html-to-text';

// Import extracted components
import ListAssistantResponse from './components/ListAssistantResponse';
import AssistantResponseContent from './components/AssistantResponseContent';
import { AssistantResponse } from './types';

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = isLight ? 'pages/options/logo_horizontal.svg' : 'pages/options/logo_horizontal_dark.svg';
  const goGithubSite = () =>
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  // Retrieve stored assistant responses
  const storedResponses = useStorage(assistantResponseStorage);

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

  console.log('loaded nativeAppPath', storedNativeAppPath);
  console.log('loaded inputPath', inputPath);

  // Extract epoch time from the id and store it in the state
  const [assistantResponses, setAssistantResponses] = useState<AssistantResponse[]>(
    Array.isArray(storedResponses)
      ? storedResponses.map((response: any) => {
          // Extract epoch time using regex
          const match = response.content.match(/assistant-(\d+)-/);
          const epochTime = match ? parseInt(match[1], 10) : Date.now();
          return {
            ...response,
            summary: htmlToText(response.content, { wordwrap: 80 }).split('\n')[0],
            epochTime,
          };
        })
      : []
  );

  const [selectedResponse, setSelectedResponse] = useState<AssistantResponse | null>(null);

  const viewResponse = (response: AssistantResponse) => {
    setSelectedResponse(response);
  };

  const removeResponse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      const updatedResponses = assistantResponses.filter(response => response.id !== id);
      setAssistantResponses(updatedResponses);
      await assistantResponseStorage.removeResponse(id);
      if (selectedResponse && selectedResponse.id === id) {
        setSelectedResponse(null);
      }
    }
  };

  const saveNativeAppPath = async () => {
    console.log('inputPath', inputPath);
    await nativeAppPathStorage.setAppPath(inputPath);
    console.log('Saved inputPath', inputPath);
    alert('Native app path saved successfully!');
  };

  // Memoize sorted responses to optimize performance
  const sortedResponses = useMemo(() => {
    return [...assistantResponses].sort((a, b) => b.epochTime - a.epochTime); // Default to descending
  }, [assistantResponses]);

  return (
    <div className={`flex h-screen ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      {/* Left Side Menu */}
      <aside className="w-64 bg-gray-200 dark:bg-gray-900 p-4 overflow-auto text-left">
        <div className="mb-6">
          <img src={logo} alt="Logo" className="w-full" />
        </div>
        <div className="mb-4">
          <Button onClick={exampleThemeStorage.toggle} theme={theme} className="w-full mb-2 text-left">
            Toggle Theme
          </Button>
          <Button onClick={goGithubSite} theme={theme} className="w-full text-left">
            GitHub
          </Button>
        </div>
        <ListAssistantResponse
          responses={sortedResponses}
          onSelect={viewResponse}
          onRemove={removeResponse}
          theme={theme}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto text-left">
        {selectedResponse ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">Response Details</h2>
            <div
              className="prose dark:prose-dark overflow-auto max-h-80 mb-4"
              dangerouslySetInnerHTML={{ __html: selectedResponse.content }}
            />
            <AssistantResponseContent content={selectedResponse.content} />
            <Button onClick={() => setSelectedResponse(null)} className="mt-4 text-left" theme={theme}>
              Deselect
            </Button>
          </div>
        ) : (
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
          </div>
        )}
      </main>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Options, <div> Loading ... </div>),
  <div> Error Occur </div>
);