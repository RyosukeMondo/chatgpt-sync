import { useState, useEffect } from 'react';
import { useStorage } from '@extension/shared';
import { nativeAppPathStorage, codeBasePathStorage } from '@extension/storage';
import { Button } from '@extension/ui';

const InputPathSetting = () => {
  const storedNativeAppPath = useStorage(nativeAppPathStorage);
  const storedCodeBasePath = useStorage(codeBasePathStorage);
  const [inputNativeAppPath, setInputNativeAppPath] = useState<string>(storedNativeAppPath?.path || '');
  const [inputCodeBasePath, setInputCodeBasePath] = useState<string>(storedCodeBasePath?.path || '');

  useEffect(() => {
    const loadPaths = async () => {
      const savedNativePath = await nativeAppPathStorage.get();
      console.log('loaded nativeAppPath', savedNativePath);
      setInputNativeAppPath(savedNativePath.path);

      const savedCodePath = await codeBasePathStorage.get();
      console.log('loaded codeBasePath', savedCodePath);
      setInputCodeBasePath(savedCodePath.path);
    };
    loadPaths();
  }, []);

  const saveNativeAppPath = async () => {
    console.log('inputNativeAppPath', inputNativeAppPath);
    await nativeAppPathStorage.setAppPath(inputNativeAppPath);
    console.log('Saved inputNativeAppPath', inputNativeAppPath);
    alert('Native app path saved successfully!');
  };

  const saveCodeBasePath = async () => {
    console.log('inputCodeBasePath', inputCodeBasePath);
    await codeBasePathStorage.setCodeBasePath(inputCodeBasePath);
    console.log('Saved inputCodeBasePath', inputCodeBasePath);
    alert('Code base path saved successfully!');
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
        value={inputNativeAppPath}
        onChange={(e) => setInputNativeAppPath(e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder="C:\\path\\to\\native_app.exe"
      />
      <Button onClick={saveNativeAppPath} className="mt-2 text-left">
        Save Native App Path
      </Button>

      <label htmlFor="codeBasePath" className="block text-sm font-medium text-gray-700 mt-4">
        Code Base Path
      </label>
      <input
        type="text"
        id="codeBasePath"
        name="codeBasePath"
        value={inputCodeBasePath}
        onChange={(e) => setInputCodeBasePath(e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        placeholder="/path/to/codebase"
      />
      <Button onClick={saveCodeBasePath} className="mt-2 text-left">
        Save Code Base Path
      </Button>
    </div>
  );
};

export default InputPathSetting;