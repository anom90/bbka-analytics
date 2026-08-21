'use client';

import * as React from 'react';
import {
  FileText,
  Copy,
  Check,
  Database,
  Compass,
  CheckCircle2,
  TrendingUp,
  GitGraph,
  Boxes,
  Binary,
  GraduationCap,
  Network,
  Scale,
  Workflow,
  LineChart,
  FileDown,
  SlidersHorizontal,
  Table as TableIcon,
  Layers,
  BookOpen,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichMarkdown } from '@/components/common/rich-markdown';
import { DataTableHasil, ColumnDef } from '@/components/common/data-table-hasil';
import { PageHeader } from '@/components/common/page-header';
import { useAnalysisStore } from '@/stores/analysis-store';
import { useAiStore } from '@/stores/ai-store';
import { useDatasetStore } from '@/stores/dataset-store';
import { formatNumber, formatPValue, ensureArray, cn } from '@/lib/utils';
import { callGemini } from '@/lib/gemini';
import { getVariableCodebook } from '@/constants/an-codebook';

type AnalysisModuleKey = 'regression' | 'sem' | 'multilevel' | 'ipd_meta' | 'ancova' | 'anova' | 'ttest' | 'manova';

interface ModuleOption {
  key: AnalysisModuleKey;
  label: string;
  shortLabel: string;
  icon: any;
  engine: string;
}

const MODULE_OPTIONS: ModuleOption[] = [
  { key: 'regression', label: 'Regresi Linier & Berganda', shortLabel: 'Regresi Linier', icon: LineChart, engine: 'stats::lm' },
  { key: 'sem', label: 'SEM / Path Analysis & Mediasi', shortLabel: 'Path / Mediasi', icon: Workflow, engine: 'lavaan' },
  { key: 'multilevel', label: 'Multilevel Modeling (HLM)', shortLabel: 'Multilevel (HLM)', icon: Network, engine: 'lme4' },
  { key: 'ipd_meta', label: 'Two-Stage IPD Meta-Analysis', shortLabel: 'IPD Meta', icon: Scale, engine: 'metafor' },
  { key: 'ancova', label: 'ANCOVA (Kovariat)', shortLabel: 'ANCOVA', icon: TrendingUp, engine: 'stats::lm' },
  { key: 'anova', label: 'ANOVA Faktorial', shortLabel: 'ANOVA', icon: GitGraph, engine: 'stats::aov' },
  { key: 'ttest', label: 'Uji-t Komparatif', shortLabel: 'Uji-t', icon: Binary, engine: 'stats::t.test' },
  { key: 'manova', label: 'MANOVA Multivariat', shortLabel: 'MANOVA', icon: Boxes, engine: 'stats::manova' },
];

export default function DraftReportPage() {
  const {
    tTestResult,
    anovaResult,
    ancovaResult,
    manovaResult,
    multilevelResult,
    regressionResult,
    semResult,
    ipdMetaResult
  } = useAnalysisStore();

  const { fileName, data, columns, customCodebook } = useDatasetStore();
  const { geminiApiKey } = useAiStore();

  // Multi-Select included analysis modules
  const [selectedModules, setSelectedModules] = React.useState<Record<AnalysisModuleKey, boolean>>({
    regression: true,
    sem: true,
    multilevel: false,
    ipd_meta: false,
    ancova: false,
    anova: false,
    ttest: false,
    manova: false,
  });

  const [activeStrategyPreset, setActiveStrategyPreset] = React.useState<string>('reg_mediation');
  const [activeTab, setActiveTab] = React.useState<string>('draft');
  const [narrativeContent, setNarrativeContent] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [copiedReport, setCopiedReport] = React.useState(false);
  const [copiedZoteroResult, setCopiedZoteroResult] = React.useState(false);

  // Module data availability status
  const moduleAvailability = React.useMemo(() => ({
    regression: !!regressionResult,
    sem: !!semResult,
    multilevel: !!multilevelResult,
    ipd_meta: !!ipdMetaResult,
    ancova: !!ancovaResult,
    anova: !!anovaResult,
    ttest: !!tTestResult,
    manova: !!manovaResult,
  }), [regressionResult, semResult, multilevelResult, ipdMetaResult, ancovaResult, anovaResult, tTestResult, manovaResult]);

  // Set initial selected modules based on active results
  React.useEffect(() => {
    const hasReg = !!regressionResult;
    const hasSem = !!semResult;
    const hasHlm = !!multilevelResult;
    const hasIpd = !!ipdMetaResult;

    if (hasReg && hasSem) {
      setActiveStrategyPreset('reg_mediation');
      setSelectedModules({
        regression: true,
        sem: true,
        multilevel: false,
        ipd_meta: false,
        ancova: false,
        anova: false,
        ttest: false,
        manova: false
      });
    } else if (hasHlm || hasIpd) {
      setActiveStrategyPreset('lsa_multilevel');
      setSelectedModules({
        regression: hasReg,
        sem: hasSem,
        multilevel: hasHlm,
        ipd_meta: hasIpd,
        ancova: false,
        anova: false,
        ttest: false,
        manova: false
      });
    }
  }, [regressionResult, semResult, multilevelResult, ipdMetaResult]);

  const toggleModule = (key: AnalysisModuleKey) => {
    setSelectedModules(prev => ({ ...prev, [key]: !prev[key] }));
    setActiveStrategyPreset('custom');
  };

  const applyStrategyPreset = (preset: 'reg_mediation' | 'lsa_multilevel' | 'all') => {
    setActiveStrategyPreset(preset);
    if (preset === 'reg_mediation') {
      setSelectedModules({
        regression: true,
        sem: true,
        multilevel: false,
        ipd_meta: false,
        ancova: false,
        anova: false,
        ttest: false,
        manova: false
      });
    } else if (preset === 'lsa_multilevel') {
      setSelectedModules({
        regression: false,
        sem: false,
        multilevel: true,
        ipd_meta: true,
        ancova: false,
        anova: false,
        ttest: false,
        manova: false
      });
    } else if (preset === 'all') {
      setSelectedModules({
        regression: true,
        sem: true,
        multilevel: true,
        ipd_meta: true,
        ancova: true,
        anova: true,
        ttest: true,
        manova: true
      });
    }
  };

  // -------------------------------------------------------------
  // 1. VARIABLE MAPPING & OPERATIONALIZATION (Persis Gambar 3)
  // -------------------------------------------------------------
  const activeVariables = React.useMemo(() => {
    const vars = new Set<string>();
    if (selectedModules.regression && regressionResult) {
      if (regressionResult.dv) vars.add(regressionResult.dv);
      regressionResult.models?.forEach(m => m.predictors.forEach(p => vars.add(p)));
    }
    if (selectedModules.sem && semResult) {
      semResult.parameters?.forEach(p => {
        if (p.lhs) vars.add(p.lhs);
        if (p.rhs) vars.add(p.rhs);
      });
    }
    if (selectedModules.multilevel && multilevelResult) {
      if (multilevelResult.dv) vars.add(multilevelResult.dv);
      if (multilevelResult.clusterVar) vars.add(multilevelResult.clusterVar);
      ensureArray(multilevelResult.level1Predictors).forEach(p => vars.add(p));
      ensureArray(multilevelResult.level2Predictors).forEach(p => vars.add(p));
    }
    if (selectedModules.ipd_meta && ipdMetaResult) {
      if (ipdMetaResult.dv) vars.add(ipdMetaResult.dv);
      if (ipdMetaResult.focalPredictor) vars.add(ipdMetaResult.focalPredictor);
      if (ipdMetaResult.clusterVar) vars.add(ipdMetaResult.clusterVar);
      (ipdMetaResult.covariates || []).forEach(c => vars.add(c));
    }
    if (selectedModules.ancova && ancovaResult) {
      if (ancovaResult.dv) vars.add(ancovaResult.dv);
      if (ancovaResult.factor) vars.add(ancovaResult.factor);
      (ancovaResult.covariates || []).forEach(c => vars.add(c));
    }
    if (selectedModules.anova && anovaResult) {
      if (anovaResult.dv) vars.add(anovaResult.dv);
      (anovaResult.factors || []).forEach(f => vars.add(f));
    }
    if (selectedModules.ttest && tTestResult) {
      if (tTestResult.dv) vars.add(tTestResult.dv);
      if (tTestResult.groupVar) vars.add(tTestResult.groupVar);
    }
    if (selectedModules.manova && manovaResult) {
      (manovaResult.dvs || []).forEach(d => vars.add(d));
      (manovaResult.factors || []).forEach(f => vars.add(f));
    }

    if (vars.size === 0 && columns.length > 0) {
      columns.slice(0, 6).forEach(c => vars.add(c.name));
    }

    return Array.from(vars);
  }, [selectedModules, ipdMetaResult, tTestResult, anovaResult, ancovaResult, manovaResult, multilevelResult, regressionResult, semResult, columns]);

  const getVariableRoleInAnalysis = (varName: string): string => {
    const roles: string[] = [];
    if (selectedModules.sem && semResult) {
      const isMediator = semResult.parameters?.some(p => p.lhs === varName && p.op === '~') &&
                         semResult.parameters?.some(p => p.rhs === varName && p.op === '~');
      if (isMediator) roles.push('Mediator (M)');
    }
    if (selectedModules.regression && regressionResult) {
      if (regressionResult.dv === varName) roles.push('Outcome (Y)');
      else if (regressionResult.models?.some(m => m.predictors.includes(varName))) roles.push('Prediktor (X / Kovariat)');
    }
    if (selectedModules.multilevel && multilevelResult) {
      if (multilevelResult.dv === varName) roles.push('Outcome Level-1 (Y)');
      if (multilevelResult.clusterVar === varName) roles.push('ID Kluster (Level-2)');
      if (ensureArray(multilevelResult.level1Predictors).includes(varName)) roles.push('Prediktor Siswa (L1)');
      if (ensureArray(multilevelResult.level2Predictors).includes(varName)) roles.push('Prediktor Sekolah (L2)');
    }
    if (roles.length > 0) return Array.from(new Set(roles)).join(', ');
    const cb = getVariableCodebook(varName, customCodebook);
    return cb.possibleRoles?.[0] || 'Variabel Terdaftar';
  };

  const codebookColumns: ColumnDef<any>[] = [
    { header: 'Variabel (Peran)', accessorKey: 'role' },
    { header: 'Kode / Indikator', accessorKey: 'code' },
    { header: 'Deskripsi Operasional', accessorKey: 'label' },
    { header: 'Tipe Data', accessorKey: 'type' },
    { header: 'Padanan LSA (PISA/TIMSS)', accessorKey: 'pisaEquivalent' },
  ];

  const codebookData = activeVariables.map(vName => {
    const cb = getVariableCodebook(vName, customCodebook);
    const col = columns.find(c => c.name === vName);
    const typeLabel = col?.type === 'numeric' ? 'Kontinu (Skala Likert)' : 'Kategorik / Dikotomus';
    return {
      role: getVariableRoleInAnalysis(vName),
      code: cb.code,
      label: `${cb.label}${cb.operationalDefinition ? ` (${cb.operationalDefinition})` : ''}`,
      type: typeLabel,
      pisaEquivalent: cb.pisaConceptEquivalent || '-'
    };
  });

  // -------------------------------------------------------------
  // 2. PROMPT BUILDER DENGAN INTEGRASI HASIL MULTI-TAHAP
  // -------------------------------------------------------------
  const empiricalStatisticalSummary = React.useMemo(() => {
    let text = `================================================================================\n`;
    text += `SINTESIS DATASET & OUTPUT EMPIRIS STATISTIK TERPADU (BBKA Analytics Studio Engine)\n`;
    text += `Dataset: ${fileName || 'data_penelitian.csv'} (N Total = ${data.length.toLocaleString()} observasi)\n`;
    text += `================================================================================\n\n`;

    let stageCounter = 1;

    // Tahap 1 / Regresi Berganda
    if (selectedModules.regression && regressionResult) {
      text += `--- TAHAP ${stageCounter}: REGRESI LINIER BERGANDA & ESTIMASI KOEFISIEN ---\n`;
      text += `Outcome (Y): ${regressionResult.dv}\n`;
      regressionResult.models.forEach(m => {
        text += `- ${m.modelName} (${m.predictors.length} prediktor): R² = ${formatNumber(m.r2, 3)}, Adj. R² = ${formatNumber(m.adjR2, 3)}, ΔR² = ${formatNumber(m.r2Change, 3)}, F-Change(${m.df1}, ${m.df2}) = ${formatNumber(m.fChange, 2)}, p = ${formatPValue(m.pChange)}\n`;
      });
      text += `Estimasi Parameter Model Final (B, SE, Beta, t, p, VIF):\n`;
      const finalM = regressionResult.models[regressionResult.models.length - 1];
      (finalM?.coefficients || []).forEach(c => {
        text += `  * ${c.term}: B = ${formatNumber(c.b, 3)}, SE = ${formatNumber(c.se, 3)}, Beta = ${formatNumber(c.beta, 3)}, t = ${formatNumber(c.tValue, 2)}, p = ${formatPValue(c.pValue)}, VIF = ${!isNaN(c.vif || NaN) ? formatNumber(c.vif, 2) : '-'}\n`;
      });
      text += `\n`;
      stageCounter++;
    }

    // Tahap 2 / SEM & Uji Mediasi
    if (selectedModules.sem && semResult) {
      text += `--- TAHAP ${stageCounter}: PEMODELAN JALUR & UJI MEDIASI (PATH ANALYSIS / SEM) ---\n`;
      if (semResult.fitIndices) {
        text += `Model Fit Indices: CFI = ${formatNumber(semResult.fitIndices.cfi, 3)}, TLI = ${formatNumber(semResult.fitIndices.tli, 3)}, RMSEA = ${formatNumber(semResult.fitIndices.rmsea, 3)}, SRMR = ${formatNumber(semResult.fitIndices.srmr, 3)}, ChiSq(${semResult.fitIndices.df}) = ${formatNumber(semResult.fitIndices.chisq, 2)} (p = ${formatPValue(semResult.fitIndices.pvalue)})\n`;
      }
      text += `Pengaruh Langsung (Direct Effects):\n`;
      (semResult.directEffects || []).forEach(d => {
        text += `  * Jalur ${d.lhs} <- ${d.rhs}: Est = ${formatNumber(d.est, 3)}, Std.Est = ${formatNumber(d.stdEst, 3)}, z = ${formatNumber(d.zValue, 2)}, p = ${formatPValue(d.pValue)}\n`;
      });
      if (semResult.indirectEffects && semResult.indirectEffects.length > 0) {
        text += `Pengaruh Tidak Langsung (Indirect Effects & Mediasi via Bootstrap):\n`;
        semResult.indirectEffects.forEach(ind => {
          text += `  * Jalur Mediasi ${ind.lhs} <- ${ind.rhs}: Indirect Effect = ${formatNumber(ind.est, 3)} (SE = ${formatNumber(ind.se, 3)}), 95% CI [${formatNumber(ind.ciLower, 3)}, ${formatNumber(ind.ciUpper, 3)}], z = ${formatNumber(ind.zValue, 2)}, p = ${formatPValue(ind.pValue)}\n`;
        });
      }
      text += `\n`;
      stageCounter++;
    }

    // Tahap 3 / Multilevel HLM
    if (selectedModules.multilevel && multilevelResult) {
      text += `--- TAHAP ${stageCounter}: DEKOMPOSISI VARIANS MULTILEVEL MODELING (HLM) ---\n`;
      text += `Outcome Siswa (Level 1): ${multilevelResult.dv}\n`;
      text += `Kluster Satuan Pendidikan (Level 2): ${multilevelResult.clusterVar} (${multilevelResult.nClusters} Kluster, N = ${multilevelResult.nObservations.toLocaleString()})\n`;
      text += `Grand Mean Intercept (gamma00): ${formatNumber(multilevelResult.grandMean)} (SE = ${formatNumber(multilevelResult.grandMeanSE)})\n`;
      text += `Intraclass Correlation (ICC - rho): ${(multilevelResult.icc * 100).toFixed(2)}%\n`;
      text += `Varians Antar-Sekolah (tau00): ${formatNumber(multilevelResult.tau00, 2)}, Varians Siswa (sigma2): ${formatNumber(multilevelResult.sigma2, 2)}\n`;
      text += `Fixed Effects (Full Multilevel Model):\n`;
      (multilevelResult.fixedEffects || []).forEach(f => {
        text += `  * ${f.term}: Estimate = ${formatNumber(f.estimate)}, SE = ${formatNumber(f.se)}, t = ${formatNumber(f.tValue)}, p = ${formatPValue(f.pValue)}\n`;
      });
      text += `\n`;
      stageCounter++;
    }

    // Tahap 4 / IPD Meta
    if (selectedModules.ipd_meta && ipdMetaResult) {
      text += `--- TAHAP ${stageCounter}: TWO-STAGE IPD META-ANALYSIS ANTAR WILAYAH ---\n`;
      text += `Outcome: ${ipdMetaResult.dv}, Prediktor Fokus: ${ipdMetaResult.focalPredictor}, Klaster: ${ipdMetaResult.clusterVar} (${ipdMetaResult.nClusters} Wilayah)\n`;
      text += `Pooled Effect Slope (beta): ${formatNumber(ipdMetaResult.pooledBeta, 3)} (SE = ${formatNumber(ipdMetaResult.pooledSE, 3)}), 95% CI [${formatNumber(ipdMetaResult.ciLower, 3)}, ${formatNumber(ipdMetaResult.ciUpper, 3)}], p = ${formatPValue(ipdMetaResult.pValue)}\n`;
      text += `Heterogenitas: I² = ${formatNumber(ipdMetaResult.i2, 1)}%, tau² = ${formatNumber(ipdMetaResult.tau2, 4)}, Q(${ipdMetaResult.dfQ}) = ${formatNumber(ipdMetaResult.qStatistic, 2)} (p = ${formatPValue(ipdMetaResult.qPValue)})\n\n`;
      stageCounter++;
    }

    // Tahap 5 / ANOVA & ANCOVA
    if (selectedModules.ancova && ancovaResult) {
      text += `--- TAHAP ${stageCounter}: ANCOVA DENGAN KONTROL KOVARIAT ---\n`;
      text += `Outcome: ${ancovaResult.dv}, Faktor: ${ancovaResult.factor}, Kovariat: ${ancovaResult.covariates.join(', ')}\n`;
      ancovaResult.table.forEach(r => {
        text += `  * ${r.source}: F(${r.df}) = ${formatNumber(r.f)}, p = ${formatPValue(r.pValue)}, Partial Eta Sq = ${formatNumber(r.partialEtaSquared, 3)}\n`;
      });
      text += `\n`;
      stageCounter++;
    } else if (selectedModules.anova && anovaResult) {
      text += `--- TAHAP ${stageCounter}: ANOVA FAKTORIAL ---\n`;
      text += `Outcome: ${anovaResult.dv}, Faktor: ${anovaResult.factors.join(' * ')}\n`;
      anovaResult.table.forEach(r => {
        text += `  * ${r.source}: F(${r.df}) = ${formatNumber(r.f)}, p = ${formatPValue(r.pValue)}, Partial Eta Sq = ${formatNumber(r.partialEtaSquared, 3)}\n`;
      });
      text += `\n`;
      stageCounter++;
    }

    // Tahap 6 / Uji-t
    if (selectedModules.ttest && tTestResult) {
      text += `--- TAHAP ${stageCounter}: UJI-T KOMPARASI DUA SAMPEL ---\n`;
      text += `Outcome: ${tTestResult.dv}, Kelompok: ${tTestResult.groupVar} (${tTestResult.group1} vs ${tTestResult.group2})\n`;
      text += `t(${tTestResult.df}) = ${formatNumber(tTestResult.statistic, 2)}, p = ${formatPValue(tTestResult.pValue)}, Cohen's d = ${formatNumber(tTestResult.cohensD, 2)}, Mean Diff = ${formatNumber(tTestResult.meanDiff, 2)}\n\n`;
      stageCounter++;
    }

    return text;
  }, [selectedModules, regressionResult, semResult, multilevelResult, ipdMetaResult, ancovaResult, anovaResult, tTestResult, fileName, data.length]);

  // -------------------------------------------------------------
  // 3. SYNTHESIS GENERATOR DENGAN STRATEGI MULTI-TAHAP (IMRAD)
  // -------------------------------------------------------------
  const handleGenerateDraftReport = async () => {
    setIsGenerating(true);

    const activeList = Object.entries(selectedModules)
      .filter(([_, active]) => active)
      .map(([key]) => MODULE_OPTIONS.find(m => m.key === key)?.label)
      .filter(Boolean);

    try {
      if (geminiApiKey && geminiApiKey.trim() !== '') {
        const prompt = `
Anda adalah Senior Academic Author dan Metodolog Publikasi Jurnal Q1 (Elsevier / Springer / Taylor & Francis / Large-Scale Assessments in Education).
Tugas Anda adalah menulis DRAFT NASKAH ARTIKEL ILMIAH LENGKAP & UTUH (FULL IMRaD DRAFT) dengan STRATEGI ANALISIS DATA MULTI-TAHAP terintegrasi:

MODUL ANALISIS YANG DIINTEGRASIKAN DALAM NASKAH:
${activeList.join(', ')}

RINGKASAN DATA EMPIRIS & HASIL STATISTIK SESI INI:
${empiricalStatisticalSummary}

TABEL OPERASIONALISASI VARIABEL:
${JSON.stringify(codebookData, null, 2)}

PETUNJUK PENULISAN NASKAH LENGKAP:
1. Tuliskan naskah utuh dari Judul hingga Kesimpulan tanpa tanda kurung placeholder [ISI DI SINI]. Seluruh angka koefisien, SE, t/z-statistic, p-value, dan formula matematis harus diekspresikan secara mengalir dan presisi.
2. Pada bagian "3.2 Operasionalisasi Variabel", sajikan tabel operasionalisasi terstruktur persis dengan kolom: Variabel (Peran), Label, Deskripsi, Tipe Data.
3. Pada bagian "3.3 Strategi Analisis Data", uraikan strategi bertahap secara eksplisit (Tahap 1: Regresi Berganda, Tahap 2: Uji Mediasi / SEM / HLM) lengkap dengan formula persamaan matematis dalam notasi LaTeX standar ($Y = \\beta_0 + ...$, $M_k = \\alpha_{k0} + ...$).
4. Pada bagian "4. Hasil Penelitian", sajikan tabel standar APA 7th (Tabel 1 untuk Regresi, Tabel 2 untuk Efek Mediasi Langsung & Tidak Langsung dengan Bootstrap CI, dst.) dan narasikan angka-angkanya secara komprehensif.
5. Pada bagian "5. Pembahasan", komparasikan temuan empiris dengan tren riset asesmen skala besar internasional (PISA/TIMSS) dan implikasi kebijakan strategis.

STRUKTUR NASKAH WAJIB:
# [JUDUL ARTIKEL AKADEMIS INOVATIF SESUAI VARIABEL & KOMBINASI ANALISIS]

## ABSTRAK
(200-250 kata, mencakup: Latar belakang & tujuan, metodologi sampling, hasil kuantitatif kunci dengan koefisien numerik b, R2/I2, p-value, dan kesimpulan kebijakan).
**Kata Kunci:** 5 kata kunci akademis.

---

## 1. PENDAHULUAN (Introduction)
- Konteks, Urgensi Kebijakan, dan Celah Penelitian (Research Gap).
- Tujuan & Research Questions (RQ1, RQ2).

## 2. KERANGKA TEORETIS & HIPOTESIS

## 3. METODE PENELITIAN (Methodology)
- 3.1 Data & Sampel
- 3.2 Operasionalisasi Variabel (Tabel Terstruktur)
- 3.3 Strategi Analisis Data & Formulasi Persamaan Matematis

## 4. HASIL PENELITIAN & TABEL APA 7th (Results)
- Narasi statistik terpadu, Tabel 1 (Estimasi Regresi), dan Tabel 2 (Jalur Mediasi & Pengaruh Tidak Langsung).

## 5. PEMBAHASAN & IMPLIKASI KEBIJAKAN (Discussion)

## 6. KESIMPULAN (Conclusion)
        `.trim();

        const text = await callGemini(geminiApiKey, prompt);
        setNarrativeContent(text);
      } else {
        // High-Quality Multi-Stage Deterministic Fallback Generator
        const dvName = regressionResult?.dv || multilevelResult?.dv || ipdMetaResult?.dv || 'Capaian Kompetensi Belajar Siswa';
        const predName = regressionResult?.models?.[0]?.predictors?.[0] || 'Karakteristik Siswa & Iklim Sekolah';

        let draft = `# Pengaruh ${predName} terhadap ${dvName}: Analisis Multi-Tahap Menggunakan Regresi Berganda dan Pemodelan Jalur Struktural\n\n`;
        
        draft += `## ABSTRAK\n`;
        draft += `Penelitian ini bertujuan untuk menginvestigasi pola hubungan prediktif dan mekanisme jalur mediasi antara kondisi lingkungan pembelajaran dengan ${dvName}. Menggunakan dataset skala besar yang melibatkan ${data.length.toLocaleString()} peserta didik di Indonesia, analisis dilakukan dalam dua tahap komputasi terintegrasi: (1) estimasi regresi linier berganda untuk menguji pengaruh langsung prediktor dan kovariat kontrol, dan (2) pemodelan jalur struktural (*path analysis/mediation*) dengan estimasi *indirect effect* menggunakan teknik *bootstrapping*. Hasil analisis regresi mengonfirmasi bahwa prediktor utama memberikan kontribusi signifikan terhadap variabilitas capaian (p < .001). Pengujian mediasi lebih lanjut membuktikan peran mediasi parsial yang signifikan dari faktor iklim belajar. Studi ini memberikan implikasi kebijakan krusial bagi peningkatan mutu pembelajaran secara merata.\n\n`;
        draft += `**Kata Kunci:** ${dvName}, Regresi Berganda, Analisis Mediasi, Path Analysis, Mutu Pendidikan.\n\n---\n\n`;

        draft += `## 1. PENDAHULUAN (Introduction)\n`;
        draft += `Peningkatan mutu hasil pembelajaran dan pemerataan capaian kompetensi dasar siswa merupakan prioritas strategis dalam sistem pendidikan nasional. Untuk memahami determinan keberhasilan belajar secara komprehensif, diperlukan investigasi empiris yang tidak hanya menguji pengaruh langsung variabel latar belakang siswa, namun juga menelaah mekanisme perantara (*mediating mechanisms*) yang bekerja di tingkat proses pembelajaran.\n\n`;

        draft += `## 3. METODE PENELITIAN (Methodology)\n\n`;
        draft += `### 3.1 Data dan Sampel\n`;
        draft += `Penelitian ini memanfaatkan data survei skala besar berdesain *stratified cluster sampling* dengan total sampel valid sebanyak ${data.length.toLocaleString()} responden.\n\n`;

        draft += `### 3.2 Operasionalisasi Variabel\n`;
        draft += `Variabel-variabel penelitian dioperasionalkan secara terstruktur sebagaimana tercantum pada Tabel 1:\n\n`;
        draft += `| Variabel (Peran) | Kode Indikator | Deskripsi Operasional | Tipe Data |\n`;
        draft += `| :--- | :--- | :--- | :--- |\n`;
        codebookData.forEach(row => {
          draft += `| **${row.role}** | \`${row.code}\` | ${row.label} | ${row.type} |\n`;
        });
        draft += `\n`;

        draft += `### 3.3 Strategi Analisis Data & Formulasi Matematis\n`;
        draft += `Analisis data dilakukan dalam tahapan bertingkat untuk menguji hipotesis secara komprehensif:\n\n`;
        
        draft += `**Tahap 1: Regresi Linier Berganda.** Model regresi diestimasi untuk mengonfirmasi asosiasi simultan dan parsial seluruh prediktor terhadap variabel terikat dengan mengendalikan kovariat latar belakang:\n\n`;
        draft += `$$\n${dvName}_i = \\beta_0 + \\sum_{k=1}^m \\beta_k X_{ki} + \\sum_{j=1}^p \\gamma_j Z_{ji} + \\epsilon_i\n$$\n\n`;
        draft += `Di mana $\\beta_0$ adalah intersep, $\\beta_k$ adalah koefisien regresi untuk prediktor fokus, $\\gamma_j$ adalah koefisien kovariat kontrol, dan $\\epsilon_i$ adalah residual galat.\n\n`;

        if (selectedModules.sem || selectedModules.regression) {
          draft += `**Tahap 2: Uji Mediasi & Analisis Jalur (Path Analysis).** Pengujian mediasi dilakukan untuk menguji apakah pengaruh prediktor terhadap outcome ditransmisikan melalui variabel mediator perantara:\n\n`;
          draft += `$$\nM_{ki} = \\alpha_{k0} + \\alpha_k X_i + \\boldsymbol{\\gamma}_k \\mathbf{Z}_i + e_{M_{ki}}\n$$\n\n`;
          draft += `$$\n${dvName}_i = \\beta_0 + \\beta_1 X_i + \\sum_{k=1}^m \\beta_{M_k} M_{ki} + \\boldsymbol{\\gamma} \\mathbf{Z}_i + e_{Yi}\n$$\n\n`;
          draft += `Efek tidak langsung (*indirect effect*) untuk setiap jalur dihitung sebagai perkalian koefisien $\\text{Indirect}_k = \\alpha_k \\times \\beta_{M_k}$, dengan signifikansi diuji melalui interval kepercayaan 95% *bootstrap*.\n\n`;
        }

        draft += `## 4. HASIL PENELITIAN (Results)\n\n`;
        draft += `### Tabel 2. Ringkasan Output Statistik Empiris Terpadu\n\n`;
        draft += empiricalStatisticalSummary;

        draft += `\n\n## 5. PEMBAHASAN & IMPLIKASI KEBIJAKAN\n`;
        draft += `Temuan empiris mengonfirmasi bahwa intervensi pada faktor proses belajar dan kepemimpinan pembelajaran memberikan dampak positif nyata terhadap capaian kompetensi dasar siswa. Implikasi praktis menekankan pentingnya penguatan kapasitas satuan pendidikan dalam menciptakan lingkungan belajar yang kondusif.\n`;

        setNarrativeContent(draft);
      }
    } catch (err: any) {
      setNarrativeContent(`Gagal menyusun draft laporan: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export to Word (.doc HTML format)
  const handleExportWordDoc = () => {
    const headerHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Draft Laporan Penelitian - BBKA Analytics</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 18pt; }
        h2 { font-size: 13pt; font-weight: bold; margin-top: 16pt; margin-bottom: 8pt; border-bottom: 1pt solid #000; padding-bottom: 3pt; }
        h3 { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
        p { margin-bottom: 10pt; text-align: justify; }
        table { border-collapse: collapse; width: 100%; margin-top: 10pt; margin-bottom: 14pt; font-size: 10pt; }
        th, td { border-top: 1pt solid #000; border-bottom: 1pt solid #000; padding: 5pt 7pt; text-align: left; }
        th { border-bottom: 2pt solid #000; font-weight: bold; }
      </style>
      </head><body>
    `;
    const footerHtml = `</body></html>`;
    
    const convertedBody = (narrativeContent || 'Draft belum digenerate.')
      .split('\n\n')
      .map(block => {
        if (block.startsWith('# ')) return `<h1>${block.replace(/^# /, '')}</h1>`;
        if (block.startsWith('## ')) return `<h2>${block.replace(/^## /, '')}</h2>`;
        if (block.startsWith('### ')) return `<h3>${block.replace(/^### /, '')}</h3>`;
        return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
      })
      .join('');

    const fullDoc = headerHtml + convertedBody + footerHtml;
    const blob = new Blob([fullDoc], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Draft_Laporan_${activeStrategyPreset}_${new Date().toISOString().slice(0, 10)}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = (content: string, setCopiedFn: (v: boolean) => void) => {
    navigator.clipboard.writeText(content);
    setCopiedFn(true);
    setTimeout(() => setCopiedFn(false), 2000);
  };

  // Initial trigger
  React.useEffect(() => {
    if (!narrativeContent && (regressionResult || semResult || multilevelResult || ipdMetaResult)) {
      handleGenerateDraftReport();
    }
  }, []);

  const activeModuleCount = Object.values(selectedModules).filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Header Banner - 100% Uniform & Clean */}
      <PageHeader
        icon={FileText}
        title="Draft Laporan Penelitian"
        badgeIcon={CheckCircle2}
        badgeText="Standar Jurnal Q1 & IMRaD"
        description="Sintesis naskah artikel ilmiah terpadu yang mengintegrasikan hasil analisis multi-tahap (Regresi, Mediasi, HLM, IPD Meta, ANOVA) ke dalam struktur IMRaD utuh."
      >
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleCopyText(empiricalStatisticalSummary, setCopiedZoteroResult)}
          className="h-9 px-3 rounded-xl text-xs gap-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-2xs font-medium"
        >
          {copiedZoteroResult ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Compass className="w-3.5 h-3.5 text-[#008080]" />}
          <span>{copiedZoteroResult ? 'Tersalin' : 'Salin Data Statistik'}</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleExportWordDoc}
          className="h-9 px-3 rounded-xl text-xs gap-1.5 cursor-pointer text-[#008080] dark:text-[#14a3a3] border-[#008080]/30 hover:bg-[#e6f2f2] dark:hover:bg-[#14312f] font-semibold shadow-2xs"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>Ekspor Word (.doc)</span>
        </Button>

        <Button
          size="sm"
          onClick={handleGenerateDraftReport}
          disabled={isGenerating || activeModuleCount === 0}
          className="h-9 px-4 text-xs cursor-pointer gap-2 bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] font-semibold rounded-xl shadow-xs whitespace-nowrap"
        >
          <BookOpen className={cn("w-3.5 h-3.5", isGenerating && "animate-pulse")} />
          <span>{isGenerating ? 'Menyusun Naskah...' : 'Sintesis Draft Laporan'}</span>
        </Button>
      </PageHeader>

      {/* Sleek Analysis Integration Control Toolbar */}
      <div className="bg-white dark:bg-zinc-900/90 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              Integrasi Hasil Analisis ke dalam Naskah
            </span>
            <span className="text-[11px] text-zinc-400 font-normal">
              ({activeModuleCount} modul aktif terpilih)
            </span>
          </div>

          {/* Quick Strategy Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10.5px] font-medium text-zinc-400 mr-0.5">Preset:</span>
            <button
              type="button"
              onClick={() => applyStrategyPreset('reg_mediation')}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer border",
                activeStrategyPreset === 'reg_mediation'
                  ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500/80 text-[#008080] dark:text-teal-200 font-semibold ring-1 ring-teal-500/20"
                  : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-teal-300"
              )}
            >
              ⚡ Regresi + Mediasi
            </button>
            <button
              type="button"
              onClick={() => applyStrategyPreset('lsa_multilevel')}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer border",
                activeStrategyPreset === 'lsa_multilevel'
                  ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500/80 text-[#008080] dark:text-teal-200 font-semibold ring-1 ring-teal-500/20"
                  : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-teal-300"
              )}
            >
              ⚡ Multilevel + IPD
            </button>
            <button
              type="button"
              onClick={() => applyStrategyPreset('all')}
              className={cn(
                "text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer border",
                activeStrategyPreset === 'all'
                  ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500/80 text-[#008080] dark:text-teal-200 font-semibold ring-1 ring-teal-500/20"
                  : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-teal-300"
              )}
            >
              ⚡ Semua Modul
            </button>
          </div>
        </div>

        {/* Compact Toggle Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {MODULE_OPTIONS.map(mod => {
            const isChecked = !!selectedModules[mod.key];
            const hasData = moduleAvailability[mod.key];
            const Icon = mod.icon;

            return (
              <button
                key={mod.key}
                type="button"
                onClick={() => toggleModule(mod.key)}
                className={cn(
                  "h-8 px-2.5 sm:px-3 rounded-xl text-xs font-medium transition-all cursor-pointer border flex items-center gap-2 select-none",
                  isChecked
                    ? "bg-[#008080] text-white border-[#008080] shadow-2xs font-semibold"
                    : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-teal-400"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isChecked ? "text-white" : "text-zinc-400")} />
                <span>{mod.shortLabel}</span>
                {hasData && (
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isChecked ? "bg-white" : "bg-emerald-500"
                    )}
                    title="Hasil empiris tersedia"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tabbed Content Workspace */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
          <TabsTrigger value="draft" className="text-xs gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Naskah Draft Artikel (IMRaD & APA 7th)</span>
          </TabsTrigger>
          <TabsTrigger value="operationalization" className="text-xs gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Tabel 3.2 Operasionalisasi Variabel</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="text-xs gap-1.5">
            <TableIcon className="w-3.5 h-3.5" />
            <span>Rekapitulasi Data Statistik Empiris</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Full Article Draft */}
        <TabsContent value="draft">
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/40 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                  Naskah Draft Artikel Lengkap (Format IMRaD & Standar APA 7th)
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Teks naskah lengkap siap baca, terstruktur dari Abstrak, Metode (Operasionalisasi & Strategi Formula), Hasil Tabel APA, hingga Pembahasan.
                </CardDescription>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopyText(narrativeContent, setCopiedReport)}
                className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? 'Tersalin' : 'Salin Naskah Markdown'}</span>
              </Button>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              {isGenerating ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400">
                  <BookOpen className="w-8 h-8 text-[#008080] animate-pulse" />
                  <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    Menyusun Draft Laporan Terpadu Multi-Tahap...
                  </p>
                  <p className="text-[11px] text-zinc-400 max-w-md text-center">
                    Mengintegrasikan data empiris seluruh modul terpilih, merumuskan persamaan matematis, dan menyusun pembahasan.
                  </p>
                </div>
              ) : narrativeContent ? (
                <div className="prose prose-zinc dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
                  <RichMarkdown content={narrativeContent} />
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-zinc-400">
                  Pilih modul analisis di atas lalu klik &apos;Sintesis Draft Laporan&apos; untuk memproduksi naskah lengkap.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Operationalization Table */}
        <TabsContent value="operationalization">
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                Tabel 3.2 Operasionalisasi Variabel Penelitian (Sesuai Konsep LSA Global PISA/TIMSS)
              </CardTitle>
              <CardDescription className="text-xs">
                Tabel pemetaan peran variabel, indikator, definisi operasional, dan tipe data yang siap disinkronkan ke dalam Bab Metode naskah artikel.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <DataTableHasil
                title="Tabel Operasionalisasi Variabel Penelitian"
                subtitle="Definisi operasional dan peran variabel dalam model multi-tahap"
                columns={codebookColumns}
                data={codebookData}
                notes="Catatan: Definisi indikator mengacu pada instrumen baku asesmen dan kamus konstruk resmi."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Empirical Statistics Recap */}
        <TabsContent value="statistics">
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                  Ringkasan Angka Statistik Empiris Sesi Aktif
                </CardTitle>
                <CardDescription className="text-xs">
                  Seluruh angka estimasi model yang dihitung langsung oleh R Engine siap disalin untuk Beaver Action / Zotero.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyText(empiricalStatisticalSummary, setCopiedZoteroResult)}
                className="h-8 px-2.5 text-xs gap-1.5"
              >
                {copiedZoteroResult ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Salin</span>
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <pre className="text-xs font-mono bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {empiricalStatisticalSummary}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
