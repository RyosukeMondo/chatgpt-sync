import { useCallback } from 'react';
import { assistantResponseStorage } from '@extension/storage';
import { useStorage } from './useStorage';

type AssistantResponse = {
  id: string;
  content: string;
};

// A Set to keep track of processed response IDs to avoid duplicates
const sentResponseIds = new Set<string>();

function getElementUniqueId(element: Element): string {
  // Implement a method to generate a unique ID for an element
  // This could be based on attributes, position in DOM, etc.
  // For simplicity, let's assume each element has a unique data-id attribute
  return element.getAttribute('data-message-id') || '';
}

function extractAssistantResponses(): AssistantResponse[] {
  const assistantElements = document.querySelectorAll("div[data-message-author-role='assistant']");
  const responses: AssistantResponse[] = [];
  assistantElements.forEach((element) => {
    const responseText = element.outerHTML.trim();
    const id = getElementUniqueId(element);
    if (responseText && id && !sentResponseIds.has(id)) {
      responses.push({
        id,
        content: responseText,
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

  const extractAndStore = useCallback(async () => {
    const newResponses = extractAssistantResponses();
    if (newResponses.length > 0) {
      // Combine existing responses with new ones
      const updatedResponses = [...(storedResponses || []), ...newResponses];
      // Remove duplicates based on ID
      const uniqueResponses = Array.from(
        new Map(updatedResponses.map((item) => [item.id, item])).values()
      );
      await assistantResponseStorage.set(uniqueResponses);
      console.log('Assistant responses have been updated in storage.');
    }
  }, [storedResponses]);

  return { extractAndStore, storedResponses };
}