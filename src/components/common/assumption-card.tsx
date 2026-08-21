'use client';

import * as React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Info, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AssumptionCheckItem } from '@/lib/types';
import { formatNumber, formatPValue } from '@/lib/utils';

interface AssumptionCardProps {
  title?: string;
  subtitle?: string;
  assumptions?: AssumptionCheckItem[];
  className?: string;
}

export function AssumptionCard({
  title = 'Evaluasi & Pemeriksaan Asumsi Statistik (Diagnostic Assumption Checks)',
  subtitle = 'Pemeriksaan asumsi parametrik untuk memastikan validitas inferensi dan memandu pemilihan uji alternatif jika asumsi terlanggar.',
  assumptions = [],
  className = ''
}: AssumptionCardProps) {
  if (!assumptions || assumptions.length === 0) return null;

  const passedCount = assumptions.filter(a => a.status === 'passed').length;
  const warningCount = assumptions.filter(a => a.status === 'warning').length;
  const failedCount = assumptions.filter(a => a.status === 'failed').length;

  return (
    <Card className={`shadow-sm border-zinc-200 dark:border-zinc-800 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </CardTitle>
              {subtitle && (
                <CardDescription className="text-xs mt-0.5">{subtitle}</CardDescription>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {passedCount > 0 && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-[10px] font-mono">
                ✓ {passedCount} Terpenuhi
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-[10px] font-mono">
                ! {warningCount} Perhatian
              </Badge>
            )}
            {failedCount > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800 text-[10px] font-mono">
                ✕ {failedCount} Terlanggar
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          {assumptions.map((item, idx) => {
            const isPassed = item.status === 'passed';
            const isWarning = item.status === 'warning';

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-colors ${
                  isPassed
                    ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10'
                    : isWarning
                    ? 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10'
                    : 'border-red-200/80 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {item.name}
                      </h4>
                      {item.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <p className="text-[11.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed pl-6">
                      {item.conclusion}
                    </p>

                    {item.recommendation && (
                      <div className="flex items-center gap-1.5 pl-6 pt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        <Info className="w-3 h-3 text-[#008080] dark:text-[#14a3a3] shrink-0" />
                        <span><strong>Rekomendasi Tindakan:</strong> {item.recommendation}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${
                        isPassed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300'
                      }`}
                    >
                      {isPassed ? 'Terpenuhi' : isWarning ? 'Perhatian / Robust' : 'Terlanggar'}
                    </Badge>

                    {item.threshold && (
                      <p className="text-[10px] text-zinc-400 font-mono mt-1">
                        Kriteria: {item.threshold}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
