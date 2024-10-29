export interface SaveToPathRequest {
    kind: 'SAVE_TO_PATH';
    filePath: string;
    content: string;
}

export interface SaveToPathResponse {
    status: 'success' | 'fail';
    error?: string;
}

export interface GetCodeTreeRequest {
    kind: 'GET_CODE_TREE';
    target_path: string;
}

export interface GetCodeTreeResponse {
    repositories: string[];
    error?: string;
}

export interface GetContentsRequest {
    kind: 'GET_CONTENTS';
    filePaths: string[];
}

export interface GetContentsResponse {
    contents: string[];
    error?: string;
}