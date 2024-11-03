import React, { useEffect, useState } from 'react';
import { Button } from '@extension/ui';
import { AssistantResponse } from '../../../../types/types';

interface ListAssistantResponseProps {
  responses: AssistantResponse[];
  onSelect: (response: AssistantResponse) => void;
  onRemove: (id: string) => void;
}

const ListAssistantResponse: React.FC<ListAssistantResponseProps> = ({ responses, onSelect, onRemove }) => {
  const [responseList, setResponseList] = useState<AssistantResponse[]>(responses);

  useEffect(() => {
    setResponseList(responses);
  }, [responses]);

  return (
    <div className="text-left">
      <h3 className="text-md font-semibold mb-2">Responses</h3>
      {responseList.length === 0 ? (
        <p className="text-sm text-gray-500">No responses stored.</p>
      ) : (
        <ul className="space-y-1 overflow-y-auto max-h-64">
          {responseList.map(response => {
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
              <li key={response.id} className="p-2 bg-gray-100 dark:bg-gray-700 rounded flex flex-col">
                <button onClick={() => onSelect(response)} className="text-left font-medium text-sm hover:underline">
                  {response.summary}
                </button>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{zonedDate} JST</p>
                <Button onClick={() => onRemove(response.id)} className="mt-1 text-xs text-left" theme={'light'}>
                  Remove
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ListAssistantResponse;
