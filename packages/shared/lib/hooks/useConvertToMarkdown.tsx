const useConvertToMarkdown = (responseText: string): string => {
  const convertHtmlToMarkdown = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let markdown = '';

    const traverse = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        markdown += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        switch (element.tagName.toLowerCase()) {
          case 'p':
            markdown += `\n\n${traverseChildren(element)}\n\n`;
            break;
          case 'strong':
          case 'b':
            markdown += `**${traverseChildren(element)}**`;
            break;
          case 'em':
          case 'i':
            markdown += `*${traverseChildren(element)}*`;
            break;
          case 'h1':
            markdown += `\n\n# ${traverseChildren(element)}\n\n`;
            break;
          case 'h2':
            markdown += `\n\n## ${traverseChildren(element)}\n\n`;
            break;
          case 'h3':
            markdown += `\n\n### ${traverseChildren(element)}\n\n`;
            break;
          case 'ul':
            markdown += `\n\n${traverseList(element, '-')}\n\n`;
            break;
          case 'ol':
            markdown += `\n\n${traverseList(element, '1.')}\n\n`;
            break;
          case 'li':
            // Handled in traverseList
            break;
          case 'code':
            if (element.parentElement?.tagName.toLowerCase() === 'pre') {
              markdown += `\n\n\`\`\`typescript\n${element.textContent}\n\`\`\`\n\n`;
            } else {
              markdown += `\`${element.textContent}\``;
            }
            break;
          case 'pre':
            // Handled in 'code'
            break;
          case 'blockquote':
            markdown += `\n\n> ${traverseChildren(element)}\n\n`;
            break;
          case 'a':
            const href = element.getAttribute('href');
            markdown += `[${traverseChildren(element)}](${href})`;
            break;
          default:
            markdown += traverseChildren(element);
            break;
        }
      }
    };

    const traverseChildren = (element: HTMLElement): string => {
      let text = '';
      element.childNodes.forEach(child => {
        const prevMarkdown = markdown;
        traverse(child);
        text += markdown.slice(prevMarkdown.length);
      });
      return text;
    };

    const traverseList = (element: HTMLElement, marker: string): string => {
      let listMarkdown = '';
      element.querySelectorAll('li').forEach((li, index) => {
        if (marker === '1.') {
          listMarkdown += `${index + 1}. ${traverseChildren(li as HTMLElement)}\n`;
        } else {
          listMarkdown += `${marker} ${traverseChildren(li as HTMLElement)}\n`;
        }
      });
      return listMarkdown;
    };

    doc.body.childNodes.forEach(node => traverse(node));

    return markdown.trim();
  };

  const markdown = convertHtmlToMarkdown(responseText);
  console.log(markdown);
  return markdown;
};

export default useConvertToMarkdown;
