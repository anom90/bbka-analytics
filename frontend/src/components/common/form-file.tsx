'use client';

import * as React from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  X,
  Loader2,
  Star,
  BookOpen,
  Table,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDatasetStore } from '@/stores/dataset-store';
import { cn, formatNumber } from '@/lib/utils';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { DataRow } from '@/lib/types';

import { getVariableCodebook, VariableCodebookItem } from '@/constants/an-codebook';

interface SheetPreviewInfo {
  name: string;
  rowCount: number;
  colCount: number;
  previewRows: DataRow[];
  headers: string[];
  isRecommendedData?: boolean;
  isCodebookSheet?: boolean;
}

interface FilePreviewState {
  fileName: string;
  fileSize: number;
  isExcel: boolean;
  sheets: SheetPreviewInfo[];
  selectedSheetName: string;
  rawWorkbook?: XLSX.WorkBook;
  rawCsvText?: string;
  extractedCodebook?: Record<string, VariableCodebookItem>;
}

export function FormFile({ className }: { className?: string }) {
  const { loadFromParsedData, loadDefaultDataset, isLoading: storeLoading, fileName: activeFileName } = useDatasetStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [filePreview, setFilePreview] = React.useState<FilePreviewState | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);

  // Upload progress state
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progressPercent, setProgressPercent] = React.useState(0);
  const [progressStatus, setProgressStatus] = React.useState('');

  const processUploadedFile = async (file: File) => {
    setParseError(null);
    setIsProcessing(true);
    setProgressPercent(15);
    setProgressStatus(`Membaca file ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`);

    const lowerName = file.name.toLowerCase();

    try {
      if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        await new Promise(r => setTimeout(r, 100)); // Yield to UI thread
        setProgressPercent(35);
        setProgressStatus('Memuat buku kerja Excel ke memori...');

        const buffer = await file.arrayBuffer();
        setProgressPercent(60);
        setProgressStatus('Membaca seluruh lembar kerja (Sheet)...');

        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetNames = workbook.SheetNames;

        if (sheetNames.length === 0) {
          throw new Error('File Excel tidak memiliki sheet yang valid.');
        }

        setProgressPercent(75);
        setProgressStatus('Mengekstrak codebook kamus variabel & memetakan indikator...');

        // 1. Auto Extract Codebook from any sheet named codebook/kamus/pedoman
        const extractedCodebook: Record<string, VariableCodebookItem> = {};
        sheetNames.forEach(sName => {
          const lowerSName = sName.toLowerCase();
          if (lowerSName.includes('codebook') || lowerSName.includes('kamus') || lowerSName.includes('pedoman')) {
            const ws = workbook.Sheets[sName];
            const rawRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: null });
            if (rawRows && rawRows.length > 1) {
              const headerRow = (rawRows[0] || []).map((c: any) => String(c || '').toLowerCase().trim());
              const codeIdx = headerRow.findIndex((h: string) => h.includes('code') || h.includes('kode') || h.includes('variabel') || h.includes('var'));
              const nameIdx = headerRow.findIndex((h: string) => h.includes('nama') || h.includes('label') || h.includes('indikator') || h.includes('keterangan'));
              const conceptIdx = headerRow.findIndex((h: string) => h.includes('konseptual'));
              const opIdx = headerRow.findIndex((h: string) => h.includes('operasional') || h.includes('definisi') || h.includes('deskripsi'));

              const finalCodeIdx = codeIdx !== -1 ? codeIdx : 0;
              const finalNameIdx = nameIdx !== -1 ? nameIdx : 1;

              for (let r = 1; r < rawRows.length; r++) {
                const row = rawRows[r];
                if (!row || row.length === 0) continue;
                const codeVal = String(row[finalCodeIdx] || '').trim();
                const nameVal = String(row[finalNameIdx] || '').trim();
                const opVal = opIdx !== -1 && row[opIdx] ? String(row[opIdx]).trim() : '';
                const conceptVal = conceptIdx !== -1 && row[conceptIdx] ? String(row[conceptIdx]).trim() : '';

                if (codeVal && codeVal !== 'NULL' && codeVal !== 'None' && codeVal !== 'Codebook' && codeVal !== 'Kode') {
                  extractedCodebook[codeVal] = {
                    code: codeVal,
                    label: nameVal && nameVal !== 'NULL' ? `${nameVal} (${codeVal})` : codeVal,
                    domain: `Kamus ${sName}`,
                    operationalDefinition: opVal && opVal !== 'NULL' ? opVal : (nameVal || codeVal),
                    pisaConceptEquivalent: conceptVal && conceptVal !== 'NULL' ? conceptVal : '-',
                    level: 'Level 2 (Satuan/Pendidik)',
                    dataType: codeVal.startsWith('kd_') ? 'Identitas / ID' : 'Kontinu (Skala)'
                  };
                }
              }
            }
          }
        });

        setProgressPercent(85);
        setProgressStatus('Menganalisis pratinjau struktur kolom & baris data...');

        let maxRows = -1;
        let recommendedSheetName = sheetNames[0];

        const rawInfos = sheetNames.map(sName => {
          const ws = workbook.Sheets[sName];
          const json = XLSX.utils.sheet_to_json(ws, { defval: null }) as DataRow[];
          const headers = json.length > 0 ? Object.keys(json[0]) : [];
          const isCb = sName.toLowerCase().includes('codebook') || sName.toLowerCase().includes('kamus') || sName.toLowerCase().includes('pedoman');

          if (!isCb && json.length > maxRows) {
            maxRows = json.length;
            recommendedSheetName = sName;
          }
          return {
            name: sName,
            rowCount: json.length,
            colCount: headers.length,
            previewRows: json.slice(0, 6),
            headers,
            isCodebookSheet: isCb
          };
        });

        const sheetInfos: SheetPreviewInfo[] = rawInfos.map(s => ({
          ...s,
          isRecommendedData: s.name === recommendedSheetName && s.rowCount > 10
        }));

        setProgressPercent(100);
        setProgressStatus('Pratinjau siap!');

        setFilePreview({
          fileName: file.name,
          fileSize: file.size,
          isExcel: true,
          sheets: sheetInfos,
          selectedSheetName: recommendedSheetName,
          rawWorkbook: workbook,
          extractedCodebook
        });
      } else if (lowerName.endsWith('.csv')) {
        setProgressPercent(40);
        setProgressStatus('Membaca stream CSV...');

        const text = await file.text();
        setProgressPercent(75);
        setProgressStatus('Memetakan baris & tipe data...');

        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data as DataRow[];
            const headers = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
            setProgressPercent(100);
            setProgressStatus('Pratinjau siap!');

            setFilePreview({
              fileName: file.name,
              fileSize: file.size,
              isExcel: false,
              sheets: [
                {
                  name: 'Data CSV',
                  rowCount: parsedData.length,
                  colCount: headers.length,
                  previewRows: parsedData.slice(0, 6),
                  headers,
                  isRecommendedData: true
                }
              ],
              selectedSheetName: 'Data CSV',
              rawCsvText: text
            });
          },
          error: (err: Error) => {
            setParseError(`Gagal membaca file CSV: ${err.message}`);
          }
        });
      } else {
        throw new Error('Format file tidak didukung. Silakan gunakan .csv atau .xlsx / .xls');
      }
    } catch (err: any) {
      setParseError(err.message || 'Terjadi kesalahan saat memproses file.');
    } finally {
      setTimeout(() => setIsProcessing(false), 300);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmLoad = () => {
    if (!filePreview) return;

    setIsProcessing(true);
    setProgressPercent(50);
    setProgressStatus('Memuat & menyimpan dataset ke Local Storage...');

    setTimeout(() => {
      if (filePreview.isExcel && filePreview.rawWorkbook) {
        const ws = filePreview.rawWorkbook.Sheets[filePreview.selectedSheetName];
        const fullJson = XLSX.utils.sheet_to_json(ws, { defval: null }) as DataRow[];
        loadFromParsedData(
          fullJson,
          `${filePreview.fileName} [${filePreview.selectedSheetName}]`,
          filePreview.extractedCodebook
        );
        setFilePreview(null);
      } else if (filePreview.rawCsvText) {
        Papa.parse(filePreview.rawCsvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            loadFromParsedData(results.data as DataRow[], filePreview.fileName);
            setFilePreview(null);
          }
        });
      }
      setIsProcessing(false);
    }, 150);
  };

  const currentSheetInfo = filePreview?.sheets.find(
    s => s.name === filePreview.selectedSheetName
  ) || filePreview?.sheets[0];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Dropzone */}
      {!filePreview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden',
            isDragging
              ? 'border-[#008080] dark:border-[#14a3a3] bg-[#e6f2f2]/60 dark:bg-[#14312f]/40 scale-[1.01]'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-[#008080] dark:hover:border-[#14a3a3] bg-zinc-50/40 dark:bg-zinc-900/40',
            isProcessing && 'pointer-events-none opacity-80'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          {isProcessing ? (
            <div className="space-y-3 w-full max-w-sm py-4">
              <div className="flex items-center justify-center gap-2 text-[#008080] dark:text-[#14a3a3]">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                  {progressStatus}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#008080] dark:bg-[#14a3a3] h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">{progressPercent}% selesai</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-[#e6f2f2] dark:bg-[#14312f] rounded-2xl text-[#008080] dark:text-[#14a3a3] shadow-xs">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                  Klik untuk memilih file atau seret file ke sini
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Mendukung file Excel (.xlsx, .xls) dengan multi-sheet (Codebook vs Data) & CSV (.csv)
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Rich Workbook Sheet Selector & Live Data Preview */
        <Card className="border-2 border-[#008080]/40 dark:border-[#14a3a3]/40 shadow-md bg-white dark:bg-[#101c1c]">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#e6f2f2] dark:bg-[#14312f] text-[#008080] dark:text-[#14a3a3]">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {filePreview.fileName}
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {(filePreview.fileSize / 1024).toFixed(1)} KB
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {filePreview.isExcel
                      ? `Terdeteksi ${filePreview.sheets.length} Lembar Kerja (Sheet). Pilih sheet yang berisi tabel data untuk analisis.`
                      : 'Pratinjau data file CSV.'}
                  </CardDescription>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilePreview(null)}
                className="h-8 text-xs cursor-pointer text-zinc-500 hover:text-red-600 dark:hover:text-red-400 gap-1 rounded-xl"
              >
                <X className="w-3.5 h-3.5" /> Ganti File
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {/* Sheet Selector Cards if multiple sheets */}
            {filePreview.isExcel && filePreview.sheets.length > 1 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                    Pilih Sheet Data untuk Dimuat:
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    Klik sheet untuk melihat pratinjau di bawah
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filePreview.sheets.map(s => {
                    const isSelected = s.name === filePreview.selectedSheetName;
                    const isRec = s.isRecommendedData;

                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setFilePreview({ ...filePreview, selectedSheetName: s.name })}
                        className={cn(
                          'p-3 rounded-xl text-left cursor-pointer transition-all border flex flex-col justify-between gap-2 relative overflow-hidden',
                          isSelected
                            ? 'bg-gradient-to-br from-[#008080] to-[#006666] dark:from-[#14a3a3] dark:to-[#0f8787] text-white dark:text-[#04211f] border-transparent shadow-sm scale-[1.01]'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:bg-[#e6f2f2]/60 dark:hover:bg-[#14312f]/40 hover:border-[#008080]/30'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 w-full">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileSpreadsheet className={cn('size-4 shrink-0', isSelected ? 'text-white dark:text-[#04211f]' : 'text-[#008080] dark:text-[#14a3a3]')} />
                            <span className="font-bold text-xs truncate">{s.name}</span>
                          </div>
                          {isRec && (
                            <Badge
                              className={cn(
                                'text-[9px] px-1.5 py-0 h-4 shrink-0 font-semibold',
                                isSelected
                                  ? 'bg-amber-400 text-amber-950 border-transparent font-bold'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
                              )}
                            >
                              <Star className="w-2.5 h-2.5 fill-current mr-0.5" /> Rekomendasi
                            </Badge>
                          )}
                          {s.isCodebookSheet && (
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[9px] px-1.5 py-0 h-4 shrink-0 font-mono',
                                isSelected
                                  ? 'border-white/40 text-white'
                                  : 'border-teal-300 text-teal-700 dark:border-teal-800 dark:text-teal-300'
                              )}
                            >
                              Kamus
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-black/10 dark:border-white/10 w-full">
                          <span className={isSelected ? 'text-white/80 dark:text-[#04211f]/80' : 'text-zinc-500'}>
                            {s.colCount} Variabel
                          </span>
                          <span className={cn('font-mono font-bold', isSelected ? 'text-white dark:text-[#04211f]' : 'text-zinc-900 dark:text-zinc-100')}>
                            {s.rowCount.toLocaleString()} baris
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Data Preview Table for Selected Sheet */}
            {currentSheetInfo && (
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Pratinjau Matriks Data: <strong className="text-zinc-900 dark:text-zinc-100">{currentSheetInfo.name}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {currentSheetInfo.rowCount.toLocaleString()} Baris Observasi
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {currentSheetInfo.colCount} Kolom
                    </Badge>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto max-h-56 bg-white dark:bg-zinc-950 font-mono text-[11px] shadow-2xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
                      <tr>
                        <th className="p-2 text-zinc-400 text-[10px] w-10 text-center bg-zinc-50 dark:bg-zinc-900">#</th>
                        {currentSheetInfo.headers.map(h => {
                          const cb = getVariableCodebook(h, filePreview?.extractedCodebook);
                          return (
                            <th key={h} className="p-2 font-semibold text-zinc-800 dark:text-zinc-200 whitespace-nowrap bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200/50 dark:border-zinc-800/50 last:border-r-0">
                              <div className="flex flex-col min-w-[90px] max-w-[220px]">
                                <span className="font-mono text-zinc-900 dark:text-zinc-100 font-bold">{h}</span>
                                {cb.label && cb.label !== h && (
                                  <span className="text-[10px] font-normal text-[#008080] dark:text-[#14a3a3] truncate font-sans" title={cb.label}>
                                    {cb.label}
                                  </span>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {currentSheetInfo.previewRows.length === 0 ? (
                        <tr>
                          <td colSpan={currentSheetInfo.headers.length + 1} className="p-6 text-center text-zinc-400 text-xs">
                            Sheet ini kosong atau tidak memiliki baris data terstruktur. Silakan pilih sheet lainnya di atas.
                          </td>
                        </tr>
                      ) : (
                        currentSheetInfo.previewRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                            <td className="p-2 text-zinc-400 text-[10px] text-center font-mono">{rIdx + 1}</td>
                            {currentSheetInfo.headers.map(h => (
                              <td key={h} className="p-2 text-zinc-700 dark:text-zinc-300 whitespace-nowrap truncate max-w-[220px]">
                                {row[h] !== null && row[h] !== undefined ? String(row[h]) : '-'}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Confirm Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-[11px] text-zinc-500 italic">
                Pastikan sheet yang dipilih adalah tabel data responden (misal: <code>rapor_publik</code>).
              </p>
              <Button
                onClick={handleConfirmLoad}
                disabled={!currentSheetInfo || currentSheetInfo.rowCount === 0 || isProcessing}
                className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer text-xs gap-1.5 shadow-sm font-semibold px-5 rounded-xl h-9"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Gunakan Sheet &apos;{currentSheetInfo?.name}&apos; & Muat Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parse Error Notification */}
      {parseError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* Active dataset indicator & default dataset load button */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
          <span className="text-xs text-zinc-600 dark:text-zinc-300">
            {activeFileName ? (
              <>Dataset aktif: <strong className="text-zinc-900 dark:text-zinc-100">{activeFileName}</strong></>
            ) : (
              'Belum ada dataset yang dimuat.'
            )}
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            setFilePreview(null);
            loadDefaultDataset();
          }}
          disabled={storeLoading || isProcessing}
          className="cursor-pointer text-xs flex items-center gap-1.5 border-[#008080]/30 dark:border-[#14a3a3]/30 text-[#008080] dark:text-[#14a3a3] hover:bg-[#e6f2f2] dark:hover:bg-[#14312f] rounded-xl font-semibold"
        >
          {storeLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Database className="w-3.5 h-3.5" />
          )}
          Muat Data Asesmen Nasional Bawaan
        </Button>
      </div>
    </div>
  );
}
