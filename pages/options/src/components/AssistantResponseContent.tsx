import React, { useState } from 'react';
import CodeTab from './CodeTab';
import MarkdownPreview from './MarkdownPreview';
import { AssistantResponse } from '../../../../types/types';
import { useStorage } from '@extension/shared';
import { assistantResponseStorage } from '@extension/storage';
import { Button } from '@extension/ui';
import ListAssistantResponse from './ListAssistantResponse';
import './AssistantResponseContent.css';

const AssistantResponseContent = () => {
  const storedResponses = useStorage(assistantResponseStorage);
  const [assistantResponses, setAssistantResponses] = useState<AssistantResponse[]>(
    Array.isArray(storedResponses) ? storedResponses : [],
  );

  const [selectedResponse, setSelectedResponse] = useState<AssistantResponse | null>(null);

  const viewResponse = (response: AssistantResponse) => {
    console.log(response);
    setSelectedResponse(response);
  };

  const removeResponse = async (id: string) => {
    if (window.confirm('このレスポンスを削除してもよろしいですか？')) {
      const updatedResponses = assistantResponses.filter(response => response.id !== id);
      setAssistantResponses(updatedResponses);
      await assistantResponseStorage.removeResponse(id);
      if (selectedResponse && selectedResponse.id === id) {
        setSelectedResponse(null);
      }
    }
  };

  return (
    <div className="assistant-content fixed w-full assistant-content">
      <ListAssistantResponse
        responses={[...assistantResponses].sort((a, b) => b.epochTime - a.epochTime)}
        onSelect={viewResponse}
        onRemove={removeResponse}
      />
      {selectedResponse && (
        <div className="response-details">
          <h2 className="text-lg font-semibold mb-4">Response Details</h2>
          <div className="flex mb-4">
            <div
              className="w-1/2 prose dark:prose-dark overflow-auto max-h-80 mr-2"
              dangerouslySetInnerHTML={{ __html: selectedResponse.content }}
            />
            {selectedResponse.markdown && (
              <div className="w-1/2 overflow-auto max-h-80 ml-2">
                <MarkdownPreview markdownContent={selectedResponse.markdown} />
              </div>
            )}
          </div>
          <CodeTab htmlContent={selectedResponse.content} />
          <Button onClick={() => setSelectedResponse(null)} className="mt-4 text-left">
            選択解除
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssistantResponseContent;
