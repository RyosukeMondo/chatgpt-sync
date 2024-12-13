import { useCallback, useEffect, useRef, useState } from 'react';
import { assistantResponseStorage } from '@extension/storage';
import { useStorage } from './useStorage';
import { htmlToText } from 'html-to-text';
import { AssistantResponse } from '../../../../types/types';
import useConvertToMarkdown from './useConvertToMarkdown';

const sentResponseIds = new Set<string>();

function getElementUniqueId(element: Element): string {
  return element.getAttribute('data-message-id') || '';
}

function extractAssistantResponses(): AssistantResponse[] {
  const assistantElements = document.querySelectorAll("div[data-message-author-role='assistant']");
  const responses: AssistantResponse[] = [];
  assistantElements.forEach(element => {
    const responseText = element.outerHTML.trim();
    const id = getElementUniqueId(element);
    if (responseText && id && !sentResponseIds.has(id)) {
      const summary = htmlToText(responseText, { wordwrap: 80 }).split('\n')[0];
      const epochTime = Date.now();
      responses.push({
        id,
        content: responseText,
        summary,
        epochTime,
        markdown: useConvertToMarkdown(responseText),
      });
      sentResponseIds.add(id);
      console.log(`Assistant response detected: ID ${id}`);
    }
  });
  console.log(`Total new assistant responses extracted: ${responses.length}`);
  return responses;
}

export function useExtractAssistantResponse() {
  const storedResponses = useStorage(assistantResponseStorage);
  const [isObserving, setIsObserving] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const pollingRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const extractAndStore = useCallback(async () => {
    console.log('抽出開始');
    const newResponses = extractAssistantResponses();
    if (newResponses.length > 0) {
      // Ensure storedResponses is an array before spreading
      const currentResponses = Array.isArray(storedResponses) ? storedResponses : [];
      const updatedResponses = [...currentResponses, ...newResponses];
      const uniqueResponses = Array.from(new Map(updatedResponses.map(item => [item.id, item])).values());
      await assistantResponseStorage.set(uniqueResponses);
      console.log('Assistant responses have been updated in storage.');
    }
  }, [storedResponses]);

  const handlePolling = useCallback(
    (element: HTMLElement) => {
      let previousContent = element.innerHTML;
      let unchangedCount = 0;

      const intervalId = setInterval(async () => {
        const currentContent = element.innerHTML;
        if (currentContent === previousContent) {
          unchangedCount += 1;
          console.log(`Unchanged count for ID ${getElementUniqueId(element)}: ${unchangedCount}`);
          if (unchangedCount >= 3) {
            clearInterval(intervalId);
            pollingRefs.current.delete(getElementUniqueId(element));

            const uniqueId = getElementUniqueId(element) || `id-${Date.now()}`;
            if (!sentResponseIds.has(uniqueId)) {
              const responseText = element.outerHTML.trim();
              const summary = htmlToText(responseText, { wordwrap: 80 }).split('\n')[0];
              const epochTime = Date.now();
              const response: AssistantResponse = {
                id: uniqueId,
                content: responseText,
                summary,
                epochTime,
                markdown: useConvertToMarkdown(responseText),
              };
              sentResponseIds.add(uniqueId);
              // Ensure storedResponses is an array before spreading
              const currentResponses = Array.isArray(storedResponses) ? storedResponses : [];
              const updatedResponses = [...currentResponses, response];
              await assistantResponseStorage.set(updatedResponses);
              console.log(`Assistant response stored after polling: ID ${uniqueId}`);
            }
          }
        } else {
          unchangedCount = 0;
          previousContent = currentContent;
          console.log(`Content changed for ID ${getElementUniqueId(element)}, reset unchanged count.`);
        }
      }, 1000);

      pollingRefs.current.set(getElementUniqueId(element), intervalId);
      console.log(`Started polling for ID ${getElementUniqueId(element)}`);
    },
    [storedResponses],
  );

  const observeMain = useCallback(() => {
    const mainElement = document.querySelector('main');
    if (!mainElement) {
      console.log('<main> 要素が見つかりません。');
      return;
    }

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element && node.matches("div[data-message-author-role='assistant']")) {
            const element = node as HTMLElement;
            const uniqueId = getElementUniqueId(element);
            console.log(`新しいアシスタント要素が追加されました: ID ${uniqueId}`);
            handlePolling(element);
          }
        });
      });
    });

    observer.observe(mainElement, { childList: true, subtree: true });
    observerRef.current = observer;
    setIsObserving(true);
    console.log('Observing started.');
  }, [handlePolling]);

  const startObserving = useCallback(() => {
    if (observerRef.current) {
      console.log('オブザーバーは既に起動しています。');
      return;
    }

    observeMain();

    // <main>の再生成を監視
    const bodyObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.removedNodes.forEach(node => {
          if (node instanceof Element && node.tagName.toLowerCase() === 'main') {
            console.log('<main> が削除されました。オブザーバーを再設定します。');
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
            observeMain();
          }
        });
      });
    });

    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }, [observeMain]);

  const stopObserving = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
      setIsObserving(false);
      console.log('Observing stopped.');
    }

    pollingRefs.current.forEach((intervalId, id) => {
      clearInterval(intervalId);
      console.log(`Polling stopped for ID ${id}`);
    });
    pollingRefs.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        console.log('コンポーネントがアンマウントされ、オブザーバーが停止しました。');
      }
      pollingRefs.current.forEach((intervalId, id) => {
        clearInterval(intervalId);
        console.log(`Polling stopped for ID ${id} due to unmount.`);
      });
      pollingRefs.current.clear();
    };
  }, []);

  return { extractAndStore, storedResponses, isObserving, startObserving, stopObserving };
}
