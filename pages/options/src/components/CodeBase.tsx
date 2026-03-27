import React, { useState, useEffect, useRef, useCallback } from 'react';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import CodeBaseOperationPanel from './CodeBaseOperationPanel';
import { sendGetCodeTree } from './communication/sendGetCodeTree';
import {
  codeTreeStorage,
  codeBasePathStorage,
  PromptStorage,
  codeContentsStorage,
  assistantResponseStorage,
} from '@extension/storage';
import { assistantWaitingStorage } from '@extension/storage/lib/impl/assistantWaitingStorage';
import CodePreview from './CodePreview';

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
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>();
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Track timers so they can be cleaned up on unmount
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);

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

  const onSelect = (_keys: React.Key[], info: { selectedNodes: { isLeaf?: boolean; key: string }[] }) => {
    setSelectedKeys(_keys);
    const leafPaths = info.selectedNodes
      .filter(node => node.isLeaf)
      .map(node => node.key.replace('root', targetPath));
    setSelectedFilePaths(leafPaths);
  };

  const handleUpdateTree = async () => {
    try {
      await sendGetCodeTree(targetPath);
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

  const clearWaitingTimers = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleSendToTab = async () => {
    // Clear any previous waiting timers
    clearWaitingTimers();

    setStatusMessage('タブに送信しました');
    if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = setTimeout(() => {
      setStatusMessage('');
    }, 3000);

    try {
      const storedContents = await codeContentsStorage.get();
      const contentsMap: { [key: string]: string[] } = {};
      storedContents.forEach(item => {
        contentsMap[item.id] = item.contents;
      });

      const selectedContents = selectedFilePaths
        .filter(path => contentsMap[path] && contentsMap[path].length > 0)
        .map(path => ({
          path,
          content: contentsMap[path].join('\n'),
        }));

      if (selectedContents.length === 0) {
        console.warn('No valid file contents selected');
        return;
      }

      const codeBlocks = selectedContents.map(file => `// Path: ${file.path}\n${file.content}`).join('\n\n');

      const prefixPrompt = 'Below is the current implementation. Please review and suggest improvements:';
      const pathInstructionPrompt = '(must include // Path: {actual path} inside your generated code)';
      const combinedPrompt = [prompt || prefixPrompt, pathInstructionPrompt, codeBlocks].filter(Boolean).join('\n\n');

      await PromptStorage.setPrompt(combinedPrompt);
      await assistantWaitingStorage.set(true);

      const currentResponses = await assistantResponseStorage.get();
      const initialResponsesJson = JSON.stringify(currentResponses);

      checkIntervalRef.current = setInterval(async () => {
        const newResponses = await assistantResponseStorage.get();
        const newResponsesJson = JSON.stringify(newResponses);

        if (newResponsesJson !== initialResponsesJson) {
          await assistantWaitingStorage.set(false);
          clearWaitingTimers();
        }
      }, 1000);

      timeoutRef.current = setTimeout(async () => {
        clearWaitingTimers();
        await assistantWaitingStorage.set(false);
      }, 30000);
    } catch (error) {
      console.error('Failed to update prompt:', error);
      clearWaitingTimers();
      await assistantWaitingStorage.set(false);
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
