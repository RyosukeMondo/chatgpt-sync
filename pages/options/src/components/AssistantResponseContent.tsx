import React, { useState, useMemo } from 'react';
import CodeTab from './CodeTab';
import MarkdownPreview from './MarkdownPreview';
import type { AssistantResponse } from '../../../../types/types';
import { useStorage } from '@extension/shared';
import { assistantResponseStorage } from '@extension/storage';
import { assistantWaitingStorage } from '@extension/storage/lib/impl/assistantWaitingStorage';
import { Button } from '@extension/ui';
import ListAssistantResponse from './ListAssistantResponse';
import AssistantResponseOperationPanel from './AssistantResponseOperationPanel';
import './AssistantResponseContent.css';

const AssistantResponseContent: React.FC = () => {
  const storedResponses = useStorage(assistantResponseStorage);
  const isWaiting = useStorage(assistantWaitingStorage);

  const responses = useMemo(() => {
    const list = Array.isArray(storedResponses) ? storedResponses : [];
    return [...list].sort((a, b) => b.epochTime - a.epochTime);
  }, [storedResponses]);

  const [selectedResponse, setSelectedResponse] = useState<AssistantResponse | null>(null);

  const [showDangerousHTML, setShowDangerousHTML] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const viewResponse = (response: AssistantResponse) => {
    setSelectedResponse(response);
  };

  const removeResponse = async (id: string) => {
    if (window.confirm('このレスポンスを削除してもよろしいですか？')) {
      await assistantResponseStorage.removeResponse(id);
      if (selectedResponse && selectedResponse.id === id) {
        setSelectedResponse(null);
      }
    }
  };

  return (
    <div className="assistant-content fixed w-full assistant-content">
      {isWaiting && (
        <div className="waiting-indicator bg-blue-100 p-2 text-center text-blue-700 fixed top-0 left-0 w-full z-50">
          応答を待っています...
        </div>
      )}
      <ListAssistantResponse
        responses={responses}
        onSelect={viewResponse}
        onRemove={removeResponse}
      />
      {selectedResponse && (
        <div className="response-details">
          <AssistantResponseOperationPanel
            responseId={selectedResponse.id}
            markdownContent={selectedResponse.markdown}
            showDangerousHTML={showDangerousHTML}
            setShowDangerousHTML={setShowDangerousHTML}
            showMarkdown={showMarkdown}
            setShowMarkdown={setShowMarkdown}
            showLog={showLog}
            setShowLog={setShowLog}
          />
          <h2 className="text-lg font-semibold mb-4">Response Details</h2>
          <div className="flex mb-4">
            {showDangerousHTML && (
              <div
                className="w-1/2 prose dark:prose-dark overflow-auto max-h-80 mr-2"
                dangerouslySetInnerHTML={{ __html: selectedResponse.content }}
              />
            )}
            {showMarkdown && selectedResponse.markdown && (
              <div className="w-1/2 overflow-auto max-h-80 ml-2">
                <MarkdownPreview markdownContent={selectedResponse.markdown} />
              </div>
            )}
          </div>
          <CodeTab htmlContent={selectedResponse.content} />
          {showLog && (
            <div className="log-section">
              <p>ログ内容...</p>
            </div>
          )}
          <Button onClick={() => setSelectedResponse(null)} className="mt-4 text-left">
            選択解除
          </Button>
        </div>
      )}
    </div>
  );
};

export default AssistantResponseContent;
