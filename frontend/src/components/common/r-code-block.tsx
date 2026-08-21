'use client';

import * as React from 'react';
import { Copy, Check, Download, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RCodeBlockProps {
  title?: string;
  description?: string;
  code: string;
  packages?: string[];
  fileName?: string;
  className?: string;
}

const MONO_FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export function RCodeBlock({
  title = 'Sintaks Verifikasi R (R Code)',
  description = 'Salin kode ini ke RStudio untuk memverifikasi dan mengonfirmasi hasil analisis 1:1.',
  code,
  packages = ['stats'],
  fileName = 'analisis_verifikasi.R',
  className
}: RCodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md overflow-hidden', className)}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
              {title}
              <Badge
                variant="outline"
                className="text-[10px] bg-blue-950/60 text-blue-300 border-blue-800 font-mono"
                style={{ fontFamily: MONO_FONT_FAMILY }}
              >
                R Script
              </Badge>
            </h4>
            {description && (
              <p className="text-[11px] text-zinc-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {packages && packages.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-400 mr-2">
              <span>Paket R:</span>
              {packages.map(p => (
                <span
                  key={p}
                  className="px-1.5 py-0.5 rounded bg-zinc-800 font-mono text-zinc-300"
                  style={{ fontFamily: MONO_FONT_FAMILY }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8 text-xs cursor-pointer gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono"
            style={{ fontFamily: MONO_FONT_FAMILY }}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin' : 'Salin Kode R'}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="h-8 text-xs cursor-pointer gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono"
            style={{ fontFamily: MONO_FONT_FAMILY }}
            title="Download file .R"
          >
            <Download className="w-3.5 h-3.5" />
            .R
          </Button>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed">
        <pre
          className="text-zinc-200 whitespace-pre font-mono text-xs"
          style={{ fontFamily: MONO_FONT_FAMILY }}
        >
          {code}
        </pre>
      </div>
    </div>
  );
}
