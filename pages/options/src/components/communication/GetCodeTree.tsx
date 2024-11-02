// GetCodeTree.tsx
import React, { useEffect } from 'react';
import { sendGetCodeTree } from './sendGetCodeTree';
import { codeTreeStorage } from '@extension/storage/lib/impl/codeTreeStorage';

const GetCodeTree: React.FC<{ targetPath: string }> = ({ targetPath }) => {
  useEffect(() => {
    const fetchCodeTree = async () => {
      try {
        const response = await sendGetCodeTree(targetPath);
        await codeTreeStorage.setCodeTree(response.repositories.map((repo, index) => ({
          id: index,
          name: repo,
          children: [],
        })));
      } catch (error) {
        console.error(error);
      }
    };

    fetchCodeTree();
  }, [targetPath]);

  return null;
};

export default GetCodeTree;