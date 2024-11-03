import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

type CodeContents = {
  id: string;
  contents: string[];
};

type CodeContentsStorageType = BaseStorage<CodeContents[]> & {
  upsertContents(content: CodeContents): Promise<void>;
  removeContents(id: string): Promise<void>;
  clearAllContents(): Promise<void>;
};

const defaultContents: CodeContents[] = [];

const storage = createStorage<CodeContents[]>('code-contents-key', defaultContents, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

export const codeContentsStorage: CodeContentsStorageType = {
  ...storage,

  upsertContents: async (content: CodeContents) => {
    try {
      const current = await storage.get();
      const index = current.findIndex(item => item.id === content.id);
      if (index !== -1) {
        current[index].contents = content.contents;
      } else {
        current.push(content);
      }
      await storage.set(current);
    } catch (error) {
      console.error('Failed to upsert contents:', error);
    }
  },

  removeContents: async (id: string) => {
    try {
      const current = await storage.get();
      const updated = current.filter(item => item.id !== id);
      await storage.set(updated);
    } catch (error) {
      console.error('Failed to remove contents:', error);
    }
  },

  clearAllContents: async () => {
    try {
      await storage.set([]);
    } catch (error) {
      console.error('Failed to clear all contents:', error);
    }
  },
};
