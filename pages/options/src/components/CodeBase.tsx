import React, { useEffect, useState } from 'react';
import { codeTreeStorage } from '@extension/storage/lib/impl/codeTreeStorage'; 
import GetCodeTree from './communication/GetCodeTree';
import { codeBasePathStorage } from '@extension/storage/lib/impl/codeBasePathStorage';
import { sendGetCodeTree } from './communication/sendGetCodeTree';

const CodeBase: React.FC = () => {
  const [codeTree, setCodeTree] = useState<string[]>([]);
  const [targetPath, setTargetPath] = useState<string>('');

  useEffect(() => {
    const fetchInitialCodeTree = async () => {
      try {
        const paths = await codeTreeStorage.getPaths();
        setCodeTree(paths);
      } catch (error) {
        console.error('コードツリーの取得に失敗しました:', error);
      }
    };
    fetchInitialCodeTree();
  }, []);

  useEffect(() => {
    const fetchTargetPath = async () => {
      const path = await codeBasePathStorage.getCodeBasePath();
      console.log('Loaded codeBasePath:', path);
      setTargetPath(path || 'Z:/your/target/path');
    };
    fetchTargetPath();
  }, []);

  const handleUpdateTree = async () => {
    try {
      await sendGetCodeTree(targetPath);
      console.log('コードツリーが更新されました。');
      const paths = await codeTreeStorage.getPaths();
      setCodeTree(paths);
    } catch (error) {
      console.error('ツリーの更新に失敗しました:', error);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <aside style={{ width: '250px', borderRight: '1px solid #ccc' }}>
        <h2>コードツリー</h2>
        <button onClick={handleUpdateTree}>更新ツリー</button>
        <ul>
          {codeTree.map((path, index) => (
            <li key={index}>{path}</li>
          ))}
        </ul>
      </aside>
      <main style={{ padding: '20px' }}>
        <h2>コードベースページ</h2>
        <GetCodeTree targetPath={targetPath} />
        <p>ここに将来の実装のためのプレースホルダーコンテンツを追加します。</p>
      </main>
    </div>
  );
};

export default CodeBase;