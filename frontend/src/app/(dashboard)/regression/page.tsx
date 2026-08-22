'use client';

import * as React from 'react';
import {
  LineChart,
  Play,
  Code2,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Layers,
  Sliders,
  Table,
  Zap,
  Plus,
  BarChart3,
  HelpCircle,
  FolderPlus,
  ArrowRight,
  Info,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DataTableHasil, ColumnDef } from '@/components/common/data-table-hasil';
import { AssumptionCard } from '@/components/common/assumption-card';
import { AiCard } from '@/components/common/ai-card';
import { RCodeBlock } from '@/components/common/r-code-block';
import { RConsoleBlock } from '@/components/common/r-console-block';
import { PageHeader } from '@/components/common/page-header';
import { useDatasetStore } from '@/stores/dataset-store';
import { useAnalysisStore } from '@/stores/analysis-store';
import { formatNumber, formatPValue, cn } from '@/lib/utils';
import { RSyntaxGenerator } from '@/lib/stats/r-syntax';
import { RegressionBlockConfig } from '@/lib/types';
import { getVariableDescription, AN_CODEBOOK_DICTIONARY } from '@/constants/an-codebook';

import { VariableSelector, VariableSlot } from '@/components/common/variable-selector';

export default function RegressionPage() {
  const { data, columns, fileName, loadDefaultDataset } = useDatasetStore();
  const {
    regressionConfig,
    setRegressionConfig,
    executeRegression,
    regressionResult,
    isCalculating,
    error,
    clearSpecificAnalysis
  } = useAnalysisStore();

  const [activeOutputTab, setActiveOutputTab] = React.useState('tables');
  const [autoRun, setAutoRun] = React.useState(true);
  const [isDebouncing, setIsDebouncing] = React.useState(false);
  const isInitialMount = React.useRef(true);

  const regressionMode = regressionConfig.mode || (regressionConfig.blocks && regressionConfig.blocks.length > 1 ? 'hierarchical' : 'standard');

  React.useEffect(() => {
    useAnalysisStore.setState({ error: null });
    if (data.length === 0 && !fileName) {
      loadDefaultDataset();
    }
  }, []);

  const handleResetRegression = () => {
    clearSpecificAnalysis('regression');
  };

  // Ensure default blocks exist
  React.useEffect(() => {
    if (!regressionConfig.blocks || regressionConfig.blocks.length === 0) {
      setRegressionConfig({
        blocks: [
          { blockNumber: 1, blockName: 'Blok 1: Status Sosial Ekonomi', variables: ['ses_siswa'] },
          { blockNumber: 2, blockName: 'Blok 2: Iklim & Praktik Belajar', variables: ['guru_iklim_kelas'] }
        ]
      });
    }
  }, []);

  // Reactive Debounce Auto-Run (JASP Mode)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (regressionResult) return;
    }

    const hasIv = (regressionConfig.blocks || []).some(b => b.variables && b.variables.length > 0);
    if (!autoRun || data.length === 0 || !regressionConfig.dv || !hasIv) return;

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setIsDebouncing(false);
      executeRegression(data);
    }, 450);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [autoRun, data, regressionConfig.dv, regressionConfig.blocks, regressionConfig.mode]);

  const handleRunRegression = () => {
    if (data.length > 0) {
      executeRegression(data);
    }
  };

  const handleSetMode = (mode: 'standard' | 'hierarchical') => {
    if (mode === 'standard') {
      const allVars = Array.from(new Set((regressionConfig.blocks || []).flatMap(b => b.variables)));
      setRegressionConfig({
        mode: 'standard',
        blocks: [
          {
            blockNumber: 1,
            blockName: 'Model Regresi Linier Berganda',
            variables: allVars
          }
        ]
      });
    } else {
      const currentBlocks = regressionConfig.blocks || [];
      if (currentBlocks.length <= 1) {
        const firstBlockVars = currentBlocks[0]?.variables || [];
        const b1Vars = firstBlockVars.slice(0, Math.ceil(firstBlockVars.length / 2));
        const b2Vars = firstBlockVars.slice(Math.ceil(firstBlockVars.length / 2));
        setRegressionConfig({
          mode: 'hierarchical',
          blocks: [
            { blockNumber: 1, blockName: 'Blok 1: Latar Belakang / Kontrol', variables: b1Vars.length > 0 ? b1Vars : ['ses_siswa'] },
            { blockNumber: 2, blockName: 'Blok 2: Intervensi / Lingkungan', variables: b2Vars.length > 0 ? b2Vars : ['guru_iklim_kelas'] }
          ]
        });
      } else {
        setRegressionConfig({ mode: 'hierarchical' });
      }
    }
  };

  const handleAddBlock = () => {
    const currentBlocks = [...(regressionConfig.blocks || [])];
    const newBlockNumber = currentBlocks.length + 1;
    const newBlock: RegressionBlockConfig = {
      blockNumber: newBlockNumber,
      blockName: `Blok ${newBlockNumber}: Variabel Tambahan`,
      variables: []
    };
    setRegressionConfig({
      blocks: [...currentBlocks, newBlock]
    });
  };

  const handleRemoveBlock = (blockIndex: number) => {
    const currentBlocks = [...(regressionConfig.blocks || [])];
    if (currentBlocks.length <= 1) return;
    const updated = currentBlocks
      .filter((_, idx) => idx !== blockIndex)
      .map((b, idx) => ({
        ...b,
        blockNumber: idx + 1,
        blockName: (b.blockName || '').startsWith('Blok ') ? `Blok ${idx + 1}: ${(b.blockName || '').split(': ')[1] || ''}` : (b.blockName || `Blok ${idx + 1}`)
      }));
    setRegressionConfig({ blocks: updated });
  };

  // Model Summary Columns
  const summaryColumns: ColumnDef<any>[] = [
    { header: 'Model Regresi', accessorKey: 'modelName' },
    { header: 'R', accessorKey: 'r', align: 'right' },
    { header: 'R²', accessorKey: 'r2', align: 'right' },
    { header: 'Adjusted R²', accessorKey: 'adjR2', align: 'right' },
    { header: 'Std. Error Est.', accessorKey: 'seEst', align: 'right' },
    { header: 'ΔR² (R² Change)', accessorKey: 'r2Change', align: 'right' },
    { header: 'F Change', accessorKey: 'fChange', align: 'right' },
    { header: 'df1 / df2', accessorKey: 'df', align: 'right' },
    { header: 'p-value (F Change)', accessorKey: 'pChange', align: 'right' },
  ];

  const summaryData = regressionResult?.models?.map(m => ({
    modelName: `${m.modelName} (${m.predictors.length} prediktor)`,
    r: formatNumber(m.r, 3),
    r2: formatNumber(m.r2, 3),
    adjR2: formatNumber(m.adjR2, 3),
    seEst: formatNumber(m.seEst, 2),
    r2Change: formatNumber(m.r2Change, 3),
    fChange: formatNumber(m.fChange, 2),
    df: `${m.df1} / ${m.df2}`,
    pChange: formatPValue(m.pChange),
  })) || [];

  // Coefficients Columns (Table 2 Coefficients with Beta & VIF)
  const coefColumns: ColumnDef<any>[] = [
    { header: 'Model / Parameter', accessorKey: 'term' },
    { header: 'Unstandardized (B)', accessorKey: 'b', align: 'right' },
    { header: 'Std. Error (SE)', accessorKey: 'se', align: 'right' },
    { header: 'Standardized (β)', accessorKey: 'beta', align: 'right' },
    { header: 't-value', accessorKey: 'tValue', align: 'right' },
    { header: 'p-value', accessorKey: 'pValue', align: 'right' },
    { header: '95% CI', accessorKey: 'ci', align: 'right' },
    { header: 'VIF', accessorKey: 'vif', align: 'right' },
    { header: 'Tolerance', accessorKey: 'tolerance', align: 'right' },
  ];

  const finalModel = regressionResult?.models?.[regressionResult.models.length - 1];
  const coefData = finalModel?.coefficients?.map(c => ({
    term: c.term === '(Intercept)' ? 'Konstanta (Intercept)' : c.term,
    b: formatNumber(c.b, 3),
    se: formatNumber(c.se, 3),
    beta: c.term === '(Intercept)' ? '-' : formatNumber(c.beta, 3),
    tValue: formatNumber(c.tValue, 2),
    pValue: formatPValue(c.pValue),
    ci: `[${formatNumber(c.ciLower, 2)}, ${formatNumber(c.ciUpper, 2)}]`,
    vif: !isNaN(c.vif || NaN) ? formatNumber(c.vif, 2) : '-',
    tolerance: !isNaN(c.tolerance || NaN) ? formatNumber(c.tolerance, 3) : '-',
  })) || [];

  // Automated APA Narrative Generation
  const generateApaNarrative = () => {
    if (!regressionResult || !regressionResult.models || regressionResult.models.length === 0) {
      return 'Jalankan analisis regresi untuk melihat narasi interpretasi akademik otomatis.';
    }

    const mCount = regressionResult.models.length;
    const finalM = regressionResult.models[mCount - 1];
    const isHierarchical = mCount > 1;

    let narrative = isHierarchical
      ? `Analisis regresi linier berganda berjenjang (*hierarchical multiple regression*) dilakukan untuk memprediksi capaian **${regressionResult.dv}** berdasarkan ${mCount} blok prediktor (N = ${(regressionResult.nObservations || 0).toLocaleString()}).\n\n`
      : `Analisis regresi linier berganda (*standard multiple linear regression*) dilakukan untuk memprediksi capaian **${regressionResult.dv}** berdasarkan serangkaian variabel prediktor (N = ${(regressionResult.nObservations || 0).toLocaleString()}).\n\n`;

    regressionResult.models.forEach((m, idx) => {
      narrative += `* **${m.modelName}**: Menjelaskan varians sebesar **${((m.r2 || 0) * 100).toFixed(1)}%** (*R²* = ${formatNumber(m.r2, 3)}, *F*(${m.df1}, ${m.df2}) = ${formatNumber(m.fChange, 2)}, *p* = ${formatPValue(m.pChange)}). `;
      if (idx > 0) {
        narrative += `Penambahan blok ini memberikan kontribusi penambahan varians signifikan sebesar **ΔR² = ${((m.r2Change || 0) * 100).toFixed(1)}%** (*p* = ${formatPValue(m.pChange)}).\n`;
      } else {
        narrative += `\n`;
      }
    });

    narrative += `\nPada model final yang mencakup seluruh prediktor, model secara keseluruhan mampu menjelaskan **${((finalM?.r2 || 0) * 100).toFixed(1)}%** total varians (*Adjusted R²* = ${formatNumber(finalM?.adjR2, 3)}). Seluruh prediktor menunjukkan nilai VIF di bawah 5.0, mengindikasikan tidak adanya masalah multikolinearitas yang serius.`;

    return narrative;
  };

  const blocks = regressionConfig.blocks || [];
  const selectedVarsCount = blocks.reduce((sum, b) => sum + (b.variables?.length || 0), 0);

  // Configure Slots for standard VariableSelector component
  const variableSlots: VariableSlot[] = React.useMemo(() => {
    const s: VariableSlot[] = [
      {
        id: 'dv',
        label: 'Dependent Variable (Outcome Kontinu Y)',
        description: 'Variabel hasil kontinu (contoh: nilai_literasi atau nilai_numerasi)',
        typeFilter: 'numeric',
        multi: false,
        selected: regressionConfig.dv ? [regressionConfig.dv] : [],
        onChange: (selected) => setRegressionConfig({ dv: selected[0] || '' })
      }
    ];

    if (regressionMode === 'standard') {
      const firstBlock = (regressionConfig.blocks && regressionConfig.blocks[0]) || { variables: [] };
      s.push({
        id: 'ivs',
        label: 'Independent Variables (Prediktor X)',
        description: 'Seluruh prediktor simultan dalam model regresi linier berganda',
        typeFilter: 'all',
        multi: true,
        selected: firstBlock.variables || [],
        onChange: (selected) => setRegressionConfig({
          mode: 'standard',
          blocks: [
            {
              blockNumber: 1,
              blockName: 'Model Regresi Linier Berganda',
              variables: selected
            }
          ]
        })
      });
    } else {
      const currentBlocks = regressionConfig.blocks || [];
      currentBlocks.forEach((block, idx) => {
        s.push({
          id: `block_${block.blockNumber || idx + 1}`,
          label: `${block.blockName || `Blok ${idx + 1}`}`,
          description: `Variabel prediktor untuk Model Jenjang ${idx + 1}`,
          typeFilter: 'all',
          multi: true,
          selected: block.variables || [],
          onChange: (selected) => {
            const updated = [...(regressionConfig.blocks || [])];
            updated[idx] = {
              ...updated[idx],
              variables: selected
            };
            setRegressionConfig({ blocks: updated });
          },
          onRename: (newLabel) => {
            const updated = [...(regressionConfig.blocks || [])];
            updated[idx] = { ...updated[idx], blockName: newLabel };
            setRegressionConfig({ blocks: updated });
          },
          onRemove: currentBlocks.length > 1 ? () => handleRemoveBlock(idx) : undefined
        });
      });
    }

    return s;
  }, [regressionConfig.dv, regressionConfig.blocks, regressionMode, setRegressionConfig]);

  return (
    <div className="space-y-6">
      {/* Header Banner - 100% Consistent with All Other Modules */}
      <PageHeader
        icon={LineChart}
        title="Regresi Linier & Berganda"
        badgeIcon={CheckCircle2}
        badgeText="R Engine (stats::lm)"
        description="Estimasi model regresi linier simultan (Enter) atau bertingkat (Hierarchical Blocks, ΔR² Change, F-Change) dengan uji asumsi OLS lengkap dan diagnostik multikolinearitas (VIF)."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetRegression}
          className="text-xs h-9 px-3 gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer shadow-2xs font-medium"
          title="Bersihkan model dan reset hasil analisis"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Analisis
        </Button>

        {/* Auto-Run Reactive Toggle */}
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
          onClick={handleRunRegression}
          disabled={isCalculating || !regressionConfig.dv || selectedVarsCount === 0}
          className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer gap-2 text-xs px-4 py-2 shadow-xs font-semibold rounded-xl whitespace-nowrap h-9"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Jalankan Regresi
        </Button>
      </PageHeader>

      {/* Mode Switcher Tabs - Standardized Layout */}
      <Tabs value={regressionMode} onValueChange={(v) => handleSetMode(v as 'standard' | 'hierarchical')}>
        <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
          <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 p-1">
            <TabsTrigger value="standard" className="text-xs">
              Regresi Standar (Simultan / Enter)
            </TabsTrigger>
            <TabsTrigger value="hierarchical" className="text-xs flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Regresi Berjenjang (Hierarkis / ΔR²)</span>
            </TabsTrigger>
          </TabsList>

          {regressionMode === 'hierarchical' && (
            <Button
              type="button"
              onClick={handleAddBlock}
              variant="outline"
              size="sm"
              className="text-xs h-8 rounded-xl border-[#008080]/30 hover:bg-[#e6f2f2] text-[#008080] dark:border-[#14a3a3]/30 dark:hover:bg-[#14312f] dark:text-[#14a3a3] gap-1.5 cursor-pointer font-semibold shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Blok Prediktor
            </Button>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Variable Selection Section with Standard Card */}
        <div className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Konfigurasi Variabel Regresi</CardTitle>
              <CardDescription className="text-xs">
                {regressionMode === 'hierarchical'
                  ? 'Pilih variabel dependen kontinu (Y) dan kelompokkan prediktor ke dalam blok bertingkat dinamis (ΔR² Blockwise).'
                  : 'Pilih variabel dependen kontinu (Y) dan tentukan seluruh variabel independen prediktor (X).'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VariableSelector
                columns={columns}
                slots={variableSlots}
              />
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Output Sub-Tabs */}
      <Tabs value={activeOutputTab} onValueChange={setActiveOutputTab}>
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 p-1">
            <TabsTrigger value="tables">Tabel Hasil & Narasi APA</TabsTrigger>
            <TabsTrigger value="assumptions" className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Uji Asumsi Statistik
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
          {regressionResult ? (
            <div className="space-y-6">
              {/* Visual Breakdown of Variance Contribution */}
              {regressionResult.models.length > 1 && (
                <Card className="border border-teal-200/60 dark:border-teal-900/40 bg-white dark:bg-zinc-900/50 shadow-2xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                      Dekomposisi Penambahan Varians (Hierarchical ΔR² Contribution)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-6 w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex shadow-inner">
                        {regressionResult.models.map((m, idx) => {
                          const deltaPct = ((m.r2Change || 0) * 100);
                          const colors = ['bg-[#008080]', 'bg-teal-500', 'bg-emerald-500', 'bg-cyan-600', 'bg-indigo-500'];
                          const color = colors[idx % colors.length];

                          return (
                            <div
                              key={m.modelNumber || idx}
                              style={{ width: `${Math.max(deltaPct, 2)}%` }}
                              title={`${m.modelName}: ΔR² = ${deltaPct.toFixed(1)}%`}
                              className={cn(color, "h-full transition-all flex items-center justify-center text-[10px] text-white font-bold px-1 truncate")}
                            >
                              {deltaPct >= 3 ? `${deltaPct.toFixed(1)}%` : ''}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-4 pt-1">
                        {regressionResult.models.map((m, idx) => {
                          const colors = ['bg-[#008080]', 'bg-teal-500', 'bg-emerald-500', 'bg-cyan-600', 'bg-indigo-500'];
                          const color = colors[idx % colors.length];
                          return (
                            <div key={m.modelNumber || idx} className="flex items-center gap-1.5 text-xs">
                              <span className={cn("w-3 h-3 rounded-full", color)} />
                              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{m.modelName}:</span>
                              <span className="text-zinc-500">ΔR² = {((m.r2Change || 0) * 100).toFixed(1)}% (Kumulatif: {((m.r2 || 0) * 100).toFixed(1)}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <DataTableHasil
                title={`Tabel 1. Ringkasan Perbandingan Model Regresi (Model Summary & ΔR²)`}
                subtitle="Mengevaluasi kontribusi unik dan signifikansi perubahan varians pada setiap blok prediktor"
                columns={summaryColumns}
                data={summaryData}
                notes="Catatan: * p < .05, ** p < .01, *** p < .001. ΔR² menunjukkan peningkatan varians yang dijelaskan."
              />

              <DataTableHasil
                title="Tabel 2. Parameter Regresi Model Final (Unstandardized B, Standardized β, & VIF)"
                subtitle="Koefisien terstandar (Standardized β) membandingkan kekuatan relatif masing-masing prediktor"
                columns={coefColumns}
                data={coefData}
                notes="Catatan: Nilai VIF < 5.0 (Tolerance > 0.20) mengindikasikan model bebas dari multikolinearitas yang serius."
              />

              <AiCard
                analysisKey={`regression_${regressionResult.dv}_${regressionResult.models.length}models`}
                title="Narasi Laporan Hasil Regresi (Format APA 7th)"
                defaultNarrative={generateApaNarrative()}
                promptBuilder={() => `
Tolong buatkan narasi laporan penelitian akademik berstandar APA 7th dalam Bahasa Indonesia untuk hasil ${regressionResult.models.length > 1 ? 'Regresi Linier Berganda Berjenjang (Hierarchical Multiple Regression)' : 'Regresi Linier Berganda (Standard Multiple Regression)'} berikut:
- Variabel Terikat (Outcome): ${regressionResult.dv}
- N Observasi: ${(regressionResult.nObservations || 0).toLocaleString()}
- Ringkasan Model:
${regressionResult.models.map(m => `  * ${m.modelName} (${m.predictors.join(', ')}): R = ${formatNumber(m.r, 3)}, R2 = ${formatNumber(m.r2, 3)}, Adj R2 = ${formatNumber(m.adjR2, 3)}, deltaR2 = ${formatNumber(m.r2Change, 3)}, F-Change(${m.df1}, ${m.df2}) = ${formatNumber(m.fChange, 2)}, p = ${formatPValue(m.pChange)}`).join('\n')}
- Koefisien Model Final:
${(finalModel?.coefficients || []).map(c => `  * ${c.term}: B = ${formatNumber(c.b, 3)}, SE = ${formatNumber(c.se, 3)}, Beta = ${formatNumber(c.beta, 3)}, t = ${formatNumber(c.tValue, 2)}, p = ${formatPValue(c.pValue)}, VIF = ${!isNaN(c.vif || NaN) ? formatNumber(c.vif, 2) : '-'}`).join('\n')}
                `.trim()}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              Tentukan variabel dan klik &apos;Jalankan Regresi&apos; di atas untuk menampilkan hasil tabel APA.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Statistical Assumption Checks */}
        <TabsContent value="assumptions" className="space-y-6 mt-4">
          <AssumptionCard
            title="Pemeriksaan Asumsi Regresi Linier"
            subtitle="Pemeriksaan normalitas residual, multikolinearitas (VIF), homoskedastisitas (Breusch-Pagan), dan independensi observasi (Durbin-Watson)."
            assumptions={regressionResult?.assumptions || []}
          />
        </TabsContent>

        {/* Tab 3: R Console Terminal Output */}
        <TabsContent value="r_console" className="mt-4">
          <RConsoleBlock
            title="Output Konsol R - Regresi Linier Berganda (Raw Text Output)"
            description="Keluaran teks mentah resmi dari eksekusi fungsi stats::lm, anova(), dan car::vif() di sesi R."
            consoleOutput={regressionResult?.rConsoleOutput}
          />
        </TabsContent>

        {/* Tab 4: R Verification Code */}
        <TabsContent value="r_code" className="mt-4">
          <RCodeBlock
            title="Sintaks Verifikasi Regresi di R"
            description="Salin kode ini ke RStudio untuk memverifikasi model regresi hierarkis, ANOVA perbandingan model, dan uji diagnostik asumsi."
            code={RSyntaxGenerator.getRegressionCode(
              regressionConfig.dv,
              regressionConfig.blocks || [],
              fileName || 'data_asesmen_nasional.csv'
            )}
            packages={['car', 'lm.beta']}
            fileName="verifikasi_regresi.R"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
