import React from 'react';
import ReactMarkdown from 'react-markdown';
import './MarkdownPreview.css';

type MarkdownPreviewProps = {
  markdownContent: string;
};

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ markdownContent }) => {
  return (
    <div className="markdown-preview">
      <ReactMarkdown>{markdownContent}</ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
