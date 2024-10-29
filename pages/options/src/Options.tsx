import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage, assistantResponseStorage } from '@extension/storage';
import { Button } from '@extension/ui';
import React, { useState, useMemo } from 'react';
import { htmlToText } from 'html-to-text';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Import extracted components
import ListAssistantResponse from './components/ListAssistantResponse';
import AssistantResponseContent from './components/AssistantResponseContent';

interface AssistantResponse {
  id: string;
  content: string;
  summary: string;
  epochTime: number; // Added to store the extracted epoch time
}

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = isLight ? 'options/logo_horizontal.svg' : 'options/logo_horizontal_dark.svg';
  const goGithubSite = () =>
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  // Retrieve stored assistant responses
  const storedResponses = useStorage(assistantResponseStorage);
  
  // State for sorting order: 'asc' or 'desc'
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Extract epoch time from the id and store it in the state
  const [assistantResponses, setAssistantResponses] = useState<AssistantResponse[]>(
    Array.isArray(storedResponses)
      ? storedResponses.map((response: any) => {
          // Extract epoch time using regex
          console.log('response', response);
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

  const closeModal = () => {
    setSelectedResponse(null);
  };

  const removeResponse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      const updatedResponses = assistantResponses.filter(response => response.id !== id);
      setAssistantResponses(updatedResponses);
      await assistantResponseStorage.removeResponse(id);
    }
  };

  // Memoize sorted responses to optimize performance
  const sortedResponses = useMemo(() => {
    return [...assistantResponses].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.epochTime - b.epochTime;
      } else {
        return b.epochTime - a.epochTime;
      }
    });
  }, [assistantResponses, sortOrder]);

  // Function to toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // State for active menu item
  const [activeMenu, setActiveMenu] = useState<'responses' | 'settings'>('responses');

  return (
    <div className={`flex h-screen ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      {/* Left Side Menu */}
      <aside className="w-64 bg-gray-200 dark:bg-gray-900 p-4">
        <div className="mb-6">
          <img src={logo} alt="Logo" className="w-full" />
        </div>
        <nav>
          <ul>
            <li>
              <button
                className={`w-full text-left px-2 py-1 rounded ${
                  activeMenu === 'responses' ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveMenu('responses')}
              >
                Assistant Responses
              </button>
            </li>
            <li className="mt-2">
              <button
                className={`w-full text-left px-2 py-1 rounded ${
                  activeMenu === 'settings' ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveMenu('settings')}
              >
                Settings
              </button>
            </li>
          </ul>
        </nav>
        <div className="mt-6">
          <Button onClick={goGithubSite} theme={theme}>
            GitHub
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {activeMenu === 'responses' && (
          <ListAssistantResponse
            responses={sortedResponses}
            onSelect={viewResponse}
            onRemove={removeResponse}
            sortOrder={sortOrder}
            toggleSortOrder={toggleSortOrder}
            theme={theme}
          />
        )}

        {activeMenu === 'settings' && (
          <div>
            <h2 className="text-lg font-semibold">Settings</h2>
            {/* Add your settings components or content here */}
            <div className="mt-4">
              <Button onClick={exampleThemeStorage.toggle} theme={theme}>
                Toggle Theme
              </Button>
            </div>
          </div>
        )}

        {selectedResponse && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-3xl w-full">
              <h3 className="text-xl font-semibold mb-4">Response Details</h3>
              <AssistantResponseContent content={selectedResponse.content} />
              <button onClick={closeModal} className="mt-4 btn btn-secondary">
                Close
              </button>
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
