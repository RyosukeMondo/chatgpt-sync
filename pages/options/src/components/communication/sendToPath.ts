// sendToPath.ts
import { SaveToPathRequest, SaveToPathResponse } from './MessageKinds';
import { nativeAppPathStorage } from '@extension/storage';

export const sendToPath = async (fullPath: string, content: string): Promise<void> => {
  try {
    const pathObj = await nativeAppPathStorage.get();
    const path = pathObj?.path;

    if (!path) {
      alert('Native app path is not set. Please configure it in the options.');
      return;
    }

    const message: SaveToPathRequest = {
      kind: 'SAVE_TO_PATH',
      filePath: fullPath,
      content: content,
    };

    console.log('Sending message to native app:', JSON.stringify(message));

    chrome.runtime.sendNativeMessage('com.your_company.chatgpt_sync', message, (response: SaveToPathResponse) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending native message:', chrome.runtime.lastError);
        alert('Failed to send code to native app.');
      } else {
        console.log('Native app response:', response);
        if (response.status === 'success') {
          alert('Code successfully sent to native app!');
        } else {
          alert(`Failed to send code: ${response.error}`);
        }
      }
    });
  } catch (error) {
    console.error('Error retrieving nativeAppPath:', error);
    alert('An error occurred while retrieving the native app path.');
  }
};