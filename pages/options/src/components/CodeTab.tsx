import React from 'react';
import { Button } from '@extension/ui';
import { useCodeSnippet } from './useCodeSnippet';
import { CodeTabProps, Tab } from '../types';
import { nativeAppPathStorage } from '@extension/storage'; // Import the storage utility

const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const CodeTab: React.FC<CodeTabProps> = ({ htmlContent }) => {
  const { snippets } = useCodeSnippet(htmlContent);

  const fileNameCount: { [key: string]: number } = {};

  const tabs: Tab[] = snippets.map((snippet, index) => {
    let label: string;
    if (snippet.fileName) {
      if (!fileNameCount[snippet.fileName]) {
        fileNameCount[snippet.fileName] = 1;
      } else {
        fileNameCount[snippet.fileName]++;
      }
      const ordinal = getOrdinal(fileNameCount[snippet.fileName]);
      label = `${snippet.fileName} (${ordinal})`;
    } else {
      label = `${index + 1}`;
    }
    return {
      label,
      content: snippet.content,
    };
  });

  const [activeTab, setActiveTab] = React.useState(0);

  const copyToClipboard = () => {
    const codeToCopy = tabs[activeTab]?.content || '';
    navigator.clipboard.writeText(codeToCopy).then(
      () => {
        alert('Code copied to clipboard!');
      },
      (err) => {
        alert('Failed to copy code.');
        console.error('Clipboard copy failed:', err);
      }
    );
  };

  const sendToPath = async () => {
    const codeToSend = tabs[activeTab]?.content || '';

    try {
      // Use the storage utility to get the nativeAppPath object
      const pathObj = await nativeAppPathStorage.get();
      const path = pathObj?.path;

      console.log('Loaded nativeAppPath:', pathObj);
      console.log('Loaded inputPath:', path);

      if (!path) {
        alert('Native app path is not set. Please configure it in the options.');
        return;
      }

      const message = {
        path,
        code: codeToSend,
      };

      chrome.runtime.sendNativeMessage('com.your_company.chatgpt_sync', message, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending native message:', chrome.runtime.lastError);
          alert('Failed to send code to native app.');
        } else {
          console.log('Native app response:', response);
          alert('Code successfully sent to native app!');
        }
      });
    } catch (error) {
      console.error('Error retrieving nativeAppPath:', error);
      alert('An error occurred while retrieving the native app path.');
    }
  };

  return (
    <div className="code-tab-container">
      {/* Tabs */}
      <div className="tabs flex border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`py-2 px-4 -mb-px ${
              activeTab === index
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-500 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="mt-4">
        {tabs.length > 0 ? (
          <>
            <pre className="bg-gray-900 dark:bg-gray-700 p-4 rounded overflow-auto">
              <code>{tabs[activeTab].content}</code>
            </pre>
            <div className="mt-2 flex space-x-2">
              <Button onClick={copyToClipboard} className="text-left" theme="light">
                Copy to Clipboard
              </Button>
              <Button onClick={sendToPath} className="text-left" theme="light">
                Send to Path
              </Button>
            </div>
          </>
        ) : (
          <p>No code snippets available.</p>
        )}
      </div>
    </div>
  );
};

export default CodeTab;