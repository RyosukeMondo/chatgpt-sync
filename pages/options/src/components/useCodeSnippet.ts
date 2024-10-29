import { useMemo } from 'react';
import { CodeSnippet, UseCodeSnippetResult } from '../types';

const PATH_REGEX = /^\/\/\s*Path:\s*(.+)$|^\/\*\s*Path:\s*(.+)\s*\*\/$|^#\s*Path:\s*(.+)$/i;

export const useCodeSnippet = (htmlContent: string): UseCodeSnippetResult => {
  // console.log('htmlContent', htmlContent);
  const snippets: CodeSnippet[] = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const codeElements = doc.querySelectorAll('pre code, code');
    // console.log('codeElements', codeElements);

    const extractedSnippets: CodeSnippet[] = [];

    codeElements.forEach((codeElement) => {
      const codeText = codeElement.textContent || '';

      // Check if code has at least 100 characters
      if (codeText.length < 100) return;

      const lines = codeText.split('\n').slice(0, 4); // First 4 lines
      let fullPath: string | undefined;
      let fileName: string | undefined;

      for (const line of lines) {
        const match = line.match(PATH_REGEX);
        if (match) {
          // console.log('match', match);
          // expect only one of matches 1,2,3 not null.
          fullPath = match[1] || match[2] || match[3];
          fullPath = fullPath.trim();
          // Extract filename from fullPath
          const pathParts = fullPath.split(/[\\/]/);
          const lastPart = pathParts[pathParts.length - 1];
          if (lastPart && lastPart.includes('.')) {
            fileName = lastPart;
          }
          break;
        }
      }

      // Ensure the path is included in the code content as a comment
      if (fullPath && !codeText.includes(fullPath)) {
        // Prepend the path as a comment
        const updatedCode = `${codeText}`;
        extractedSnippets.push({
          content: updatedCode,
          fileName,
          fullPath,
        });
      } else {
        extractedSnippets.push({
          content: codeText,
          fileName,
          fullPath,
        });
      }
    });

    return extractedSnippets;
  }, [htmlContent]);

  return { snippets };
};
