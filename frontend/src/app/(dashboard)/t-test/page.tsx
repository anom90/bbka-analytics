'use client';

import * as React from 'react';
import { Binary, Play, Code2, CheckCircle2, Terminal, ShieldCheck, Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { VariableSelector } from '@/components/common/variable-selector';
import { DataTableHasil, ColumnDef } from '@/components/common/data-table-hasil';
import { GroupMeanChart } from '@/components/common/group-mean-chart';
import { AssumptionCard } from '@/components/common/assumption-card';
import { AiCard } from '@/components/common/ai-card';
import { RCodeBlock } from '@/components/common/r-code-block';
import { RConsoleBlock } from '@/components/common/r-console-block';
import { PageHeader } from '@/components/common/page-header';
import { useDatasetStore } from '@/stores/dataset-store';
import { useAnalysisStore } from '@/stores/analysis-store';
import { formatNumber, formatPValue, cn } from '@/lib/utils';
import { generateLocalTTestNarrative } from '@/lib/gemini';
import { RSyntaxGenerator } from '@/lib/stats/r-syntax';
import { TTestType } from '@/lib/types';

export default function TTestPage() {
  const { data, columns, fileName, loadDefaultDataset } = useDatasetStore();
  const {
    tTestConfig,
    setTTestConfig,
    executeTTest,
    tTestResult,
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
    if (data.length === 0 && !fileName) {
      loadDefaultDataset();
    }
  }, []);

  const handleResetTTest = () => {
    clearSpecificAnalysis('ttest');
  };

  // Reactive Debounce Auto-Run (JASP Mode)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (tTestResult) return;
    }

    if (!autoRun || data.length === 0) return;
    const isReady =
      (tTestConfig.type === 'independent' && tTestConfig.dv && tTestConfig.groupVar) ||
      (tTestConfig.type === 'paired' && tTestConfig.dv && tTestConfig.pairedVar2) ||
      (tTestConfig.type === 'one_sample' && tTestConfig.dv);

    if (!isReady) return;

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setIsDebouncing(false);
      executeTTest(data);
    }, 400);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [
    autoRun,
    data,
    tTestConfig.type,
    tTestConfig.dv,
    tTestConfig.groupVar,
    tTestConfig.pairedVar2,
    tTestConfig.testValue
  ]);

  const handleTypeChange = (type: string) => {
    setTTestConfig({ type: type as TTestType });
  };

  const handleRunTest = () => {
    if (data.length > 0) {
      executeTTest(data);
    }
  };

  // Define APA Main Result Table columns
  const mainColumns: ColumnDef<any>[] = [
    { header: 'Uji Statistik', accessorKey: 'testName' },
    { header: 'Statistik t', accessorKey: 'tStat', align: 'right' },
    { header: 'df', accessorKey: 'df', align: 'right' },
    { header: 'p-value', accessorKey: 'pValue', align: 'right' },
    { header: 'Mean Diff (Δ)', accessorKey: 'meanDiff', align: 'right' },
    { header: 'SE Diff', accessorKey: 'seDiff', align: 'right' },
    { header: '95% CI Lower', accessorKey: 'ciLower', align: 'right' },
    { header: '95% CI Upper', accessorKey: 'ciUpper', align: 'right' },
    { header: "Cohen's d", accessorKey: 'cohensD', align: 'right' },
  ];

  const mainData = tTestResult ? [
    {
      testName: "Student's t (Equal var)",
      tStat: formatNumber(tTestResult.statistic),
      df: tTestResult.df,
      pValue: formatPValue(tTestResult.pValue),
      meanDiff: formatNumber(tTestResult.meanDiff),
      seDiff: formatNumber(tTestResult.stdErrorDiff),
      ciLower: formatNumber(tTestResult.ciLower),
      ciUpper: formatNumber(tTestResult.ciUpper),
      cohensD: formatNumber(tTestResult.cohensD)
    },
    ...(tTestResult.welchStatistic !== undefined ? [{
      testName: "Welch's t (Unequal var)",
      tStat: formatNumber(tTestResult.welchStatistic),
      df: formatNumber(tTestResult.welchDf, 1),
      pValue: formatPValue(tTestResult.welchPValue),
      meanDiff: formatNumber(tTestResult.meanDiff),
      seDiff: formatNumber(tTestResult.stdErrorDiff),
      ciLower: formatNumber(tTestResult.ciLower),
      ciUpper: formatNumber(tTestResult.ciUpper),
      cohensD: formatNumber(tTestResult.cohensD)
    }] : [])
  ] : [];

  // Descriptives table columns
  const descColumns: ColumnDef<any>[] = [
    { header: 'Kelompok', accessorKey: 'group' },
    { header: 'N', accessorKey: 'n', align: 'right' },
    { header: 'Mean (M)', accessorKey: 'mean', align: 'right' },
    { header: 'Std. Dev (SD)', accessorKey: 'sd', align: 'right' },
    { header: 'Std. Error (SE)', accessorKey: 'se', align: 'right' },
    { header: 'Median', accessorKey: 'median', align: 'right' },
  ];

  const descData = tTestResult?.descriptives?.map(d => ({
    group: d.group,
    n: d.n,
    mean: formatNumber(d.mean),
    sd: formatNumber(d.sd),
    se: formatNumber(d.se),
    median: formatNumber(d.median)
  })) || [];

  const rVerificationCode = RSyntaxGenerator.getTTestCode(
    tTestConfig.type,
    tTestConfig.dv,
    tTestConfig.groupVar,
    tTestConfig.testValue,
    tTestConfig.pairedVar2,
    fileName || 'data_latihan_jasp_multilevel.csv'
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={Binary}
        title="Uji-t (Independent & Paired t-Test)"
        badgeIcon={CheckCircle2}
        badgeText="R Engine (stats::t.test)"
        description="Bandingkan rata-rata capaian kelompok sampel independen, berpasangan, atau satu sampel dengan estimasi Cohen's d."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetTTest}
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
          onClick={handleRunTest}
          disabled={isCalculating || data.length === 0}
          className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer gap-2 text-xs px-4 py-2 shadow-xs font-semibold rounded-xl whitespace-nowrap h-9"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Jalankan Uji-t
        </Button>
      </PageHeader>

      {/* Tabs Type Selection */}
      <Tabs value={tTestConfig.type} onValueChange={handleTypeChange}>
        <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 p-1">
          <TabsTrigger value="independent">Independent Samples t-Test</TabsTrigger>
          <TabsTrigger value="paired">Paired Samples t-Test</TabsTrigger>
          <TabsTrigger value="one_sample">One-Sample t-Test</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Konfigurasi Variabel Uji</CardTitle>
              <CardDescription className="text-xs">
                Pilih variabel dependen berskala numerik dan variabel pengelompokan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tTestConfig.type === 'independent' && (
                <VariableSelector
                  columns={columns}
                  slots={[
                    {
                      id: 'dv',
                      label: 'Dependent Variable (Variabel Terikat)',
                      description: 'Variabel hasil/skor (contoh: nilai_literasi, nilai_numerasi)',
                      typeFilter: 'numeric',
                      selected: tTestConfig.dv ? [tTestConfig.dv] : [],
                      onChange: (s) => setTTestConfig({ dv: s[0] || '' })
                    },
                    {
                      id: 'groupVar',
                      label: 'Grouping Variable (Faktor / 2 Kelompok)',
                      description: 'Variabel kategori 2 grup (contoh: jenis_kelamin [L/P], status_sekolah [N/S])',
                      typeFilter: 'nominal',
                      selected: tTestConfig.groupVar ? [tTestConfig.groupVar] : [],
                      onChange: (s) => setTTestConfig({ groupVar: s[0] || '' })
                    }
                  ]}
                />
              )}

              {tTestConfig.type === 'paired' && (
                <VariableSelector
                  columns={columns}
                  slots={[
                    {
                      id: 'dv',
                      label: 'Pengukuran 1 (Variable 1)',
                      description: 'Contoh: nilai_literasi',
                      typeFilter: 'numeric',
                      selected: tTestConfig.dv ? [tTestConfig.dv] : [],
                      onChange: (s) => setTTestConfig({ dv: s[0] || '' })
                    },
                    {
                      id: 'pairedVar2',
                      label: 'Pengukuran 2 (Variable 2)',
                      description: 'Contoh: nilai_numerasi',
                      typeFilter: 'numeric',
                      selected: tTestConfig.pairedVar2 ? [tTestConfig.pairedVar2] : [],
                      onChange: (s) => setTTestConfig({ pairedVar2: s[0] || '' })
                    }
                  ]}
                />
              )}

              {tTestConfig.type === 'one_sample' && (
                <div className="space-y-4">
                  <VariableSelector
                    columns={columns}
                    slots={[
                      {
                        id: 'dv',
                        label: 'Test Variable (Variabel Terikat)',
                        description: 'Variabel numerik yang akan dibandingkan dengan patokan',
                        typeFilter: 'numeric',
                        selected: tTestConfig.dv ? [tTestConfig.dv] : [],
                        onChange: (s) => setTTestConfig({ dv: s[0] || '' })
                      }
                    ]}
                  />
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 w-72">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Nilai Uji Acuan (μ₀):
                    </span>
                    <Input
                      type="number"
                      value={tTestConfig.testValue}
                      onChange={(e) => setTTestConfig({ testValue: Number(e.target.value) })}
                      className="w-24 h-8 text-xs bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>

      {/* Error notification */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      {/* Output Sub-Tabs (Tabel Hasil APA vs Sintaks R) */}
      <Tabs value={activeOutputTab} onValueChange={setActiveOutputTab}>
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 p-1">
            <TabsTrigger value="tables">Tabel Hasil & Grafik</TabsTrigger>
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

        {/* Tab 1: Tables and Visual Chart */}
        <TabsContent value="tables" className="space-y-6 mt-4">
          {tTestResult ? (
            <div className="space-y-6">
              {/* Group Mean Chart with Error Bars */}
              <GroupMeanChart
                dvName={tTestResult.dv}
                title={`Perbandingan Rata-rata ${tTestResult.dv} Antar Kelompok (95% CI)`}
                data={tTestResult.descriptives}
              />

              {/* APA Main Table */}
              <DataTableHasil
                title={`Tabel 1. Hasil Uji-t Perbandingan ${tTestResult.dv}`}
                subtitle={
                  tTestResult.type === 'independent'
                    ? `Perbandingan antara kelompok ${tTestResult.group1} dan ${tTestResult.group2}`
                    : tTestResult.type === 'paired'
                    ? `Perbandingan berpasangan antara ${tTestResult.group1} dan ${tTestResult.group2}`
                    : `Perbandingan terhadap nilai acuan μ₀ = ${tTestResult.testValue}`
                }
                columns={mainColumns}
                data={mainData}
                notes="Catatan: * p < .05, ** p < .01, *** p < .001. Nilai d adalah estimasi ukuran pengaruh Cohen's d."
              />

              {/* Levene's Test Callout if Independent */}
              {tTestResult.leveneF !== undefined && (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Uji Homogenitas Varians (Levene&apos;s Test):
                    </span>{' '}
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      F(1, {tTestResult.df}) = {formatNumber(tTestResult.leveneF)}, p = {formatPValue(tTestResult.leveneP)}
                    </span>
                  </div>
                  <Badge
                    variant={tTestResult.leveneP! >= 0.05 ? 'success' : 'warning'}
                    className="text-[11px]"
                  >
                    {tTestResult.leveneP! >= 0.05 ? 'Varians Homogen (Gunakan Student t)' : 'Varians Heterogen (Gunakan Welch t)'}
                  </Badge>
                </div>
              )}

              {/* Descriptives Table */}
              <DataTableHasil
                title="Tabel 2. Statistik Deskriptif per Kelompok"
                columns={descColumns}
                data={descData}
              />

              {/* AI Narrative Synthesis Card */}
              <AiCard
                analysisKey={`ttest_${tTestResult.dv}_${tTestResult.groupVar || ''}`}
                defaultNarrative={generateLocalTTestNarrative(tTestResult)}
                promptBuilder={() => `
Tolong buatkan narasi laporan penelitian akademik berstandar APA 7th dalam Bahasa Indonesia untuk hasil Independent t-test berikut:
- Variabel Terikat: ${tTestResult.dv}
- Variabel Grup: ${tTestResult.groupVar} (${tTestResult.group1} vs ${tTestResult.group2})
- Student's t: t(${tTestResult.df}) = ${formatNumber(tTestResult.statistic)}, p = ${formatPValue(tTestResult.pValue)}
- Welch's t: t(${formatNumber(tTestResult.welchDf, 1)}) = ${formatNumber(tTestResult.welchStatistic)}, p = ${formatPValue(tTestResult.welchPValue)}
- Mean Difference: ${formatNumber(tTestResult.meanDiff)} [95% CI: ${formatNumber(tTestResult.ciLower)}, ${formatNumber(tTestResult.ciUpper)}]
- Cohen's d: ${formatNumber(tTestResult.cohensD)}
- Deskriptif Kelompok:
  * ${tTestResult.descriptives[0].group}: M = ${formatNumber(tTestResult.descriptives[0].mean)}, SD = ${formatNumber(tTestResult.descriptives[0].sd)}, N = ${tTestResult.descriptives[0].n}
  * ${tTestResult.descriptives[1].group}: M = ${formatNumber(tTestResult.descriptives[1].mean)}, SD = ${formatNumber(tTestResult.descriptives[1].sd)}, N = ${tTestResult.descriptives[1].n}
                `.trim()}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              Klik &apos;Jalankan Uji-t&apos; di atas untuk menampilkan hasil tabel APA dan visualisasi.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Statistical Assumption Checks */}
        <TabsContent value="assumptions" className="space-y-6 mt-4">
          <AssumptionCard
            title="Pemeriksaan Asumsi Parametrik Uji-t"
            subtitle="Pemeriksaan normalitas data dan homogenitas varians untuk menentukan validitas penggunaan Student's t vs Welch's t."
            assumptions={tTestResult?.assumptions || []}
          />
        </TabsContent>

        {/* Tab 3: R Console Terminal Output */}
        <TabsContent value="r_console" className="mt-4">
          <RConsoleBlock
            title="Output Konsol R - Uji-t (Raw Text Output)"
            description="Keluaran teks mentah resmi dari eksekusi fungsi stats::t.test di sesi R."
            consoleOutput={tTestResult?.rConsoleOutput}
          />
        </TabsContent>

        {/* Tab 3: R Verification Code */}
        <TabsContent value="r_code" className="mt-4">
          <RCodeBlock
            title="Sintaks Verifikasi Uji-t di R"
            description="Salin kode ini dan jalankan di RStudio untuk mencocokkan nilai t, df, p-value, dan Cohen's d."
            code={rVerificationCode}
            packages={['rstatix', 'car', 'dplyr']}
            fileName="verifikasi_ttest.R"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
