// FILE: codeBasePathStorage.ts
import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

// Define the structure for code base path
export type CodeBasePath = {
  path: string;
};

// Extend the BaseStorage with additional methods for setting and getting the code base path
type CodeBasePathStorageType = BaseStorage<CodeBasePath> & {
  setCodeBasePath: (path: string) => Promise<void>;
  getCodeBasePath: () => Promise<string>;
};

// Default value for code base path
const defaultCodeBasePath: CodeBasePath = { path: '' };

// Create storage with the key 'codeBasePath'
const storage = createStorage<CodeBasePath>('codeBasePath', defaultCodeBasePath, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

// Extend storage with setCodeBasePath and getCodeBasePath methods
export const codeBasePathStorage: CodeBasePathStorageType = {
  ...storage,

  setCodeBasePath: async (path: string) => {
    await storage.set({ path });
  },

  getCodeBasePath: async () => {
    const data = await storage.get();
    return data.path;
  },
};

export default codeBasePathStorage;