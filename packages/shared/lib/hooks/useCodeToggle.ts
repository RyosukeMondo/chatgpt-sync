// useCodeToggle.ts
export const Toggler = (() => {
  function toggleCodeVisibility(preElement: HTMLElement) {
    const codeElement = preElement.querySelector('code');
    if (codeElement) {
      codeElement.style.display = codeElement.style.display === 'none' ? 'block' : 'none';
    }
  }

  function addToggleButton(preElement: HTMLElement) {
    if (!preElement.querySelector('.toggle-button')) {
      const button = document.createElement('button');
      button.innerText = 'Toggle Code Visibility';
      button.className = 'toggle-button';
      button.style.marginTop = '8px';
      button.onclick = () => toggleCodeVisibility(preElement);
      toggleCodeVisibility(preElement);

      preElement.insertBefore(button, preElement.firstChild);
      console.log('Toggle button added to <pre> element.');
    }
  }

  return { toggleCodeVisibility, addToggleButton };
})();
