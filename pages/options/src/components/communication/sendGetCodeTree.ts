// sendGetCodeTree.ts
import { GetCodeTreeRequest, GetCodeTreeResponse } from '../../../../../types/types';
import { codeTreeStorage } from '@extension/storage';

export const sendGetCodeTree = async (targetPath: string): Promise<GetCodeTreeResponse> => {
  const message: GetCodeTreeRequest = {
    kind: 'GET_CODE_TREE',
    target_path: targetPath,
  };

  return new Promise<GetCodeTreeResponse>((resolve, reject) => {
    chrome.runtime.sendNativeMessage('com.your_company.chatgpt_sync', message, async (response: GetCodeTreeResponse) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending native message:', chrome.runtime.lastError);
        reject(new Error('Failed to get code tree.'));
      } else {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          try {
            await codeTreeStorage.setCodeTree(response);
            resolve(response);
          } catch (storageError) {
            console.error('Error saving code tree to storage:', storageError);
            reject(new Error('Failed to save code tree.'));
          }
        }
      }
    });
  });
};