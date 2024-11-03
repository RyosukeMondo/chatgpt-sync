import React from 'react';
import { sendToPath } from './communication/sendToPath';
import { codeBasePathStorage } from '@extension/storage';
import { Button } from '@extension/ui';

interface AssistantResponseOperationPanelProps {
  responseId: string;
  markdownContent: string;
  showDangerousHTML: boolean;
  setShowDangerousHTML: (value: boolean) => void;
  showMarkdown: boolean;
  setShowMarkdown: (value: boolean) => void;
  showLog: boolean;
  setShowLog: (value: boolean) => void;
}

const AssistantResponseOperationPanel: React.FC<AssistantResponseOperationPanelProps> = ({
  responseId,
  markdownContent,
  showDangerousHTML,
  setShowDangerousHTML,
  showMarkdown,
  setShowMarkdown,
  showLog,
  setShowLog,
}) => {
  const handleSend = async () => {
    try {
      const pathObj = await codeBasePathStorage.get();
      const folderPath = pathObj?.path;
      if (!folderPath) {
        console.error('コードベースのパスが設定されていません。');
        return;
      }
      const filePath = `${folderPath}/assistant_response_${responseId}.md`;
      await sendToPath(filePath, markdownContent);
      console.log('レスポンスをパスに送信しました。');
    } catch (error) {
      console.error('送信中にエラーが発生しました:', error);
    }
  };

  return (
    <div className="operation-panel">
      <Button onClick={() => setShowDangerousHTML(!showDangerousHTML)}>
        {showDangerousHTML ? '危険なHTMLを非表示' : '危険なHTMLを表示'}
      </Button>
      <Button onClick={() => setShowMarkdown(!showMarkdown)}>
        {showMarkdown ? 'Markdownを非表示' : 'Markdownを表示'}
      </Button>
      <Button onClick={() => setShowLog(!showLog)}>{showLog ? 'ログを非表示' : 'ログを表示'}</Button>
      <Button onClick={handleSend}>パスに送信</Button>
    </div>
  );
};

export default AssistantResponseOperationPanel;
