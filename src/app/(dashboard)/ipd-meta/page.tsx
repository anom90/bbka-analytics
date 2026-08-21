'use client';

import * as React from 'react';
import {
  Scale,
  Play,
  Code2,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Zap,
  Info,
  BarChart2,
  Table,
  Layers,
  Check,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { VariableSelector } from '@/components/common/variable-selector';
import { DataTableHasil, ColumnDef } from '@/components/common/data-table-hasil';
import { AssumptionCard } from '@/components/common/assumption-card';
import { AiCard } from '@/components/common/ai-card';
import { RCodeBlock } from '@/components/common/r-code-block';
import { RConsoleBlock } from '@/components/common/r-console-block';
import { ForestPlot } from '@/components/common/forest-plot';
import { PageHeader } from '@/components/common/page-header';
import { useDatasetStore } from '@/stores/dataset-store';
import { useAnalysisStore } from '@/stores/analysis-store';
import { formatNumber, formatPValue, cn } from '@/lib/utils';
import { RSyntaxGenerator } from '@/lib/stats/r-syntax';
import { getVariableDescription } from '@/constants/an-codebook';

export default function IPDMetaPage() {
  const { data, columns, fileName, loadDefaultDataset } = useDatasetStore();
  const {
    ipdMetaConfig,
    setIPDMetaConfig,
    executeIPDMeta,
    ipdMetaResult,
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

  const handleResetIPD = () => {
    clearSpecificAnalysis('ipd_meta');
  };

  // Synchronize default variables when dataset columns load/change
  React.useEffect(() => {
    if (columns.length > 0) {
      const colNames = columns.map(c => c.name);
      const numericCols = columns.filter(c => c.type === 'numeric').map(c => c.name);
      const categoricalCols = columns.filter(c => c.type !== 'numeric').map(c => c.name);

      const nextDv = colNames.includes(ipdMetaConfig.dv)
        ? ipdMetaConfig.dv
        : numericCols.find(c => c.includes('LIT') || c.includes('nilai_literasi') || c.includes('skor_')) || numericCols[0] || '';

      const nextFocal = (colNames.includes(ipdMetaConfig.focalPredictor) && ipdMetaConfig.focalPredictor !== nextDv)
        ? ipdMetaConfig.focalPredictor
        : numericCols.find(c => c !== nextDv && (c.includes('AKC') || c.includes('guru_') || c.includes('iklim') || c.includes('ks_'))) || numericCols.find(c => c !== nextDv) || '';

      const nextCluster = (colNames.includes(ipdMetaConfig.clusterVar) && ipdMetaConfig.clusterVar !== nextDv && ipdMetaConfig.clusterVar !== nextFocal)
        ? ipdMetaConfig.clusterVar
        : colNames.find(c => ['kd_kokab', 'provinsi', 'status_wilayah', 'kabupaten', 'jenjang', 'status_sekolah'].includes(c.toLowerCase())) || categoricalCols[0] || colNames[0] || '';

      const nextCovariates = (ipdMetaConfig.covariates || []).filter(
        c => colNames.includes(c) && c !== nextDv && c !== nextFocal && c !== nextCluster
      );

      if (
        nextDv !== ipdMetaConfig.dv ||
        nextFocal !== ipdMetaConfig.focalPredictor ||
        nextCluster !== ipdMetaConfig.clusterVar ||
        nextCovariates.length !== (ipdMetaConfig.covariates || []).length
      ) {
        setIPDMetaConfig({
          dv: nextDv,
          focalPredictor: nextFocal,
          clusterVar: nextCluster,
          covariates: nextCovariates
        });
      }
    }
  }, [columns]);

  // Reactive Debounce Auto-Run (JASP Mode)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (ipdMetaResult) return;
    }

    if (
      !autoRun ||
      data.length === 0 ||
      !ipdMetaConfig.dv ||
      !ipdMetaConfig.focalPredictor ||
      !ipdMetaConfig.clusterVar
    ) {
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setIsDebouncing(false);
      executeIPDMeta(data);
    }, 450);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [
    autoRun,
    data,
    ipdMetaConfig.dv,
    ipdMetaConfig.focalPredictor,
    ipdMetaConfig.clusterVar,
    ipdMetaConfig.covariates
  ]);

  const handleRunAnalysis = () => {
    if (data.length > 0) {
      executeIPDMeta(data);
    }
  };

  // Table 1: Pooled Model Summary Columns
  const pooledSummaryColumns: ColumnDef<any>[] = [
    { header: 'Parameter Model', accessorKey: 'param' },
    { header: 'Pooled Slope (β)', accessorKey: 'beta', align: 'right' },
    { header: 'Std. Error (SE)', accessorKey: 'se', align: 'right' },
    { header: 'z-value', accessorKey: 'zValue', align: 'right' },
    { header: 'p-value', accessorKey: 'pValue', align: 'right' },
    { header: '95% CI', accessorKey: 'ci', align: 'right' },
    { header: 'I² (Heterogenitas)', accessorKey: 'i2', align: 'right' },
    { header: 'τ² (Between-Var)', accessorKey: 'tau2', align: 'right' },
    { header: 'Cochran’s Q (df, p)', accessorKey: 'cochranQ', align: 'right' },
  ];

  const pooledSummaryData = ipdMetaResult
    ? [
        {
          param: `Efek Sintesis (${ipdMetaConfig.focalPredictor} → ${ipdMetaConfig.dv})`,
          beta: formatNumber(ipdMetaResult.pooledBeta, 3),
          se: formatNumber(ipdMetaResult.pooledSE, 3),
          zValue: formatNumber(ipdMetaResult.zValue, 2),
          pValue: formatPValue(ipdMetaResult.pValue),
          ci: `[${formatNumber(ipdMetaResult.ciLower, 3)}, ${formatNumber(ipdMetaResult.ciUpper, 3)}]`,
          i2: `${formatNumber(ipdMetaResult.i2, 1)}%`,
          tau2: formatNumber(ipdMetaResult.tau2, 4),
          cochranQ: `Q(${ipdMetaResult.dfQ}) = ${formatNumber(ipdMetaResult.qStatistic, 2)} (${formatPValue(ipdMetaResult.qPValue)})`,
        },
      ]
    : [];

  // Table 2: Cluster Level Breakdown Columns
  const clusterColumns: ColumnDef<any>[] = [
    { header: 'Klaster / Wilayah', accessorKey: 'clusterId' },
    { header: 'N Sampel', accessorKey: 'n', align: 'right' },
    { header: 'Koefisien (B)', accessorKey: 'beta', align: 'right' },
    { header: 'Std. Error (SE)', accessorKey: 'se', align: 'right' },
    { header: '95% CI', accessorKey: 'ci', align: 'right' },
    { header: 'z / t', accessorKey: 'zValue', align: 'right' },
    { header: 'p-value', accessorKey: 'pValue', align: 'right' },
    { header: 'Bobot Model (%)', accessorKey: 'weightPct', align: 'right' },
  ];

  const clusterData =
    ipdMetaResult?.clusterResults.map((c) => ({
      clusterId: c.clusterId,
      n: c.n.toLocaleString(),
      beta: formatNumber(c.beta, 3),
      se: formatNumber(c.se, 3),
      ci: `[${formatNumber(c.ciLower, 2)}, ${formatNumber(c.ciUpper, 2)}]`,
      zValue: formatNumber(c.zValue, 2),
      pValue: formatPValue(c.pValue),
      weightPct: `${c.weightPct.toFixed(1)}%`,
    })) || [];

  // Automated APA Narrative Generation (Codebook contextual)
  const generateApaNarrative = () => {
    if (!ipdMetaResult) {
      return 'Jalankan analisis Meta-Analisis IPD untuk melihat narasi interpretasi akademik otomatis.';
    }

    const {
      dv,
      focalPredictor,
      clusterVar,
      covariates,
      nTotalObservations,
      nClusters,
      pooledBeta,
      ciLower,
      ciUpper,
      pValue,
      i2,
      tau2,
      qStatistic,
      dfQ,
      qPValue
    } = ipdMetaResult;

    const covText =
      covariates.length > 0
        ? ` dengan mengontrol kovariat **${covariates.join(', ')}**`
        : '';

    return `Sintesis **Two-Stage Individual Participant Data (IPD) Meta-Analysis** dilakukan untuk menguji pengaruh **${focalPredictor}** (*${getVariableDescription(focalPredictor)}*) terhadap capaian **${dv}** (*${getVariableDescription(dv)}*)${covText} pada level **${clusterVar}** (Total N = ${nTotalObservations.toLocaleString()} siswa/guru yang tersebar di ${nClusters} wilayah/klaster).\n\n` +
      `Pada **Tahap 1**, model regresi linier diestimasi secara terpisah pada masing-masing klaster untuk memperoleh koefisien efek spesifik wilayah. Pada **Tahap 2**, hasil diintegrasikan menggunakan model *Random-Effects Meta-Analysis* (REML via paket R *metafor*, merujuk pada Brunner et al., 2022; Eryilmaz & Strietholt, 2025).\n\n` +
      `Hasil integrasi meta-analisis menunjukkan bahwa ${focalPredictor} memiliki pengaruh gabungan (*pooled effect size*) yang **${pValue < 0.05 ? 'signifikan secara statistik' : 'tidak signifikan'}** sebesar **β = ${formatNumber(pooledBeta, 3)}** (95% CI [${formatNumber(ciLower, 3)}, ${formatNumber(ciUpper, 3)}], *z* = ${formatNumber(ipdMetaResult.zValue, 2)}, *p* = ${formatPValue(pValue)}).\n\n` +
      `Uji heterogenitas antar-wilayah menunjukkan tingkat variabilitas sebesar **I² = ${formatNumber(i2, 1)}%** (*Q*(${dfQ}) = ${formatNumber(qStatistic, 2)}, *p* = ${formatPValue(qPValue)}, *τ²* = ${formatNumber(tau2, 4)}). ${
        i2 > 50
          ? `Tingkat heterogenitas yang moderat hingga substansial ini mengindikasikan adanya variasi disparitas efek kebijakan antar-wilayah di Indonesia yang layak dieksplorasi lebih lanjut melalui meta-regresi atau analisis sub-kelompok.`
          : `Heterogenitas antar-wilayah yang rendah mengindikasikan bahwa pengaruh prediktor tersebut bersifat konsisten di hampir seluruh wilayah yang dianalisis.`
      }`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Sleek, Ultra-Modern & Professional */}
      <PageHeader
        icon={Scale}
        title="Meta-Analisis IPD (Two-Stage)"
        badgeIcon={CheckCircle2}
        badgeText="R Engine (metafor::rma)"
        description="Sintesis Two-Stage IPD Meta-Analysis (Brunner et al., 2022; TIMSS 2015) untuk menganalisis heterogenitas efek antar-provinsi/wilayah."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetIPD}
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
          disabled={
            isCalculating ||
            !ipdMetaConfig.dv ||
            !ipdMetaConfig.focalPredictor ||
            !ipdMetaConfig.clusterVar
          }
          className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer gap-2 text-xs px-4 py-2 shadow-xs font-semibold rounded-xl whitespace-nowrap h-9"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Jalankan Meta-Analisis
        </Button>
      </PageHeader>

      {/* Error display */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Variable Selection Component - Exactly Consistent with Multilevel and other menus */}
      <Card className="border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
            Konfigurasi Variabel Two-Stage IPD Meta-Analysis
          </CardTitle>
          <CardDescription className="text-xs">
            Pilih Variabel Terikat (Outcome Y), Prediktor Utama (X), ID Klaster Makro (G), serta Variabel Kontrol / Kovariat (Z).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <VariableSelector
            columns={columns}
            slots={[
              {
                id: 'dv',
                label: 'Dependent Variable (Outcome Kontinu Y)',
                description: 'Capaian kontinu siswa / well-being guru (contoh: LIT, NUM, nilai_literasi)',
                typeFilter: 'numeric',
                selected: ipdMetaConfig.dv ? [ipdMetaConfig.dv] : [],
                onChange: (s) => setIPDMetaConfig({ dv: s[0] || '' })
              },
              {
                id: 'focalPredictor',
                label: 'Prediktor Utama Fokus (X)',
                description: 'Variabel intervensi / kepemimpinan / iklim sekolah (contoh: AKC, guru_iklim_keamanan)',
                typeFilter: 'numeric',
                selected: ipdMetaConfig.focalPredictor ? [ipdMetaConfig.focalPredictor] : [],
                onChange: (s) => setIPDMetaConfig({ focalPredictor: s[0] || '' })
              },
              {
                id: 'clusterVar',
                label: 'Klaster Pengelompokan Makro (G)',
                description: 'Pengelompokan wilayah makro (contoh: kd_kokab, provinsi, status_wilayah, jenjang)',
                typeFilter: 'all',
                selected: ipdMetaConfig.clusterVar ? [ipdMetaConfig.clusterVar] : [],
                onChange: (s) => setIPDMetaConfig({ clusterVar: s[0] || '' })
              },
              {
                id: 'covariates',
                label: 'Variabel Kontrol / Kovariat (Z)',
                description: 'Karakteristik latar belakang siswa & satuan pendidikan (contoh: ses_siswa, jenis_kelamin, status_sekolah)',
                typeFilter: 'all',
                multi: true,
                selected: ipdMetaConfig.covariates || [],
                onChange: (s) => setIPDMetaConfig({ covariates: s })
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Output Sub-Tabs */}
      <Tabs value={activeOutputTab} onValueChange={setActiveOutputTab}>
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
          <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 p-1">
            <TabsTrigger value="forest" className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-[#008080] dark:text-[#14a3a3]" />
              Forest Plot & Ringkasan APA
            </TabsTrigger>
            <TabsTrigger value="assumptions" className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Uji Heterogenitas & Asumsi
            </TabsTrigger>
            <TabsTrigger value="r_console" className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              Output Konsol R (metafor)
            </TabsTrigger>
            <TabsTrigger value="r_code" className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-500" />
              Sintaks Verifikasi R
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Forest Plot, Tables and APA Narrative */}
        <TabsContent value="forest" className="space-y-6 mt-4">
          {ipdMetaResult ? (
            <div className="space-y-6">
              {/* Forest Plot SVG Component */}
              <ForestPlot
                result={ipdMetaResult}
                title={`Forest Plot Pengaruh ${ipdMetaResult.focalPredictor} terhadap ${ipdMetaResult.dv}`}
                subtitle={`Sintesis ${ipdMetaResult.nClusters} klaster (${ipdMetaResult.clusterVar}) menggunakan model Random-Effects (REML)`}
              />

              {/* Table 1: Model Summary */}
              <DataTableHasil
                title="Tabel 1. Estimasi Efek Gabungan Meta-Analisis IPD (Pooled Effect & Heterogeneity)"
                subtitle="Hasil integrasi random-effects model (REML) dan indeks inkonsistensi heterogenitas (I², τ², Q)"
                columns={pooledSummaryColumns}
                data={pooledSummaryData}
                notes="Catatan: * p < .05, ** p < .01, *** p < .001. Nilai I² > 50% mengindikasikan variasi antar-wilayah yang substansial."
              />

              {/* Table 2: Cluster Details Breakdown */}
              <DataTableHasil
                title={`Tabel 2. Rincian Estimasi Regresi per Klaster / Wilayah (${ipdMetaResult.clusterVar})`}
                subtitle="Koefisien spesifik per wilayah (Tahap 1) beserta interval kepercayaan 95% dan bobot relatif (%)"
                columns={clusterColumns}
                data={clusterData}
                notes="Catatan: Bobot (%) dihitung berdasarkan inverse-variance acak (1 / [SE² + τ²])."
              />

              {/* APA Narrative AI Card */}
              <AiCard
                analysisKey="multilevel"
                title="Narasi Laporan Meta-Analisis IPD (Format APA 7th)"
                defaultNarrative={generateApaNarrative()}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              Tentukan variabel dan klik &apos;Jalankan Meta-Analisis&apos; di atas untuk menampilkan Forest Plot dan tabel APA.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Heterogeneity & Assumptions */}
        <TabsContent value="assumptions" className="space-y-6 mt-4">
          <AssumptionCard
            title="Pemeriksaan Asumsi Meta-Analisis & Heterogenitas"
            subtitle="Pemeriksaan konsistensi efek antar-klaster (I², Cochran’s Q) dan kecukupan jumlah unit makro."
            assumptions={ipdMetaResult?.assumptions || []}
          />
        </TabsContent>

        {/* Tab 3: R Console Output */}
        <TabsContent value="r_console" className="mt-4">
          <RConsoleBlock
            title="Output Konsol R - metafor::rma (Two-Stage IPD Meta-Analysis)"
            description="Keluaran teks mentah resmi dari eksekusi fungsi metafor::rma() di sesi R."
            consoleOutput={ipdMetaResult?.rConsoleOutput}
          />
        </TabsContent>

        {/* Tab 4: R Code Verification */}
        <TabsContent value="r_code" className="mt-4">
          <RCodeBlock
            title="Sintaks Verifikasi Meta-Analisis IPD di R"
            description="Salin kode ini ke RStudio untuk memverifikasi Two-Stage IPD Meta-Analysis dengan paket metafor dan visualisasi forest()."
            code={RSyntaxGenerator.getIPDMetaCode(
              ipdMetaConfig.dv,
              ipdMetaConfig.focalPredictor,
              ipdMetaConfig.clusterVar,
              ipdMetaConfig.covariates || [],
              fileName || 'data_asesmen_nasional.csv'
            )}
            packages={['metafor', 'dplyr', 'ggplot2']}
            fileName="verifikasi_ipd_meta.R"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
