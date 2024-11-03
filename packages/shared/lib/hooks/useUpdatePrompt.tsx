import { useEffect } from 'react';
import { PromptStorage } from '@extension/storage';
import { useStorage } from './useStorage';

const clickSendButton = () => {
  setTimeout(() => {
    const sendButton = document.querySelector('[aria-label="プロンプトを送信する"]') as HTMLElement;
    if (sendButton) {
      sendButton.click();
    }
  }, 1000);
};

export function useUpdatePrompt() {
  const storedPrompt = useStorage(PromptStorage);

  useEffect(() => {
    console.log('useUpdatePrompt loaded');
    const updatePromptElement = async () => {
      const prompt = await PromptStorage.getPrompt();
      const promptElement = document.getElementById('prompt-textarea');
      if (promptElement) {
        promptElement.innerHTML = prompt;
      }
    };
    clickSendButton();

    updatePromptElement();
  }, [storedPrompt]);

  return null;
}
