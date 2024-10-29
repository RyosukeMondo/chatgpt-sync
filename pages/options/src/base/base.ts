import { StorageEnum } from './enums';
import { BaseStorage } from './types';

export const createStorage = <T>(
  key: string,
  defaultValue: T,
  options: { storageEnum: StorageEnum; liveUpdate: boolean }
): BaseStorage<T> => {
  const get = (): Promise<T> => {
    return new Promise((resolve, reject) => {
      const storageArea =
        options.storageEnum === StorageEnum.Local
          ? chrome.storage.local
          : chrome.storage.sync;

      storageArea.get([key], (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  };

  const set = (value: T): Promise<void> => {
    return new Promise((resolve, reject) => {
      const storageArea =
        options.storageEnum === StorageEnum.Local
          ? chrome.storage.local
          : chrome.storage.sync;

      const data: Record<string, T> = {};
      data[key] = value;
      storageArea.set(data, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  };

  const remove = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const storageArea =
        options.storageEnum === StorageEnum.Local
          ? chrome.storage.local
          : chrome.storage.sync;

      storageArea.remove(key, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        resolve();
      });
    });
  };

  const listen = (callback: (value: T) => void) => {
    const storageArea =
      options.storageEnum === StorageEnum.Local
        ? chrome.storage.local
        : chrome.storage.sync;

    const listener = (changes: { [key: string]: any }, areaName: string) => {
      if (areaName === (options.storageEnum === StorageEnum.Local ? 'local' : 'sync') && changes[key]) {
        callback(changes[key].newValue);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  };

  return {
    get,
    set,
    remove,
    listen: options.liveUpdate ? listen : undefined,
  };
};