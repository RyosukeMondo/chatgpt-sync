import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import type { ComponentPropsWithoutRef } from 'react';

const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

const Popup = () => {
  const injectContentScript = async () => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    if (tab.url?.startsWith('about:') || tab.url?.startsWith('chrome:')) {
      chrome.notifications.create('inject-error', notificationOptions);
      return;
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        files: ['/content-runtime/index.iife.js'],
      });
    } catch (err: any) {
      if (err.message.includes('Cannot access a chrome:// URL')) {
        chrome.notifications.create('inject-error', notificationOptions);
      }
    }
  };

  return (
    <div className="App">
      <button onClick={injectContentScript}>Inject Content Script</button>
      <ToggleButton>Toggle theme</ToggleButton>
    </div>
  );
};

const ToggleButton = (props: ComponentPropsWithoutRef<'button'>) => {
  const theme = useStorage(exampleThemeStorage);
  return (
    <button
      className={'font-bold py-1 px-4 rounded ' + (theme === 'light' ? 'bg-white text-black' : 'bg-black text-white')}
      onClick={exampleThemeStorage.toggle}>
      {props.children}
    </button>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div>Loading...</div>), <div>Error Occurred</div>);
