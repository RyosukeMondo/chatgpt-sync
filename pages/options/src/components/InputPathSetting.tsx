import { useState, useEffect } from 'react';
import { useStorage } from '@extension/shared';
import { nativeAppPathStorage } from '@extension/storage';
import { Button } from '@extension/ui';

const InputPathSetting = ({ }) => {
  const storedNativeAppPath = useStorage(nativeAppPathStorage);
  const [inputPath, setInputPath] = useState<string>(storedNativeAppPath?.path || '');

  useEffect(() => {
    const loadPath = async () => {
      const savedPathObj = await nativeAppPathStorage.get();
      console.log('loaded nativeAppPath', savedPathObj);
      setInputPath(savedPathObj.path);
    };
    loadPath();
  }, []);

  const saveNativeAppPath = async () => {
    console.log('inputPath', inputPath);
    await nativeAppPathStorage.setAppPath(inputPath);
    console.log('Saved inputPath', inputPath);
    alert('Native app path saved successfully!');
  };

  return (
    <div className="w-full max-w-md">
      <label htmlFor="nativeAppPath" className="block text-sm font-medium text-gray-700">
        Native App Path
      </label>
      <input
        type="text"
        id="nativeAppPath"
        name="nativeAppPath"
        value={inputPath}
        onChange={(e) => setInputPath(e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder="C:\\path\\to\\native_app.exe"
      />
      <Button onClick={saveNativeAppPath} className="mt-2 text-left">
        Save Path
      </Button>
    </div>
  );
};

export default InputPathSetting;