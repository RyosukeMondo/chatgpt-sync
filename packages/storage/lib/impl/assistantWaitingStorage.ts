import { createStorage } from '../base/base';
import { StorageEnum } from '../base/enums';

export const assistantWaitingStorage = createStorage<boolean>('assistantWaiting', false, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});
