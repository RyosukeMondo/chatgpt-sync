import { useEffect } from 'react';
import { Button } from '@extension/ui';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { useExtractAssistantResponse } from '@extension/shared/lib/hooks/useExtractAssistantResponse';

export default function App() {
  const theme = useStorage(exampleThemeStorage);
  const { extractAndStore } = useExtractAssistantResponse();

  useEffect(() => {
    console.log('content ui loaded');
    // get body and console.log it
    console.log(document.body);
  }, []);

  return (
    <div className="flex flex-col items-start gap-2 rounded bg-blue-100 px-2 py-1">
      <div className="flex gap-1 text-blue-500">
        Edit <strong className="text-blue-700">pages/content-ui/src/App.tsx</strong> and save to reload.
      </div>
      <div className="flex gap-2">
        <Button theme={theme} onClick={exampleThemeStorage.toggle}>
          Toggle Theme
        </Button>
        <Button theme={theme} onClick={extractAndStore}>
          Extract Assistant Responses
        </Button>
      </div>
    </div>
  );
}