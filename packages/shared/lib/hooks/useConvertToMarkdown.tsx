/**
 * Converts HTML content to Markdown format.
 *
 * Note: This is a pure utility function, not a React hook.
 * It was previously named useConvertToMarkdown which violated
 * the Rules of Hooks since it was called outside React components.
 */
export function convertHtmlToMarkdown(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const traverseChildren = (element: HTMLElement): string => {
    let text = '';
    element.childNodes.forEach(child => {
      text += traverse(child);
    });
    return text;
  };

  const traverseList = (element: HTMLElement, marker: string): string => {
    let listMarkdown = '';
    element.querySelectorAll(':scope > li').forEach((li, index) => {
      if (marker === '1.') {
        listMarkdown += `${index + 1}. ${traverseChildren(li as HTMLElement)}\n`;
      } else {
        listMarkdown += `${marker} ${traverseChildren(li as HTMLElement)}\n`;
      }
    });
    return listMarkdown;
  };

  const traverse = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const element = node as HTMLElement;
    switch (element.tagName.toLowerCase()) {
      case 'p':
        return `\n\n${traverseChildren(element)}\n\n`;
      case 'strong':
      case 'b':
        return `**${traverseChildren(element)}**`;
      case 'em':
      case 'i':
        return `*${traverseChildren(element)}*`;
      case 'h1':
        return `\n\n# ${traverseChildren(element)}\n\n`;
      case 'h2':
        return `\n\n## ${traverseChildren(element)}\n\n`;
      case 'h3':
        return `\n\n### ${traverseChildren(element)}\n\n`;
      case 'ul':
        return `\n\n${traverseList(element, '-')}\n\n`;
      case 'ol':
        return `\n\n${traverseList(element, '1.')}\n\n`;
      case 'li':
        // Handled in traverseList
        return '';
      case 'code':
        if (element.parentElement?.tagName.toLowerCase() === 'pre') {
          return `\n\n\`\`\`\n${element.textContent}\n\`\`\`\n\n`;
        }
        return `\`${element.textContent}\``;
      case 'pre':
        // Handled in 'code'
        return '';
      case 'blockquote':
        return `\n\n> ${traverseChildren(element)}\n\n`;
      case 'a': {
        const href = element.getAttribute('href');
        return `[${traverseChildren(element)}](${href})`;
      }
      default:
        return traverseChildren(element);
    }
  };

  let markdown = '';
  doc.body.childNodes.forEach(node => {
    markdown += traverse(node);
  });

  return markdown.trim();
}

// Preserve backward-compatible default export
export default convertHtmlToMarkdown;
