import React, { useEffect, useState } from 'react';
import { sendGetCodeContents } from './communication/sendGetCodeContents';
import { codeContentsStorage } from '@extension/storage';

type CodePreviewProps = {
  filePaths: string[];
};

const CodePreview: React.FC<CodePreviewProps> = ({ filePaths }) => {
  const [contents, setContents] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      setError(null);
      try {
        await sendGetCodeContents(filePaths);
        const storedContents = await codeContentsStorage.get();
        const contentsMap: { [key: string]: string[] } = {};
        storedContents.forEach(item => {
          contentsMap[item.id] = item.contents;
        });
        setContents(contentsMap);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (filePaths.length > 0) {
      fetchContents();
    }
  }, [filePaths]);

  if (loading) {
    return <p>"読み込み中..."</p>;
  }

  if (error) {
    return <p>エラー: {error}</p>;
  }

  return (
    <div>
      {filePaths.map(path => (
        <div key={path}>
          <h3>{path}</h3>
          <pre>
            <code>{contents[path]?.join('\n') || 'コンテンツがありません。'}</code>
          </pre>
        </div>
      ))}
    </div>
  );
};

export default CodePreview;
