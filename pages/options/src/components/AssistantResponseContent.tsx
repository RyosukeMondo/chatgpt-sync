import React, { useState, useEffect } from 'react';
import CodeTab from './CodeTab';

interface AssistantResponseContentProps {
  content: string;
}

const AssistantResponseContent: React.FC<AssistantResponseContentProps> = ({ content }) => {
  const [codeSnippets, setCodeSnippets] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const codeElements = Array.from(doc.querySelectorAll('code'));
    const snippets = codeElements.map(code => code.textContent || '');
    const filteredSnippets = snippets.filter(snippet => snippet.trim().length > 100);
    setCodeSnippets(filteredSnippets);
    setActiveTab(0);
  }, [content]);

  if (codeSnippets.length === 0) {
    return <p className="text-left">No code snippets found in this response.</p>;
  }

  return (
    <div className="text-left">
      <div className="tabs">
        {codeSnippets.map((_, index) => (
          <button
            key={index}
            className={`tab ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            Code {index + 1}
          </button>
        ))}
      </div>
      <div className="tab-content mt-4">
        <CodeTab code={codeSnippets[activeTab]} />
      </div>
    </div>
  );
};

export default AssistantResponseContent;