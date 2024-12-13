import { createStorage } from '../createStorage';

export const assistantWaitingStorage = createStorage<boolean>('assistantWaiting', false);
