'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';

interface RichMarkdownProps {
  content: string;
  className?: string;
}

interface ParsedTable {
  headers: string[];
  alignments: ('left' | 'center' | 'right')[];
  rows: string[][];
}

function parseMarkdownTable(tableText: string): ParsedTable | null {
  // Normalize collapsed rows where rows are separated by | | or |\n
  let raw = tableText.trim();
  raw = raw.replace(/\|\s*\|\s*/g, '|\n|');
  
  const rawLines = raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('|') && l.endsWith('|'));
  
  if (rawLines.length < 2) return null;

  // Find header separator row (contains --- or :---:)
  const sepIdx = rawLines.findIndex(l => /^\|[\s-:]+(\|[\s-:]+)+\|$/.test(l));
  if (sepIdx <= 0) return null;

  const headerLine = rawLines[sepIdx - 1];
  const sepLine = rawLines[sepIdx];
  const dataLines = rawLines.slice(sepIdx + 1);

  const headers = headerLine.slice(1, -1).split('|').map(s => s.trim());
  const sepCells = sepLine.slice(1, -1).split('|').map(s => s.trim());
  
  const alignments: ('left' | 'center' | 'right')[] = sepCells.map(cell => {
    if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
    if (cell.endsWith(':')) return 'right';
    return 'left';
  });

  const rows = dataLines.map(line => {
    return line.slice(1, -1).split('|').map(s => s.trim());
  }).filter(r => r.some(cell => cell.length > 0));

  if (headers.length === 0 || rows.length === 0) return null;
  return { headers, alignments, rows };
}

function APATableRenderer({ table }: { table: ParsedTable }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-2xs p-3">
      <table className="w-full text-xs font-serif border-collapse">
        {/* Top Border - APA 7th Style (thick solid top border) */}
        <thead>
          <tr className="border-t-2 border-b border-zinc-900 dark:border-zinc-200 bg-zinc-50/75 dark:bg-zinc-800/60 font-sans font-semibold">
            {table.headers.map((h, i) => {
              const align = table.alignments[i] || (i === 0 ? 'left' : 'right');
              return (
                <th
                  key={i}
                  className={cn(
                    "py-2.5 px-3 font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap",
                    align === 'right' ? "text-right" : align === 'center' ? "text-center" : "text-left"
                  )}
                >
                  {h}
                </th>
              );
            })}
          </tr>
        </thead>
        {/* Table Body - APA 7th: No vertical borders, bottom border thick solid */}
        <tbody className="border-b-2 border-zinc-900 dark:border-zinc-200 divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {table.rows.map((row, rIdx) => (
            <tr
              key={rIdx}
              className="hover:bg-[#e6f2f2]/30 dark:hover:bg-[#14312f]/20 transition-colors"
            >
              {table.headers.map((_, cIdx) => {
                const val = row[cIdx] !== undefined ? row[cIdx] : '';
                const align = table.alignments[cIdx] || (cIdx === 0 ? 'left' : 'right');
                return (
                  <td
                    key={cIdx}
                    className={cn(
                      "py-2 px-3 text-zinc-800 dark:text-zinc-200 font-mono text-[11px]",
                      cIdx === 0 && "font-sans font-medium text-zinc-900 dark:text-zinc-100",
                      align === 'right' ? "text-right" : align === 'center' ? "text-center" : "text-left"
                    )}
                  >
                    {val || '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RichMarkdown({ content, className }: RichMarkdownProps) {
  if (!content) return null;

  // Split and render segments (Markdown vs APA Table)
  const segments = React.useMemo(() => {
    let text = content;
    text = text.replace(/\\\\([a-zA-Z]+)/g, '\\$1');
    
    // Normalize collapsed single line tables like:
    // | Header 1 | Header 2 | | :--- | :--- | | Val 1 | Val 2 |
    text = text.replace(/\|\s*\|\s*(?=:?--)/g, '|\n|');
    text = text.replace(/\|\s*\|\s*(?=[A-Za-z0-9\-\[\<])/g, '|\n|');

    // Split text into potential table blocks vs prose
    const lines = text.split('\n');
    const result: { type: 'markdown' | 'table'; content: string; tableData?: ParsedTable }[] = [];

    let currentMarkdown: string[] = [];
    let currentTable: string[] = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const isTableLine = line.startsWith('|') && line.endsWith('|');

      if (isTableLine) {
        if (!inTable) {
          if (currentMarkdown.length > 0) {
            result.push({ type: 'markdown', content: currentMarkdown.join('\n') });
            currentMarkdown = [];
          }
          inTable = true;
        }
        currentTable.push(line);
      } else {
        if (inTable) {
          const parsed = parseMarkdownTable(currentTable.join('\n'));
          if (parsed) {
            result.push({ type: 'table', content: currentTable.join('\n'), tableData: parsed });
          } else {
            // Fallback to markdown if table parsing failed
            currentMarkdown.push(...currentTable);
          }
          currentTable = [];
          inTable = false;
        }
        currentMarkdown.push(lines[i]);
      }
    }

    if (inTable && currentTable.length > 0) {
      const parsed = parseMarkdownTable(currentTable.join('\n'));
      if (parsed) {
        result.push({ type: 'table', content: currentTable.join('\n'), tableData: parsed });
      } else {
        currentMarkdown.push(...currentTable);
      }
    }

    if (currentMarkdown.length > 0) {
      result.push({ type: 'markdown', content: currentMarkdown.join('\n') });
    }

    return result;
  }, [content]);

  return (
    <div className={cn('prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-3 font-serif', className)}>
      {segments.map((seg, idx) => {
        if (seg.type === 'table' && seg.tableData) {
          return <APATableRenderer key={idx} table={seg.tableData} />;
        }

        return (
          <ReactMarkdown
            key={idx}
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold font-sans text-zinc-900 dark:text-zinc-100 mt-6 mb-3 pb-1 border-b border-zinc-200 dark:border-zinc-800">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-bold font-sans text-zinc-900 dark:text-zinc-100 mt-5 mb-2.5">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold font-sans text-zinc-900 dark:text-zinc-100 mt-4 mb-2">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-sm font-semibold font-sans text-zinc-900 dark:text-zinc-100 mt-3 mb-1.5">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 my-2">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 space-y-1.5 my-2 text-sm text-zinc-800 dark:text-zinc-200">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 space-y-1.5 my-2 text-sm text-zinc-800 dark:text-zinc-200">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[#008080] dark:border-[#14a3a3] bg-[#e6f2f2]/50 dark:bg-[#14312f]/30 p-3.5 rounded-r-xl text-xs text-zinc-800 dark:text-zinc-200 my-3 italic">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-zinc-950 dark:text-zinc-50">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-zinc-800 dark:text-zinc-200">
                  {children}
                </em>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-[#008080] dark:text-[#14a3a3] font-medium border border-zinc-200 dark:border-zinc-700">
                      {children}
                    </code>
                  );
                }
                return (
                  <pre className="p-3.5 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto my-3 border border-zinc-800">
                    <code>{children}</code>
                  </pre>
                );
              },
              hr: () => (
                <hr className="my-6 border-zinc-200 dark:border-zinc-800" />
              )
            }}
          >
            {seg.content}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
