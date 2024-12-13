import { Toggler } from '@extension/shared/lib/hooks/useCodeToggle';
import { createRoot } from 'react-dom/client';
import { useExtractAssistantResponse } from '@extension/shared/lib/hooks/useExtractAssistantResponse';
import { useEffect } from 'react';
import React from 'react';

console.log('content script loaded2');
console.log(document.body);

// Create ExtractComponent to handle periodic extraction
const ExtractComponent: React.FC = () => {
  const { extractAndStore } = useExtractAssistantResponse();

  useEffect(() => {
    console.log('Setting up periodic extraction');
    const intervalId = setInterval(() => {
      console.log('Running periodic extraction');
      extractAndStore();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [extractAndStore]);

  return null;
};

// Create and mount the React component
const mountPoint = document.createElement('div');
mountPoint.id = 'chatgpt-sync-root';
document.body.appendChild(mountPoint);
const root = createRoot(mountPoint);
root.render(React.createElement(ExtractComponent));

// 初期の <pre> 要素にボタンを追加
const preElements = document.querySelectorAll('pre');
preElements.forEach(pre => {
  Toggler.addToggleButton(pre as HTMLElement);
});

// MutationObserver の設定
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1 && (node as HTMLElement).tagName.toLowerCase() === 'pre') {
        console.log('pre element added');
        Toggler.addToggleButton(node as HTMLElement);
      }
    });
  });
});

// DOMの監視を開始
observer.observe(document.body, { childList: true, subtree: true });
