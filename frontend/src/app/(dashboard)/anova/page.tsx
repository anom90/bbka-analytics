'use client';

import * as React from 'react';
import { GitGraph, Play, Code2, CheckCircle2, Terminal, ShieldCheck, Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { VariableSelector } from '@/components/common/variable-selector';
import { DataTableHasil, ColumnDef } from '@/components/common/data-table-hasil';
import { GroupMeanChart } from '@/components/common/group-mean-chart';
import { InteractionPlot } from '@/components/common/interaction-plot';
import { AssumptionCard } from '@/components/common/assumption-card';
import { AiCard } from '@/components/common/ai-card';
import { RCodeBlock } from '@/components/common/r-code-block';
import { RConsoleBlock } from '@/components/common/r-console-block';
import { PageHeader } from '@/components/common/page-header';
import { useDatasetStore } from '@/stores/dataset-store';
import { useAnalysisStore } from '@/stores/analysis-store';
import { formatNumber, formatPValue, ensureArray, cn } from '@/lib/utils';
import { generateLocalAnovaNarrative } from '@/lib/gemini';
import { RSyntaxGenerator } from '@/lib/stats/r-syntax';

export default function AnovaPage() {
  const { data, columns, fileName, loadDefaultDataset } = useDatasetStore();
  const {
    anovaConfig,
    setAnovaConfig,
    executeAnova,
    anovaResult,
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

  const handleResetAnova = () => {
    clearSpecificAnalysis('anova');
  };

  // Reactive Debounce Auto-Run (JASP Mode)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (anovaResult) return;
    }

    const factors = ensureArray(anovaConfig.factors);
    if (!autoRun || data.length === 0 || !anovaConfig.dv || factors.length === 0) return;

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setIsDebouncing(false);
      executeAnova(data);
    }, 450);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [autoRun, data, anovaConfig.dv, anovaConfig.factors]);

  const handleRunAnova = () => {
    if (data.length > 0) {
      executeAnova(data);
    }
  };

  // ANOVA Table Columns
  const anovaColumns: ColumnDef<any>[] = [
    { header: 'Sumber Variasi (Source)', accessorKey: 'source' },
    { header: 'Sum of Squares (SS)', accessorKey: 'ss', align: 'right' },
    { header: 'df', accessorKey: 'df', align: 'right' },
    { header: 'Mean Square (MS)', accessorKey: 'ms', align: 'right' },
    { header: 'F', accessorKey: 'f', align: 'right' },
    { header: 'p-value', accessorKey: 'pValue', align: 'right' },
    { header: 'Partial η²', accessorKey: 'partialEtaSq', align: 'right' },
  ];

  const anovaData = (anovaResult?.table || []).map(r => ({
    source: r.source || 'Faktor',
    ss: formatNumber(r.ss),
    df: r.df ?? '-',
    ms: formatNumber(r.ms),
    f: isNaN(Number(r.f)) ? '-' : formatNumber(r.f),
    pValue: isNaN(Number(r.pValue)) ? '-' : formatPValue(r.pValue),
    partialEtaSq: r.partialEtaSquared !== undefined && !isNaN(Number(r.partialEtaSquared)) ? formatNumber(r.partialEtaSquared) : '-'
  }));

  // Descriptives Columns
  const descColumns: ColumnDef<any>[] = [
    { header: 'Kelompok / Sel', accessorKey: 'label' },
    { header: 'N', accessorKey: 'n', align: 'right' },
    { header: 'Mean (M)', accessorKey: 'mean', align: 'right' },
    { header: 'Std. Dev (SD)', accessorKey: 'sd', align: 'right' },
    { header: 'Std. Error (SE)', accessorKey: 'se', align: 'right' },
  ];

  const descData = (anovaResult?.descriptives || []).map(d => ({
    label: d.label || 'Kelompok',
    n: d.n ?? 0,
    mean: formatNumber(d.mean),
    sd: formatNumber(d.sd),
    se: formatNumber(d.se)
  }));

  // Post-Hoc Columns
  const postHocColumns: ColumnDef<any>[] = [
    { header: 'Perbandingan Kelompok', accessorKey: 'comparison' },
    { header: 'Mean Diff (ΔM)', accessorKey: 'meanDiff', align: 'right' },
    { header: 'SE', accessorKey: 'se', align: 'right' },
    { header: 'Tukey q', accessorKey: 'qValue', align: 'right' },
    { header: 'p-value', accessorKey: 'pValue', align: 'right' },
    { header: '95% CI Lower', accessorKey: 'ciLower', align: 'right' },
    { header: '95% CI Upper', accessorKey: 'ciUpper', align: 'right' },
  ];

  const safeFactors = ensureArray(anovaResult?.factors);
  const factorA = safeFactors[0] || 'Faktor A';
  const factorB = safeFactors[1] || 'Faktor B';
  const hasMultipleFactors = safeFactors.length >= 2;
  const isTwoWay = anovaResult?.type === 'two_way' && hasMultipleFactors;

  // Verify if interaction plot can be safely rendered
  const canRenderInteractionPlot =
    isTwoWay &&
    (anovaResult?.descriptives || []).some(
      d => d?.cells?.[factorA] !== undefined && d?.cells?.[factorB] !== undefined
    );

  const rVerificationCode = RSyntaxGenerator.getAnovaCode(
    anovaConfig.dv,
    ensureArray(anovaConfig.factors),
    fileName || 'data_latihan_jasp_multilevel.csv'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={GitGraph}
        title="ANOVA Faktorial (One-Way & Two-Way)"
        badgeIcon={CheckCircle2}
        badgeText="R Engine (stats::aov)"
        description="Uji perbandingan rata-rata multi-kelompok (One-Way) atau pengaruh interaksi dua faktor (Two-Way) dengan estimasi ukuran pengaruh η²."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetAnova}
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
          onClick={handleRunAnova}
          disabled={isCalculating || data.length === 0 || ensureArray(anovaConfig.factors).length === 0}
          className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer gap-2 text-xs px-4 py-2 shadow-xs font-semibold rounded-xl whitespace-nowrap h-9"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isCalculating ? 'Menghitung ANOVA...' : 'Jalankan ANOVA'}
        </Button>
      </PageHeader>

      {/* Variable Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Konfigurasi Variabel ANOVA</CardTitle>
          <CardDescription className="text-xs">
            Pilih 1 variabel dependen numerik dan 1 atau 2 faktor independen (kategori).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VariableSelector
            columns={columns}
            slots={[
              {
                id: 'dv',
                label: 'Dependent Variable (Variabel Terikat)',
                description: 'Variabel hasil numerik (contoh: nilai_literasi atau nilai_numerasi)',
                typeFilter: 'numeric',
                selected: anovaConfig.dv ? [anovaConfig.dv] : [],
                onChange: (s) => setAnovaConfig({ dv: s[0] || '' })
              },
              {
                id: 'factors',
                label: 'Fixed Factors (Faktor Bebas)',
                description: 'Faktor kategori (1 faktor = One-Way, 2 faktor = Two-Way Faktorial)',
                typeFilter: 'nominal',
                multi: true,
                selected: anovaConfig.factors,
                onChange: (s) => setAnovaConfig({ factors: s.slice(0, 2) })
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

        {/* Tab 1: Tables, Charts and APA Narrative */}
        <TabsContent value="tables" className="space-y-6 mt-4">
          {anovaResult ? (
            <div className="space-y-6">
              {/* Factorial Interaction Plot or Group Mean Chart */}
              {canRenderInteractionPlot ? (
                <InteractionPlot
                  dvName={anovaResult.dv}
                  factorAName={factorA}
                  factorBName={factorB}
                  descriptives={anovaResult.descriptives || []}
                />
              ) : (
                <GroupMeanChart
                  dvName={anovaResult.dv}
                  title={`Perbandingan Rata-rata ${anovaResult.dv} Antar Kelompok ${factorA}`}
                  data={(anovaResult.descriptives || []).map(d => ({
                    group: d.label || 'Kelompok',
                    mean: d.mean,
                    sd: d.sd,
                    se: d.se,
                    n: d.n
                  }))}
                />
              )}

              {/* Main ANOVA Table */}
              <DataTableHasil
                title={`Tabel 1. Tabel ANOVA untuk ${anovaResult.dv} berdasarkan ${safeFactors.join(' × ')}`}
                columns={anovaColumns}
                data={anovaData}
                notes="Catatan: * p < .05, ** p < .01, *** p < .001. Partial η² menunjukkan proporsi variasi yang dijelaskan oleh masing-masing efek."
              />

              {/* Descriptives Table */}
              <DataTableHasil
                title="Tabel 2. Statistik Deskriptif per Kelompok Faktor"
                columns={descColumns}
                data={descData}
              />

              {/* Post-Hoc Tukey HSD Table if One-Way */}
              {anovaResult.postHoc && typeof anovaResult.postHoc === 'object' && !Array.isArray(anovaResult.postHoc) && Object.keys(anovaResult.postHoc).length > 0 && (
                <div className="space-y-4">
                  {Object.entries(anovaResult.postHoc).map(([factorName, comps]) => {
                    const compsList = Array.isArray(comps) ? comps : typeof comps === 'object' && comps !== null ? Object.values(comps) : [];
                    if (compsList.length === 0) return null;

                    return (
                      <DataTableHasil
                        key={factorName}
                        title={`Tabel 3. Uji Lanjut Post-Hoc Tukey HSD (${factorName})`}
                        columns={postHocColumns}
                        data={compsList.map((c: any) => ({
                          comparison: c.comparison || 'Perbandingan',
                          meanDiff: formatNumber(c.meanDiff),
                          se: formatNumber(c.se),
                          qValue: formatNumber(c.qValue),
                          pValue: formatPValue(c.pValue),
                          ciLower: formatNumber(c.ciLower),
                          ciUpper: formatNumber(c.ciUpper)
                        }))}
                        notes="Catatan: Membandingkan semua kombinasi pasangan kelompok dengan mengontrol laju kesalahan tipe I."
                      />
                    );
                  })}
                </div>
              )}

              {/* AI Narrative Card */}
              <AiCard
                analysisKey={`anova_${anovaResult.dv}_${safeFactors.join('_')}`}
                defaultNarrative={generateLocalAnovaNarrative(anovaResult)}
                promptBuilder={() => `
Tolong buatkan narasi laporan penelitian akademik berstandar APA 7th dalam Bahasa Indonesia untuk hasil ${isTwoWay ? 'Two-Way Factorial' : 'One-Way'} ANOVA berikut:
- Variabel Terikat: ${anovaResult.dv}
- Faktor: ${safeFactors.join(' & ')}
- Hasil Tabel ANOVA:
${(anovaResult.table || []).map(r => `  * ${r.source}: F(${r.df}) = ${formatNumber(r.f)}, p = ${formatPValue(r.pValue)}, partial eta2 = ${formatNumber(r.partialEtaSquared)}`).join('\n')}
                `.trim()}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              Klik &apos;Jalankan ANOVA&apos; di atas untuk menampilkan hasil tabel APA dan grafik interaksi.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Statistical Assumption Checks */}
        <TabsContent value="assumptions" className="space-y-6 mt-4">
          <AssumptionCard
            title="Pemeriksaan Asumsi ANOVA"
            subtitle="Pemeriksaan normalitas residual model dan homogenitas varians (Levene's test) antar kelompok faktor."
            assumptions={anovaResult?.assumptions || []}
          />
        </TabsContent>

        {/* Tab 3: R Console Terminal Output */}
        <TabsContent value="r_console" className="mt-4">
          <RConsoleBlock
            title="Output Konsol R - ANOVA (Raw Text Output)"
            description="Keluaran teks mentah resmi dari eksekusi fungsi stats::aov dan summary() di sesi R."
            consoleOutput={anovaResult?.rConsoleOutput}
          />
        </TabsContent>

        {/* Tab 3: R Verification Code */}
        <TabsContent value="r_code" className="mt-4">
          <RCodeBlock
            title="Sintaks Verifikasi ANOVA di R"
            description="Salin kode ini ke RStudio untuk memverifikasi nilai F, df, p-value, eta-squared, dan Tukey HSD."
            code={rVerificationCode}
            packages={['car', 'effectsize']}
            fileName="verifikasi_anova.R"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
