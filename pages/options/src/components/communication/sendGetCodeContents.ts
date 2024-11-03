import { GetContentsRequest, GetContentsResponse } from '../../../../../types/types';
import { codeContentsStorage } from '@extension/storage';

export const sendGetCodeContents = async (filePaths: string[]): Promise<GetContentsResponse> => {
  const message: GetContentsRequest = {
    kind: 'GET_CONTENTS',
    filePaths,
  };

  return new Promise<GetContentsResponse>((resolve, reject) => {
    chrome.runtime.sendNativeMessage(
      'com.your_company.chatgpt_sync',
      message,
      async (response: GetContentsResponse) => {
        if (chrome.runtime.lastError) {
          console.error('ネイティブメッセージ送信エラー:', chrome.runtime.lastError);
          reject(new Error('コンテンツの取得に失敗しました。'));
        } else {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            try {
              const upsertPromises = filePaths.map((filePath, index) => {
                return codeContentsStorage.upsertContents({
                  id: filePath,
                  contents: response.contents[index].split('\n'),
                });
              });
              await Promise.all(upsertPromises);
              resolve(response);
            } catch (storageError) {
              console.error('ストレージへの保存エラー:', storageError);
              reject(new Error('コンテンツの保存に失敗しました。'));
            }
          }
        }
      },
    );
  });
};
