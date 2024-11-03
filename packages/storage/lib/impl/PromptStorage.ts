import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

// Define the structure for native app path
export type Prompt = {
  prompt: string;
};

type PromptStorageType = BaseStorage<Prompt> & {
  setPrompt: (path: string) => Promise<void>;
  getPrompt: () => Promise<string>;
};

const defaultPrompt: Prompt = { prompt: 'say something.' };

const storage = createStorage<Prompt>('Prompt', defaultPrompt, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

const escapeHTML = (text: string) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const formatMessage = (message: string) => {
  return message
    .split('\n')
    .map(line => `<p>${escapeHTML(line.trimEnd())}</p>`)
    .join('');
};

// Extend storage with the setAppPath method
export const PromptStorage: PromptStorageType = {
  ...storage,

  // setAppPath now accepts a string and wraps it in the NativeAppPath object
  setPrompt: async (prompt: string) => {
    // split with \n, wrap with <p> every line, and join with \n
    const prompt_final = formatMessage(prompt);
    await storage.set({ prompt: prompt_final });
  },
  getPrompt: async () => {
    const prompt = await storage.get();
    return prompt.prompt;
  },
};

export default PromptStorage;
