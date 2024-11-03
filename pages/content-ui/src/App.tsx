import { useEffect } from 'react';
import { Button } from '@extension/ui';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { useExtractAssistantResponse } from '@extension/shared/lib/hooks/useExtractAssistantResponse';
import { useUpdatePrompt } from '@extension/shared/lib/hooks/useUpdatePrompt';

export default function App() {
  const theme = useStorage(exampleThemeStorage);
  const { extractAndStore, isObserving, startObserving, stopObserving } = useExtractAssistantResponse();
  useUpdatePrompt();

  const handleToggleObserve = () => {
    if (isObserving) {
      stopObserving();
    } else {
      startObserving();
    }
  };

  useEffect(() => {
    console.log('content ui loaded');
    console.log(document.body);
  }, []);

  return (
    <div className="flex flex-col items-start gap-2 rounded bg-blue-100 px-2 py-1">
      <div className="flex gap-1 text-blue-500">
        Edit <strong className="text-blue-700">pages/content-ui/src/App.tsx</strong> and save to reload.
      </div>
      <div className="flex gap-2">
        <Button theme={theme} onClick={handleToggleObserve}>
          {isObserving ? '停止' : '開始'} オブザーバー
        </Button>
        <Button theme={theme} onClick={extractAndStore}>
          抽出
        </Button>
      </div>
    </div>
  );
}
