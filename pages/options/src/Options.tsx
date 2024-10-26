import '@src/Options.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage, assistantResponseStorage } from '@extension/storage';
import { Button } from '@extension/ui';
import React from 'react';

const Options = () => {
  const theme = useStorage(exampleThemeStorage);
  const isLight = theme === 'light';
  const logo = isLight ? 'options/logo_horizontal.svg' : 'options/logo_horizontal_dark.svg';
  const goGithubSite = () =>
    chrome.tabs.create({ url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite' });

  // Retrieve stored assistant responses
  const storedResponses = useStorage(assistantResponseStorage);
  const assistantResponses = Array.isArray(storedResponses) ? storedResponses : [];

  return (
    <div className={`App ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      <button onClick={goGithubSite}>
        <img src={chrome.runtime.getURL(logo)} className="App-logo" alt="logo" />
      </button>
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
            {assistantResponses.map((response: { id: React.Key | null | undefined; content: any; }) => (
              <li key={response.id} className="p-2 bg-gray-200 dark:bg-gray-200 rounded">
                <div
                  dangerouslySetInnerHTML={{ __html: response.content }}
                  className="prose dark:prose-dark"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <div> Loading ... </div>), <div> Error Occur </div>);