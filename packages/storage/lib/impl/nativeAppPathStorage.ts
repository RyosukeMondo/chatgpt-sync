import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

// Define the structure for native app path
export type NativeAppPath = {
  path: string;
};

// Extend the BaseStorage with an additional method for setting the app path
type NativeAppPathStorageType = BaseStorage<NativeAppPath> & {
  setAppPath: (path: string) => Promise<void>;
};

// Default value for native app path
const defaultAppPath: NativeAppPath = { path: '' };

// Create storage with the correct key 'nativeAppPath'
const storage = createStorage<NativeAppPath>('nativeAppPath', defaultAppPath, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

// Extend storage with the setAppPath method
export const nativeAppPathStorage: NativeAppPathStorageType = {
  ...storage,
  
  // setAppPath now accepts a string and wraps it in the NativeAppPath object
  setAppPath: async (path: string) => {
    await storage.set({ path });
  },
};

export default nativeAppPathStorage;