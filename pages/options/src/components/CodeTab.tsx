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
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const filteredTabs = tabs.filter(tab =>
    tab.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = () => {
    const codeToCopy = tabs[activeTab]?.content || '';
    navigator.clipboard.writeText(codeToCopy).then(
      () => {
        setLogs(prev => [...prev, 'コードがクリップボードにコピーされました。']);
      },
      (err) => {
        setLogs(prev => [...prev, 'コードのコピーに失敗しました。']);
        console.error('Clipboard copy failed:', err);
      }
    );
  };

  const handleSendToPath = async () => {
    const codeToSend = tabs[activeTab]?.content || '';
    const pathToSend = tabs[activeTab]?.fullPath || '';
    try {
      await sendToPath(pathToSend, codeToSend);
      setLogs(prev => [...prev, `パス "${pathToSend}" への送信に成功しました。`]);
    } catch (err) {
      setLogs(prev => [...prev, `パス "${pathToSend}" への送信に失敗しました。`]);
      console.error('Send to path failed:', err);
    }
  };

  const handleSendToPathAll = async () => {
    try {
      await sendToPathAll();
      setLogs(prev => [...prev, 'すべてのパスへの送信に成功しました。']);
    } catch (err) {
      setLogs(prev => [...prev, '一部の送信に失敗しました。']);
      console.error('Send to path all failed:', err);
    }
  };

  const sendToPathAll = async () => {
    const promises = tabs.map(tab => {
      if (tab.fullPath && tab.content) {
        return sendToPath(tab.fullPath, tab.content);
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
  };

  const handleToggleHeight = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div className="code-tab-container">
      {/* Operation Panel */}
      <div className="operation-panel flex items-center space-x-2 mb-4">
        <Button onClick={handleToggleHeight} className="text-left" theme="light">
          {isExpanded ? '高さを縮小' : '高さを拡大'}
        </Button>
        <Button onClick={copyToClipboard} className="text-left" theme="light">
          クリップボードにコピー
        </Button>
        <Button onClick={handleSendToPath} className="text-left" theme="light">
          パスに送信
        </Button>
        <Button onClick={handleSendToPathAll} className="text-left" theme="light">
          すべてのパスに送信
        </Button>
      </div>

      {/* Dropdown with Search */}
      <div className="dropdown-container flex items-center border-b">
        <input
          type="text"
          placeholder="タブを検索..."
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
            <pre className={`bg-gray-900 dark:bg-gray-700 p-4 rounded overflow-auto ${isExpanded ? 'h-96' : 'h-48'}`}>
              <code>{tabs[activeTab].content}</code>
            </pre>
            <div className="mt-2 flex space-x-2">
              {/* Buttons are moved to Operation Panel */}
            </div>
          </>
        ) : (
          <p>コードスニペットが利用可能ではありません。</p>
        )}
      </div>

      {/* Log Area */}
      <div className="log-area mt-4 p-2 border rounded bg-gray-100 dark:bg-gray-800">
        <h3 className="font-bold">ログ</h3>
        <ul className="list-disc list-inside">
          {logs.map((log, index) => (
            <li key={index} className="text-sm">
              {log}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CodeTab;