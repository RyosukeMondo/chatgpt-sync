import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage, assistantResponseStorage } from '@extension/storage';
import { Button } from '@extension/ui';
import React, { useState } from 'react';
import { htmlToText } from 'html-to-text';

interface AssistantResponse {
  id: string;
  content: string;
  summary: string;
}

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = isLight ? 'options/logo_horizontal.svg' : 'options/logo_horizontal_dark.svg';
  const goGithubSite = () =>
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  // Retrieve stored assistant responses
  const storedResponses = useStorage(assistantResponseStorage);
  const [assistantResponses, setAssistantResponses] = useState<AssistantResponse[]>(
    Array.isArray(storedResponses)
      ? storedResponses.map((response: any) => ({
          ...response,
          summary: htmlToText(response.content, { wordwrap: 80 }).split('\n')[0],
        }))
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

  return (
    <div className={`App ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      <p>
        Edit <code>pages/options/src/Options.tsx</code>
      </p>
      <div className="mt-4">
        <Button onClick={exampleThemeStorage.toggle} theme={theme}>
          Toggle Theme
        </Button>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold">Assistant Responses</h2>
        {assistantResponses.length === 0 ? (
          <p>No assistant responses stored.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {assistantResponses.map(response => (
              <li key={response.id} className="p-4 bg-gray-100 dark:bg-gray-700 rounded flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{response.summary}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="italic">// Path: Z:/home/rmondo/repos/chatgpt-sync/pages/options/src/Options.tsx</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => viewResponse(response)} theme={theme}>
                    View
                  </Button>
                  <Button onClick={() => removeResponse(response.id as string)}
                  className='ml-4'
                   theme={theme}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedResponse && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-lg w-full">
            <h3 className="text-xl font-semibold mb-4">Response Details</h3>
            <div
              className="prose dark:prose-dark overflow-auto max-h-80"
              dangerouslySetInnerHTML={{ __html: selectedResponse.content }}
            />
            <button onClick={closeModal} className="mt-4 btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <div> Loading ... </div>), <div> Error Occur </div>);
