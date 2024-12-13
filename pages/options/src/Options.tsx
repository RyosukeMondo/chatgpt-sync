// Path: Z:\home\rmondo\repos\chatgpt-sync/pages/options/src/Options.tsx
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

  const menuItems = [
    {
      key: 'input',
      label: 'Input Path Setting',
      colorClass: 'bg-blue-500',
      icon: '📝',
      component: <InputPathSetting />,
    },
    {
      key: 'assistant',
      label: 'Assistant Response',
      colorClass: 'bg-green-500',
      icon: '💬',
      component: <AssistantResponseContent />,
    },
    {
      key: 'codebase',
      label: 'CodeBase',
      colorClass: 'bg-purple-500',
      icon: '💻',
      component: <CodeBase />,
    },
  ];

  const currentMenuItem = menuItems.find(item => item.key === activeContent);

  return (
    <div className={`flex h-screen ${isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      {/* Left Side Menu */}
      <aside className="w-64 bg-gray-200 dark:bg-gray-900 p-4 overflow-auto text-left border-r border-gray-300 dark:border-gray-700">
        <div className="mb-6 flex items-center justify-center">
          <img src={logo} alt="Logo" className="w-32 h-auto" />
        </div>
        <nav className="flex flex-col space-y-2">
          {menuItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveContent(item.key as 'input' | 'assistant' | 'codebase')}
              className={`w-full p-2 text-white rounded transition-colors duration-200 flex items-center justify-start gap-2 
                ${activeContent === item.key ? `${item.colorClass}` : 'bg-gray-400 hover:bg-gray-500'}
              `}
              aria-current={activeContent === item.key ? 'page' : undefined}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-auto text-left">
        {/* Header */}
        <header className="p-4 border-b border-gray-300 dark:border-gray-700">
          <h1 className="text-xl font-semibold">{currentMenuItem ? currentMenuItem.label : 'Options'}</h1>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto text-left">
          {!currentMenuItem && <p className="text-gray-500">Select a section from the left menu to begin.</p>}
          {currentMenuItem?.component}
        </div>
      </main>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <div> Loading ... </div>), <div> Error Occur </div>);
