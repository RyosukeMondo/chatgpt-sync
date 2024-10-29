export interface AssistantResponse {
  id: string;
  content: string;
  summary: string;
  epochTime: number; // Added to store the extracted epoch time
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
}

export interface CodeSnippet {
  content: string;
  fileName?: string;
  fullPath?: string;
}

export interface UseCodeSnippetResult {
  snippets: CodeSnippet[];
}