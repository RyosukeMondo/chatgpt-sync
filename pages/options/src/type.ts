export interface AssistantResponse {
  id: string;
  content: string;
  summary: string;
  epochTime: number; // Added to store the extracted epoch time
}