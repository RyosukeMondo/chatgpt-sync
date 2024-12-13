import { useCallback, useEffect, useRef, useState } from 'react';
import { assistantResponseStorage } from '@extension/storage';
import { useStorage } from './useStorage';
import { htmlToText } from 'html-to-text';
import { AssistantResponse } from '../../../../types/types';
import useConvertToMarkdown from './useConvertToMarkdown';

const sentResponseIds = new Set<string>();
const STABILITY_THRESHOLD_MS = 3000; // 3 seconds of no changes
const MAX_RETRIES = 3;
const RETRY_INTERVAL_MS = 1000;

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
    }
  });
  if (responses.length > 0) {
    console.log(`Found ${responses.length} new assistant response(s)`);
  }
  return responses;
}

export function useExtractAssistantResponse() {
  const storedResponses = useStorage(assistantResponseStorage);
  const [isObserving, setIsObserving] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const contentStatesRef = useRef<
    Map<
      string,
      {
        content: string;
        lastChangeTime: number;
        retryCount: number;
        timeoutId?: NodeJS.Timeout;
      }
    >
  >(new Map());

  const extractAndStore = useCallback(async () => {
    const elements = document.querySelectorAll("div[data-message-author-role='assistant']");
    elements.forEach(element => {
      const id = getElementUniqueId(element);
      if (!id || sentResponseIds.has(id)) return;

      const currentContent = element.innerHTML;
      const state = contentStatesRef.current.get(id);
      const now = Date.now();

      if (!state) {
        // New content found
        contentStatesRef.current.set(id, {
          content: currentContent,
          lastChangeTime: now,
          retryCount: 0,
        });
        return;
      }

      if (currentContent !== state.content) {
        // Content changed
        state.content = currentContent;
        state.lastChangeTime = now;
        state.retryCount = 0;
        return;
      }

      // Content unchanged, check if stable
      const timeSinceLastChange = now - state.lastChangeTime;
      if (timeSinceLastChange >= STABILITY_THRESHOLD_MS) {
        if (state.retryCount < MAX_RETRIES) {
          // Schedule next check
          if (state.timeoutId) clearTimeout(state.timeoutId);
          state.timeoutId = setTimeout(() => {
            state.retryCount++;
            extractAndStore();
          }, RETRY_INTERVAL_MS);
          return;
        }

        // Content is stable after retries, store it
        const responseText = element.outerHTML.trim();
        const summary = htmlToText(responseText, { wordwrap: 80 }).split('\n')[0];
        const response: AssistantResponse = {
          id,
          content: responseText,
          summary,
          epochTime: now,
          markdown: useConvertToMarkdown(responseText),
        };

        // Store the response
        const currentResponses = Array.isArray(storedResponses) ? storedResponses : [];
        const updatedResponses = [...currentResponses, response];
        assistantResponseStorage.set(updatedResponses);
        sentResponseIds.add(id);
        contentStatesRef.current.delete(id);
        console.log(`Stored stable response after ${state.retryCount} retries: ${id}`);
      }
    });
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
    }

    contentStatesRef.current.forEach((state, id) => {
      if (state.timeoutId) clearTimeout(state.timeoutId);
    });
    contentStatesRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      contentStatesRef.current.forEach(state => {
        if (state.timeoutId) clearTimeout(state.timeoutId);
      });
      contentStatesRef.current.clear();
    };
  }, []);

  return { extractAndStore, storedResponses, isObserving, startObserving, stopObserving };
}
