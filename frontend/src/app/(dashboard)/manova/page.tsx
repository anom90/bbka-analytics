'use client';

import * as React from 'react';
import { Boxes, Play, Code2, CheckCircle2, Terminal, ShieldCheck, Zap, RotateCcw } from 'lucide-react';
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

export default function ManovaPage() {
  const { data, columns, fileName, loadDefaultDataset } = useDatasetStore();
  const {
    manovaConfig,
    setManovaConfig,
    executeManova,
    manovaResult,
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

  const handleResetManova = () => {
    clearSpecificAnalysis('manova');
  };

  // Reactive Debounce Auto-Run (JASP Mode)
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (manovaResult) return;
    }

    if (!autoRun || data.length === 0 || !manovaConfig.dvs || manovaConfig.dvs.length < 2 || !manovaConfig.factors || manovaConfig.factors.length === 0) return;

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setIsDebouncing(false);
      executeManova(data);
    }, 450);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [autoRun, data, manovaConfig.dvs, manovaConfig.factors]);

  const handleRunManova = () => {
    if (data.length > 0) {
      executeManova(data);
    }
  };

  // Multivariate Effect Columns
  const multiColumns: ColumnDef<any>[] = [
    { header: 'Efek (Source)', accessorKey: 'source' },
    { header: 'Uji Multivariat', accessorKey: 'testName' },
    { header: 'Nilai Statistik (Value)', accessorKey: 'statValue', align: 'right' },
    { header: 'Approx. F', accessorKey: 'approxF', align: 'right' },
    { header: 'Num df', accessorKey: 'numDf', align: 'right' },
    { header: 'Den df', accessorKey: 'denDf', align: 'right' },
    { header: 'p-value', accessorKey: 'pValue', align: 'right' },
    { header: 'Partial η²', accessorKey: 'partialEtaSq', align: 'right' },
  ];

  const multiData: any[] = [];
  if (manovaResult?.multivariateEffects) {
    const effects = ensureArray(manovaResult.multivariateEffects);
    for (const eff of effects) {
      const stats = ensureArray(eff.stats);
      for (const st of stats) {
        multiData.push({
          source: eff.source,
          testName: st.test === 'Wilks' ? "Wilks' Lambda (Λ)" : st.test === 'Pillai' ? "Pillai's Trace (V)" : st.test === 'Hotelling' ? "Hotelling-Lawley (T)" : "Roy's Largest Root (θ)",
          statValue: formatNumber(st.value, 4),
          approxF: formatNumber(st.approxF),
          numDf: formatNumber(st.numDf, 1),
          denDf: formatNumber(st.denDf, 1),
          pValue: formatPValue(st.pValue),
          partialEtaSq: formatNumber(st.partialEtaSq)
        });
      }
    }
  }

  const safeDvs = ensureArray(manovaResult?.dvs);
  const safeFactors = ensureArray(manovaResult?.factors);

  const rVerificationCode = RSyntaxGenerator.getManovaCode(
    ensureArray(manovaConfig.dvs),
    ensureArray(manovaConfig.factors),
    fileName || 'data_latihan_jasp_multilevel.csv'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={Boxes}
        title="Analisis Multivariat (MANOVA)"
        badgeIcon={CheckCircle2}
        badgeText="R Engine (stats::manova)"
        description="Uji pengaruh faktor kelompok terhadap multivariat variabel dependen kontinu secara simultan (Pillai, Wilks, Hotelling, Roy)."
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleResetManova}
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
          onClick={handleRunManova}
          disabled={isCalculating || data.length === 0}
          className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer gap-2 text-xs px-4 py-2 shadow-xs font-semibold rounded-xl whitespace-nowrap h-9"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Jalankan MANOVA
        </Button>
      </PageHeader>

      {/* Variable Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Konfigurasi Variabel MANOVA</CardTitle>
          <CardDescription className="text-xs">
            Pilih minimal 2 variabel dependen simultan dan faktor kelompok.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VariableSelector
            columns={columns}
            slots={[
              {
                id: 'dvs',
                label: 'Dependent Variables (Minimal 2 Variabel Terikat)',
                description: 'Variabel hasil simultan (contoh: nilai_literasi dan nilai_numerasi)',
                typeFilter: 'numeric',
                multi: true,
                selected: manovaConfig.dvs,
                onChange: (s) => setManovaConfig({ dvs: s })
              },
              {
                id: 'factors',
                label: 'Fixed Factor (Faktor Kelompok)',
                description: 'Faktor pengelompokan (contoh: status_sekolah atau status_wilayah)',
                typeFilter: 'nominal',
                multi: true,
                selected: manovaConfig.factors,
                onChange: (s) => setManovaConfig({ factors: s.slice(0, 1) })
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
          {manovaResult ? (
            <div className="space-y-6">
              {/* Multivariate Tests Table */}
              <DataTableHasil
                title={`Tabel 1. Uji Multivariat MANOVA untuk [${safeDvs.join(', ')}]`}
                columns={multiColumns}
                data={multiData}
                notes="Catatan: Wilks' Lambda mengukur proporsi varians yang tidak dijelaskan. Pillai's Trace paling kuat terhadap deviasi asumsi. * p < .05, ** p < .01, *** p < .001."
              />

              {/* Box's M Test Callout */}
              {manovaResult.boxM && (
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Uji Homogenitas Matriks Kovarians (Box&apos;s M Test):
                    </span>{' '}
                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                      M = {formatNumber(manovaResult.boxM.mValue)}, F({manovaResult.boxM.df1}, {formatNumber(manovaResult.boxM.df2, 0)}) = {formatNumber(manovaResult.boxM.approxF)}, p = {formatPValue(manovaResult.boxM.pValue)}
                    </span>
                  </div>
                  <Badge
                    variant={manovaResult.boxM.pValue >= 0.001 ? 'success' : 'warning'}
                    className="text-[11px]"
                  >
                    {manovaResult.boxM.pValue >= 0.001 ? 'Kovarians Homogen (p > .001)' : 'Peringatan: Asumsi Kovarians Heterogen (Gunakan Pillai)'}
                  </Badge>
                </div>
              )}

              {/* Follow-up Univariate ANOVAs */}
              {manovaResult.univariateAnovas && (
                <div className="space-y-4">
                  <h4 className="font-serif text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Uji Lanjut Univariate ANOVA (Follow-up Post-Hoc per DV):
                  </h4>
                  {Object.entries(manovaResult.univariateAnovas).map(([dvName, anovaRes]) => (
                    <DataTableHasil
                      key={dvName}
                      title={`Tabel 2. Follow-up Univariate ANOVA: ${dvName}`}
                      columns={[
                        { header: 'Sumber Variasi', accessorKey: 'source' },
                        { header: 'SS', accessorKey: 'ss', align: 'right' },
                        { header: 'df', accessorKey: 'df', align: 'right' },
                        { header: 'MS', accessorKey: 'ms', align: 'right' },
                        { header: 'F', accessorKey: 'f', align: 'right' },
                        { header: 'p-value', accessorKey: 'pValue', align: 'right' },
                        { header: 'Partial η²', accessorKey: 'partialEtaSq', align: 'right' }
                      ]}
                      data={ensureArray(anovaRes?.table).map((r: any) => ({
                        source: r.source,
                        ss: formatNumber(r.ss),
                        df: r.df,
                        ms: formatNumber(r.ms),
                        f: isNaN(r.f) ? '-' : formatNumber(r.f),
                        pValue: isNaN(r.pValue) ? '-' : formatPValue(r.pValue),
                        partialEtaSq: r.partialEtaSquared !== undefined ? formatNumber(r.partialEtaSquared) : '-'
                      }))}
                    />
                  ))}
                </div>
              )}

              {/* AI Narrative Card */}
              <AiCard
                analysisKey={`manova_${safeDvs.join('_')}_${safeFactors.join('_')}`}
                defaultNarrative={`
### Ringkasan Hasil Analisis MANOVA (APA 7th Format)

Analisis **Multivariate Analysis of Variance (MANOVA)** satu jalur diterapkan untuk menguji pengaruh **${safeFactors.join(' & ')}** secara simultan terhadap dua variabel capaian: **${safeDvs.join(' & ')}**.

1. **Hasil Uji Statistik Multivariat**:
   - **Wilks' Lambda ($\\Lambda$)**: $\\Lambda = ${formatNumber(manovaResult.multivariateEffects?.[0]?.stats?.[0]?.value, 4)}$, $F = ${formatNumber(manovaResult.multivariateEffects?.[0]?.stats?.[0]?.approxF)}$, $p = ${formatPValue(manovaResult.multivariateEffects?.[0]?.stats?.[0]?.pValue)}$, $\\eta^2_p = ${formatNumber(manovaResult.multivariateEffects?.[0]?.stats?.[0]?.partialEtaSq)}$.
   - **Pillai's Trace ($V$)**: $V = ${formatNumber(manovaResult.multivariateEffects?.[0]?.stats?.[1]?.value, 4)}$, $F = ${formatNumber(manovaResult.multivariateEffects?.[0]?.stats?.[1]?.approxF)}$, $p = ${formatPValue(manovaResult.multivariateEffects?.[0]?.stats?.[1]?.pValue)}$.

2. **Kesimpulan Multivariat**:
   Terdapat pengaruh gabungan yang **signifikan secara statistik** dari ${safeFactors.join(' & ')} terhadap vektor komposit capaian ${safeDvs.join(' & ')} ($p < .05$).

3. **Uji Univariat Lanjutan (Follow-up ANOVAs)**:
   Pengujian univariat terpisah menunjukkan bahwa kelompok berbeda secara signifikan baik pada masing-masing dimensi capaian asesmen.
                `.trim()}
                promptBuilder={() => `
Tolong buatkan narasi laporan penelitian akademik berstandar APA 7th dalam Bahasa Indonesia untuk hasil MANOVA (Multivariate Analysis of Variance) berikut:
- Variabel Terikat (DVs): ${safeDvs.join(' & ')}
- Faktor: ${safeFactors.join(' & ')}
- Hasil Uji Multivariat:
${multiData.map(r => `  * ${r.source} (${r.testName}): Value = ${r.statValue}, F = ${r.approxF}, df = (${r.numDf}, ${r.denDf}), p = ${r.pValue}, partial eta2 = ${r.partialEtaSq}`).join('\n')}
${manovaResult.univariateAnovas ? `- Uji Lanjut Univariate ANOVA (Follow-up per DV):
${Object.entries(manovaResult.univariateAnovas).map(([dvName, anovaRes]: [string, any]) => ensureArray(anovaRes?.table).map((r: any) => `  * [${dvName}] ${r.source}: F(${r.df}) = ${formatNumber(r.f)}, p = ${formatPValue(r.pValue)}, partial eta2 = ${formatNumber(r.partialEtaSquared)}`).join('\n')).join('\n')}` : ''}
                `.trim()}
              />
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400">
              Klik &apos;Jalankan MANOVA&apos; di atas untuk menampilkan hasil tabel APA.
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Statistical Assumption Checks */}
        <TabsContent value="assumptions" className="space-y-6 mt-4">
          <AssumptionCard
            title="Pemeriksaan Asumsi MANOVA"
            subtitle="Pemeriksaan homogenitas matriks kovarians (Box's M test) dan multikolinearitas antar variabel dependen."
            assumptions={manovaResult?.assumptions || []}
          />
        </TabsContent>

        {/* Tab 3: R Console Terminal Output */}
        <TabsContent value="r_console" className="mt-4">
          <RConsoleBlock
            title="Output Konsol R - MANOVA (Raw Text Output)"
            description="Keluaran teks mentah resmi dari eksekusi fungsi stats::manova dan summary() di sesi R."
            consoleOutput={manovaResult?.rConsoleOutput}
          />
        </TabsContent>

        {/* Tab 3: R Verification Code */}
        <TabsContent value="r_code" className="mt-4">
          <RCodeBlock
            title="Sintaks Verifikasi MANOVA di R"
            description="Salin kode ini ke RStudio untuk memverifikasi nilai Wilks' Lambda, Pillai, Hotelling, Roy, dan Box's M."
            code={rVerificationCode}
            packages={['heplots', 'biotools']}
            fileName="verifikasi_manova.R"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
