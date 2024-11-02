// sendToPath.ts
import { SaveToPathRequest, SaveToPathResponse } from '../../types';
import { nativeAppPathStorage } from '@extension/storage';

export const sendToPath = async (fullPath: string, content: string): Promise<void> => {
  try {
    const pathObj = await nativeAppPathStorage.get();
    const path = pathObj?.path;

    if (!path) {
      throw new Error('Native app path is not set. Please configure it in the options.');
    }

    const message: SaveToPathRequest = {
      kind: 'SAVE_TO_PATH',
      filePath: fullPath,
      content: content,
    };

    console.log('Sending message to native app:', JSON.stringify(message));

    await new Promise<SaveToPathResponse>((resolve, reject) => {
      chrome.runtime.sendNativeMessage('com.your_company.chatgpt_sync', message, (response: SaveToPathResponse) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending native message:', chrome.runtime.lastError);
          reject(new Error('Failed to send code to native app.'));
        } else {
          console.log('Native app response:', response);
          if (response.status === 'success') {
            resolve(response);
          } else {
            reject(new Error(`Failed to send code: ${response.error}`));
          }
        }
      });
    });
  } catch (error) {
    console.error('Error in sendToPath:', error);
    throw error;
  }
};