import React from 'react';
import { Button } from '@extension/ui';

interface CodeTabProps {
  code: string;
}

const CodeTab: React.FC<CodeTabProps> = ({ code }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(
      () => {
        alert('Code copied to clipboard!');
      },
      err => {
        alert('Failed to copy code.');
        console.error('Clipboard copy failed:', err);
      }
    );
  };

  return (
    <div className="text-left">
      <pre className="bg-gray-900 dark:bg-gray-700 p-4 rounded overflow-auto">
        <code>{code}</code>
      </pre>
      <Button onClick={copyToClipboard} className="mt-2 text-left" theme="primary">
        Copy to Clipboard
      </Button>
    </div>
  );
};

export default CodeTab;