import React, { useState, useEffect } from 'react';
import CodeTab from './CodeTab';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import CodeBaseOperationPanel from './CodeBaseOperationPanel';
import { sendGetCodeTree } from './communication/sendGetCodeTree';
import { codeTreeStorage } from '@extension/storage';
import { codeBasePathStorage } from '@extension/storage';
import { PromptStorage } from '@extension/storage';
import { codeContentsStorage } from '@extension/storage';
import { assistantWaitingStorage } from '@extension/storage';
import { assistantResponseStorage } from '@extension/storage';
import { useStorage } from '@extension/shared';

interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
  isLeaf?: boolean;
}

const CodeBase: React.FC = () => {
  const [codeTree, setCodeTree] = useState<TreeNode[]>([]);
  const [targetPath, setTargetPath] = useState<string>('');
  const [selectedFilePaths, setSelectedFilePaths] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const storedResponses = useStorage(assistantResponseStorage);
  const [lastResponseCount, setLastResponseCount] = useState<number>(0);

  useEffect(() => {
    if (Array.isArray(storedResponses)) {
      setLastResponseCount(storedResponses.length);
    }
  }, [storedResponses]);

  useEffect(() => {
    const fetchInitialCodeTree = async () => {
      try {
        const paths = await codeTreeStorage.getPaths();
        const treeData = buildTree(paths);
        setCodeTree(treeData);
      } catch (error) {
        console.error('コードツリーの取得に失敗しました:', error);
      }
    };
    fetchInitialCodeTree();
  }, [targetPath]);

  useEffect(() => {
    const fetchTargetPath = async () => {
      const path = await codeBasePathStorage.getCodeBasePath();
      console.log('Loaded codeBasePath:', path);
      setTargetPath(path || '/your/target/path');
    };
    fetchTargetPath();
  }, []);

  const buildTree = (paths: string[]): TreeNode[] => {
    const root: TreeNode = { title: 'root', key: 'root', children: [] };
    const normalizedTargetPath = targetPath.replace(/\\/g, '/');

    paths.forEach(path => {
      const normalizedPath = path.replace(/\\/g, '/');
      if (!normalizedPath.startsWith(normalizedTargetPath)) return;
      const relativePath = normalizedPath.substring(normalizedTargetPath.length).replace(/^\//, '');
      const parts = relativePath.split('/').filter(part => part);

      let current = root;
      parts.forEach((part, index) => {
        if (!current.children) current.children = [];
        let node = current.children.find(child => child.key === `${current.key}/${part}`);
        if (!node) {
          node = {
            title: part,
            key: `${current.key}/${part}`,
            children: index < parts.length - 1 ? [] : undefined,
            isLeaf: index === parts.length - 1,
          };
          current.children.push(node);
        }
        current = node;
      });
    });

    return root.children || [];
  };

  const onSelect = (keys: React.Key[], info: any) => {
    console.log('Selected:', keys, info);
    setSelectedKeys(keys);
    const leafPaths = info.selectedNodes
      .filter((node: any) => node.isLeaf)
      .map((node: any) => node.key.replace('root', targetPath));
    setSelectedFilePaths(leafPaths);
  };

  const handleUpdateTree = async () => {
    try {
      await sendGetCodeTree(targetPath);
      console.log('コードツリーが更新されました。');
      const paths = await codeTreeStorage.getPaths();
      const treeData = buildTree(paths);
      setCodeTree(treeData);
    } catch (error) {
      console.error('ツリーの更新に失敗しました:', error);
    }
  };

  const handleDeselectAll = () => {
    setSelectedFilePaths([]);
    setSelectedKeys([]);
  };

  const handleSendToTab = async () => {
    // Show status message
    setStatusMessage('タブに送信しました');
    setTimeout(() => {
      setStatusMessage('');
    }, 3000);

    // Set waiting state in storage
    console.log('CodeBase - About to set waiting state to true');
    await assistantWaitingStorage.set(true);
    console.log('CodeBase - Waiting state set to true');

    try {
      const storedContents = await codeContentsStorage.get();
      const selectedContents = selectedFilePaths.map(path => {
        return storedContents.find(content => content.path === path);
      });
      console.log('Selected contents:', selectedContents);

      // Store the current responses for comparison
      const currentResponses = await assistantResponseStorage.get();
      const initialResponsesJson = JSON.stringify(currentResponses);
      console.log('Initial responses:', initialResponsesJson);

      // Set up an interval to check for response changes
      const checkInterval = setInterval(async () => {
        const newResponses = await assistantResponseStorage.get();
        const newResponsesJson = JSON.stringify(newResponses);

        if (newResponsesJson !== initialResponsesJson) {
          // Responses have changed, clear waiting state
          console.log('CodeBase - Responses changed, setting waiting state to false');
          await assistantWaitingStorage.set(false);
          clearInterval(checkInterval);
        }
      }, 1000); // Check every second

      // Set a timeout to clear waiting state after 30 seconds to prevent indefinite waiting
      setTimeout(async () => {
        clearInterval(checkInterval);
        console.log('CodeBase - Timeout reached, setting waiting state to false');
        await assistantWaitingStorage.set(false);
      }, 30000);
    } catch (error) {
      console.error('Error:', error);
      // Make sure to end waiting state even if there's an error
      console.log('CodeBase - About to set waiting state to false (error case)');
      await assistantWaitingStorage.set(false);
      console.log('CodeBase - Waiting state set to false (error case)');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <CodeBaseOperationPanel
        onDeselectAll={handleDeselectAll}
        onSendToTab={handleSendToTab}
        prompt={prompt}
        setPrompt={setPrompt}
      />
      {statusMessage && <div className="status-message mt-2 text-green-600">{statusMessage}</div>}
      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px' }}>
          <h2>コードツリー</h2>
          <button onClick={handleUpdateTree} style={{ marginBottom: '10px' }}>
            更新ツリー
          </button>
          <Tree treeData={codeTree} onSelect={onSelect} selectedKeys={selectedKeys} defaultExpandAll multiple />
        </aside>
        <main style={{ padding: '20px', flex: 1 }}>
          <h2>コードベースページ</h2>
          {selectedFilePaths.length > 0 ? (
            <CodePreview filePaths={selectedFilePaths} />
          ) : (
            <p>ここに将来の実装のためのプレースホルダーコンテンツを追加します。</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default CodeBase;
