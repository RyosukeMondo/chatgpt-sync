import { useEffect } from 'react';
import { PromptStorage } from '@extension/storage';
import { useStorage } from './useStorage';

const SEND_BUTTON_SELECTORS = [
  '[data-testid="send-button"]',
  'button[aria-label="Send prompt"]',
  'button[aria-label="プロンプトを送信する"]',
];

const clickSendButton = () => {
  setTimeout(() => {
    for (const selector of SEND_BUTTON_SELECTORS) {
      const sendButton = document.querySelector(selector) as HTMLElement;
      if (sendButton) {
        console.log(`Send button found via ${selector}, clicking...`);
        sendButton.click();
        return;
      }
    }
    console.log('Send button not found with any known selector');
  }, 1000);
};

export function useUpdatePrompt() {
  const storedPrompt = useStorage(PromptStorage);

  useEffect(() => {
    console.log('useUpdatePrompt loaded');
    const updatePromptElement = async () => {
      const prompt = await PromptStorage.getPrompt();
      console.log('Retrieved prompt:', prompt);

      // Skip if prompt is empty or just contains empty paragraph tags
      const promptStr = String(prompt || '');
      if (!prompt || prompt === '<p></p>' || promptStr.trim() === '') {
        console.log('Empty prompt, skipping update');
        return false; // Return false to indicate no update was performed
      }

      const promptElement = document.getElementById('prompt-textarea');
      if (promptElement) {
        console.log('Found prompt element');

        promptElement.innerHTML = prompt;

        // Dispatch input event to trigger ProseMirror update
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
        });
        promptElement.dispatchEvent(inputEvent);

        console.log('Updated prompt element and dispatched input event');

        // Clear the prompt from storage after successful update
        await PromptStorage.setPrompt('');
        console.log('Cleared prompt from storage');
        return true; // Return true to indicate successful update
      } else {
        console.log('Prompt element not found');
        return false;
      }
    };

    // Only run if there's actually a stored prompt
    const storedPromptStr = String(storedPrompt || '');
    if (storedPrompt && storedPrompt !== '<p></p>' && storedPromptStr.trim() !== '') {
      // Add a small delay to ensure the ChatGPT interface is loaded
      setTimeout(async () => {
        const updated = await updatePromptElement();
        if (updated) {
          clickSendButton();
        }
      }, 500);
    }
  }, [storedPrompt]);

  return null;
}
