import React from 'react';

/**
 * Improved Markdown parser that converts markdown to React elements.
 * Supports: headers, bold, italic, strikethrough, links, images, 
 * inline code, code blocks, blockquotes, bullet lists, numbered lists,
 * checklists, tables, and horizontal rules.
 */

// Parse inline formatting (bold, italic, strikethrough, code, links, images)
const parseInline = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Images: ![alt](url)
    const imgMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      parts.push(
        <img 
          key={key++} 
          src={imgMatch[2]} 
          alt={imgMatch[1]} 
          className="max-w-full h-auto rounded-lg my-2"
        />
      );
      remaining = remaining.slice(imgMatch[0].length);
      continue;
    }

    // Links: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a 
          key={key++} 
          href={linkMatch[2]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-brand-500 hover:text-brand-600 underline underline-offset-2"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code 
          key={key++} 
          className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-rose-500 dark:text-rose-400 text-[11px] font-mono rounded"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold: **text** or __text__
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*|^__([^_]+)__/);
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="font-bold text-neutral-900 dark:text-white">
          {boldMatch[1] || boldMatch[2]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text* or _text_
    const italicMatch = remaining.match(/^\*([^*]+)\*|^_([^_]+)_/);
    if (italicMatch) {
      parts.push(
        <em key={key++} className="italic text-neutral-800 dark:text-neutral-200">
          {italicMatch[1] || italicMatch[2]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Strikethrough: ~~text~~
    const strikeMatch = remaining.match(/^~~([^~]+)~~/);
    if (strikeMatch) {
      parts.push(
        <del key={key++} className="line-through text-neutral-400 dark:text-neutral-500">
          {strikeMatch[1]}
        </del>
      );
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // No match — take next character
    parts.push(remaining[0]);
    remaining = remaining.slice(1);
  }

  return parts;
};

// Parse a table from lines
const parseTable = (lines: string[], startIdx: number): { element: React.ReactNode; endIdx: number } | null => {
  if (startIdx + 1 >= lines.length) return null;
  
  // Check if second line is a separator (|---|---|)
  const separatorLine = lines[startIdx + 1];
  if (!separatorLine.match(/^\|[\s:-]+\|/)) return null;

  const headers = lines[startIdx]
    .split('|')
    .filter(cell => cell.trim())
    .map(cell => cell.trim());

  const alignments = separatorLine
    .split('|')
    .filter(cell => cell.trim())
    .map(cell => {
      const trimmed = cell.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
      if (trimmed.endsWith(':')) return 'right';
      return 'left';
    });

  const rows: string[][] = [];
  let endIdx = startIdx + 2;
  
  while (endIdx < lines.length && lines[endIdx].includes('|')) {
    rows.push(
      lines[endIdx]
        .split('|')
        .filter(cell => cell.trim())
        .map(cell => cell.trim())
    );
    endIdx++;
  }

  return {
    element: (
      <div className="overflow-x-auto my-3">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              {headers.map((header, i) => (
                <th 
                  key={i} 
                  className="py-2 px-3 text-left font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-800/50"
                  style={{ textAlign: alignments[i] || 'left' }}
                >
                  {parseInline(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                {row.map((cell, cellIdx) => (
                  <td 
                    key={cellIdx} 
                    className="py-2 px-3 text-neutral-700 dark:text-neutral-300"
                    style={{ textAlign: alignments[cellIdx] || 'left' }}
                  >
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
    endIdx
  };
};

/**
 * Main markdown renderer function.
 * Takes a markdown string and returns an array of React elements.
 */
export const renderMarkdown = (md: string): React.ReactNode[] => {
  const lines = md.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks (```)
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre key={key++} className="bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-mono p-4 rounded-xl overflow-x-auto my-3 border border-neutral-200 dark:border-neutral-700">
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // Horizontal rule (---, ***, ___)
    if (line.match(/^[-*_]{3,}$/)) {
      elements.push(
        <hr key={key++} className="my-4 border-t border-neutral-200 dark:border-neutral-700" />
      );
      i++;
      continue;
    }

    // Tables
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('|')) {
      const tableResult = parseTable(lines, i);
      if (tableResult) {
        elements.push(React.cloneElement(tableResult.element as React.ReactElement, { key: key++ }));
        i = tableResult.endIdx;
        continue;
      }
    }

    // Headers
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={key++} className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-3 mb-1">
          {parseInline(line.slice(5))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-3 mb-1">
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-base font-bold text-neutral-900 dark:text-white mt-4 mb-2">
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-lg font-bold text-neutral-900 dark:text-white mt-4 mb-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
          {parseInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote key={key++} className="border-l-4 border-amber-400 dark:border-amber-500 pl-4 py-2 my-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-r-lg">
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="text-xs text-neutral-600 dark:text-neutral-400 italic">
              {parseInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Checklists
    if (line.match(/^- \[[ x]\] /)) {
      const checked = line.startsWith('- [x] ');
      const text = line.slice(6);
      elements.push(
        <div key={key++} className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 my-1.5">
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
            checked 
              ? 'bg-brand-500 border-brand-500' 
              : 'border-neutral-300 dark:border-neutral-600'
          }`}>
            {checked && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className={checked ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
            {parseInline(text)}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Bullet lists (- or *)
    if (line.match(/^[-*] /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={key++} className="my-2 space-y-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
              <span className="text-brand-500 mt-1.5">•</span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered lists
    if (line.match(/^\d+\. /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        listItems.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={key++} className="my-2 space-y-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
              <span className="text-brand-500 font-bold text-[10px] mt-0.5 w-4">{idx + 1}.</span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      elements.push(<div key={key++} className="h-2" />);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed mb-2">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return elements;
};
