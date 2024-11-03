import React, { useEffect, useState } from 'react';
import { codeTreeStorage } from '@extension/storage/lib/impl/codeTreeStorage';
import { codeBasePathStorage } from '@extension/storage/lib/impl/codeBasePathStorage';
import { sendGetCodeTree } from './communication/sendGetCodeTree';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import CodePreview from './CodePreview';
import CodeBaseOperationPanel from './CodeBaseOperationPanel'; // 追加
import { PromptStorage } from '@extension/storage'; // 追加
import { codeContentsStorage } from '@extension/storage'; // 追加

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
  const [prompt, setPrompt] = useState<string>(''); // 追加
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]); // 追加

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
    setSelectedKeys(keys); // 追加
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
    setSelectedKeys([]); // 追加
  };

  const handleSendToTab = async () => {
    // 更新
    try {
      const storedContents = await codeContentsStorage.get();
      const contentsMap: { [key: string]: string[] } = {};
      storedContents.forEach(item => {
        contentsMap[item.id] = item.contents;
      });

      const selectedContents = selectedFilePaths.map(path => ({
        path,
        content: contentsMap[path] || [],
      }));
      const fixed_prompt = '(must include // Path: {actual path} inside your generated code)';
      const combinedPrompt = `${prompt}\n\n${fixed_prompt}\n${selectedContents
        .map(file => `// Path: ${file.path}\n${file.content.join('\n')}`)
        .join('\n\n')}`;

      await PromptStorage.setPrompt(combinedPrompt);
      console.log('Promptが更新されました。');
    } catch (error: any) {
      console.error('Promptの更新に失敗しました:', error);
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
      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px' }}>
          <h2>コードツリー</h2>
          <button onClick={handleUpdateTree} style={{ marginBottom: '10px' }}>
            更新ツリー
          </button>
          <Tree
            treeData={codeTree}
            onSelect={onSelect}
            selectedKeys={selectedKeys} // 追加
            defaultExpandAll
            multiple
          />
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
