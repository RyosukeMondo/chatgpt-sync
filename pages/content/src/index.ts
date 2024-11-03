import { Toggler } from '@extension/shared/lib/hooks/useCodeToggle';

console.log('content script loaded2');
console.log(document.body);

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
