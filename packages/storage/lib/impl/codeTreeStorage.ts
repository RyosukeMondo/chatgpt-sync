// codeTreeStorage.ts
import { StorageEnum } from '../base/enums';
import { createStorage } from '../base/base';
import type { BaseStorage } from '../base/types';

export interface GetCodeTreeResponse {
    repositories: string[];
    error?: string;
}

type CodeTreeStorageType = BaseStorage<GetCodeTreeResponse> & {
    setCodeTree: (codeTree: GetCodeTreeResponse) => Promise<void>;
    getPaths: () => Promise<string[]>;
};

const storage = createStorage<GetCodeTreeResponse>('code-tree-storage-key', { repositories: [] }, {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
});

export const codeTreeStorage: CodeTreeStorageType = {
    ...storage,
    setCodeTree: async (codeTree) => {
        await storage.set(() => codeTree);
    },
    getPaths: async () => {
        const current = storage.get();
        return (await current)?.repositories || [];
    },
};