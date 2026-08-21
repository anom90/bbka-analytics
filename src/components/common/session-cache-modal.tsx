'use client';

import * as React from 'react';
import {
  RotateCcw,
  Trash2,
  Database,
  CheckCircle2,
  HardDrive,
  Activity,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAnalysisStore } from '@/stores/analysis-store';
import { useDatasetStore } from '@/stores/dataset-store';

export function SessionCacheModal() {
  const [open, setOpen] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const {
    tTestResult,
    anovaResult,
    ancovaResult,
    manovaResult,
    regressionResult,
    semResult,
    multilevelResult,
    clearAllResults,
    clearAllSessionCache
  } = useAnalysisStore();

  const { data, fileName, loadDefaultDataset } = useDatasetStore();

  // Count active cached results
  const cachedResultsCount = [
    tTestResult,
    anovaResult,
    ancovaResult,
    manovaResult,
    regressionResult,
    semResult,
    multilevelResult
  ].filter(Boolean).length;

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 2500);
  };

  const handleClearAnalysisResults = () => {
    clearAllResults();
    showSuccess('✓ Seluruh cache hasil uji statistik berhasil dibersihkan.');
  };

  const handleClearAllSessionCache = async () => {
    await clearAllSessionCache();
    showSuccess('✓ Seluruh cache sesi IndexedDB & konfigurasi model berhasil di-reset.');
  };

  const handleResetFullWorkspace = async () => {
    await clearAllSessionCache();
    loadDefaultDataset();
    showSuccess('✓ Workspace & dataset telah dikembalikan ke kondisi awal (Clean State).');
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 text-xs gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer shadow-xs font-medium"
        title="Manajemen Memori Sesi & Cache Analisis"
      >
        <HardDrive className="size-3.5 text-[#008080] dark:text-[#14a3a3]" />
        <span className="hidden md:inline">Sesi & Cache</span>
        {cachedResultsCount > 0 && (
          <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#008080] text-white text-[10px] font-bold font-mono">
            {cachedResultsCount}
          </span>
        )}
      </Button>

      {/* Modal Dialog Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex min-h-full items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-3.5 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-[#008080] dark:text-[#14a3a3] border border-teal-200 dark:border-teal-900">
                  <HardDrive className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Manajemen Sesi & Cache
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Kontrol memori browser, hasil analisis, dan dataset aktif.
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 py-3.5 space-y-3 overflow-y-auto max-h-[calc(85vh-7rem)]">
              {/* Storage Summary Box */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                    <Database className="size-3.5 text-zinc-400" />
                    Dataset Aktif:
                  </span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[220px]" title={fileName || 'Dataset'}>
                    {fileName || 'Default Dataset'} ({data.length.toLocaleString()} baris)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                    <Activity className="size-3.5 text-teal-500" />
                    Hasil Analisis Tersimpan:
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono font-bold bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-200">
                    {cachedResultsCount} Modul Uji
                  </Badge>
                </div>
              </div>

              {/* Feedback Alert */}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs border border-emerald-200 dark:border-emerald-900 font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Action Options */}
              <div className="space-y-2.5">
                {/* Action 1: Clear results only */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <RotateCcw className="size-3.5 text-blue-500" />
                      Bersihkan Hasil Uji Statistik
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Menghapus tabel output uji t-Test, ANOVA, SEM, & Multilevel dari cache memori tanpa mengubah dataset.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearAnalysisResults}
                    className="text-xs h-8 shrink-0 cursor-pointer rounded-lg"
                  >
                    Bersihkan
                  </Button>
                </div>

                {/* Action 2: Clear full session cache (IndexedDB) */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <SlidersHorizontal className="size-3.5 text-[#008080] dark:text-[#14a3a3]" />
                      Reset Sintaks & Konfigurasi Model
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Mengosongkan cache sintaks kustom, pilihan variabel eksogen/endogen, dan konstruk laten SEM.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearAllSessionCache}
                    className="text-xs h-8 shrink-0 text-[#008080] dark:text-[#14a3a3] border-[#008080]/30 hover:bg-[#e6f2f2] dark:hover:bg-[#14312f] cursor-pointer rounded-lg font-semibold"
                  >
                    Reset Model
                  </Button>
                </div>

                {/* Action 3: Complete Workspace Wipe */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-50/60 transition-colors">
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                      <Trash2 className="size-3.5 text-rose-600" />
                      Reset Total Workspace & Dataset
                    </p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400 leading-relaxed">
                      Mengosongkan seluruh memori browser dan memuat ulang dataset default (Clean Workspace).
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleResetFullWorkspace}
                    className="text-xs h-8 shrink-0 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer rounded-lg font-bold shadow-xs"
                  >
                    Reset Total
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 px-5 border-t border-zinc-100 dark:border-zinc-800 shrink-0 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="text-xs h-7 px-3 rounded-lg cursor-pointer text-zinc-600 dark:text-zinc-400"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
