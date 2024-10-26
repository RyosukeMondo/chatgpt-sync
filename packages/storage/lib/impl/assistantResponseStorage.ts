import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

type HTMLSnippet = string;

type AssistantResponseStorage = BaseStorage<HTMLSnippet> & {
  clearSnippet: () => Promise<void>;
};

const storage = createStorage<HTMLSnippet>('assistant-response-key', '<!-- Default HTML Snippet -->', {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

// You can extend it with your own methods
export const assistantResponseStorage: AssistantResponseStorage = {
  ...storage,
  clearSnippet: async () => {
    await storage.set(() => '');
  },
};