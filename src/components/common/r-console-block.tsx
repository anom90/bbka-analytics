'use client';

import * as React from 'react';
import { Terminal, Copy, Check, TerminalSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface RConsoleBlockProps {
  title?: string;
  description?: string;
  consoleOutput?: string;
  engineName?: string;
  className?: string;
}

const MONO_FONT_FAMILY = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export function RConsoleBlock({
  title = 'Output Konsol R (Live R Session Console)',
  description = 'Hasil keluaran teks mentah (raw text stdout) dari eksekusi fungsi R native di sesi RStudio/Plumber.',
  consoleOutput,
  engineName = 'R Native Sesi Aktif',
  className
}: RConsoleBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!consoleOutput) return;
    navigator.clipboard.writeText(consoleOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = consoleOutput ? consoleOutput.split('\n').length : 0;

  return (
    <Card className={cn('shadow-md border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-zinc-100 overflow-hidden', className)}>
      {/* Terminal Top Bar */}
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-zinc-900/90 border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-xs font-bold text-zinc-100 flex items-center gap-2">
              {title}
              <Badge
                variant="outline"
                className="bg-emerald-950/60 text-emerald-300 border-emerald-800 text-[10px] flex items-center gap-1.5 font-mono"
                style={{ fontFamily: MONO_FONT_FAMILY }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {engineName}
              </Badge>
            </CardTitle>
            {description && (
              <CardDescription className="text-[11px] text-zinc-400 mt-0.5">
                {description}
              </CardDescription>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {consoleOutput && (
            <span
              className="hidden sm:inline-block text-[10px] text-zinc-400 font-mono mr-2"
              style={{ fontFamily: MONO_FONT_FAMILY }}
            >
              {lineCount} baris output
            </span>
          )}

          {consoleOutput && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-8 text-xs cursor-pointer gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono"
              style={{ fontFamily: MONO_FONT_FAMILY }}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  Salin Konsol
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {consoleOutput ? (
          <div className="p-4 overflow-x-auto max-h-[440px] overflow-y-auto leading-relaxed select-text text-xs">
            <pre
              className="text-zinc-200 whitespace-pre font-mono text-xs"
              style={{ fontFamily: MONO_FONT_FAMILY }}
            >
              {consoleOutput}
            </pre>
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed rounded-xl border-zinc-800 bg-zinc-900/40 m-4 space-y-2">
            <TerminalSquare className="w-8 h-8 mx-auto text-zinc-500 stroke-1" />
            <p className="text-xs text-zinc-400 font-medium">
              Output konsol R belum tersedia.
            </p>
            <p className="text-[11px] text-zinc-500 max-w-md mx-auto">
              Klik tombol &apos;Jalankan Analisis&apos; di atas untuk mengeksekusi fungsi R native dan menampilkan keluaran mentah konsol R di sini.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
