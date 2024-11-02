import React, { useState } from 'react';
import { Button } from '@extension/ui';
import { useCodeSnippet } from './useCodeSnippet';
import { CodeTabProps, Tab } from '../types';
import { sendToPath } from './communication/sendToPath';

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
      fullPath: snippet.fullPath,
      content: snippet.content,
    };
  });

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTabs = tabs.filter(tab =>
    tab.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleSendToPath = () => {
    const codeToSend = tabs[activeTab]?.content || '';
    const pathToSend = tabs[activeTab]?.fullPath || '';
    sendToPath(pathToSend, codeToSend);
  };

  return (
    <div className="code-tab-container">
      {/* Dropdown with Search */}
      <div className="dropdown-container flex items-center border-b">
        <input
          type="text"
          placeholder="Search tabs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-l"
        />
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(Number(e.target.value))}
          className="p-2 border-t border-b border-r rounded-r"
        >
          {filteredTabs.map((tab, index) => (
            <option key={index} value={tabs.indexOf(tab)}>
              {tab.label}
            </option>
          ))}
        </select>
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
              <Button onClick={handleSendToPath} className="text-left" theme="light">
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