import React from 'react';
import ListAssistantResponse from './components/ListAssistantResponse';

interface SideMenuProps {
  toggleTheme: () => void;
  goGithubSite: () => void;
  sortedResponses: any[];
  viewResponse: (response: any) => void;
  removeResponse: (id: string) => void;
  theme: string;
}

const SideMenu: React.FC<SideMenuProps> = ({ toggleTheme, goGithubSite, sortedResponses, viewResponse, removeResponse, theme }) => {
  return (
    <aside className="w-64 bg-gray-200 dark:bg-gray-900 p-4 overflow-auto text-left">
      <div className="mb-4">
        <button onClick={toggleTheme} className="w-full mb-2 text-left">
          Toggle Theme
        </button>
        <button onClick={goGithubSite} className="w-full text-left">
          GitHub
        </button>
      </div>
      <ListAssistantResponse
        responses={sortedResponses}
        onSelect={viewResponse}
        onRemove={removeResponse}
        theme={theme}
      />
    </aside>
  );
};

export default SideMenu;