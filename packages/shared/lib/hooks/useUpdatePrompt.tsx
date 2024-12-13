import { useEffect } from 'react';
import { PromptStorage } from '@extension/storage';
import { useStorage } from './useStorage';

const clickSendButton = () => {
  setTimeout(() => {
    const sendButton = document.querySelector('[aria-label="プロンプトを送信する"]') as HTMLElement;
    if (sendButton) {
      console.log('Send button found, clicking...');
      sendButton.click();
    } else {
      console.log('Send button not found');
    }
  }, 1000);
};

export function useUpdatePrompt() {
  const storedPrompt = useStorage(PromptStorage);

  useEffect(() => {
    console.log('useUpdatePrompt loaded');
    const updatePromptElement = async () => {
      const prompt = await PromptStorage.getPrompt();
      console.log('Retrieved prompt:', prompt);

      const promptElement = document.getElementById('prompt-textarea');
      if (promptElement) {
        console.log('Found prompt element');

        // Create a paragraph element with the text
        const p = document.createElement('p');
        p.textContent = prompt;

        // Clear existing content and append new paragraph
        promptElement.innerHTML = '';
        promptElement.appendChild(p);

        // Dispatch input event to trigger ProseMirror update
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
        });
        promptElement.dispatchEvent(inputEvent);

        console.log('Updated prompt element and dispatched input event');
      } else {
        console.log('Prompt element not found');
      }
    };

    // Add a small delay to ensure the ChatGPT interface is loaded
    setTimeout(() => {
      updatePromptElement();
      clickSendButton();
    }, 500);
  }, [storedPrompt]);

  return null;
}
