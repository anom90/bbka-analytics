'use client';

import * as React from 'react';
import {
  Workflow,
  Play,
  Code2,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  GitFork,
  Sliders,
  FileCode,
  Table,
  Plus,
  Trash2,
  Layers,
  ArrowRight,
  Info,
  RotateCcw,
  Zap,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { VariableSelector, VariableSlot } from '@/components/common/variable-selector';
import { DataTableHasil, ColumnDef } from '@/components/common/data-table-hasil';
import { AiCard } from '@/components/common/ai-card';
import { RCodeBlock } from '@/components/common/r-code-block';
import { RConsoleBlock } from '@/components/common/r-console-block';
import { PageHeader } from '@/components/common/page-header';
import { useDatasetStore } from '@/stores/dataset-store';
import { useAnalysisStore } from '@/stores/analysis-store';
import { formatNumber, formatPValue, cn } from '@/lib/utils';
import { getVariableCodebook } from '@/constants/an-codebook';
import { SEMLatentConstruct as LatentConstruct, SEMLatentRelation as LatentRelation } from '@/lib/types';

const DEFAULT_LATENT_CONSTRUCTS: LatentConstruct[] = [
  { id: '1', name: 'Laten_1', indicators: [] },
  { id: '2', name: 'Laten_2', indicators: [] }
];

export default function SemPage() {
  const { data, columns, fileName, customCodebook } = useDatasetStore();
  const {
    semConfig,
    setSEMConfig,
    executeSEM,
    semResult,
    isCalculating,
    error,
    clearSpecificAnalysis
  } = useAnalysisStore();

  const [activeOutputTab, setActiveOutputTab] = React.useState('tables');
  const [autoRun, setAutoRun] = React.useState(true);
  const [isDebouncing, setIsDebouncing] = React.useState(false);
  const isInitialMount = React.useRef(true);
  const [activeMode, setActiveMode] = React.useState<'path' | 'latent' | 'syntax'>(
    semConfig?.mode === 'syntax' ? 'syntax' : 'path'
  );
  const [syntaxInput, setSyntaxInput] = React.useState(semConfig?.customSyntax || '');
  const [resetSuccessMessage, setResetSuccessMessage] = React.useState<string | null>(null);

  const handleResetSEM = () => {
    clearSpecificAnalysis('sem');
    setSyntaxInput('');
    setValidationError(null);
    setResetSuccessMessage('✓ Model dan hasil analisis berhasil dibersihkan.');
    setTimeout(() => setResetSuccessMessage(null), 2500);
  };

  // -------------------------------------------------------------
  // VISUAL LATENT CONSTRUCT BUILDER STATE — persisted in semConfig (not local useState)
  // so it survives page navigation and is included in Export/Import Project.
  // -------------------------------------------------------------
  const latentConstructs = semConfig.latentConstructs || DEFAULT_LATENT_CONSTRUCTS;
  const setLatentConstructs = (
    updater: LatentConstruct[] | ((prev: LatentConstruct[]) => LatentConstruct[])
  ) => {
    const next = typeof updater === 'function' ? (updater as (prev: LatentConstruct[]) => LatentConstruct[])(latentConstructs) : updater;
    setSEMConfig({ latentConstructs: next });
  };

  const latentRelations = semConfig.latentRelations || [];
  const setLatentRelations = (
    updater: LatentRelation[] | ((prev: LatentRelation[]) => LatentRelation[])
  ) => {
    const next = typeof updater === 'function' ? (updater as (prev: LatentRelation[]) => LatentRelation[])(latentRelations) : updater;
    setSEMConfig({ latentRelations: next });
  };

  const [validationError, setValidationError] = React.useState<string | null>(null);

  React.useEffect(() => {
    useAnalysisStore.setState({ error: null });
  }, []);

  // Reactive Debounce Auto-Run (JASP Mode for SEM / Path Analysis)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (semResult) return;
    }

    if (!autoRun || data.length === 0) return;

    if (activeMode === 'path') {
      const hasX = (semConfig?.exogenous || []).length > 0;
      const hasY = (semConfig?.endogenous || []).length > 0;
      if (!hasX || !hasY) return;
    } else if (activeMode === 'latent') {
      const validConstructs = latentConstructs.filter(c => c.indicators.length >= 2);
      if (validConstructs.length === 0) return;
    } else if (activeMode === 'syntax') {
      if (!syntaxInput.trim()) return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setIsDebouncing(false);
      handleRunAnalysis();
    }, 500);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [
    autoRun,
    data,
    activeMode,
    semConfig?.exogenous,
    semConfig?.mediators,
    semConfig?.endogenous,
    latentConstructs,
    latentRelations,
    syntaxInput
  ]);

  const handleAddLatent = () => {
    const newId = String(Date.now());
    const newName = `Laten_${latentConstructs.length + 1}`;
    setLatentConstructs(prev => [...prev, { id: newId, name: newName, indicators: [] }]);
  };

  const handleRenameLatent = (id: string, newNameRaw: string) => {
    const cleanName = newNameRaw.replace(/[^a-zA-Z0-9_]/g, '_') || 'Laten';
    const oldConstruct = latentConstructs.find(c => c.id === id);
    if (!oldConstruct) return;
    const oldName = oldConstruct.name;

    setLatentConstructs(prev =>
      prev.map(c => c.id === id ? { ...c, name: cleanName } : c)
    );

    // Synchronize names in latentRelations
    setLatentRelations(prev =>
      prev.map(r => ({
        outcomeLatent: r.outcomeLatent === oldName ? cleanName : r.outcomeLatent,
        predictors: r.predictors.map(p => p === oldName ? cleanName : p)
      }))
    );
  };

  const handleRemoveLatent = (id: string) => {
    const removed = latentConstructs.find(c => c.id === id);
    if (!removed) return;
    setLatentConstructs(prev => prev.filter(c => c.id !== id));
    setLatentRelations(prev =>
      prev
        .filter(r => r.outcomeLatent !== removed.name)
        .map(r => ({
          ...r,
          predictors: r.predictors.filter(p => p !== removed.name)
        }))
    );
  };

  // Slots for the shared VariableSelector — one per latent construct, consistent with
  // how every other module (Path Analysis, Regression blocks, etc.) picks variables.
  const latentSlots: VariableSlot[] = React.useMemo(() => {
    return latentConstructs.map(construct => ({
      id: construct.id,
      label: construct.name,
      description: `Indikator manifes (butir) untuk variabel laten ${construct.name} — minimal 2 indikator disarankan untuk model CFA.`,
      typeFilter: 'all',
      multi: true,
      selected: construct.indicators,
      onChange: (selected: string[]) => {
        setLatentConstructs(prev => prev.map(c => c.id === construct.id ? { ...c, indicators: selected } : c));
      },
      onRename: (newLabel: string) => handleRenameLatent(construct.id, newLabel),
      onRemove: latentConstructs.length > 1 ? () => handleRemoveLatent(construct.id) : undefined
    }));
  }, [latentConstructs]);

  // Compile Latent Model into lavaan syntax safely
  const generateLatentLavaanSyntax = (): string => {
    const activeCols = new Set(columns.map(c => c.name));
    const validConstructs = latentConstructs.filter(c => c.indicators.length > 0);
    const validLatentNames = new Set(validConstructs.map(c => c.name));
    // A predictor is valid if it's either another declared latent, or an actual manifest
    // (observed) dataset variable — lavaan's `~` regression accepts both interchangeably.
    const isValidPredictor = (p: string, outcome: string) => p !== outcome && (validLatentNames.has(p) || activeCols.has(p));

    const lines: string[] = ['# 1. Model Pengukuran (Measurement Model / CFA)'];
    validConstructs.forEach(c => {
      const validIndicators = c.indicators.filter(ind => activeCols.has(ind));
      if (validIndicators.length > 0) {
        lines.push(`${c.name} =~ ${validIndicators.join(' + ')}`);
      }
    });

    const activeRelations = latentRelations.filter(
      r => validLatentNames.has(r.outcomeLatent) && r.predictors.some(p => isValidPredictor(p, r.outcomeLatent))
    );

    if (activeRelations.length > 0) {
      lines.push('\n# 2. Model Struktural (Structural Model: Laten & Kovariat Manifes)');
      activeRelations.forEach(r => {
        const activePreds = r.predictors.filter(p => isValidPredictor(p, r.outcomeLatent));
        if (activePreds.length > 0) {
          lines.push(`${r.outcomeLatent} ~ ${activePreds.join(' + ')}`);
        }
      });
    }

    return lines.join('\n');
  };

  const handleRunAnalysis = () => {
    if (data.length === 0) return;
    setValidationError(null);

    if (activeMode === 'syntax') {
      setSEMConfig({ mode: 'syntax', customSyntax: syntaxInput });
    } else if (activeMode === 'latent') {
      const validConstructs = latentConstructs.filter(c => c.indicators.length > 0);
      if (validConstructs.length === 0) {
        setValidationError('Silakan pilih minimal 2 indikator untuk setidaknya satu variabel laten sebelum menjalankan SEM.');
        return;
      }

      const activeCols = new Set(columns.map(c => c.name));
      for (const c of validConstructs) {
        const missingInds = c.indicators.filter(ind => !activeCols.has(ind));
        if (missingInds.length > 0) {
          setValidationError(`Indikator '${missingInds.join(', ')}' pada laten '${c.name}' tidak ditemukan pada dataset aktif saat ini.`);
          return;
        }
      }

      const generated = generateLatentLavaanSyntax();
      setSEMConfig({ mode: 'syntax', customSyntax: generated });
    } else {
      // Visual Path Analysis mode
      setSEMConfig({ mode: 'visual' });
    }
    executeSEM(data);
  };

  const setTemplateSyntax = (type: 'mediation' | 'dual_mediation' | 'full_sem') => {
    if (type === 'mediation') {
      const syn = `# Model Mediasi Sederhana (Path Analysis)
M ~ a * X
Y ~ b * M + c * X

# Efek Mediasi
indirect := a * b
total := c + (a * b)
`;
      setSyntaxInput(syn);
      setSEMConfig({ customSyntax: syn, mode: 'syntax' });
      setActiveMode('syntax');
    } else if (type === 'dual_mediation') {
      const syn = `# Model Mediasi Ganda Paralel (Dual-Mediation Path Analysis)
M1 ~ a1 * X
M2 ~ a2 * X
Y ~ b1 * M1 + b2 * M2 + c * X

# Efek Mediasi Tidak Langsung
ind_M1 := a1 * b1
ind_M2 := a2 * b2
ind_total := (a1 * b1) + (a2 * b2)
total := c + ind_total
`;
      setSyntaxInput(syn);
      setSEMConfig({ customSyntax: syn, mode: 'syntax' });
      setActiveMode('syntax');
    } else if (type === 'full_sem') {
      const syn = `# Model Full SEM dengan Variabel Laten (CFA + Structural)
# 1. Model Pengukuran (Measurement Model)
Iklim =~ GD.2.1 + GD.2.2 + GD.2.3
Literasi =~ GD.3.5 + GD.3.6

# 2. Model Struktural (Structural Model)
Literasi ~ Iklim
`;
      setSyntaxInput(syn);
      setSEMConfig({ customSyntax: syn, mode: 'syntax' });
      setActiveMode('syntax');
    }
  };

  // Parameters Table Columns
  const paramColumns: ColumnDef<any>[] = [
    { header: 'Jalur Hubungan (Path)', accessorKey: 'relation' },
    { header: 'Tipe Jalur', accessorKey: 'type' },
    { header: 'Label', accessorKey: 'label', align: 'center' },
    { header: 'Unstandardized (B)', accessorKey: 'est', align: 'right' },
    { header: 'Std. Error (SE)', accessorKey: 'se', align: 'right' },
    { header: 'Standardized (β)', accessorKey: 'stdEst', align: 'right' },
    { header: 'z-value', accessorKey: 'zValue', align: 'right' },
    { header: 'p-value', accessorKey: 'pValue', align: 'right' },
    { header: '95% CI', accessorKey: 'ci', align: 'right' },
  ];

  const formatParamData = (params: any[]) => {
    return params?.map(p => ({
      relation: `${p.lhs} ${p.op} ${p.rhs}`,
      type: p.op === '=~' ? 'Factor Loading (λ)' : p.type === 'regression' ? 'Direct Path' : p.type === 'indirect' ? 'Indirect Effect' : p.type === 'total' ? 'Total Effect' : p.type,
      label: p.label || '-',
      est: formatNumber(p.est, 3),
      se: formatNumber(p.se, 3),
      stdEst: formatNumber(p.stdEst, 3),
      zValue: isNaN(p.zValue) ? '-' : formatNumber(p.zValue, 2),
      pValue: isNaN(p.pValue) ? '-' : formatPValue(p.pValue),
      ci: !isNaN(p.ciLower) ? `[${formatNumber(p.ciLower, 2)}, ${formatNumber(p.ciUpper, 2)}]` : '-',
    })) || [];
  };

  const directData = formatParamData(semResult?.directEffects || []);
  const measurementData = formatParamData((semResult?.parameters || []).filter(p => p.op === '=~'));
  const indirectData = formatParamData(semResult?.indirectEffects || []);
  const allParamData = formatParamData(semResult?.parameters || []);

  // Fit index badge status
  const getFitBadge = (name: string, value: number) => {
    if (value === undefined || value === null || isNaN(value)) {
      return <Badge variant="outline" className="bg-zinc-50 text-zinc-500">-</Badge>;
    }
    let passed = false;
    let label = '';
    if (name === 'CFI' || name === 'TLI') {
      passed = value >= 0.90;
      label = value >= 0.95 ? 'Good Fit (≥ .95)' : value >= 0.90 ? 'Acceptable (≥ .90)' : 'Poor (< .90)';
    } else if (name === 'RMSEA') {
      passed = value <= 0.08;
      label = value <= 0.06 ? 'Good Fit (≤ .06)' : value <= 0.08 ? 'Acceptable (≤ .08)' : 'Poor (> .08)';
    } else if (name === 'SRMR') {
      passed = value <= 0.08;
      label = value <= 0.08 ? 'Good Fit (≤ .08)' : 'Poor (> .08)';
    }

    return (
      <Badge
        variant="outline"
        className={passed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300'}
      >
        {label}
      </Badge>
    );
  };

  const generateApaNarrative = () => {
    if (!semResult || !semResult.fitIndices) return 'Jalankan analisis untuk melihat narasi pembahasan format APA otomatis.';

    const fit = semResult.fitIndices;
    let text = `Analisis Jalur / Pemodelan Persamaan Struktural (*Path Analysis & SEM*) dieksekusi menggunakan R Engine (*lavaan*) pada sampel N = ${(semResult.nObservations || 0).toLocaleString()} responden.\n\n`;

    text += `### 1. Evaluasi Kelayakan Model (*Goodness-of-Fit Indices*)\n`;
    text += `Berdasarkan kriteria evaluasi model fit (Hu & Bentler, 1999; Kline, 2016), model yang diuji menunjukkan kesesuaian data:\n`;
    text += `* **Chi-Square**: χ²(${fit.df || 0}) = ${formatNumber(fit.chisq, 2)}, *p* = ${formatPValue(fit.pvalue)}\n`;
    text += `* **CFI (Comparative Fit Index)**: **${formatNumber(fit.cfi, 3)}** (kriteria ≥ .95)\n`;
    text += `* **TLI (Tucker-Lewis Index)**: **${formatNumber(fit.tli, 3)}** (kriteria ≥ .95)\n`;
    text += `* **RMSEA**: **${formatNumber(fit.rmsea, 3)}**\n`;
    text += `* **SRMR**: **${formatNumber(fit.srmr, 3)}** (kriteria ≤ .08)\n\n`;

    text += `### 2. Pengujian Jalur Struktural & Efek Mediasi\n`;
    if (semResult.directEffects && semResult.directEffects.length > 0) {
      text += `* **Pengaruh Langsung (*Direct Effects*)**:\n`;
      semResult.directEffects.forEach(d => {
        text += `  - Jalur **${d.lhs} ← ${d.rhs}**: β = ${formatNumber(d.stdEst, 3)}, *B* = ${formatNumber(d.est, 3)} (*SE* = ${formatNumber(d.se, 3)}), *z* = ${formatNumber(d.zValue, 2)}, *p* = ${formatPValue(d.pValue)}.\n`;
      });
    }

    if (semResult.indirectEffects && semResult.indirectEffects.length > 0) {
      text += `\n* **Efek Mediasi Tidak Langsung (*Indirect Effects*)**:\n`;
      semResult.indirectEffects.forEach(ind => {
        text += `  - Jalur Mediasi **${ind.lhs}**: β = ${formatNumber(ind.stdEst, 3)}, *B* = ${formatNumber(ind.est, 3)} (*SE* = ${formatNumber(ind.se, 3)}), *z* = ${formatNumber(ind.zValue, 2)}, *p* = ${formatPValue(ind.pValue)}.\n`;
      });
      text += `\nHasil ini mengonfirmasi hipotesis mediasi secara signifikan pada taraf signifikansi p < .05.`;
    }

    return text;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Ultra Clean, Modern & Professional */}
      <PageHeader
        icon={Workflow}
        title="Analisis Jalur (Path Analysis) & SEM"
        badgeIcon={CheckCircle2}
        badgeText="R Engine (lavaan)"
        description="Pilih Mode Path Analysis untuk variabel komposit/teramati, atau Mode Visual SEM untuk membangun variabel laten tanpa kode manual."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetSEM}
          className="text-xs h-9 px-3 gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer shadow-2xs font-medium"
          title="Bersihkan model dan reset hasil analisis"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Analisis
        </Button>

        <button
          type="button"
          onClick={() => setAutoRun(!autoRun)}
          className={cn(
            "text-xs px-3 py-2 rounded-xl font-medium border flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs whitespace-nowrap h-9",
            autoRun
              ? "bg-teal-50 border-teal-300 text-teal-900 dark:bg-teal-950/80 dark:border-teal-700 dark:text-teal-200 ring-1 ring-teal-500/20"
              : "bg-zinc-100 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
          )}
          title="Mode Komputasi Reaktif: Hitung otomatis saat variabel diubah seperti di JASP/Jamovi"
        >
          <Zap className={cn("w-3.5 h-3.5", autoRun ? "text-amber-500 fill-amber-500" : "text-zinc-400")} />
          <span>Auto-Run {autoRun ? 'Aktif' : 'Manual'}</span>
          {isDebouncing && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping ml-0.5" />}
        </button>

        <Button
          onClick={handleRunAnalysis}
          disabled={isCalculating || data.length === 0}
          className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer gap-2 text-xs px-4 py-2 shadow-xs font-semibold rounded-xl whitespace-nowrap h-9"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {activeMode === 'latent' ? 'Jalankan SEM' : activeMode === 'path' ? 'Jalankan Path Analysis' : 'Jalankan lavaan'}
        </Button>
      </PageHeader>

      {/* Success reset display */}
      {resetSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs border border-emerald-200/80 dark:border-emerald-900 font-medium flex items-center gap-2.5 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{resetSuccessMessage}</span>
        </div>
      )}

      {/* Error / Alert display */}
      {(validationError || error) && (
        <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs border border-amber-200/80 dark:border-amber-800/60 flex items-start justify-between gap-3 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">Informasi Konfigurasi Model</p>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5">{validationError || error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setValidationError(null);
              useAnalysisStore.setState({ error: null });
            }}
            className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-100 p-1 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/30 cursor-pointer"
            title="Tutup pesan"
          >
            &times;
          </button>
        </div>
      )}

      {/* Mode Selector Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                Pilih Pendekatan Pemodelan
              </CardTitle>
              <CardDescription className="text-xs">
                Gunakan Path Analysis untuk variabel teramati tunggal, atau Visual SEM Builder untuk variabel laten dengan banyak indikator.
              </CardDescription>
            </div>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs shrink-0 self-start">
              <button
                onClick={() => { setActiveMode('path'); setSEMConfig({ mode: 'visual' }); setValidationError(null); }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${activeMode === 'path' ? 'bg-white dark:bg-zinc-700 shadow-xs text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-500'}`}
              >
                1. Path Analysis (Variabel Teramati)
              </button>
              <button
                onClick={() => { setActiveMode('latent'); setValidationError(null); }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${activeMode === 'latent' ? 'bg-white dark:bg-zinc-700 shadow-xs text-[#008080] dark:text-[#14a3a3] font-bold' : 'text-zinc-500'}`}
              >
                2. Visual SEM (Variabel Laten)
              </button>
              <button
                onClick={() => { setActiveMode('syntax'); setSEMConfig({ mode: 'syntax' }); setValidationError(null); }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${activeMode === 'syntax' ? 'bg-white dark:bg-zinc-700 shadow-xs text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-500'}`}
              >
                3. Sintaks lavaan
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* MODE 1: VISUAL PATH ANALYSIS (MANIFEST VARIABLES) */}
          {activeMode === 'path' && (
            <VariableSelector
              columns={columns}
              slots={[
                {
                  id: 'exogenous',
                  label: 'Variabel Eksogen / Independen (X)',
                  description: 'Prediktor awal dalam model jalur (contoh: ses_siswa, jenis_kelamin, sts_sek)',
                  typeFilter: 'all',
                  multi: true,
                  selected: semConfig.exogenous || [],
                  onChange: (vars: string[]) => setSEMConfig({ exogenous: vars })
                },
                {
                  id: 'mediators',
                  label: 'Variabel Mediasi / Intervening (M)',
                  description: 'Variabel perantara dalam model jalur (contoh: GD.2.7 [Bermain], nilai_literasi)',
                  typeFilter: 'all',
                  multi: true,
                  selected: semConfig.mediators || [],
                  onChange: (vars: string[]) => setSEMConfig({ mediators: vars })
                },
                {
                  id: 'endogenous',
                  label: 'Variabel Endogen / Dependen (Y)',
                  description: 'Variabel kriteria akhir (contoh: GD.3.5 [Literasi], nilai_numerasi)',
                  typeFilter: 'all',
                  multi: true,
                  selected: semConfig.endogenous || [],
                  onChange: (vars: string[]) => setSEMConfig({ endogenous: vars })
                }
              ]}
            />
          )}

          {/* MODE 2: VISUAL LATENT CONSTRUCT SEM BUILDER */}
          {activeMode === 'latent' && (
            <div className="space-y-6">
              {/* Construct Definition Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                      Langkah 1: Bangun Variabel Laten & Masukkan Indikator Butir (CFA)
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Tentukan nama variabel laten, lalu klik variabel di bawah untuk memasukkannya sebagai indikator manifes.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddLatent}
                    className="h-8 text-xs gap-1.5 cursor-pointer rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Variabel Laten
                  </Button>
                </div>

                <VariableSelector columns={columns} slots={latentSlots} />
              </div>

              {/* Structural Relations Between Latents & Manifest Covariates */}
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                    Langkah 2: Tentukan Pengaruh Struktural Antar Variabel Laten & Kovariat Manifes
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Selain variabel laten lain, sebuah variabel manifes/kovariat teramati (misalnya karakteristik siswa) juga dapat memengaruhi variabel laten secara langsung.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {latentConstructs.map(outcome => {
                    const relation = latentRelations.find(r => r.outcomeLatent === outcome.name);
                    const currentPreds = relation?.predictors || [];
                    const otherLatents = latentConstructs.filter(c => c.name !== outcome.name);
                    const outcomeIndicatorSet = new Set(outcome.indicators);
                    const manifestOptions = columns.filter(col => !outcomeIndicatorSet.has(col.name));

                    const togglePredictor = (predName: string) => {
                      const isChecked = currentPreds.includes(predName);
                      setLatentRelations(prev => {
                        const existing = prev.find(r => r.outcomeLatent === outcome.name);
                        if (existing) {
                          const nextPreds = isChecked
                            ? existing.predictors.filter(p => p !== predName)
                            : [...existing.predictors, predName];
                          return prev.map(r => r.outcomeLatent === outcome.name ? { ...r, predictors: nextPreds } : r);
                        }
                        return [...prev, { outcomeLatent: outcome.name, predictors: [predName] }];
                      });
                    };

                    return (
                      <div key={outcome.id} className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#008080] dark:text-[#14a3a3] font-mono shrink-0">
                            {outcome.name}
                          </span>
                          <span className="text-zinc-400 font-bold shrink-0">← dipengaruhi oleh:</span>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1">
                            <Layers className="w-3 h-3" /> Variabel Laten Lain:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {otherLatents.length === 0 ? (
                              <span className="text-[11px] text-zinc-400 italic">Tambahkan minimal 2 variabel laten di atas</span>
                            ) : (
                              otherLatents.map(pred => {
                                const isChecked = currentPreds.includes(pred.name);
                                return (
                                  <button
                                    key={pred.id}
                                    type="button"
                                    onClick={() => togglePredictor(pred.name)}
                                    className={`px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-all font-mono ${isChecked ? 'bg-[#008080] text-white border-transparent' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-[#008080]'}`}
                                  >
                                    {isChecked ? '✓ ' : '+ '} {pred.name}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1">
                            <Hash className="w-3 h-3" /> Variabel Manifes / Kovariat (opsional):
                          </span>
                          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-0.5">
                            {manifestOptions.map(col => {
                              const isChecked = currentPreds.includes(col.name);
                              const cb = getVariableCodebook(col.name, customCodebook);
                              return (
                                <button
                                  key={col.name}
                                  type="button"
                                  title={cb.label || col.name}
                                  onClick={() => togglePredictor(col.name)}
                                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold cursor-pointer border transition-all font-mono ${isChecked ? 'bg-amber-600 text-white border-transparent' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-amber-400'}`}
                                >
                                  {isChecked ? '✓ ' : '+ '} {col.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview of Generated lavaan syntax */}
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    Preview Sintaks lavaan Otomatis:
                  </span>
                  <Badge variant="outline" className="bg-emerald-950/60 text-emerald-300 border-emerald-800 text-[9.5px]">
                    Auto-generated
                  </Badge>
                </div>
                <pre className="text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre">
                  {generateLatentLavaanSyntax() || '# Pilih indikator untuk mengonstruksi model'}
                </pre>
              </div>
            </div>
          )}

          {/* MODE 3: MANUAL LAVAAN SYNTAX EDITOR */}
          {activeMode === 'syntax' && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTemplateSyntax('mediation')}
                  className="text-xs h-8 px-3 gap-1.5 cursor-pointer rounded-xl"
                >
                  <FileCode className="size-3.5" />
                  Template Mediasi Sederhana
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTemplateSyntax('dual_mediation')}
                  className="text-xs h-8 px-3 gap-1.5 cursor-pointer rounded-xl"
                >
                  <GitFork className="size-3.5" />
                  Template Mediasi Ganda
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTemplateSyntax('full_sem')}
                  className="text-xs h-8 px-3 gap-1.5 cursor-pointer rounded-xl"
                >
                  <Workflow className="size-3.5" />
                  Template Full SEM (Laten)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSyntaxInput('');
                    setSEMConfig({ customSyntax: '' });
                  }}
                  className="text-xs h-8 px-2.5 text-zinc-400 hover:text-red-500 cursor-pointer ml-auto gap-1"
                  title="Kosongkan teks editor sintaks"
                >
                  <Trash2 className="size-3.5" />
                  Kosongkan
                </Button>
              </div>
              <textarea
                value={syntaxInput}
                onChange={(e) => {
                  setSyntaxInput(e.target.value);
                  setSEMConfig({ customSyntax: e.target.value, mode: 'syntax' });
                }}
                rows={8}
                className="w-full p-3 font-mono text-xs rounded-xl bg-zinc-950 text-emerald-400 border border-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#008080]"
                placeholder="# Tulis sintaks lavaan di sini...&#10;Y ~ b*M + c*X&#10;M ~ a*X&#10;ind := a*b&#10;tot := c + (a*b)"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Sub-Tabs */}
      <Tabs value={activeOutputTab} onValueChange={setActiveOutputTab}>
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 p-1">
            <TabsTrigger value="tables">Tabel Hasil & Narasi APA</TabsTrigger>
            <TabsTrigger value="fit_indices" className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Indeks Kelayakan Model Fit
            </TabsTrigger>
            <TabsTrigger value="r_console" className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              Output Konsol R (Terminal)
            </TabsTrigger>
            <TabsTrigger value="r_code" className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-500" />
              Sintaks Verifikasi R
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Tables and APA Narrative */}
        <TabsContent value="tables" className="space-y-6 mt-4">
          {semResult ? (
            <div className="space-y-6">
              {/* Quick Model Fit Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
                  <p className="text-xs text-zinc-500 font-medium">CFI (Comparative Fit)</p>
                  <p className="text-2xl font-extrabold text-[#008080] dark:text-[#14a3a3] font-mono">
                    {formatNumber(semResult.fitIndices.cfi, 3)}
                  </p>
                  {getFitBadge('CFI', semResult.fitIndices.cfi)}
                </Card>

                <Card className="p-4 border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
                  <p className="text-xs text-zinc-500 font-medium">TLI (Tucker-Lewis)</p>
                  <p className="text-2xl font-extrabold text-[#008080] dark:text-[#14a3a3] font-mono">
                    {formatNumber(semResult.fitIndices.tli, 3)}
                  </p>
                  {getFitBadge('TLI', semResult.fitIndices.tli)}
                </Card>

                <Card className="p-4 border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
                  <p className="text-xs text-zinc-500 font-medium">RMSEA</p>
                  <p className="text-2xl font-extrabold text-[#008080] dark:text-[#14a3a3] font-mono">
                    {formatNumber(semResult.fitIndices.rmsea, 3)}
                  </p>
                  {getFitBadge('RMSEA', semResult.fitIndices.rmsea)}
                </Card>

                <Card className="p-4 border-zinc-200 dark:border-zinc-800 space-y-1.5 shadow-xs">
                  <p className="text-xs text-zinc-500 font-medium">SRMR</p>
                  <p className="text-2xl font-extrabold text-[#008080] dark:text-[#14a3a3] font-mono">
                    {formatNumber(semResult.fitIndices.srmr, 3)}
                  </p>
                  {getFitBadge('SRMR', semResult.fitIndices.srmr)}
                </Card>
              </div>

              {/* Table 1: Measurement Model / Factor Loadings if latent variables exist */}
              {measurementData.length > 0 && (
                <DataTableHasil
                  title="Tabel 1. Model Pengukuran / Factor Loadings (CFA)"
                  subtitle="Estimasi bobot indikator manifes terhadap variabel laten (λ)"
                  columns={paramColumns}
                  data={measurementData}
                  notes="Catatan: Standardized (β) menunjukkan bobot faktor terstandar (factor loading λ). Nilai λ ≥ 0.50 menunjukkan validitas konvergen yang memadai."
                />
              )}

              {/* Table 2: Structural Regressions / Direct Paths */}
              <DataTableHasil
                title={measurementData.length > 0 ? "Tabel 2. Estimasi Parameter Model Struktural (Direct Paths)" : "Tabel 1. Estimasi Parameter Pengaruh Langsung (Direct Paths)"}
                subtitle="Regresi struktural antar variabel teramati / laten"
                columns={paramColumns}
                data={directData}
                notes="Catatan: * p < .05, ** p < .01, *** p < .001. Variabel kategori biner dikodekan sebagai dummy 0 vs 1 (Contoh: jenis_kelamin: L=0 [Referensi], P=1 [Pembanding]; sts_sek: N=0 [Negeri/Ref], S=1 [Swasta/Pembanding]). Koefisien positif menunjukkan kelompok pembanding bernilai lebih tinggi dibanding kelompok referensi."
              />

              {/* Table 3: Indirect & Total Effects */}
              {indirectData.length > 0 && (
                <DataTableHasil
                  title={measurementData.length > 0 ? "Tabel 3. Estimasi Efek Mediasi Tidak Langsung (Indirect Effects)" : "Tabel 2. Estimasi Efek Mediasi Tidak Langsung (Indirect Effects)"}
                  subtitle="Uji signifikansi jalur mediasi (Product-of-Coefficients)"
                  columns={paramColumns}
                  data={indirectData}
                  notes="Catatan: Efek tidak langsung dihitung melalui perkalian koefisien jalur mediator."
                />
              )}

              <AiCard
                analysisKey={`sem_${semResult.nObservations}_${(semResult.directEffects || []).length}paths`}
                title="Narasi Laporan Hasil Analisis Jalur / SEM (Format APA 7th)"
                defaultNarrative={generateApaNarrative()}
                promptBuilder={() => `
Tolong buatkan narasi laporan penelitian akademik berstandar APA 7th dalam Bahasa Indonesia untuk hasil Analisis Jalur / Structural Equation Modeling (SEM) menggunakan engine R (lavaan) berikut:
- N Observasi: ${(semResult.nObservations || 0).toLocaleString()}
${semResult.fitIndices ? `- Model Fit Indices: Chi-Square(${semResult.fitIndices.df || 0}) = ${formatNumber(semResult.fitIndices.chisq, 2)}, p = ${formatPValue(semResult.fitIndices.pvalue)}, CFI = ${formatNumber(semResult.fitIndices.cfi, 3)}, TLI = ${formatNumber(semResult.fitIndices.tli, 3)}, RMSEA = ${formatNumber(semResult.fitIndices.rmsea, 3)}, SRMR = ${formatNumber(semResult.fitIndices.srmr, 3)}` : ''}
- Pengaruh Langsung (Direct Effects):
${(semResult.directEffects || []).map(d => `  * ${d.lhs} <- ${d.rhs}: Est = ${formatNumber(d.est, 3)}, Std.Est = ${formatNumber(d.stdEst, 3)}, z = ${formatNumber(d.zValue, 2)}, p = ${formatPValue(d.pValue)}`).join('\n')}
${semResult.indirectEffects && semResult.indirectEffects.length > 0 ? `- Pengaruh Tidak Langsung / Mediasi (Indirect Effects):
${semResult.indirectEffects.map(ind => `  * ${ind.lhs}: Est = ${formatNumber(ind.est, 3)}, Std.Est = ${formatNumber(ind.stdEst, 3)}, SE = ${formatNumber(ind.se, 3)}, z = ${formatNumber(ind.zValue, 2)}, p = ${formatPValue(ind.pValue)}` ).join('\n')}` : ''}
                `.trim()}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              Tentukan spesifikasi model dan klik &apos;Jalankan&apos; di atas untuk menampilkan hasil tabel APA.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Fit Indices Details */}
        <TabsContent value="fit_indices" className="space-y-6 mt-4">
          {semResult ? (
            <div className="space-y-6">
              <DataTableHasil
                title="Tabel Lengkap Seluruh Parameter Model (Regresi, Kovarians, dan Varians)"
                columns={paramColumns}
                data={allParamData}
              />

              <Card className="border-zinc-200 dark:border-zinc-800 shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Statistik Kelayakan Model Tambahan (*Goodness-of-Fit Measures*)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Chi-Square (χ²):</span>
                      <span className="font-bold text-sm font-mono">{formatNumber(semResult.fitIndices.chisq, 2)} (df = {semResult.fitIndices.df})</span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Akaike (AIC):</span>
                      <span className="font-bold text-sm font-mono">{!isNaN(semResult.fitIndices.aic) ? formatNumber(semResult.fitIndices.aic, 1) : '-'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Bayesian (BIC):</span>
                      <span className="font-bold text-sm font-mono">{!isNaN(semResult.fitIndices.bic) ? formatNumber(semResult.fitIndices.bic, 1) : '-'}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-500 block text-[11px]">Sampel Observasi:</span>
                      <span className="font-bold text-sm font-mono">N = {(semResult.nObservations || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              Belum ada hasil analisis untuk ditampilkan.
            </div>
          )}
        </TabsContent>

        {/* Tab 3: R Console Terminal Output */}
        <TabsContent value="r_console" className="mt-4">
          <RConsoleBlock
            title="R Session Output (lavaan::sem Engine)"
            consoleOutput={semResult?.rConsoleOutput || 'Jalankan analisis untuk melihat output konsol R.'}
          />
        </TabsContent>

        {/* Tab 4: R Verification Syntax */}
        <TabsContent value="r_code" className="mt-4">
          <RCodeBlock
            title="Sintaks Verifikasi R (lavaan Standar JASP)"
            code={`library(lavaan)\n\n# Membaca dataset\ndf <- read.csv("${fileName || 'dataset.csv'}", stringsAsFactors = TRUE)\n\n# Model Sintaks lavaan:\nmodel_syntax <- '${semResult?.syntaxUsed || '# Belum ada model'}'\n\n# Estimasi SEM / Path Analysis\nfit <- sem(model = model_syntax, data = df, missing = "fiml", estimator = "ML", fixed.x = FALSE)\n\n# Ringkasan Fit & Parameter Estimates\nsummary(fit, fit.measures = TRUE, standardized = TRUE, rsquare = TRUE)\nparameterEstimates(fit, standardized = TRUE, ci = TRUE)`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
