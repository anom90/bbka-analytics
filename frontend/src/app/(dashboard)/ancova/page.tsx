'use client';

import * as React from 'react';
import { TrendingUp, Play, Code2, CheckCircle2, Terminal, ShieldCheck, Zap, RotateCcw } from 'lucide-react';
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
import { PageHeader } from '@/components/common/page-header';
import { useDatasetStore } from '@/stores/dataset-store';
import { useAnalysisStore } from '@/stores/analysis-store';
import { formatNumber, formatPValue, ensureArray, cn } from '@/lib/utils';
import { RSyntaxGenerator } from '@/lib/stats/r-syntax';

export default function AncovaPage() {
  const { data, columns, fileName } = useDatasetStore();
  const {
    ancovaConfig,
    setAncovaConfig,
    executeAncova,
    ancovaResult,
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

  const handleResetAncova = () => {
    clearSpecificAnalysis('ancova');
  };

  // Reactive Debounce Auto-Run (JASP Mode)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (ancovaResult) return;
    }

    const covs = ensureArray(ancovaConfig.covariates);
    if (!autoRun || data.length === 0 || !ancovaConfig.dv || !ancovaConfig.factor || covs.length === 0) return;

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setIsDebouncing(false);
      executeAncova(data);
    }, 450);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [autoRun, data, ancovaConfig.dv, ancovaConfig.factor, ancovaConfig.covariates]);

  const handleRunAncova = () => {
    if (data.length > 0) {
      executeAncova(data);
    }
  };

  // ANCOVA Table Columns
  const ancovaColumns: ColumnDef<any>[] = [
    { header: 'Sumber Variasi (Source)', accessorKey: 'source' },
    { header: 'Sum of Squares (SS)', accessorKey: 'ss', align: 'right' },
    { header: 'df', accessorKey: 'df', align: 'right' },
    { header: 'Mean Square (MS)', accessorKey: 'ms', align: 'right' },
    { header: 'F', accessorKey: 'f', align: 'right' },
    { header: 'p-value', accessorKey: 'pValue', align: 'right' },
    { header: 'Partial η²', accessorKey: 'partialEtaSq', align: 'right' },
  ];

  const ancovaData = ancovaResult?.table?.map(r => ({
    source: r.source,
    ss: formatNumber(r.ss),
    df: r.df,
    ms: formatNumber(r.ms),
    f: isNaN(r.f) ? '-' : formatNumber(r.f),
    pValue: isNaN(r.pValue) ? '-' : formatPValue(r.pValue),
    partialEtaSq: r.partialEtaSquared !== undefined ? formatNumber(r.partialEtaSquared) : '-'
  })) || [];

  // Adjusted Means Columns
  const adjMeansColumns: ColumnDef<any>[] = [
    { header: 'Kelompok Faktor', accessorKey: 'group' },
    { header: 'Unadjusted Mean (Raw M)', accessorKey: 'unadjustedMean', align: 'right' },
    { header: 'Adjusted Mean (Marginal M)', accessorKey: 'adjustedMean', align: 'right' },
    { header: 'Std. Error (SE)', accessorKey: 'se', align: 'right' },
    { header: '95% CI Lower', accessorKey: 'ciLower', align: 'right' },
    { header: '95% CI Upper', accessorKey: 'ciUpper', align: 'right' },
  ];

  const adjMeansData = ancovaResult?.adjustedMeans?.map(m => ({
    group: m.group,
    unadjustedMean: formatNumber(m.unadjustedMean),
    adjustedMean: formatNumber(m.adjustedMean),
    se: formatNumber(m.se),
    ciLower: formatNumber(m.ciLower),
    ciUpper: formatNumber(m.ciUpper),
  })) || [];

  // Parameter Estimates Columns
  const paramColumns: ColumnDef<any>[] = [
    { header: 'Parameter / Term', accessorKey: 'term' },
    { header: 'Koefisien (B)', accessorKey: 'b', align: 'right' },
    { header: 'Std. Error (SE)', accessorKey: 'se', align: 'right' },
    { header: 't', accessorKey: 't', align: 'right' },
    { header: 'p-value', accessorKey: 'pValue', align: 'right' },
    { header: '95% CI Lower', accessorKey: 'ciLower', align: 'right' },
    { header: '95% CI Upper', accessorKey: 'ciUpper', align: 'right' },
  ];

  const paramData = ancovaResult?.parameterEstimates?.map(p => ({
    term: p.term,
    b: formatNumber(p.b),
    se: formatNumber(p.se),
    t: formatNumber(p.t),
    pValue: formatPValue(p.pValue),
    ciLower: formatNumber(p.ciLower),
    ciUpper: formatNumber(p.ciUpper),
  })) || [];

  const safeCovariates = ensureArray(ancovaResult?.covariates);

  const rVerificationCode = RSyntaxGenerator.getAncovaCode(
    ancovaConfig.dv,
    ancovaConfig.factor,
    ensureArray(ancovaConfig.covariates),
    fileName || 'data_latihan_jasp_multilevel.csv'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={TrendingUp}
        title="ANCOVA (Analysis of Covariance)"
        badgeIcon={CheckCircle2}
        badgeText="R Engine (stats::lm)"
        description="Uji perbedaan rata-rata kelompok setelah mengontrol variabel perancu (kovariat kontinu) dengan estimasi Adjusted Means."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetAncova}
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
          onClick={handleRunAncova}
          disabled={isCalculating || data.length === 0}
          className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer gap-2 text-xs px-4 py-2 shadow-xs font-semibold rounded-xl whitespace-nowrap h-9"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Jalankan ANCOVA
        </Button>
      </PageHeader>

      {/* Variable Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Konfigurasi Variabel ANCOVA</CardTitle>
          <CardDescription className="text-xs">
            Tentukan Variabel Terikat, Faktor Perlakuan (Kategori), dan Kovariat Kontinu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VariableSelector
            columns={columns}
            slots={[
              {
                id: 'dv',
                label: 'Dependent Variable (Variabel Terikat)',
                description: 'Variabel hasil kontinu (contoh: nilai_literasi)',
                typeFilter: 'numeric',
                selected: ancovaConfig.dv ? [ancovaConfig.dv] : [],
                onChange: (s) => setAncovaConfig({ dv: s[0] || '' })
              },
              {
                id: 'factor',
                label: 'Fixed Factor (Faktor Perlakuan)',
                description: 'Variabel grup pembanding (contoh: status_sekolah [N/S] atau status_wilayah)',
                typeFilter: 'nominal',
                selected: ancovaConfig.factor ? [ancovaConfig.factor] : [],
                onChange: (s) => setAncovaConfig({ factor: s[0] || '' })
              },
              {
                id: 'covariates',
                label: 'Covariates (Kovariat Terkontrol)',
                description: 'Variabel kontinu yang dikontrol (contoh: ses_siswa)',
                typeFilter: 'numeric',
                multi: true,
                selected: ancovaConfig.covariates,
                onChange: (s) => setAncovaConfig({ covariates: s })
              }
            ]}
          />
        </CardContent>
      </Card>

      {/* Error notification */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

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
          {ancovaResult ? (
            <div className="space-y-6">
              {/* Main ANCOVA Table */}
              <DataTableHasil
                title={`Tabel 1. Hasil ANCOVA untuk ${ancovaResult.dv} dengan Kovariat (${safeCovariates.join(', ')})`}
                columns={ancovaColumns}
                data={ancovaData}
                notes="Catatan: * p < .05, ** p < .01, *** p < .001. Partial η² menunjukkan ukuran pengaruh setelah mengontrol kovariat."
              />

              {/* Homogeneity of Regression Slopes Assumption Check */}
              {ancovaResult.homogeneityOfSlopes && (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Uji Homogenitas Gradien Regresi (Homogeneity of Slopes):
                    </span>{' '}
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      F(Interaksi {ancovaResult.factor} × Kovariat) = {formatNumber(ancovaResult.homogeneityOfSlopes.interactionF)}, p = {formatPValue(ancovaResult.homogeneityOfSlopes.interactionP)}
                    </span>
                  </div>
                  <Badge
                    variant={ancovaResult.homogeneityOfSlopes.slopesAreParallel ? 'success' : 'warning'}
                    className="text-[11px]"
                  >
                    {ancovaResult.homogeneityOfSlopes.slopesAreParallel
                      ? 'Asumsi Terpenuhi (Lereng Regresi Sejajar)'
                      : 'Peringatan: Lereng Regresi Tidak Sejajar'}
                  </Badge>
                </div>
              )}

              {/* Adjusted Means Table */}
              <DataTableHasil
                title="Tabel 2. Rata-rata Terkoreksi (Estimated Marginal Means)"
                subtitle="Rata-rata disesuaikan pada nilai mean kovariat"
                columns={adjMeansColumns}
                data={adjMeansData}
                notes="Catatan: Adjusted Mean menunjukkan perbandingan murni antar kelompok tanpa bias disparitas kovariat awal."
              />

              {/* Parameter Estimates Table */}
              <DataTableHasil
                title="Tabel 3. Estimasi Parameter Regresi Model ANCOVA"
                columns={paramColumns}
                data={paramData}
              />

              {/* AI Narrative Card */}
              <AiCard
                analysisKey={`ancova_${ancovaResult.dv}_${ancovaResult.factor}_${safeCovariates.join('_')}`}
                defaultNarrative={`
### Ringkasan Hasil Analisis ANCOVA (APA 7th Format)

Pengujian **Analysis of Covariance (ANCOVA)** dilakukan untuk menguji efek faktor **${ancovaResult.factor}** terhadap capaian **${ancovaResult.dv}** dengan mengontrol kovariat **${safeCovariates.join(', ')}**.

1. **Uji Efek Utama**:
   - Efek faktor **${ancovaResult.factor}**: $F = ${formatNumber(ancovaResult.table[0]?.f)}$, $p = ${formatPValue(ancovaResult.table[0]?.pValue)}$, $\\eta^2_p = ${formatNumber(ancovaResult.table[0]?.partialEtaSquared)}$.
   - Efek kovariat **${safeCovariates.join(', ')}**: $F = ${formatNumber(ancovaResult.table[1]?.f)}$, $p = ${formatPValue(ancovaResult.table[1]?.pValue)}$, $\\eta^2_p = ${formatNumber(ancovaResult.table[1]?.partialEtaSquared)}$.

2. **Perbandingan Rata-rata Terkoreksi (Adjusted Means)**:
${(ancovaResult.adjustedMeans || []).map(m => `   - Kelompok *${m.group}*: Raw Mean = ${formatNumber(m.unadjustedMean)} $\\rightarrow$ Adjusted Mean = **${formatNumber(m.adjustedMean)}** ($SE = ${formatNumber(m.se)}$)`).join('\n')}

3. **Kesimpulan**:
   ${ancovaResult.table[0]?.pValue < 0.05
     ? `Setelah mengontrol perbedaan ${safeCovariates.join(', ')}, masih terdapat perbedaan yang **signifikan secara statistik** pada ${ancovaResult.dv} antar kelompok ${ancovaResult.factor}.`
     : `Setelah disesuaikan dengan ${safeCovariates.join(', ')}, perbedaan antar kelompok ${ancovaResult.factor} menjadi **tidak signifikan**, menunjukkan bahwa variasi skor sebelumnya sebagian besar didorong oleh disparitas kovariat tersebut.`
   }
                `.trim()}
                promptBuilder={() => `
Tolong buatkan narasi laporan penelitian akademik berstandar APA 7th dalam Bahasa Indonesia untuk hasil ANCOVA (Analysis of Covariance) berikut:
- Variabel Terikat: ${ancovaResult.dv}
- Faktor: ${ancovaResult.factor}
- Kovariat: ${safeCovariates.join(', ')}
- Hasil Tabel ANCOVA:
${(ancovaResult.table || []).map(r => `  * ${r.source}: F(${r.df}) = ${formatNumber(r.f)}, p = ${formatPValue(r.pValue)}, partial eta2 = ${formatNumber(r.partialEtaSquared)}`).join('\n')}
- Rata-rata Terkoreksi (Adjusted Means):
${(ancovaResult.adjustedMeans || []).map(m => `  * ${m.group}: Raw Mean = ${formatNumber(m.unadjustedMean)}, Adjusted Mean = ${formatNumber(m.adjustedMean)} (SE = ${formatNumber(m.se)})`).join('\n')}
${ancovaResult.homogeneityOfSlopes ? `- Uji Homogenitas Gradien Regresi: F(Interaksi) = ${formatNumber(ancovaResult.homogeneityOfSlopes.interactionF)}, p = ${formatPValue(ancovaResult.homogeneityOfSlopes.interactionP)}` : ''}
                `.trim()}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              Klik &apos;Jalankan ANCOVA&apos; di atas untuk menampilkan hasil tabel APA.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Statistical Assumption Checks */}
        <TabsContent value="assumptions" className="space-y-6 mt-4">
          <AssumptionCard
            title="Pemeriksaan Asumsi ANCOVA"
            subtitle="Pemeriksaan homogenitas gradien regresi (homogeneity of slopes), linearitas hubungan kovariat-DV, dan normalitas residual."
            assumptions={ancovaResult?.assumptions || []}
          />
        </TabsContent>

        {/* Tab 3: R Console Terminal Output */}
        <TabsContent value="r_console" className="mt-4">
          <RConsoleBlock
            title="Output Konsol R - ANCOVA (Raw Text Output)"
            description="Keluaran teks mentah resmi dari eksekusi fungsi stats::lm dan anova() di sesi R."
            consoleOutput={ancovaResult?.rConsoleOutput}
          />
        </TabsContent>

        {/* Tab 3: R Verification Code */}
        <TabsContent value="r_code" className="mt-4">
          <RCodeBlock
            title="Sintaks Verifikasi ANCOVA di R"
            description="Salin kode ini ke RStudio untuk memverifikasi model ANCOVA, Adjusted Means (emmeans), dan uji kelurusan lereng regresi."
            code={rVerificationCode}
            packages={['car', 'emmeans']}
            fileName="verifikasi_ancova.R"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
