import React, { useState, useEffect } from 'react';
import CodeTab from './CodeTab';
import { AssistantResponseContentProps, AssistantResponse } from '../../../../types/types';
import { useStorage } from '@extension/shared';
import { assistantResponseStorage } from '@extension/storage';
import { htmlToText } from 'html-to-text';
import { Button } from '@extension/ui';
import ListAssistantResponse from './ListAssistantResponse';

const AssistantResponseContent = ({ }) => {
  const storedResponses = useStorage(assistantResponseStorage);
  const [assistantResponses, setAssistantResponses] = useState<AssistantResponse[]>(
    Array.isArray(storedResponses)
      ? storedResponses.map((response: any) => {
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

  const removeResponse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this response?')) {
      const updatedResponses = assistantResponses.filter(response => response.id !== id);
      setAssistantResponses(updatedResponses);
      await assistantResponseStorage.removeResponse(id);
      if (selectedResponse && selectedResponse.id === id) {
        setSelectedResponse(null);
      }
    }
  };

  return (
    <div className="assistant-content fixed w-full">
      <ListAssistantResponse
        responses={[...assistantResponses].sort((a, b) => b.epochTime - a.epochTime)}
        onSelect={viewResponse}
        onRemove={removeResponse}
      />
      {selectedResponse && (
        <div className="response-details">
          <h2 className="text-lg font-semibold mb-4">Response Details</h2>
          <div
            className="prose dark:prose-dark overflow-auto max-h-80 mb-4"
            dangerouslySetInnerHTML={{ __html: selectedResponse.content }}
          />
          <CodeTab htmlContent={selectedResponse.content} />
          <Button onClick={() => setSelectedResponse(null)} className="mt-4 text-left">
            Deselect
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssistantResponseContent; 