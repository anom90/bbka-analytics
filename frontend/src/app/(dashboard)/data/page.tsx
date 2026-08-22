'use client';

import * as React from 'react';
import {
  Database,
  FileSpreadsheet,
  BarChart2,
  Filter,
  Layers,
  Download,
  Plus,
  Trash2,
  RotateCcw,
  GitMerge,
  ArrowRight,
  Code2,
  CheckSquare,
  Square,
  Eye,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
  Wand2,
  Scissors,
  Bot,
  Binary,
  Cpu,
  BrainCircuit,
  UploadCloud,
  FileUp,
  FileDown,
  X
} from 'lucide-react';
import { FormFile } from '@/components/common/form-file';
import { DataTable } from '@/components/common/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RCodeBlock } from '@/components/common/r-code-block';
import { PageHeader } from '@/components/common/page-header';
import { useDatasetStore, DataFilterRule, calculateMissingDiagnostics, ImputationMethod } from '@/stores/dataset-store';
import { RSyntaxGenerator } from '@/lib/stats/r-syntax';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataRow } from '@/lib/types';

import { getVariableCodebook } from '@/constants/an-codebook';
import { VariableTooltip } from '@/components/common/variable-tooltip';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

export default function DataPage() {
  const {
    data,
    originalData,
    columns,
    fileName,
    loadDefaultDataset,
    applyFilters,
    applySubsetColumns,
    resetToOriginalData,
    dropMissingRows,
    dropEmptyColumns,
    dropSpecificColumns,
    imputeMissingData,
    mergeWithSecondaryData,
    exportData,
    filterRules
  } = useDatasetStore();

  const [activeTab, setActiveTab] = React.useState('explorer');

  // Filter state
  const [localRules, setLocalRules] = React.useState<DataFilterRule[]>([]);
  const [selectedColsForSubset, setSelectedColsForSubset] = React.useState<string[]>([]);
  const [subsetSearchTerm, setSubsetSearchTerm] = React.useState('');

  // Missing Data Interactive Selection & Drop State
  const [selectedMissingColsToDrop, setSelectedMissingColsToDrop] = React.useState<string[]>([]);
  const [missingSearchTerm, setMissingSearchTerm] = React.useState('');
  const [missingFilterTier, setMissingFilterTier] = React.useState<'all' | '100' | '50' | '30' | '20' | '0'>('all');
  const [customMissingThreshold, setCustomMissingThreshold] = React.useState<number>(50);

  // Missing Data Action & Animated Progress State
  const [isImputing, setIsImputing] = React.useState(false);
  const [imputeProgress, setImputeProgress] = React.useState(0);
  const [imputeStepText, setImputeStepText] = React.useState('');
  const [imputeMethodLabel, setImputeMethodLabel] = React.useState('');
  const [missingActionMessage, setMissingActionMessage] = React.useState<string | null>(null);

  // Secondary Merge state
  const secondaryFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isSecondaryDragging, setIsSecondaryDragging] = React.useState(false);
  const [secondaryFile, setSecondaryFile] = React.useState<File | null>(null);
  const [secondaryWorkbook, setSecondaryWorkbook] = React.useState<XLSX.WorkBook | null>(null);
  const [secondarySheets, setSecondarySheets] = React.useState<string[]>([]);
  const [selectedSecondarySheet, setSelectedSecondarySheet] = React.useState<string>('');
  const [secondaryData, setSecondaryData] = React.useState<DataRow[]>([]);
  const [secondaryCols, setSecondaryCols] = React.useState<string[]>([]);
  const [primaryJoinKey, setPrimaryJoinKey] = React.useState('kd_sekolah');
  const [secondaryJoinKey, setSecondaryJoinKey] = React.useState('kd_sekolah');
  const [selectedSecondaryColsToMerge, setSelectedSecondaryColsToMerge] = React.useState<string[]>([]);
  const [ignoreEmptySecondaryCols, setIgnoreEmptySecondaryCols] = React.useState(true);
  const [joinType, setJoinType] = React.useState<'left' | 'inner'>('left');
  const [mergeStatus, setMergeStatus] = React.useState<string | null>(null);

  // Merge Progress indicator state
  const [isMerging, setIsMerging] = React.useState(false);
  const [mergeProgress, setMergeProgress] = React.useState(0);
  const [mergeStepText, setMergeStepText] = React.useState('');

  // Secondary file reading progress
  const [isReadingSecondary, setIsReadingSecondary] = React.useState(false);
  const [secondaryReadProgress, setSecondaryReadProgress] = React.useState(0);

  React.useEffect(() => {
    if (columns.length > 0 && selectedColsForSubset.length === 0) {
      setSelectedColsForSubset(columns.map(c => c.name));
    }
    if (columns.some(c => c.name === 'kd_sekolah')) {
      setPrimaryJoinKey('kd_sekolah');
    }
  }, [columns]);

  // Live match diagnostics calculation
  const mergeMatchDiagnostics = React.useMemo(() => {
    if (!secondaryData || secondaryData.length === 0 || !primaryJoinKey || !secondaryJoinKey) return null;
    const norm = (v: any) => String(v ?? '').trim().toLowerCase().replace(/\.0+$/, '');
    const secKeys = new Set(secondaryData.map(r => norm(r[secondaryJoinKey])).filter(Boolean));
    const primaryDataset = data.length > 0 ? data : originalData;
    const primaryKeys = primaryDataset.map(r => norm(r[primaryJoinKey])).filter(Boolean);
    const totalPrimary = primaryKeys.length;
    let matched = 0;
    const matchedSchools = new Set<string>();
    const totalSchools = new Set<string>();

    for (const pk of primaryKeys) {
      totalSchools.add(pk);
      if (secKeys.has(pk)) {
        matched++;
        matchedSchools.add(pk);
      }
    }
    const pct = totalPrimary > 0 ? (matched / totalPrimary) * 100 : 0;
    return {
      matched,
      totalPrimary,
      pct,
      matchedSchools: matchedSchools.size,
      totalSchools: totalSchools.size,
      uniqueSecSchools: secKeys.size
    };
  }, [secondaryData, primaryJoinKey, secondaryJoinKey, data, originalData]);

  const numericCols = columns.filter(c => c.type === 'numeric');
  const nominalCols = columns.filter(c => c.type === 'nominal');

  // Calculate Real-time MICE Missing Diagnostics
  const missingDiag = React.useMemo(() => {
    return calculateMissingDiagnostics(data, columns);
  }, [data, columns]);

  // Helper to extract unique category values for a given column from dataset
  const getUniqueValuesForCol = React.useCallback((colName: string): string[] => {
    const dataset = originalData.length > 0 ? originalData : data;
    const values = new Set<string>();
    for (let i = 0; i < dataset.length; i++) {
      const v = dataset[i][colName];
      if (v !== null && v !== undefined && String(v).trim() !== '' && String(v) !== 'NULL' && String(v) !== 'NA') {
        values.add(String(v).trim());
      }
    }
    return Array.from(values).sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [data, originalData]);

  // Missing Data Handlers with Rich Step-by-Step Progress Tracking
  const handleDropMissing = () => {
    setIsImputing(true);
    setImputeProgress(30);
    setImputeStepText(`Menyaring ${missingDiag.totalRows.toLocaleString()} baris data...`);
    setImputeMethodLabel('Listwise Deletion (Drop NA)');
    setMissingActionMessage(null);

    setTimeout(() => {
      setImputeProgress(80);
      setImputeStepText('Menghapus baris yang mengandung sel kosong...');
      const res = dropMissingRows();

      setTimeout(() => {
        setImputeProgress(100);
        setIsImputing(false);
        setMissingActionMessage(
          `✓ Berhasil menghapus ${res.droppedCount.toLocaleString()} baris yang memiliki nilai missing. Tersisa ${res.remainingCount.toLocaleString()} baris lengkap (Complete Cases).`
        );
      }, 300);
    }, 200);
  };

  // Identify threshold counts
  const missingTierStats = React.useMemo(() => {
    const all = missingDiag.columnStats;
    const count100 = all.filter(c => c.missingPct >= 99.99 || c.validCount === 0).length;
    const count50 = all.filter(c => c.missingPct >= 50).length;
    const count30 = all.filter(c => c.missingPct >= 30).length;
    const count20 = all.filter(c => c.missingPct >= 20).length;
    const countZero = all.filter(c => c.missingCount === 0).length;
    const customCount = all.filter(c => c.missingPct >= customMissingThreshold).length;

    return {
      allCount: all.length,
      count100,
      count50,
      count30,
      count20,
      countZero,
      customCount
    };
  }, [missingDiag, customMissingThreshold]);

  // Identify 100% empty columns (columns with 0 valid values)
  const emptyColumnsList = React.useMemo(() => {
    return missingDiag.columnStats.filter(c => c.missingPct >= 99.99 || c.validCount === 0);
  }, [missingDiag]);

  const handleDropEmptyColumns = () => {
    if (emptyColumnsList.length === 0) return;
    const res = dropEmptyColumns(99.99);
    setMissingActionMessage(
      `✓ Berhasil menghapus ${res.droppedCols.length} variabel yang 100% kosong (tanpa data). Tersisa ${res.remainingCols} kolom aktif yang memiliki data observasi valid.`
    );
  };

  const handleDropThreshold = (threshold: number) => {
    const res = dropEmptyColumns(threshold);
    setMissingActionMessage(
      `✓ Berhasil menghapus ${res.droppedCols.length} variabel dengan missing ≥ ${threshold}%. Tersisa ${res.remainingCols} kolom aktif yang siap dianalisis.`
    );
  };

  const handleDropSelectedMissingCols = () => {
    if (selectedMissingColsToDrop.length === 0) return;
    const count = selectedMissingColsToDrop.length;
    const res = dropSpecificColumns(selectedMissingColsToDrop);
    setSelectedMissingColsToDrop([]);
    setMissingActionMessage(
      `✓ Berhasil menghapus ${res.droppedCols.length} variabel terpilih. Tersisa ${res.remainingCols} kolom aktif.`
    );
  };

  const handleDropSingleCol = (colName: string) => {
    const res = dropSpecificColumns([colName]);
    setSelectedMissingColsToDrop(prev => prev.filter(c => c !== colName));
    setMissingActionMessage(`✓ Berhasil menghapus variabel '${colName}'. Tersisa ${res.remainingCols} kolom aktif.`);
  };

  const filteredMissingStats = React.useMemo(() => {
    return missingDiag.columnStats.filter(c => {
      const cb = getVariableCodebook(c.name);
      const matchesSearch = !missingSearchTerm || 
        c.name.toLowerCase().includes(missingSearchTerm.toLowerCase()) || 
        (cb?.label && cb.label.toLowerCase().includes(missingSearchTerm.toLowerCase())) ||
        (cb?.operationalDefinition && cb.operationalDefinition.toLowerCase().includes(missingSearchTerm.toLowerCase()));
      if (!matchesSearch) return false;

      if (missingFilterTier === '100') return c.missingPct >= 99.99 || c.validCount === 0;
      if (missingFilterTier === '50') return c.missingPct >= 50;
      if (missingFilterTier === '30') return c.missingPct >= 30;
      if (missingFilterTier === '20') return c.missingPct >= 20;
      if (missingFilterTier === '0') return c.missingCount === 0;
      return true;
    });
  }, [missingDiag, missingSearchTerm, missingFilterTier]);

  // Lookup map for fast missing percentage access
  const colStatsMap = React.useMemo(() => {
    const map = new Map<string, number>();
    missingDiag.columnStats.forEach(cs => map.set(cs.name, cs.missingPct));
    return map;
  }, [missingDiag]);

  // Export the full missing-value diagnostic report (all variables, not just the current
  // on-screen filter/search) as a PDF, so it can be attached alongside the dataset when
  // requesting an analysis recommendation from Beaver / Zotero.
  const handleDownloadMissingReportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const generatedAt = new Date().toLocaleString('id-ID');
    const activeFileName = fileName || 'Dataset Bawaan';

    doc.setFontSize(14);
    doc.text('Laporan Diagnosis Missing Data', 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(`Dataset: ${activeFileName}  |  N Observasi: ${missingDiag.totalRows.toLocaleString()}  |  Total Variabel: ${missingDiag.totalCols}`, 14, 22);
    doc.text(`Dibuat: ${generatedAt}  |  Total Sel Missing: ${missingDiag.totalMissingCells.toLocaleString()} (${missingDiag.overallMissingPct.toFixed(2)}% dari seluruh sel)`, 14, 27);
    doc.text(`Baris Lengkap (Tanpa NA): ${missingDiag.completeRowsCount.toLocaleString()} (${missingDiag.completeRowsPct.toFixed(2)}%)  |  Baris Tidak Lengkap: ${missingDiag.incompleteRowsCount.toLocaleString()} (${missingDiag.incompleteRowsPct.toFixed(2)}%)`, 14, 32);
    doc.setTextColor(0);

    const sortedCols = [...missingDiag.columnStats].sort((a, b) => b.missingPct - a.missingPct);

    autoTable(doc, {
      startY: 38,
      head: [['Variabel', 'Label', 'Tipe', 'Valid (N)', 'Missing (NA)', '% Missing']],
      body: sortedCols.map(c => {
        const cb = getVariableCodebook(c.name);
        return [
          c.name,
          cb?.label && cb.label !== c.name ? cb.label : '-',
          c.type === 'numeric' ? 'Skala' : 'Nominal',
          c.validCount.toLocaleString(),
          c.missingCount.toLocaleString(),
          `${c.missingPct.toFixed(2)}%`
        ];
      }),
      styles: { fontSize: 7.5, cellPadding: 1.5 },
      headStyles: { fillColor: [0, 128, 128] },
      columnStyles: { 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && hookData.column.index === 5) {
          const pct = parseFloat(String(hookData.cell.raw).replace('%', ''));
          if (pct >= 50) hookData.cell.styles.textColor = [190, 30, 45];
          else if (pct >= 20) hookData.cell.styles.textColor = [180, 120, 0];
        }
      }
    });

    if (missingDiag.patterns.length > 0) {
      const afterTableY = (doc as any).lastAutoTable?.finalY || 38;
      doc.setFontSize(11);
      doc.text('Pola Kombinasi Missing Data (MICE Pattern)', 14, afterTableY + 10);

      autoTable(doc, {
        startY: afterTableY + 14,
        head: [['Pola', 'Jumlah Baris', '% Baris', 'Status', 'Variabel Kosong']],
        body: missingDiag.patterns.slice(0, 20).map(p => [
          p.patternId,
          p.count.toLocaleString(),
          `${p.pct.toFixed(2)}%`,
          p.isComplete ? 'Lengkap' : 'Tidak Lengkap',
          p.isComplete ? '-' : p.missingVars.join(', ')
        ]),
        styles: { fontSize: 7.5, cellPadding: 1.5 },
        headStyles: { fillColor: [0, 128, 128] },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } }
      });
    }

    const baseName = activeFileName.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
    doc.save(`laporan_missing_data_${baseName}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleImpute = async (method: ImputationMethod) => {
    const methodLabels: Record<ImputationMethod, string> = {
      rf: 'Machine Learning: Random Forest (mice.impute.rf via ranger)',
      cart: 'Machine Learning: Decision Trees (mice.impute.cart via rpart)',
      pmm: 'MICE: Predictive Mean Matching (PMM)',
      median: 'Median & Modus Cepat',
      mean: 'Rata-rata & Modus Cepat'
    };

    setIsImputing(true);
    setImputeProgress(15);
    setImputeMethodLabel(methodLabels[method]);
    setImputeStepText(`Memeriksa ${missingDiag.totalRows.toLocaleString()} observasi & ${missingDiag.totalMissingCells.toLocaleString()} sel missing...`);
    setMissingActionMessage(null);

    // Simulated granular progress steps while awaiting R / client processing
    const stepTimer1 = setTimeout(() => {
      setImputeProgress(35);
      setImputeStepText('Mengecualikan variabel ID & membangun matriks prediktor...');
    }, 400);

    const stepTimer2 = setTimeout(() => {
      setImputeProgress(65);
      setImputeStepText(`Menjalankan komputasi ${methodLabels[method]} di sesi R...`);
    }, 1200);

    try {
      const res = await imputeMissingData(method);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setImputeProgress(90);
      setImputeStepText('Memvalidasi integritas dataset 100% complete cases...');

      await new Promise(r => setTimeout(r, 300));
      setImputeProgress(100);

      setMissingActionMessage(`✓ Berhasil mengimputasi ${res.imputedCount.toLocaleString()} sel missing menggunakan ${methodLabels[method]}. Dataset kini 100% lengkap tanpa nilai NA.`);
    } catch (err: any) {
      setMissingActionMessage(`Gagal mengimputasi: ${err.message}`);
    } finally {
      setTimeout(() => setIsImputing(false), 500);
    }
  };

  const handleResetMissing = () => {
    resetToOriginalData();
    setMissingActionMessage('✓ Dataset telah dikembalikan ke kondisi awal sebelum imputasi / penghapusan.');
  };

  // Filter Handlers
  const handleAddRule = () => {
    if (columns.length === 0) return;
    const firstCol = columns[0];
    const initialVals = getUniqueValuesForCol(firstCol.name);
    const newRule: DataFilterRule = {
      id: Math.random().toString(36).substring(2, 9),
      col: firstCol.name,
      op: '==',
      val: initialVals.length > 0 ? initialVals[0] : ''
    };
    setLocalRules([...localRules, newRule]);
  };

  const handleRemoveRule = (id: string) => {
    setLocalRules(localRules.filter(r => r.id !== id));
  };

  const handleUpdateRule = (id: string, field: keyof DataFilterRule, val: any) => {
    setLocalRules(localRules.map(r => {
      if (r.id !== id) return r;
      if (field === 'col') {
        const uVals = getUniqueValuesForCol(val);
        return { ...r, col: val, val: uVals.length > 0 ? uVals[0] : '' };
      }
      return { ...r, [field]: val };
    }));
  };

  const handleExecuteFilter = () => {
    applyFilters(localRules);
  };

  const handleExecuteSubset = () => {
    applySubsetColumns(selectedColsForSubset);
  };

  const handleResetFilters = () => {
    setLocalRules([]);
    resetToOriginalData();
  };

  // Merge Handlers with Progress Tracking
  const processSecondaryFile = async (file: File) => {
    if (!file) return;
    setSecondaryFile(file);
    setMergeStatus(null);
    setIsReadingSecondary(true);
    setSecondaryReadProgress(20);

    try {
      await new Promise(r => setTimeout(r, 100));
      setSecondaryReadProgress(45);

      const buffer = await file.arrayBuffer();
      setSecondaryReadProgress(75);

      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetNames = workbook.SheetNames;
      setSecondaryWorkbook(workbook);
      setSecondarySheets(sheetNames);

      if (sheetNames.length > 0) {
        const firstSheet = sheetNames[0];
        setSelectedSecondarySheet(firstSheet);
        const sheet = workbook.Sheets[firstSheet];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: null }) as DataRow[];
        setSecondaryData(json);
        if (json.length > 0) {
          const cols = Object.keys(json[0]);
          setSecondaryCols(cols);
          
          // Auto detect secondary key
          const autoKey = cols.find(c => {
            const l = c.toLowerCase();
            return l === 'kd_sekolah' || l === 'kode_sekolah' || l === 'id_sekolah' || l === 'sekolah_id' || l === 'school_id' || l === 'npsn';
          }) || cols[0] || 'kd_sekolah';
          setSecondaryJoinKey(autoKey);
          setSelectedSecondaryColsToMerge(cols.filter(c => c !== autoKey));
        }
      }
      setSecondaryReadProgress(100);
    } catch (err: any) {
      setMergeStatus(`Gagal membaca file sekunder: ${err.message}`);
    } finally {
      setTimeout(() => setIsReadingSecondary(false), 300);
    }
  };

  const handleSecondaryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processSecondaryFile(e.target.files[0]);
    }
  };

  const handleSecondaryDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsSecondaryDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processSecondaryFile(e.dataTransfer.files[0]);
    }
  };

  const handleSecondarySheetChange = (sheetName: string) => {
    if (!secondaryWorkbook) return;
    setSelectedSecondarySheet(sheetName);
    const ws = secondaryWorkbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(ws, { defval: null }) as DataRow[];
    setSecondaryData(json);
    if (json.length > 0) {
      const cols = Object.keys(json[0]);
      setSecondaryCols(cols);
      const autoKey = cols.find(c => {
        const l = c.toLowerCase();
        return l === 'kd_sekolah' || l === 'kode_sekolah' || l === 'id_sekolah' || l === 'sekolah_id' || l === 'school_id' || l === 'npsn';
      }) || cols[0] || 'kd_sekolah';
      setSecondaryJoinKey(autoKey);
      setSelectedSecondaryColsToMerge(cols.filter(c => c !== autoKey));
    }
  };

  const handleExecuteMerge = async () => {
    if (secondaryData.length === 0) return;
    setIsMerging(true);
    setMergeProgress(20);
    setMergeStepText('Menyiapkan dan memeriksa kecocokan kunci ID sekolah...');

    try {
      if (data.length === 0 && originalData.length === 0) {
        await loadDefaultDataset();
      }

      await new Promise(r => setTimeout(r, 150));
      setMergeProgress(50);
      setMergeStepText('Menghitung agregasi rata-rata guru per sekolah...');

      await new Promise(r => setTimeout(r, 150));
      setMergeProgress(80);
      setMergeStepText(`Menggabungkan data ke ${data.length || 37247} siswa...`);

      const res = mergeWithSecondaryData(
        secondaryData,
        primaryJoinKey,
        secondaryJoinKey,
        joinType,
        selectedSecondaryColsToMerge.length > 0 ? selectedSecondaryColsToMerge : undefined,
        'guru_',
        ignoreEmptySecondaryCols
      );

      setMergeProgress(100);
      const skippedNote = res.skippedEmptyColsCount > 0 ? ` (Otomatis mengabaikan ${res.skippedEmptyColsCount} variabel yang 100% kosong).` : '';
      setMergeStatus(
        `✓ Berhasil menggabungkan data! ${res.matchedRows.toLocaleString()} dari ${res.totalRows.toLocaleString()} siswa (${res.matchPct.toFixed(1)}%) terhubung ke ${res.matchedSchools} sekolah dengan penambahan ${res.addedCols} variabel baru${skippedNote}`
      );
    } catch (err: any) {
      setMergeStatus(`Peringatan Penggabungan: ${err.message}`);
    } finally {
      setTimeout(() => setIsMerging(false), 400);
    }
  };

  const filteredSubsetCols = columns.filter(c =>
    c.name.toLowerCase().includes(subsetSearchTerm.toLowerCase())
  );

  const mergeRCode = RSyntaxGenerator.getMergeDataCode(
    fileName || 'data_latihan_jasp_multilevel.csv',
    secondaryFile?.name || 'data_guru_sulingjar.xlsx',
    primaryJoinKey || 'kd_sekolah',
    secondaryJoinKey || 'kd_sekolah',
    joinType || 'left',
    selectedSecondaryColsToMerge.length > 0 ? selectedSecondaryColsToMerge : secondaryCols,
    selectedSecondarySheet
  );

  const dataPrepCode = RSyntaxGenerator.getDataPrepCode(
    selectedColsForSubset.length > 0 ? selectedColsForSubset : columns.map(c => c.name),
    localRules,
    fileName || 'data_asesmen_nasional_clean.csv',
    {
      isMerged: originalData.length > 0,
      secondaryFileName: secondaryFile?.name || 'data_guru_sulingjar.xlsx',
      primaryKey: primaryJoinKey,
      secondaryKey: secondaryJoinKey,
      joinType: joinType,
      secondaryCols: selectedSecondaryColsToMerge,
      sheetName: selectedSecondarySheet
    }
  );

  const miceRCode = RSyntaxGenerator.getMiceImputationCode(
    fileName || 'data_latihan_jasp_multilevel.csv'
  );

  return (
    <div className="space-y-6">
      {/* Header Banner - Ultra Clean, Modern & Professional */}
      <PageHeader
        icon={Database}
        title="Manajemen Dataset & Imputasi Data"
        badgeIcon={CheckCircle2}
        badgeText="Penyimpanan Lokal (IndexedDB)"
        description="Eksplorasi pratinjau multi-sheet, diagnosis data hilang (missing data), imputasi komputasi (MICE / CART / Random Forest), filter subset cerdas, dan ekspor dataset ke R/Excel."
      >
        <Link href="/t-test">
          <Button className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] shadow-xs font-semibold text-xs cursor-pointer gap-2 rounded-xl h-9 px-4">
            Mulai Analisis <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </PageHeader>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#101c1c] p-2 rounded-2xl border border-[#e2e8e8] dark:border-white/10 shadow-2xs">
          <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl flex flex-wrap items-center gap-1 h-auto border border-zinc-200/80 dark:border-zinc-700/60">
            <TabsTrigger value="explorer" className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg cursor-pointer">
              <Database className="w-3.5 h-3.5 text-[#008080] dark:text-[#14a3a3]" />
              Eksplorasi Data & Upload
            </TabsTrigger>
            <TabsTrigger value="missing" className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg cursor-pointer">
              <BrainCircuit className="w-3.5 h-3.5 text-[#08a0a0] dark:text-[#2cc3c3]" />
              Diagnosis Missing & ML Imputasi
              {missingDiag.totalMissingCells > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500 text-white font-bold">
                  {missingDiag.incompleteRowsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="filter" className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg cursor-pointer">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              Filter & Subset
            </TabsTrigger>
            <TabsTrigger value="merge" className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg cursor-pointer">
              <GitMerge className="w-3.5 h-3.5 text-amber-600" />
              Merge Data Guru
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg cursor-pointer bg-white/60 dark:bg-zinc-900/60 font-semibold shadow-2xs">
              <Download className="w-3.5 h-3.5 text-[#008080] dark:text-[#14a3a3]" />
              Ekspor Data (JSON/CSV/XLSX) & Skrip R
            </TabsTrigger>
          </TabsList>

          {/* Quick Direct Export Pill Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-zinc-500 font-medium hidden lg:inline">Ekspor Cepat:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportData('json', fileName ? fileName.replace(/\.[^/.]+$/, '') : 'data_asesmen_nasional')}
              className="h-7 text-[11px] px-2.5 cursor-pointer gap-1 rounded-lg border-zinc-300 dark:border-zinc-700 hover:bg-[#e6f2f2] dark:hover:bg-[#14312f] text-[#008080] dark:text-[#14a3a3] font-semibold"
              title="Unduh dataset aktif dalam format JSON (.json)"
            >
              <Code2 className="w-3 h-3" /> .JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportData('csv', fileName ? fileName.replace(/\.[^/.]+$/, '') : 'data_asesmen_nasional')}
              className="h-7 text-[11px] px-2.5 cursor-pointer gap-1 rounded-lg border-zinc-300 dark:border-zinc-700 hover:bg-[#e6f2f2] dark:hover:bg-[#14312f] text-[#008080] dark:text-[#14a3a3] font-semibold"
              title="Unduh dataset aktif dalam format CSV (.csv)"
            >
              <Download className="w-3 h-3" /> .CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportData('xlsx', fileName ? fileName.replace(/\.[^/.]+$/, '') : 'data_asesmen_nasional')}
              className="h-7 text-[11px] px-2.5 cursor-pointer gap-1 rounded-lg border-zinc-300 dark:border-zinc-700 hover:bg-[#e6f2f2] dark:hover:bg-[#14312f] text-[#008080] dark:text-[#14a3a3] font-semibold"
              title="Unduh dataset aktif dalam format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3 h-3" /> .XLSX
            </Button>
          </div>
        </div>

        {/* Tab 1: Explorer & Upload */}
        <TabsContent value="explorer" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Card className="border-[#e2e8e8] dark:border-white/10 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <FileSpreadsheet className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                    Upload Dataset Kustom (Dengan Indikator Progres & Multi-Sheet)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pilih file Excel (.xlsx) atau CSV. Jika terdapat beberapa sheet (seperti sheet Codebook dan sheet Data), Anda dapat memilih sheet data yang akan dianalisis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormFile />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card className="h-full flex flex-col justify-between border-[#e2e8e8] dark:border-white/10 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Ringkasan Metadata
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Karakteristik variabel dalam dataset aktif (tersimpan di IndexedDB)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[11px] text-zinc-500">Total Sampel (N)</p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        {data.length.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                      <p className="text-[11px] text-zinc-500">Total Variabel</p>
                      <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                        {columns.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                      <p className="text-[11px] text-blue-700 dark:text-blue-300">Variabel Skala</p>
                      <p className="text-lg font-bold text-blue-900 dark:text-blue-100 font-mono">
                        {numericCols.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                      <p className="text-[11px] text-amber-700 dark:text-amber-300">Variabel Nominal/ID</p>
                      <p className="text-lg font-bold text-amber-900 dark:text-amber-100 font-mono">
                        {nominalCols.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                  Tinjauan Data Tabular
                </span>
                <Badge variant="outline" className="text-xs font-normal font-mono">
                  {fileName || 'data_latihan_jasp_multilevel.csv'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Missing Data Diagnostics & Machine Learning Imputation (MICE) */}
        <TabsContent value="missing" className="space-y-6 mt-4">
          {/* Missing Overview KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-zinc-50/70 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800">
              <p className="text-[11px] text-zinc-500 font-medium">Total Observasi (N)</p>
              <p className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                {missingDiag.totalRows.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">{missingDiag.totalCols} Variabel / Kolom</p>
            </Card>

            <Card className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">Baris Lengkap (Complete Cases)</p>
                <Badge variant="outline" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-[10px]">
                  {missingDiag.completeRowsPct.toFixed(1)}%
                </Badge>
              </div>
              <p className="text-xl font-bold font-mono text-emerald-900 dark:text-emerald-100 mt-1">
                {missingDiag.completeRowsCount.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Siap dianalisis tanpa missing value</p>
            </Card>

            <Card className="p-4 bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900">
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">Baris dengan Missing (NA)</p>
                <Badge variant="outline" className={`text-[10px] ${missingDiag.incompleteRowsCount > 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' : 'bg-zinc-100 text-zinc-600'}`}>
                  {missingDiag.incompleteRowsPct.toFixed(2)}%
                </Badge>
              </div>
              <p className="text-xl font-bold font-mono text-rose-900 dark:text-rose-100 mt-1">
                {missingDiag.incompleteRowsCount.toLocaleString()}
              </p>
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
                {missingDiag.totalMissingCells.toLocaleString()} total sel kosong ({missingDiag.overallMissingPct.toFixed(2)}%)
              </p>
            </Card>

            <Card className="p-4 bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900">
              <p className="text-[11px] text-purple-800 dark:text-purple-300 font-medium">Metode Rekomendasi MICE</p>
              <div className="mt-1 flex items-center gap-1.5">
                {missingDiag.totalMissingCells === 0 ? (
                  <Badge className="bg-emerald-600 text-white text-[11px] gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Data 100% Lengkap
                  </Badge>
                ) : (
                  <Badge className="bg-purple-600 text-white text-[11px] gap-1">
                    <BrainCircuit className="w-3 h-3" /> Machine Learning MICE (RF/CART)
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">Sesuai standar resmi Stef van Buuren</p>
            </Card>
          </div>

          {/* Machine Learning Missing Handling Actions Panel */}
          <Card className="border-teal-200 dark:border-teal-900/60 bg-gradient-to-br from-teal-50/40 via-white to-emerald-50/40 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-teal-950/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                  Opsi Penanganan & Machine Learning Imputation
                </span>
                <span className="text-xs text-zinc-500 font-normal">
                  Ditenagai oleh Paket R: <code>mice</code>, <code>ranger</code>, dan <code>rpart</code>
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Pilih apakah ingin menggunakan subset data lengkap (*Listwise Deletion*) atau mengimputasi missing data dengan algoritma <strong>Machine Learning Non-Parametrik</strong> yang mampu menangkap interaksi multi-variabel non-linear secara optimal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Option 0: Drop 100% Empty Columns */}
                {emptyColumnsList.length > 0 && (
                  <Button
                    onClick={handleDropEmptyColumns}
                    disabled={isImputing}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs cursor-pointer gap-1.5 font-bold shadow-xs"
                    title="Hapus variabel yang tidak memiliki data sama sekali (100% NA)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus 100% Kosong ({emptyColumnsList.length} Kolom)
                  </Button>
                )}

                {/* Option 1: Drop Missing Rows */}
                <Button
                  onClick={handleDropMissing}
                  disabled={missingDiag.incompleteRowsCount === 0 || isImputing}
                  variant="outline"
                  className="text-xs cursor-pointer gap-1.5 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  Drop NA Baris ({missingDiag.incompleteRowsCount} Baris)
                </Button>

                {/* Option 2: ML Random Forest (ranger) */}
                <Button
                  onClick={() => handleImpute('rf')}
                  disabled={missingDiag.totalMissingCells === 0 || isImputing}
                  className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] text-xs cursor-pointer gap-1.5 font-semibold shadow-xs"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  ML: Random Forest (ranger)
                </Button>

                {/* Option 3: ML Decision Trees (CART) */}
                <Button
                  onClick={() => handleImpute('cart')}
                  disabled={missingDiag.totalMissingCells === 0 || isImputing}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs cursor-pointer gap-1.5 font-semibold shadow-xs"
                >
                  <Bot className="w-3.5 h-3.5" />
                  ML: Decision Trees (CART)
                </Button>

                {/* Option 4: Standard MICE (PMM) */}
                <Button
                  onClick={() => handleImpute('pmm')}
                  disabled={missingDiag.totalMissingCells === 0 || isImputing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer gap-1.5 font-semibold shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  MICE: PMM
                </Button>

                {/* Option 5: Fast Median/Mode */}
                <Button
                  onClick={() => handleImpute('median')}
                  disabled={missingDiag.totalMissingCells === 0 || isImputing}
                  variant="outline"
                  className="text-xs cursor-pointer gap-1.5 border-zinc-300 dark:border-zinc-700"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Median & Modus
                </Button>

                {/* Option 6: Reset */}
                <Button
                  onClick={handleResetMissing}
                  disabled={isImputing}
                  variant="ghost"
                  className="text-xs cursor-pointer gap-1.5 text-zinc-600 dark:text-zinc-400 ml-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Data Asli
                </Button>
              </div>

              {/* Sub-Section: Quick Threshold Drop Presets */}
              <div className="p-3 rounded-xl bg-purple-100/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                    Pangkas Cepat Kolom Berbasis Batas Toleransi Missing (% NA Threshold):
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Standar survei besar: hapus variabel non-kunci jika missing &gt; 50%
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {missingTierStats.count50 > 0 && (
                    <Button
                      size="sm"
                      onClick={() => handleDropThreshold(50)}
                      disabled={isImputing}
                      className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer gap-1 font-semibold rounded-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus Kolom ≥ 50% NA ({missingTierStats.count50} Kolom)
                    </Button>
                  )}

                  {missingTierStats.count30 > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDropThreshold(30)}
                      disabled={isImputing}
                      className="h-7 text-xs border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer gap-1 rounded-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus Kolom ≥ 30% NA ({missingTierStats.count30} Kolom)
                    </Button>
                  )}

                  {missingTierStats.count20 > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDropThreshold(20)}
                      disabled={isImputing}
                      className="h-7 text-xs border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer gap-1 rounded-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                      Hapus Kolom ≥ 20% NA ({missingTierStats.count20} Kolom)
                    </Button>
                  )}

                  {/* Custom Threshold Input */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">Batas Custom:</span>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={customMissingThreshold}
                      onChange={(e) => setCustomMissingThreshold(Math.max(1, Math.min(100, Number(e.target.value) || 50)))}
                      className="h-7 w-16 text-xs text-center font-mono font-bold bg-white dark:bg-zinc-900"
                    />
                    <span className="text-xs text-zinc-500 font-bold">%</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDropThreshold(customMissingThreshold)}
                      disabled={isImputing || missingTierStats.customCount === 0}
                      className="h-7 text-xs px-2.5 cursor-pointer font-semibold"
                    >
                      Hapus ({missingTierStats.customCount} Kolom)
                    </Button>
                  </div>
                </div>
              </div>

              {/* Live Interactive Imputation Progress Bar */}
              {isImputing && (
                <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs text-purple-950 dark:text-purple-200 font-semibold">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span>{imputeStepText}</span>
                    </span>
                    <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/60 font-mono text-[11px] text-purple-900 dark:text-purple-200">
                      {imputeProgress}%
                    </Badge>
                  </div>
                  <div className="w-full bg-purple-200 dark:bg-purple-900/60 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${imputeProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-purple-700 dark:text-purple-300 italic">
                    Sedang memproses <strong>{imputeMethodLabel}</strong> pada {data.length.toLocaleString()} baris data sekunder...
                  </p>
                </div>
              )}

              {/* Action Message Feedback */}
              {missingActionMessage && !isImputing && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs border border-emerald-200 dark:border-emerald-900 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{missingActionMessage}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Column Missing Diagnostic Table with Interactive Selection & Delete */}
            <div className="md:col-span-7 space-y-4">
              <Card>
                <CardHeader className="pb-3 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span>Diagnosis Data Missing per Variabel</span>
                      <Badge variant="outline" className="text-[10px]">
                        {missingDiag.columnStats.filter(c => c.missingCount > 0).length} Variabel Memiliki NA
                      </Badge>
                    </CardTitle>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadMissingReportPdf}
                        disabled={missingDiag.totalCols === 0}
                        className="h-7 text-xs gap-1.5 cursor-pointer font-semibold border-[#008080]/30 text-[#008080] dark:text-[#14a3a3] hover:bg-[#e6f2f2] dark:hover:bg-[#14312f]"
                        title="Unduh laporan diagnosis missing data (semua variabel) sebagai PDF"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        Unduh PDF
                      </Button>

                      {/* Mass Selection Delete Action Button */}
                      {selectedMissingColsToDrop.length > 0 && (
                        <Button
                          size="sm"
                          onClick={handleDropSelectedMissingCols}
                          className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer gap-1.5 shadow-xs animate-in fade-in"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus {selectedMissingColsToDrop.length} Variabel Terpilih
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Filter Tier Tabs & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" />
                      <Input
                        placeholder="Cari nama atau label variabel..."
                        value={missingSearchTerm}
                        onChange={(e) => setMissingSearchTerm(e.target.value)}
                        className="h-8 pl-8 text-xs bg-white dark:bg-zinc-900"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 text-[11px] bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg shrink-0">
                      <button
                        type="button"
                        onClick={() => setMissingFilterTier('all')}
                        className={`px-2 py-1 rounded-md cursor-pointer transition-all font-medium ${missingFilterTier === 'all' ? 'bg-white dark:bg-zinc-700 shadow-xs font-bold text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'}`}
                      >
                        Semua ({missingTierStats.allCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMissingFilterTier('100')}
                        className={`px-2 py-1 rounded-md cursor-pointer transition-all font-medium ${missingFilterTier === '100' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 font-bold' : 'text-zinc-500'}`}
                      >
                        100% NA ({missingTierStats.count100})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMissingFilterTier('50')}
                        className={`px-2 py-1 rounded-md cursor-pointer transition-all font-medium ${missingFilterTier === '50' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 font-bold' : 'text-zinc-500'}`}
                      >
                        ≥50% NA ({missingTierStats.count50})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMissingFilterTier('20')}
                        className={`px-2 py-1 rounded-md cursor-pointer transition-all font-medium ${missingFilterTier === '20' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 font-bold' : 'text-zinc-500'}`}
                      >
                        ≥20% NA ({missingTierStats.count20})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMissingFilterTier('0')}
                        className={`px-2 py-1 rounded-md cursor-pointer transition-all font-medium ${missingFilterTier === '0' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 font-bold' : 'text-zinc-500'}`}
                      >
                        0% NA ({missingTierStats.countZero})
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="overflow-x-auto max-h-[480px] overflow-y-auto pr-1">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-zinc-100 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10">
                        <tr>
                          <th className="p-2.5 w-8">
                            <input
                              type="checkbox"
                              checked={
                                filteredMissingStats.length > 0 &&
                                filteredMissingStats.every(c => selectedMissingColsToDrop.includes(c.name))
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const allFilteredNames = filteredMissingStats.map(c => c.name);
                                  setSelectedMissingColsToDrop(Array.from(new Set([...selectedMissingColsToDrop, ...allFilteredNames])));
                                } else {
                                  const filteredSet = new Set(filteredMissingStats.map(c => c.name));
                                  setSelectedMissingColsToDrop(selectedMissingColsToDrop.filter(name => !filteredSet.has(name)));
                                }
                              }}
                              className="rounded text-rose-600 cursor-pointer"
                              title="Pilih / Batalkan semua variabel di tampilan ini"
                            />
                          </th>
                          <th className="p-2.5">Nama & Label Variabel</th>
                          <th className="p-2.5">Tipe</th>
                          <th className="p-2.5 text-right">Valid (N)</th>
                          <th className="p-2.5 text-right">Missing (NA)</th>
                          <th className="p-2.5 text-right">% Missing</th>
                          <th className="p-2.5 text-center w-12">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {filteredMissingStats.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-6 text-center text-zinc-400 italic">
                              Tidak ada variabel yang sesuai dengan filter pencarian.
                            </td>
                          </tr>
                        ) : (
                          filteredMissingStats.map(col => {
                            const is100PctEmpty = col.missingPct >= 99.99 || col.validCount === 0;
                            const isHighMissing = col.missingPct >= 50;
                            const isModMissing = col.missingPct >= 20;
                            const hasMissing = col.missingCount > 0;
                            const isChecked = selectedMissingColsToDrop.includes(col.name);
                            const codebook = getVariableCodebook(col.name);

                            return (
                              <tr
                                key={col.name}
                                className={`transition-colors ${
                                  isChecked
                                    ? 'bg-rose-100/50 dark:bg-rose-950/40'
                                    : is100PctEmpty
                                    ? 'bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-950/30'
                                    : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40'
                                }`}
                              >
                                <td className="p-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedMissingColsToDrop(selectedMissingColsToDrop.filter(name => name !== col.name));
                                      } else {
                                        setSelectedMissingColsToDrop([...selectedMissingColsToDrop, col.name]);
                                      }
                                    }}
                                    className="rounded text-rose-600 cursor-pointer"
                                  />
                                </td>
                                <td className="p-2.5">
                                  <VariableTooltip item={codebook} side="right">
                                    <div className="flex flex-col cursor-pointer text-left">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{col.name}</span>
                                        {is100PctEmpty && (
                                          <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4 font-semibold shrink-0">
                                            100% NA
                                          </Badge>
                                        )}
                                        {isHighMissing && !is100PctEmpty && (
                                          <Badge className="bg-rose-600 text-white text-[9px] px-1 py-0 h-4 font-semibold shrink-0">
                                            &ge;50% NA
                                          </Badge>
                                        )}
                                      </div>
                                      {codebook?.label && (
                                        <span className="text-[10.5px] text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]" title={codebook.label}>
                                          {codebook.label}
                                        </span>
                                      )}
                                    </div>
                                  </VariableTooltip>
                                </td>
                                <td className="p-2.5">
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                    {col.type === 'numeric' ? 'Skala' : 'Nominal'}
                                  </Badge>
                                </td>
                                <td className="p-2.5 text-right font-mono">{col.validCount.toLocaleString()}</td>
                                <td className="p-2.5 text-right font-mono">
                                  <span className={hasMissing ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-zinc-400'}>
                                    {col.missingCount.toLocaleString()}
                                  </span>
                                </td>
                                <td className="p-2.5 text-right font-mono">
                                  <div className="flex items-center justify-end gap-2">
                                    <span
                                      className={`text-[11px] ${
                                        is100PctEmpty || isHighMissing
                                          ? 'text-rose-700 dark:text-rose-300 font-bold'
                                          : isModMissing
                                          ? 'text-amber-600 font-bold'
                                          : hasMissing
                                          ? 'text-amber-600 font-medium'
                                          : 'text-emerald-600'
                                      }`}
                                    >
                                      {col.missingPct.toFixed(2)}%
                                    </span>
                                    <div className="w-12 bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden shrink-0">
                                      <div
                                        className={`h-full ${isHighMissing || is100PctEmpty ? 'bg-rose-500' : isModMissing ? 'bg-amber-500' : hasMissing ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(100, Math.max(col.missingPct, 0))}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2.5 text-center">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDropSingleCol(col.name)}
                                    className="h-6 w-6 p-0 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer rounded"
                                    title={`Hapus variabel ${col.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* MICE Pattern Breakdown */}
            <div className="md:col-span-5 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    Pola Kombinasi Missing Data (MICE Pattern)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Distribusi pola observasi lengkap vs kombinasi variabel yang mengalami missing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                    {missingDiag.patterns.map((pat, idx) => (
                      <div
                        key={pat.patternId}
                        className={`p-3 rounded-lg border text-xs space-y-1 ${
                          pat.isComplete
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                            : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold flex items-center gap-1.5">
                            {pat.isComplete ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            {pat.isComplete ? 'Pola Lengkap (Tanpa Missing)' : `Pola Missing ${idx + 1}`}
                          </span>
                          <span className="font-mono text-zinc-600 dark:text-zinc-400 font-semibold">
                            {pat.count.toLocaleString()} baris ({pat.pct.toFixed(2)}%)
                          </span>
                        </div>

                        {!pat.isComplete && pat.missingVars.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            <span className="text-[10px] text-zinc-500">Variabel Kosong:</span>
                            {pat.missingVars.map(v => (
                              <Badge key={v} variant="outline" className="text-[9px] px-1 py-0 h-4 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-mono">
                                {v}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* R Code for Machine Learning MICE Missing Analysis */}
          <RCodeBlock
            title="Sintaks Analisis Missing & Imputasi Machine Learning di R (mice, ranger, rpart & VIM)"
            description="Jalankan skrip ini di RStudio untuk melihat visualisasi matriks md.pattern dan menjalankan imputasi Random Forest / Decision Trees."
            code={miceRCode}
            packages={['mice', 'ranger', 'rpart', 'VIM']}
            fileName="analisis_missing_ml_mice.R"
          />
        </TabsContent>

        {/* Tab 3: Filter & Subset Data */}
        <TabsContent value="filter" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Smart Row Filter Builder */}
            <div className="md:col-span-7 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Filter className="w-4 h-4 text-emerald-600" />
                      Filter Baris Data Cerdas (Row Filtering)
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddRule}
                      className="h-7 text-xs cursor-pointer gap-1"
                    >
                      <Plus className="w-3 h-3" /> Tambah Aturan
                    </Button>
                  </div>
                  <CardDescription className="text-xs">
                    Saring data sampel. Variabel kategori/ID (seperti <code>jenis_kelamin</code>, <code>status_sekolah</code>, <code>kd_sekolah</code>) otomatis menyajikan daftar kategori yang valid untuk mencegah salah ketik.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {localRules.length === 0 ? (
                    <div className="p-6 text-center border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/40">
                      <p className="text-xs text-zinc-500 font-medium">Belum ada aturan filter aktif.</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Klik tombol &apos;Tambah Aturan&apos; untuk memfilter sampel (misal: membatasi kode sekolah tertentu, status sekolah, atau nilai tertentu).
                      </p>
                    </div>
                  ) : (
                    localRules.map(rule => {
                      const colMeta = columns.find(c => c.name === rule.col);
                      const isColNominal = colMeta?.type === 'nominal';
                      const distinctCategories = isColNominal ? getUniqueValuesForCol(rule.col) : [];

                      return (
                        <div key={rule.id} className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                          {/* Column Selector */}
                          <select
                            value={rule.col}
                            onChange={(e) => handleUpdateRule(rule.id, 'col', e.target.value)}
                            className="h-8 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs flex-1 font-semibold"
                          >
                            {columns.map(c => (
                              <option key={c.name} value={c.name}>
                                {c.name} ({c.type === 'numeric' ? 'Skala' : 'Kategori/ID'})
                              </option>
                            ))}
                          </select>

                          {/* Operator */}
                          <select
                            value={rule.op}
                            onChange={(e) => handleUpdateRule(rule.id, 'op', e.target.value)}
                            className="h-8 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs w-28"
                          >
                            <option value="==">Sama dengan (=)</option>
                            <option value="!=">Tidak sama (≠)</option>
                            {!isColNominal && (
                              <>
                                <option value=">">Lebih besar (&gt;)</option>
                                <option value=">=">Lebih besar sama (&ge;)</option>
                                <option value="<">Lebih kecil (&lt;)</option>
                                <option value="<=">Lebih kecil sama (&le;)</option>
                              </>
                            )}
                            <option value="contains">Mengandung teks</option>
                          </select>

                          {/* Value Input / Smart Category Dropdown */}
                          {isColNominal && distinctCategories.length > 0 ? (
                            <select
                              value={rule.val}
                              onChange={(e) => handleUpdateRule(rule.id, 'val', e.target.value)}
                              className="h-8 rounded-md border border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-medium px-2 text-xs w-40 max-w-full font-mono"
                            >
                              {distinctCategories.map(cat => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              placeholder="Nilai angka/teks..."
                              value={rule.val}
                              onChange={(e) => handleUpdateRule(rule.id, 'val', e.target.value)}
                              className="h-8 text-xs w-36 bg-white dark:bg-zinc-900"
                            />
                          )}

                          {/* Delete Rule */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveRule(rule.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      );
                    })
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetFilters}
                      className="text-xs cursor-pointer gap-1 text-zinc-600 dark:text-zinc-400"
                    >
                      <RotateCcw className="w-3 h-3" /> Kembalikan Data Awal
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleExecuteFilter}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer px-4 font-semibold shadow-xs"
                    >
                      Terapkan Filter ({localRules.length} Aturan)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subset Columns Picker */}
            <div className="md:col-span-5 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                      Subset Kolom / Variabel
                    </CardTitle>
                    <span className="text-[11px] text-zinc-500">
                      Terpilih: <strong>{selectedColsForSubset.length}</strong> / {columns.length}
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    Pilih variabel tertentu yang akan dipertahankan untuk analisis spesifik.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Search Filter for Columns */}
                  <Input
                    placeholder="Cari nama variabel..."
                    value={subsetSearchTerm}
                    onChange={(e) => setSubsetSearchTerm(e.target.value)}
                    className="h-8 text-xs bg-white dark:bg-zinc-900"
                  />

                  <div className="max-h-56 overflow-y-auto pr-1 space-y-1">
                    {filteredSubsetCols.map(c => {
                      const isChecked = selectedColsForSubset.includes(c.name);
                      const codebook = getVariableCodebook(c.name);
                      const missPct = colStatsMap.get(c.name) ?? 0;

                      return (
                        <VariableTooltip key={c.name} item={codebook} side="right" className="w-full">
                          <label
                            className="flex items-center justify-between text-xs p-1.5 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/80 cursor-pointer border border-zinc-100 dark:border-zinc-800/60 transition-colors w-full"
                          >
                            <div className="flex items-center gap-2 truncate flex-1 mr-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedColsForSubset(selectedColsForSubset.filter(name => name !== c.name));
                                  } else {
                                    setSelectedColsForSubset([...selectedColsForSubset, c.name]);
                                  }
                                }}
                                className="rounded text-[#008080] focus:ring-[#008080] cursor-pointer shrink-0"
                              />
                              <div className="flex flex-col truncate">
                                <span className="truncate font-mono font-bold text-left">{c.name}</span>
                                {codebook?.label && (
                                  <span className="text-[10px] text-zinc-500 truncate text-left" title={codebook.label}>
                                    {codebook.label}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge
                                variant="outline"
                                className={`text-[9.5px] px-1.5 py-0 h-4 font-mono font-bold ${
                                  missPct >= 99.99
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300'
                                    : missPct >= 50
                                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200'
                                    : missPct >= 20
                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200'
                                    : missPct > 0
                                    ? 'bg-amber-50/50 text-amber-600 border-amber-100'
                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200'
                                }`}
                              >
                                {missPct.toFixed(1)}% NA
                              </Badge>

                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 shrink-0">
                                {c.type === 'numeric' ? 'Skala' : 'Nominal'}
                              </Badge>
                            </div>
                          </label>
                        </VariableTooltip>
                      );
                    })}
                  </div>

                  {/* Quick Subset Selection Shortcuts */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedColsForSubset(columns.map(c => c.name))}
                      className="text-[10.5px] h-6 px-2 cursor-pointer"
                    >
                      Semua ({columns.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const zeroCols = columns.filter(c => (colStatsMap.get(c.name) ?? 0) === 0).map(c => c.name);
                        setSelectedColsForSubset(zeroCols);
                      }}
                      className="text-[10.5px] h-6 px-2 text-emerald-700 dark:text-emerald-300 border-emerald-200 cursor-pointer"
                    >
                      Lengkap (0% NA)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const lowCols = columns.filter(c => (colStatsMap.get(c.name) ?? 0) < 20).map(c => c.name);
                        setSelectedColsForSubset(lowCols);
                      }}
                      className="text-[10.5px] h-6 px-2 text-amber-700 dark:text-amber-300 border-amber-200 cursor-pointer"
                    >
                      &lt; 20% NA
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const modCols = columns.filter(c => (colStatsMap.get(c.name) ?? 0) < 50).map(c => c.name);
                        setSelectedColsForSubset(modCols);
                      }}
                      className="text-[10.5px] h-6 px-2 text-teal-700 dark:text-teal-300 border-teal-200 cursor-pointer"
                    >
                      &lt; 50% NA
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedColsForSubset([])}
                      className="text-[10.5px] h-6 px-2 text-zinc-400 hover:text-red-500 cursor-pointer ml-auto"
                    >
                      Kosongkan
                    </Button>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <Button
                      size="sm"
                      onClick={handleExecuteSubset}
                      disabled={selectedColsForSubset.length === 0}
                      className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] text-xs cursor-pointer px-4 font-semibold rounded-xl shadow-xs"
                    >
                      Terapkan Subset ({selectedColsForSubset.length} Kolom)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Preview Data Hasil Filter & Subset</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Merge / Left Join Data with Progress Bar */}
        <TabsContent value="merge" className="space-y-6 mt-4">
          <Card className="border-[#008080]/30 shadow-xs">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2 font-bold">
                  <GitMerge className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                  Penggabungan Data Multi-Level (Merge Siswa Level 1 & Data Guru Level 2)
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetToOriginalData}
                  className="h-7 text-xs cursor-pointer gap-1.5 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                  title="Batalkan penggabungan dan kembalikan dataset ke kondisi awal"
                >
                  <RotateCcw className="w-3 h-3" /> Kembalikan Data Asli
                </Button>
              </div>
              <CardDescription className="text-xs">
                Unggah file sekunder (seperti data guru / Sulingjar) untuk digabungkan ke data siswa berdasarkan kode sekolah. Nilai guru dari sekolah yang sama akan otomatis diagregasi (dihitung rata-ratanya).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. File Upload & Sheet Selection */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#008080] text-white flex items-center justify-center text-[10px]">1</span>
                      Upload Dataset Sekunder (.xlsx / .csv)
                    </h4>
                    {secondaryFile && (
                      <button
                        type="button"
                        onClick={() => secondaryFileInputRef.current?.click()}
                        className="text-[11px] text-[#008080] dark:text-[#14a3a3] font-semibold hover:underline cursor-pointer"
                      >
                        Ganti File
                      </button>
                    )}
                  </div>

                  <input
                    ref={secondaryFileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleSecondaryFileChange}
                    className="hidden"
                  />

                  {/* Dropzone matching Gambar 2 */}
                  <div
                    onClick={() => secondaryFileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsSecondaryDragging(true);
                    }}
                    onDragLeave={() => setIsSecondaryDragging(false)}
                    onDrop={handleSecondaryDrop}
                    className={cn(
                      "border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center group",
                      isSecondaryDragging
                        ? "border-[#008080] bg-[#e6f2f2]/60 dark:bg-[#14312f]/60 ring-2 ring-[#008080]/20"
                        : secondaryFile
                        ? "border-[#008080]/50 bg-teal-50/30 dark:bg-teal-950/20 hover:border-[#008080]"
                        : "border-[#008080]/40 dark:border-[#14a3a3]/40 bg-white/80 dark:bg-zinc-900/60 hover:bg-[#e6f2f2]/30 dark:hover:bg-[#14312f]/30"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#e6f2f2] dark:bg-[#14312f] text-[#008080] dark:text-[#14a3a3] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                      <UploadCloud className="w-5 h-5" />
                    </div>

                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                      {secondaryFile ? secondaryFile.name : 'Klik untuk memilih file atau seret file ke sini'}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {secondaryFile 
                        ? `${(secondaryFile.size / 1024).toFixed(1)} KB • ${secondaryData.length.toLocaleString()} baris data`
                        : 'Mendukung file Excel (.xlsx, .xls) dengan multi-sheet & CSV (.csv)'
                      }
                    </p>
                  </div>

                  {/* Secondary File Reading Progress */}
                  {isReadingSecondary && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin text-[#008080]" />
                          Membaca file data sekunder...
                        </span>
                        <span className="font-mono">{secondaryReadProgress}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#008080] h-full transition-all duration-300" style={{ width: `${secondaryReadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Multi-sheet selector for secondary file */}
                  {secondarySheets.length > 1 && (
                    <div className="space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                        Pilih Sheet File Sekunder:
                      </label>
                      <select
                        value={selectedSecondarySheet}
                        onChange={(e) => handleSecondarySheetChange(e.target.value)}
                        className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs w-full font-medium"
                      >
                        {secondarySheets.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {secondaryData.length > 0 && !isReadingSecondary && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Terbaca: {secondaryData.length.toLocaleString()} baris guru ({secondaryCols.length} kolom)
                      </span>
                      {selectedSecondarySheet && (
                        <Badge variant="outline" className="text-[10px] bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                          Sheet: {selectedSecondarySheet}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Key Relasi Configuration */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-[#008080] text-white flex items-center justify-center text-[10px]">2</span>
                    Konfigurasi Kunci Relasi (Join Key)
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                        Kolom ID Sekolah di Data Siswa (Dataset Utama):
                      </label>
                      <select
                        value={primaryJoinKey}
                        onChange={(e) => setPrimaryJoinKey(e.target.value)}
                        className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs w-full font-mono font-medium"
                      >
                        {columns.map(c => (
                          <option key={c.name} value={c.name}>{c.name} ({c.type})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-500 font-medium block mb-1">
                        Kolom ID Sekolah di Data Guru (Dataset Sekunder):
                      </label>
                      <select
                        value={secondaryJoinKey}
                        onChange={(e) => setSecondaryJoinKey(e.target.value)}
                        disabled={secondaryCols.length === 0}
                        className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs w-full font-mono font-medium disabled:opacity-50"
                      >
                        {secondaryCols.length > 0 ? (
                          secondaryCols.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))
                        ) : (
                          <option value="kd_sekolah">Unggah file sekunder terlebih dahulu</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-zinc-500 font-medium block mb-1">Metode Join:</label>
                      <select
                        value={joinType}
                        onChange={(e) => setJoinType(e.target.value as any)}
                        className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs w-full"
                      >
                        <option value="left">Left Join (Pertahankan seluruh {data.length.toLocaleString()} responden)</option>
                        <option value="inner">Inner Join (Hanya {mergeMatchDiagnostics ? `${mergeMatchDiagnostics.matched.toLocaleString()} responden` : 'responden'} yang cocok dengan data guru)</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 pt-1 text-[11px] text-zinc-700 dark:text-zinc-300 cursor-pointer font-medium select-none">
                      <input
                        type="checkbox"
                        checked={ignoreEmptySecondaryCols}
                        onChange={(e) => setIgnoreEmptySecondaryCols(e.target.checked)}
                        className="rounded text-[#008080] cursor-pointer"
                      />
                      <span>Abaikan kolom guru yang 100% kosong (misal: indikator SMK di data SMA)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. Live Match Preview Diagnostics Banner */}
              {mergeMatchDiagnostics && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    mergeMatchDiagnostics.pct >= 80
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                      : mergeMatchDiagnostics.pct > 0
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {mergeMatchDiagnostics.pct >= 80 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <strong>Pratinjau Kecocokan Kunci ({primaryJoinKey} ⟷ {secondaryJoinKey}):</strong>{' '}
                      <span>
                        {mergeMatchDiagnostics.matched.toLocaleString()} dari {mergeMatchDiagnostics.totalPrimary.toLocaleString()} siswa ({mergeMatchDiagnostics.pct.toFixed(1)}%) cocok dengan {mergeMatchDiagnostics.matchedSchools} dari {mergeMatchDiagnostics.totalSchools} sekolah.
                      </span>
                      {mergeMatchDiagnostics.pct === 0 && (
                        <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1 font-semibold">
                          ⚠️ Peringatan: Tidak ada nilai yang cocok antara kolom &apos;{primaryJoinKey}&apos; dan &apos;{secondaryJoinKey}&apos;. Pastikan kedua kolom berisi kode sekolah yang sama agar hasil merge tidak menghasilkan 100% NA.
                        </p>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant={mergeMatchDiagnostics.pct >= 80 ? 'teal' : 'destructive'}
                    className="font-mono text-xs shrink-0"
                  >
                    {mergeMatchDiagnostics.pct.toFixed(1)}% Match
                  </Badge>
                </div>
              )}

              {/* 4. Column Selection for Secondary Data */}
              {secondaryCols.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#008080] text-white flex items-center justify-center text-[10px]">3</span>
                      Pilih Variabel Guru yang Akan Diagregasi & Digabungkan ({selectedSecondaryColsToMerge.length}/{secondaryCols.filter(c => c !== secondaryJoinKey).length} Kolom):
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        onClick={() => setSelectedSecondaryColsToMerge(secondaryCols.filter(c => c !== secondaryJoinKey))}
                        className="text-[#008080] dark:text-[#14a3a3] hover:underline cursor-pointer"
                      >
                        Pilih Semua
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => setSelectedSecondaryColsToMerge([])}
                        className="text-zinc-500 hover:underline cursor-pointer"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                    {secondaryCols.filter(c => c !== secondaryJoinKey).map(col => {
                      const isChecked = selectedSecondaryColsToMerge.includes(col);
                      return (
                        <label
                          key={col}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedSecondaryColsToMerge(selectedSecondaryColsToMerge.filter(c => c !== col));
                            } else {
                              setSelectedSecondaryColsToMerge([...selectedSecondaryColsToMerge, col]);
                            }
                          }}
                          className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer select-none transition-all truncate ${
                            isChecked
                              ? 'bg-white dark:bg-zinc-800 border-[#008080]/50 text-[#008080] dark:text-[#7fdcdc] font-semibold'
                              : 'bg-zinc-100/60 dark:bg-zinc-800/30 border-transparent text-zinc-500 opacity-60'
                          }`}
                        >
                          {isChecked ? <CheckSquare className="w-3.5 h-3.5 shrink-0 text-[#008080] dark:text-[#14a3a3]" /> : <Square className="w-3.5 h-3.5 shrink-0" />}
                          <span className="truncate">{col}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Live Merge Progress Bar */}
              {isMerging && (
                <div className="p-4 rounded-xl border border-[#008080]/30 bg-[#e6f2f2]/40 dark:bg-[#14312f]/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#008080] dark:text-[#7fdcdc] font-semibold">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#008080]" />
                      {mergeStepText}
                    </span>
                    <span className="font-mono">{mergeProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#008080] h-full rounded-full transition-all duration-300" style={{ width: `${mergeProgress}%` }} />
                  </div>
                </div>
              )}

              {mergeStatus && !isMerging && (
                <div className="p-3.5 rounded-xl bg-[#e6f2f2]/60 dark:bg-[#14312f]/40 text-[#008080] dark:text-[#7fdcdc] text-xs border border-[#008080]/30 font-medium">
                  {mergeStatus}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetToOriginalData}
                  className="text-xs cursor-pointer gap-1.5 rounded-xl border-zinc-300 dark:border-zinc-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Kembalikan Data Asli
                </Button>

                <Button
                  onClick={handleExecuteMerge}
                  disabled={secondaryData.length === 0 || isMerging || (mergeMatchDiagnostics !== null && mergeMatchDiagnostics.pct === 0)}
                  className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] text-xs cursor-pointer gap-1.5 font-semibold rounded-xl shadow-xs"
                >
                  {isMerging ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <GitMerge className="w-3.5 h-3.5" />
                  )}
                  {isMerging ? 'Sedang Menggabungkan Data...' : 'Jalankan Penggabungan (Merge Data)'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Real-time R Script for Merge Verification */}
          <RCodeBlock
            title="Sintaks R untuk Verifikasi Penggabungan Data (Merge / Left Join Script)"
            description="Script R Tidyverse realtime yang disesuaikan secara dinamis dengan nama file, kolom kunci relasi, dan variabel yang Anda pilih."
            code={mergeRCode}
            packages={['dplyr', 'readr', ...(secondaryFile?.name?.endsWith('.xlsx') || secondaryFile?.name?.endsWith('.xls') ? ['readxl'] : [])]}
            fileName="merge_data_verification.R"
          />
        </TabsContent>

        {/* Tab 5: Export & Clean Data Preparation Script */}
        <TabsContent value="export" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* JSON Export Card */}
            <Card className="border-[#008080]/30 hover:border-[#008080] transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#e6f2f2] dark:bg-[#14312f] text-[#008080] dark:text-[#14a3a3]">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <Badge variant="teal" className="text-[10px] font-mono">
                    JSON Array
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold pt-2">
                  Ekspor Format JSON (.json)
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Format objek JavaScript standar untuk integrasi API, basis data web, Python Pandas, dan kecerdasan buatan.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => exportData('json', fileName ? fileName.replace(/\.[^/.]+$/, '') : 'data_asesmen_nasional_clean')}
                  className="w-full bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] text-xs cursor-pointer gap-1.5 shadow-xs font-semibold rounded-xl"
                >
                  <Code2 className="w-3.5 h-3.5" /> Unduh JSON ({data.length.toLocaleString()} Baris)
                </Button>
              </CardContent>
            </Card>

            {/* CSV Export Card */}
            <Card className="border-zinc-200 dark:border-zinc-800 hover:border-[#008080]/60 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <Download className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Comma Separated
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold pt-2">
                  Ekspor Format CSV (.csv)
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Format teks standar siap pakai untuk analisis statistik inferensial di JASP, R, SPSS, Stata, dan Mplus.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => exportData('csv', fileName ? fileName.replace(/\.[^/.]+$/, '') : 'data_asesmen_nasional_clean')}
                  variant="outline"
                  className="w-full text-xs cursor-pointer gap-1.5 border-zinc-300 dark:border-zinc-700 hover:bg-[#e6f2f2] dark:hover:bg-[#14312f] text-zinc-900 dark:text-zinc-100 font-semibold rounded-xl"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh CSV (.csv)
                </Button>
              </CardContent>
            </Card>

            {/* Excel Export Card */}
            <Card className="border-zinc-200 dark:border-zinc-800 hover:border-[#008080]/60 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#008080] dark:text-[#14a3a3]">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Excel Workbook
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold pt-2">
                  Ekspor Format Excel (.xlsx)
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Format spreadsheet Microsoft Excel (.xlsx) lengkap dengan seluruh baris dan kolom yang telah dibersihkan.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => exportData('xlsx', fileName ? fileName.replace(/\.[^/.]+$/, '') : 'data_asesmen_nasional_clean')}
                  variant="outline"
                  className="w-full text-xs cursor-pointer gap-1.5 border-zinc-300 dark:border-zinc-700 hover:bg-[#e6f2f2] dark:hover:bg-[#14312f] text-zinc-900 dark:text-zinc-100 font-semibold rounded-xl"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Unduh Excel (.xlsx)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Clean Data Script Generator */}
          <RCodeBlock
            title="Sintaks R untuk Pemrosesan & Analisis Lanjutan (Data Wrangling Script)"
            description="Script otomatis siap pakai untuk memuat dan menganalisis dataset hasil persiapan di RStudio."
            code={dataPrepCode}
            packages={['dplyr', 'readr', 'jsonlite']}
            fileName="data_preparation_script.R"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
