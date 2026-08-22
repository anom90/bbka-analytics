'use client';

import * as React from 'react';
import { Network, Play, Code2, CheckCircle2, Terminal, ShieldCheck, Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { VariableSelector } from '@/components/common/variable-selector';
import { DataTableHasil, ColumnDef } from '@/components/common/data-table-hasil';
import { CaterpillarPlot } from '@/components/common/caterpillar-plot';
import { AssumptionCard } from '@/components/common/assumption-card';
import { AiCard } from '@/components/common/ai-card';
import { RCodeBlock } from '@/components/common/r-code-block';
import { RConsoleBlock } from '@/components/common/r-console-block';
import { PageHeader } from '@/components/common/page-header';
import { useDatasetStore } from '@/stores/dataset-store';
import { useAnalysisStore } from '@/stores/analysis-store';
import { formatNumber, formatPValue, ensureArray, cn } from '@/lib/utils';
import { generateLocalMultilevelNarrative } from '@/lib/gemini';
import { RSyntaxGenerator } from '@/lib/stats/r-syntax';

export default function MultilevelPage() {
  const { data, columns, fileName } = useDatasetStore();
  const {
    multilevelConfig,
    setMultilevelConfig,
    executeMultilevel,
    multilevelResult,
    isCalculating,
    error,
    clearSpecificAnalysis
  } = useAnalysisStore();

  const [activeOutputTab, setActiveOutputTab] = React.useState('tables');
  const [autoRun, setAutoRun] = React.useState(true);
  const [isDebouncing, setIsDebouncing] = React.useState(false);
  const isInitialMount = React.useRef(true);

  React.useEffect(() => {
    useAnalysisStore.setState({ error: null });
  }, []);

  const handleResetMultilevel = () => {
    clearSpecificAnalysis('multilevel');
  };

  // Reactive Debounce Auto-Run (JASP / Jamovi Mode)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (multilevelResult) return;
    }

    if (!autoRun || data.length === 0 || !multilevelConfig.dv || !multilevelConfig.clusterVar) return;

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setIsDebouncing(false);
      executeMultilevel(data);
    }, 450);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [
    autoRun,
    data,
    multilevelConfig.dv,
    multilevelConfig.clusterVar,
    multilevelConfig.level1Predictors,
    multilevelConfig.level2Predictors
  ]);

  const handleRunMultilevel = () => {
    if (data.length > 0) {
      executeMultilevel(data);
    }
  };

  // -------------------------------------------------------------
  // TABEL 1: Perbandingan Model Multilevel Berjenjang (Model 1 vs Model 2 vs Model 3 vs Model 4)
  // Format Standar Publikasi Jurnal (Hox, Snijders & Bosker, Springer LSAE)
  // -------------------------------------------------------------
  const models = multilevelResult?.models || [];
  const model1 = models.find(m => m.modelId === 'model_1');
  const model2 = models.find(m => m.modelId === 'model_2');
  const model3 = models.find(m => m.modelId === 'model_3');
  const model4 = models.find(m => m.modelId === 'model_4') || (models.length > 1 ? models[models.length - 1] : undefined);

  const comparisonColumns: ColumnDef<any>[] = [
    { header: 'Parameter / Komponen Model', accessorKey: 'param' },
    { header: 'Model 1 (Null)', accessorKey: 'm1', align: 'right' },
    { header: 'Model 2 (Siswa L1)', accessorKey: 'm2', align: 'right' },
    { header: 'Model 3 (Sekolah L2)', accessorKey: 'm3', align: 'right' },
    { header: 'Model 4 (Model Penuh)', accessorKey: 'm4', align: 'right' },
  ];

  const comparisonData: any[] = [];

  if (multilevelResult && models.length > 0) {
    const getEst = (modelObj: any, termKey: string) => {
      if (!modelObj) return '-';
      const match = (modelObj.fixedEffects || []).find((f: any) => {
        if (termKey === '(Intercept)' || termKey.includes('Intercept')) {
          return f.term === '(Intercept)' || f.term.includes('Intercept') || f.term.includes('Grand Mean');
        }
        return f.term === termKey || f.term.startsWith(termKey) || termKey.startsWith(f.term);
      });
      if (!match) return '-';
      const star = match.pValue < 0.001 ? '***' : match.pValue < 0.01 ? '**' : match.pValue < 0.05 ? '*' : '';
      return `${formatNumber(match.estimate)} (${formatNumber(match.se)})${star}`;
    };

    // 1. Fixed Effects: Intercept
    comparisonData.push({
      param: 'Intercept (γ₀₀ - Grand Mean)',
      m1: getEst(model1, '(Intercept)'),
      m2: getEst(model2, '(Intercept)'),
      m3: getEst(model3, '(Intercept)'),
      m4: getEst(model4, '(Intercept)')
    });

    // 2. Fixed Effects: Extract terms from fixedEffects list
    const allFixedTerms = (multilevelResult.fixedEffects || []).filter(f => f.term !== '(Intercept)' && !f.term.includes('Grand Mean'));
    const l1Terms = allFixedTerms.filter(f => f.level === 'Level 1 (Siswa)' || ensureArray(multilevelResult.level1Predictors).some(p => f.term.startsWith(p)));
    const l2Terms = allFixedTerms.filter(f => f.level === 'Level 2 (Sekolah)' || ensureArray(multilevelResult.level2Predictors).some(p => f.term.startsWith(p)));

    // Render Level 1 Predictor rows
    if (l1Terms.length > 0) {
      l1Terms.forEach(f => {
        comparisonData.push({
          param: `  [L1] ${f.term}`,
          m1: '-',
          m2: getEst(model2, f.term),
          m3: '-',
          m4: getEst(model4, f.term)
        });
      });
    } else if (ensureArray(multilevelResult.level1Predictors).length > 0) {
      ensureArray(multilevelResult.level1Predictors).forEach(p => {
        comparisonData.push({
          param: `  [L1] ${p}`,
          m1: '-',
          m2: getEst(model2, p),
          m3: '-',
          m4: getEst(model4, p)
        });
      });
    }

    // Render Level 2 Predictor rows
    if (l2Terms.length > 0) {
      l2Terms.forEach(f => {
        comparisonData.push({
          param: `  [L2] ${f.term}`,
          m1: '-',
          m2: '-',
          m3: getEst(model3, f.term),
          m4: getEst(model4, f.term)
        });
      });
    } else if (ensureArray(multilevelResult.level2Predictors).length > 0) {
      ensureArray(multilevelResult.level2Predictors).forEach(p => {
        comparisonData.push({
          param: `  [L2] ${p}`,
          m1: '-',
          m2: '-',
          m3: getEst(model3, p),
          m4: getEst(model4, p)
        });
      });
    }

    // 4. Random Effects Components
    comparisonData.push({
      param: 'Varians Antar-Sekolah (τ₀₀ Between)',
      m1: model1 ? formatNumber(model1.tau00, 2) : '-',
      m2: model2 ? formatNumber(model2.tau00, 2) : '-',
      m3: model3 ? formatNumber(model3.tau00, 2) : '-',
      m4: model4 ? formatNumber(model4.tau00, 2) : formatNumber(multilevelResult.tau00, 2)
    });

    comparisonData.push({
      param: 'Varians Dalam-Sekolah (σ² Within)',
      m1: model1 ? formatNumber(model1.sigma2, 2) : '-',
      m2: model2 ? formatNumber(model2.sigma2, 2) : '-',
      m3: model3 ? formatNumber(model3.sigma2, 2) : '-',
      m4: model4 ? formatNumber(model4.sigma2, 2) : formatNumber(multilevelResult.sigma2, 2)
    });

    comparisonData.push({
      param: 'Intraclass Correlation (ICC - ρ)',
      m1: model1 ? `${(model1.icc * 100).toFixed(2)}%` : `${(multilevelResult.icc * 100).toFixed(2)}%`,
      m2: model2 ? `${(model2.icc * 100).toFixed(2)}%` : '-',
      m3: model3 ? `${(model3.icc * 100).toFixed(2)}%` : '-',
      m4: model4 ? `${(model4.icc * 100).toFixed(2)}%` : '-'
    });

    comparisonData.push({
      param: 'Reduksi Varians Siswa (Level-1 R² / R²_L1)',
      m1: '-',
      m2: model2 && model2.varExplainedL1 ? `${model2.varExplainedL1.toFixed(1)}%` : '-',
      m3: '-',
      m4: multilevelResult.r2Level1 !== undefined && multilevelResult.r2Level1 !== null ? `${(multilevelResult.r2Level1 > 1 ? multilevelResult.r2Level1 : multilevelResult.r2Level1 * 100).toFixed(1)}%` : '-'
    });

    comparisonData.push({
      param: 'Reduksi Varians Sekolah (Level-2 R² / R²_L2)',
      m1: '-',
      m2: '-',
      m3: model3 && model3.varExplainedL2 ? `${model3.varExplainedL2.toFixed(1)}%` : '-',
      m4: multilevelResult.r2Level2 !== undefined && multilevelResult.r2Level2 !== null ? `${(multilevelResult.r2Level2 > 1 ? multilevelResult.r2Level2 : multilevelResult.r2Level2 * 100).toFixed(1)}%` : '-'
    });

    // 5. Model Fit Diagnostics
    comparisonData.push({
      param: 'Deviance (-2LL)',
      m1: model1 ? formatNumber(model1.deviance, 1) : '-',
      m2: model2 ? formatNumber(model2.deviance, 1) : '-',
      m3: model3 ? formatNumber(model3.deviance, 1) : '-',
      m4: model4 ? formatNumber(model4.deviance, 1) : formatNumber(multilevelResult.deviance, 1)
    });

    comparisonData.push({
      param: 'Akaike Information Criterion (AIC)',
      m1: model1 ? formatNumber(model1.aic, 1) : '-',
      m2: model2 ? formatNumber(model2.aic, 1) : '-',
      m3: model3 ? formatNumber(model3.aic, 1) : '-',
      m4: model4 ? formatNumber(model4.aic, 1) : formatNumber(multilevelResult.aic, 1)
    });

    comparisonData.push({
      param: 'Bayesian Information Criterion (BIC)',
      m1: model1 ? formatNumber(model1.bic, 1) : '-',
      m2: model2 ? formatNumber(model2.bic, 1) : '-',
      m3: model3 ? formatNumber(model3.bic, 1) : '-',
      m4: model4 ? formatNumber(model4.bic, 1) : formatNumber(multilevelResult.bic, 1)
    });

    comparisonData.push({
      param: 'Uji Peningkatan Model vs Model 1 (Δ -2LL)',
      m1: 'Model Acuan (Baseline)',
      m2: model2 && model2.devianceDiff ? `Δ = ${formatNumber(model2.devianceDiff, 1)} (p = ${formatPValue(model2.chiSqPValue || 0.001)})` : '-',
      m3: model3 && model3.devianceDiff ? `Δ = ${formatNumber(model3.devianceDiff, 1)} (p = ${formatPValue(model3.chiSqPValue || 0.001)})` : '-',
      m4: model4 && model4.devianceDiff ? `Δ = ${formatNumber(model4.devianceDiff, 1)} (p = ${formatPValue(model4.chiSqPValue || 0.001)})` : '-'
    });
  }

  // -------------------------------------------------------------
  // TABEL 2: Rincian Estimasi Koefisien Model Penuh (Full Model Parameter Table)
  // Format Tabel 1 Jurnal Panyin & Asamoah-Gyimah (2026)
  // -------------------------------------------------------------
  const fullModelColumns: ColumnDef<any>[] = [
    { header: 'Prediktor / Parameter', accessorKey: 'term' },
    { header: 'Level Variabel', accessorKey: 'level' },
    { header: 'Koefisien (β / γ)', accessorKey: 'estimate', align: 'right' },
    { header: 'Std. Error (SE)', accessorKey: 'se', align: 'right' },
    { header: 'Standar (β*)', accessorKey: 'stdBeta', align: 'right' },
    { header: '% Var. Explained', accessorKey: 'varExplained', align: 'right' },
    { header: 't-value', accessorKey: 'tValue', align: 'right' },
    { header: 'p-value', accessorKey: 'pValue', align: 'right' },
    { header: '95% CI Lower', accessorKey: 'ciLower', align: 'right' },
    { header: '95% CI Upper', accessorKey: 'ciUpper', align: 'right' },
  ];

  const fullModelData = (multilevelResult?.fixedEffects || []).map(f => ({
    term: f.term === '(Intercept)' ? 'Intercept (γ₀₀)' : f.term,
    level: f.level || (f.term.includes('Intercept') ? 'Intercept' : 'Prediktor'),
    estimate: formatNumber(f.estimate),
    se: formatNumber(f.se),
    stdBeta: f.stdBeta !== undefined && f.term !== '(Intercept)' ? formatNumber(f.stdBeta, 3) : '-',
    varExplained: f.varExplainedPct !== undefined && f.term !== '(Intercept)' ? `${f.varExplainedPct.toFixed(1)}%` : '-',
    tValue: formatNumber(f.tValue),
    pValue: formatPValue(f.pValue),
    ciLower: formatNumber(f.ciLower),
    ciUpper: formatNumber(f.ciUpper),
  }));

  // -------------------------------------------------------------
  // TABEL 3: Ranking Intercept BLUP Sekolah (Top 20)
  // -------------------------------------------------------------
  const clusterColumns: ColumnDef<any>[] = [
    { header: 'ID Sekolah (Kluster)', accessorKey: 'clusterId' },
    { header: 'Jumlah Siswa (n)', accessorKey: 'n', align: 'right' },
    { header: 'Raw Mean', accessorKey: 'rawMean', align: 'right' },
    { header: 'BLUP Empirical Bayes Intercept', accessorKey: 'blupIntercept', align: 'right' },
    { header: 'Std. Error (SE)', accessorKey: 'se', align: 'right' },
  ];

  const clusterData = (multilevelResult?.clusterEstimates || []).slice(0, 20).map(c => ({
    clusterId: c.clusterId,
    n: c.n,
    rawMean: formatNumber(c.rawMean),
    blupIntercept: formatNumber(c.blupIntercept),
    se: formatNumber(c.se)
  }));

  const rVerificationCode = RSyntaxGenerator.getMultilevelCode(
    multilevelConfig.dv,
    multilevelConfig.clusterVar,
    multilevelConfig.level1Predictors,
    multilevelConfig.level2Predictors,
    fileName || 'data_latihan_jasp_multilevel.csv'
  );

  return (
    <div className="space-y-6">
      {/* Header Banner - Ultra Clean & Professional */}
      <PageHeader
        icon={Network}
        title="Multilevel Modeling (HLM)"
        badgeIcon={CheckCircle2}
        badgeText="R Engine (lme4)"
        description="Analisis data hierarkis siswa bersarang dalam sekolah dengan estimasi 4 tahap (Null, Level 1, Level 2, Full Model) dan ICC."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetMultilevel}
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
          onClick={handleRunMultilevel}
          disabled={isCalculating || data.length === 0 || !multilevelConfig.dv || !multilevelConfig.clusterVar}
          className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer gap-2 text-xs px-4 py-2 shadow-xs font-semibold rounded-xl whitespace-nowrap h-9"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isCalculating ? 'Mengestimasi...' : 'Estimasi Multilevel'}
        </Button>
      </PageHeader>

      {/* Variable Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Konfigurasi Variabel Hierarkis (Level 1 & Level 2)</CardTitle>
          <CardDescription className="text-xs">
            Pilih Variabel Terikat (Outcome), ID Kluster Sekolah (Level 2), serta Prediktor Siswa (L1) dan Karakteristik Sekolah (L2).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VariableSelector
            columns={columns}
            slots={[
              {
                id: 'dv',
                label: 'Dependent Variable (Outcome Kontinu Y)',
                description: 'Capaian kontinu siswa (contoh: nilai_literasi atau nilai_numerasi)',
                typeFilter: 'numeric',
                selected: multilevelConfig.dv ? [multilevelConfig.dv] : [],
                onChange: (s) => setMultilevelConfig({ dv: s[0] || '' })
              },
              {
                id: 'clusterVar',
                label: 'Cluster / Grouping ID (Level 2 Unit j)',
                description: 'Kode identitas sekolah/kluster (contoh: kd_sekolah)',
                typeFilter: 'nominal',
                selected: multilevelConfig.clusterVar ? [multilevelConfig.clusterVar] : [],
                onChange: (s) => setMultilevelConfig({ clusterVar: s[0] || '' })
              },
              {
                id: 'level1Predictors',
                label: 'Level 1 Predictors (Karakteristik Siswa X_ij)',
                description: 'Variabel tingkat siswa (contoh: ses_siswa, jenis_kelamin)',
                typeFilter: 'all',
                multi: true,
                selected: multilevelConfig.level1Predictors,
                onChange: (s) => setMultilevelConfig({ level1Predictors: s })
              },
              {
                id: 'level2Predictors',
                label: 'Level 2 Predictors (Karakteristik Sekolah W_j)',
                description: 'Variabel tingkat sekolah/guru (contoh: guru_iklim_kelas, guru_fokus_akademik, status_sekolah)',
                typeFilter: 'all',
                multi: true,
                selected: multilevelConfig.level2Predictors,
                onChange: (s) => setMultilevelConfig({ level2Predictors: s })
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {/* Output Sub-Tabs */}
      <Tabs value={activeOutputTab} onValueChange={setActiveOutputTab}>
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 p-1">
            <TabsTrigger value="tables">Tabel Hasil & Caterpillar Plot</TabsTrigger>
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

        {/* Tab 1: Tables and Caterpillar Plot */}
        <TabsContent value="tables" className="space-y-6 mt-4">
          {multilevelResult ? (
            <div className="space-y-6">
              {/* Model Summary KPI Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-[#008080]/30 dark:border-[#14a3a3]/30 bg-gradient-to-br from-[#e6f2f2]/60 to-white dark:from-[#14312f]/40 dark:to-[#101c1c] shadow-xs">
                  <p className="text-[11px] font-medium text-[#0a6a6a] dark:text-[#7fdcdc]">
                    Intraclass Correlation (ICC - ρ)
                  </p>
                  <p className="text-2xl font-extrabold text-[#008080] dark:text-[#14a3a3] font-mono mt-1">
                    {(multilevelResult.icc * 100).toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {multilevelResult.pctBetweenVariance.toFixed(1)}% variasi di level sekolah vs {multilevelResult.pctWithinVariance.toFixed(1)}% di level siswa
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                  <p className="text-[11px] font-medium text-zinc-500">
                    Varians Antar-Sekolah (τ₀₀ Between)
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1">
                    {formatNumber(multilevelResult.tau00, 2)}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Reliabilitas Sekolah λ = {formatNumber(multilevelResult.schoolReliability || 0.95, 3)}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                  <p className="text-[11px] font-medium text-zinc-500">
                    Varians Siswa (σ² Within)
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1">
                    {formatNumber(multilevelResult.sigma2, 2)}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Total Varians = {formatNumber(multilevelResult.totalVariance, 2)}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
                  <p className="text-[11px] font-medium text-zinc-500">
                    Kesesuaian Model Fit
                  </p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono mt-1">
                    AIC: {formatNumber(multilevelResult.aic, 1)}
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                    Deviance (-2LL) = {formatNumber(multilevelResult.deviance, 1)}
                  </p>
                </div>
              </div>

              {/* Caterpillar Forest Plot for School Intercepts */}
              {multilevelResult.clusterEstimates && (
                <CaterpillarPlot
                  clusterEstimates={multilevelResult.clusterEstimates}
                  overallMean={multilevelResult.grandMean || 50}
                />
              )}

              {/* TABEL 1: Perbandingan Model Multilevel Berjenjang (Model 1 vs Model 2 vs Model 3 vs Model 4) */}
              <DataTableHasil
                title={`Tabel 1. Perbandingan Model Multilevel Berjenjang (Incremental Model Building: Model 1 s.d. Model 4)`}
                subtitle="Perbandingan estimasi parameter fixed effects b (SE), reduksi varians (R²_L1 & R²_L2), serta uji peningkatan kecocokan model (Δ -2LL)."
                columns={comparisonColumns}
                data={comparisonData}
                notes="Catatan: * p < .05, ** p < .01, *** p < .001. Angka di dalam tanda kurung adalah Standard Error (SE). Model 1 = Null Model; Model 2 = Student Predictors; Model 3 = School Predictors; Model 4 = Full Model."
              />

              {/* TABEL 2: Rincian Estimasi Koefisien Model Penuh (Full Model Parameter Estimates) */}
              <DataTableHasil
                title={`Tabel 2. Rincian Estimasi Koefisien Model Penuh (Full Multilevel Model Parameter Estimates)`}
                subtitle="Estimasi koefisien unstandardized (b), standardized (β*), kontribusi % varians terjelaskan unik per variabel, nilai t, p, dan 95% CI."
                columns={fullModelColumns}
                data={fullModelData}
                notes="Catatan: Level 1 (Siswa) merujuk pada prediktor tingkat individu; Level 2 (Sekolah) merujuk pada karakteristik lingkungan/sekolah."
              />

              {/* TABEL 3: Ranking Intercept Efek Acak Sekolah (Top 20 BLUP Estimates) */}
              {clusterData.length > 0 && (
                <DataTableHasil
                  title={`Tabel 3. Ranking Intercept Efek Acak Sekolah (Top 20 BLUP Empirical Bayes dari ${multilevelResult.nClusters} Sekolah)`}
                  subtitle="Nilai estimasi empiris rata-rata performa sekolah setelah penyusutan (shrinkage correction)"
                  columns={clusterColumns}
                  data={clusterData}
                />
              )}

              {/* AI Narrative Card */}
              <AiCard
                analysisKey={`multilevel_${multilevelResult.dv}_${multilevelResult.clusterVar}`}
                defaultNarrative={generateLocalMultilevelNarrative(multilevelResult)}
                promptBuilder={() => `
Tolong buatkan narasi laporan penelitian akademik berstandar APA 7th dalam Bahasa Indonesia untuk hasil Multilevel Model (HLM) menggunakan engine R (lme4) berikut:
- Outcome L1: ${multilevelResult.dv}
- Cluster L2: ${multilevelResult.clusterVar} (${multilevelResult.nClusters} sekolah, ${multilevelResult.nObservations} siswa)
- Intraclass Correlation Coefficient (ICC): ${(multilevelResult.icc * 100).toFixed(2)}% (${multilevelResult.pctBetweenVariance.toFixed(1)}% antar sekolah, ${multilevelResult.pctWithinVariance.toFixed(1)}% dalam sekolah)
- Varians Sekolah (tau00): ${formatNumber(multilevelResult.tau00, 2)}
- Varians Siswa (sigma2): ${formatNumber(multilevelResult.sigma2, 2)}
- Reliabilitas Sekolah: lambda = ${formatNumber(multilevelResult.schoolReliability || 0.95, 3)}
- Fixed Effects:
${(multilevelResult.fixedEffects || []).map(f => `  * ${f.term} (${f.level}): B = ${formatNumber(f.estimate)}, SE = ${formatNumber(f.se)}, t = ${formatNumber(f.tValue)}, p = ${formatPValue(f.pValue)}`).join('\n')}
- Model Fit: AIC = ${formatNumber(multilevelResult.aic, 1)}, Deviance = ${formatNumber(multilevelResult.deviance, 1)}
                `.trim()}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              Klik &apos;Estimasi Model Multilevel&apos; di atas untuk menampilkan hasil tabel APA standar jurnal dan Caterpillar plot.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Statistical Assumption Checks */}
        <TabsContent value="assumptions" className="space-y-6 mt-4">
          <AssumptionCard
            title="Pemeriksaan Asumsi Diagnostik Multilevel Modeling (HLM)"
            subtitle="Evaluasi asumsi kecukupan hierarki (ICC), normalitas residual Level 1, normalitas random effects Level 2, multikolinearitas VIF, dan homoskedastisitas."
            assumptions={multilevelResult?.assumptions || []}
          />
        </TabsContent>

        {/* Tab 3: R Console Terminal Output */}
        <TabsContent value="r_console" className="mt-4">
          <RConsoleBlock
            title="Output Konsol R - Multilevel HLM (Raw Text Output)"
            description="Keluaran teks mentah resmi dari eksekusi fungsi lme4::lmer dan summary() di sesi R."
            consoleOutput={multilevelResult?.rConsoleOutput}
          />
        </TabsContent>

        {/* Tab 4: R Verification Code */}
        <TabsContent value="r_code" className="mt-4">
          <RCodeBlock
            title="Sintaks Verifikasi Multilevel Modeling (HLM) dengan lme4 di R"
            description="Salin kode ini ke RStudio untuk memverifikasi nilai ICC, tau00, sigma2, Fixed Effects, dan BLUPs acak sekolah."
            code={rVerificationCode}
            packages={['lme4', 'lmerTest', 'performance']}
            fileName="verifikasi_multilevel_lme4.R"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
