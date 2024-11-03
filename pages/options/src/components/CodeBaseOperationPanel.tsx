import React from 'react';

interface CodeBaseOperationPanelProps {
  onDeselectAll: () => void;
  onSendToTab: () => void;
  prompt: string;
  setPrompt: (value: string) => void;
}

const CodeBaseOperationPanel: React.FC<CodeBaseOperationPanelProps> = ({
  onDeselectAll,
  onSendToTab,
  prompt,
  setPrompt,
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <button onClick={onDeselectAll} style={{ marginRight: '10px' }}>
        全ての選択解除
      </button>
      <button onClick={onSendToTab} style={{ marginRight: '10px' }}>
        タブに送信
      </button>
      <textarea
        rows={5}
        name="prompt"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        style={{ width: '100%', marginTop: '10px' }}
        placeholder="プロンプトを入力してください"
      />
    </div>
  );
};

export default CodeBaseOperationPanel;
