import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';
import type { AssistantResponse } from '../../../../types/types';

// Define the type for AssistantResponseStorage
type AssistantResponseStorageType = BaseStorage<AssistantResponse[]> & {
  addResponse: (response: AssistantResponse) => Promise<void>;
  removeResponse: (id: string) => Promise<void>;
  clearAllResponses: () => Promise<void>;
};

// Initialize with an empty array or default responses
const defaultResponses: AssistantResponse[] = [];

const storage = createStorage<AssistantResponse[]>('assistant-response-key', defaultResponses, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

// Extend storage with additional methods
export const assistantResponseStorage: AssistantResponseStorageType = {
  ...storage,

  // Add a new assistant response, keeping only the oldest entry for duplicate IDs
  addResponse: async (response: AssistantResponse) => {
    const current = await storage.get();
    const existingIndex = current.findIndex(r => r.id === response.id);

    if (existingIndex === -1) {
      // If no duplicate exists, add the new response
      const updated = [...current, response];
      await storage.set(updated);
    }
    // If duplicate exists, do nothing to keep the oldest entry
  },

  // Remove an assistant response by ID
  removeResponse: async (id: string) => {
    const current = await storage.get();
    const updated = current.filter(response => response.id !== id);
    await storage.set(updated);
  },

  // Clear all assistant responses
  clearAllResponses: async () => {
    await storage.set([]);
  },
};
