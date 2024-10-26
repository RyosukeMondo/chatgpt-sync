import React from 'react';
import useAssistantResponse from '../hooks/useAssistantResponse';

const AssistantResponseDisplay: React.FC = () => {
  const { htmlSnippet, clearSnippet } = useAssistantResponse();

  return (
    <div>
      <h2>Assistant Response</h2>
      <div
        dangerouslySetInnerHTML={{ __html: htmlSnippet }}
        style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}
      />
      <button onClick={clearSnippet} style={{ marginTop: '10px' }}>
        Clear Snippet
      </button>
    </div>
  );
};

export default AssistantResponseDisplay;