import { useEffect } from 'react';
import { PromptStorage } from '@extension/storage';
import { useStorage } from './useStorage';

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

    updatePromptElement();
  }, [storedPrompt]);

  return null;
}
