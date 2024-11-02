import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';
import type { AssistantResponse } from '../../../../types/types'; 


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
  
  // Add a new assistant response
  addResponse: async (response: AssistantResponse) => {
    const current = await storage.get();
    const updated = [...current, response];
    await storage.set(updated);
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