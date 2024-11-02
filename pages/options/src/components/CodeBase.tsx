import React, { useEffect, useState } from 'react';
import { codeTreeStorage } from '@extension/storage/lib/impl/codeTreeStorage';
import GetCodeTree from './communication/GetCodeTree';
import { codeBasePathStorage } from '@extension/storage/lib/impl/codeBasePathStorage';
import { sendGetCodeTree } from './communication/sendGetCodeTree';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';

interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
  isLeaf?: boolean;
}

const CodeBase: React.FC = () => {
  const [codeTree, setCodeTree] = useState<TreeNode[]>([]);
  const [targetPath, setTargetPath] = useState<string>('');

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

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    console.log('Selected:', selectedKeys, info);
    // 必要に応じて処理を追加
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

  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px' }}>
        <h2>コードツリー</h2>
        <button onClick={handleUpdateTree} style={{ marginBottom: '10px' }}>
          更新ツリー
        </button>
        <Tree treeData={codeTree} onSelect={onSelect} defaultExpandAll />
      </aside>
      <main style={{ padding: '20px', flex: 1 }}>
        <h2>コードベースページ</h2>
        <GetCodeTree targetPath={targetPath} />
        <p>ここに将来の実装のためのプレースホルダーコンテンツを追加します。</p>
      </main>
    </div>
  );
};

export default CodeBase;
