import React from 'react';
import { Button } from '@extension/ui';
import { AssistantResponse } from '../Options';

interface ListAssistantResponseProps {
  responses: AssistantResponse[];
  onSelect: (response: AssistantResponse) => void;
  onRemove: (id: string) => void;
  sortOrder: 'asc' | 'desc';
  toggleSortOrder: () => void;
  theme: string;
}

const ListAssistantResponse: React.FC<ListAssistantResponseProps> = ({
  responses,
  onSelect,
  onRemove,
  sortOrder,
  toggleSortOrder,
  theme,
}) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold">Assistant Responses</h2>
      {responses.length === 0 ? (
        <p>No assistant responses stored.</p>
      ) : (
        <>
          <div className="flex justify-end mb-2">
            <Button onClick={toggleSortOrder} theme={theme}>
              Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
          <ul className="mt-2 space-y-2">
            {responses.map(response => {
              const date = new Date(response.epochTime);
              const timeZone = 'Asia/Tokyo';
              const zonedDate = new Intl.DateTimeFormat('en-US', {
                timeZone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              }).format(date);
              
              return (
                <li
                  key={response.id}
                  className="p-4 bg-gray-100 dark:bg-gray-700 rounded flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-medium">{response.summary}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="italic">// Path: Z:/home/rmondo/repos/chatgpt-sync/pages/options/src/Options.tsx</span>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {zonedDate} JST
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => onSelect(response)} theme={theme}>
                      View
                    </Button>
                    <Button
                      onClick={() => onRemove(response.id)}
                      className="ml-4"
                      theme={theme}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default ListAssistantResponse;