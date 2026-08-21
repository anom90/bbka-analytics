'use client';

import * as React from 'react';
import { BookOpen, Copy, Check, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RichMarkdown } from '@/components/common/rich-markdown';
import { useAiStore } from '@/stores/ai-store';
import { useDatasetStore } from '@/stores/dataset-store';
import { callGemini } from '@/lib/gemini';
import { formatCodebookContext } from '@/constants/an-codebook';

interface AiCardProps {
  analysisKey: string;
  title?: string;
  defaultNarrative?: string;
  promptBuilder?: () => string;
  variables?: string[];
  className?: string;
}

export function AiCard({
  analysisKey,
  title = 'Sintesis Akademik & Pembahasan (Standar APA 7th)',
  defaultNarrative,
  promptBuilder,
  variables,
  className
}: AiCardProps) {
  const { geminiApiKey, referenceText, interpretations, setInterpretation } = useAiStore();
  const { customCodebook, columns } = useDatasetStore();
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const activeContent = interpretations[analysisKey] || defaultNarrative || '';

  const handleGenerate = async () => {
    if (!promptBuilder) return;
    setLoading(true);
    setError(null);

    try {
      if (geminiApiKey && geminiApiKey.trim() !== '') {
        // Collect relevant variables for contextual enrichment
        const targetVars = variables && variables.length > 0
          ? variables
          : columns.map(c => c.name);
        const codebookContext = formatCodebookContext(targetVars, customCodebook);

        const prompt = `
${promptBuilder()}

${codebookContext}

Panduan Acuan & Konteks Analisis:
${referenceText}

Instruksi Penulisan Akademik:
1. Hubungkan hasil statistik secara langsung dengan nama indikator resmi, definisi operasional, dan konteks evaluasi Asesmen Nasional (Siswa / Guru / Kepala Sekolah).
2. Hindari hanya mengulang kode singkatan mentah (misal sebutkan "Pemahaman dan Sikap terhadap Risiko Bencana (SPAB 1)" alih-alih hanya "SPAB_1").
3. Bahas arah perbedaan/pengaruh berdasarkan substansi pedagogis dan kebijakan pendidikan di Indonesia.
4. Susun narasi dalam format publikasi ilmiah APA 7th Edition (Narasi Temuan, Tabel Rangkuman APA, dan Poin Pembahasan Kontekstual).
        `.trim();

        const generated = await callGemini(geminiApiKey, prompt);
        setInterpretation(analysisKey, generated);
      } else {
        // Use intelligent local narrative if no API key
        if (defaultNarrative) {
          setInterpretation(analysisKey, defaultNarrative);
        } else {
          setError('API Key Gemini belum disetel. Buka menu Pengaturan untuk memasukkan API Key.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menyusun narasi akademik.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!activeContent) return;
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-xs p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200/80 dark:border-teal-800/70 text-[#008080] dark:text-[#14a3a3] flex items-center justify-center shrink-0 shadow-2xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              {title}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border border-teal-500/20 bg-teal-50/60 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300">
                {geminiApiKey ? 'Sintesis Kontekstual' : 'Format Standar APA 7th'}
              </span>
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sintesis otomatis hasil uji hipotesis, ukuran efek (effect size), dan implikasi kebijakan pendidikan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeContent && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 text-xs cursor-pointer gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin' : 'Salin Narasi'}
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={loading}
            className="h-8 text-xs cursor-pointer gap-1.5 bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] rounded-xl font-semibold shadow-xs"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            {activeContent ? 'Perbarui Narasi' : 'Sintesis Narasi APA'}
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {activeContent ? (
        <RichMarkdown content={activeContent} className="bg-zinc-50/70 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 font-serif leading-relaxed text-zinc-800 dark:text-zinc-200" />
      ) : (
        <div className="py-6 text-center text-xs text-zinc-400 italic">
          Klik tombol &apos;Sintesis Narasi APA&apos; untuk membuat sintesis otomatis hasil analisis dalam format manuskrip ilmiah APA 7th.
        </div>
      )}
    </div>
  );
}
