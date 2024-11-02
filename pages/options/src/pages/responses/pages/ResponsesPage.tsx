// Path: Z:/home/rmondo/repos/chatgpt-sync/pages/options/src/pages/responses/pages/ResponsesPage.tsx
import React, { useState, useEffect } from 'react';
import ResponseList from '../components/ResponseList';
import { AssistantResponse } from '../../../types';
import { assistantResponseStorage, AssistantResponse as StorageAssistantResponse } from '@extension/storage';

const ResponsesPage: React.FC = () => {
  const [responses, setResponses] = useState<StorageAssistantResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const stored = await assistantResponseStorage.getAllresponses();
        setResponses(stored);
      } catch (err) {
        setError('Failed to load responses.');
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, []);

  const handleSelect = (response: AssistantResponse) => {
    // Handle detailed view logic
  };

  const handleRemove = async (id: string) => {
    try {
      await assistantResponseStorage.removeResponse(id);
      setResponses(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError('Failed to remove the response.');
    }
  };

  return (
    <div className="responses-page container">
      <h2 className="page-title">応答履歴</h2>
      {loading ? (
        <p className="status-message">読み込み中...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <ResponseList responses={responses} onSelect={handleSelect} onRemove={handleRemove} />
      )}
    </div>
  );
};

export default ResponsesPage;
