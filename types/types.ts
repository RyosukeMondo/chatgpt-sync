export interface AssistantResponse {
  id: string;
  content: string;
  summary: string;
  epochTime: number;
  markdown: string;
}

export interface AssistantResponseContentProps {
  content: string;
}

export interface CodeTabProps {
  htmlContent: string;
}

export interface Tab {
  label: string;
  content: string;
  fullPath?: string;
}

export interface CodeSnippet {
  content: string;
  fileName?: string;
  fullPath?: string;
}

export interface UseCodeSnippetResult {
  snippets: CodeSnippet[];
}

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

export interface FileNode {
  id: number;
  name: string;
  children: FileNode[];
}
