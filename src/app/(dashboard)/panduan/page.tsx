'use client';

import * as React from 'react';
import { BookOpen, Code2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/common/page-header';

export default function PanduanPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <PageHeader
        icon={BookOpen}
        title="Panduan Metodologi & Teori Statistik Asesmen Nasional"
        badgeIcon={CheckCircle2}
        badgeText="Dokumentasi & Metodologi"
        description="Petunjuk lengkap pelaksanaan analisis data, interpretasi output, dan padanan sintaks R (lme4, lavaan, metafor, stats) serta JASP."
      />

      <Tabs defaultValue="workflow">
        <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 p-1">
          <TabsTrigger value="workflow">Alur Analisis</TabsTrigger>
          <TabsTrigger value="models">Panduan Modul Uji</TabsTrigger>
          <TabsTrigger value="r_code">Padanan Sintaks R & JASP</TabsTrigger>
        </TabsList>

        {/* Tab 1: Workflow */}
        <TabsContent value="workflow" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tahapan Analisis Data Statistik Asesmen Nasional</CardTitle>
              <CardDescription className="text-xs">
                Langkah sistematis dari pemuatan data hingga ekspor draf laporan ilmiah.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-full bg-[#008080] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-xs">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Pemeriksaan & Persiapan Data (Menu Data)
                  </h4>
                  <p>
                    Muat dataset bawaan <code>data_latihan_jasp_multilevel.csv</code> atau unggah file Anda sendiri. Periksa tipe variabel (Skala numerik vs Nominal kategori) serta jumlah observasi valid.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-full bg-[#008080] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-xs">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Pengujian Komparatif & Faktorial (Uji-t, ANOVA, ANCOVA, MANOVA)
                  </h4>
                  <p>
                    Jalankan analisis sesuai hipotesis penelitian. Periksa uji asumsi homogenitas varians (Levene) dan kovarians (Box&apos;s M), serta telaah ukuran efek (<em>Cohen&apos;s d</em> atau <em>Partial Eta Squared</em>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-full bg-[#008080] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-xs">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Pemodelan Hierarkis Multilevel (Menu Multilevel / HLM)
                  </h4>
                  <p>
                    Tentukan <code>kd_sekolah</code> sebagai variabel kluster Level 2. Periksa nilai ICC. Jika nilai ICC &ge; 0.05, lanjutkan ke Random Intercept Model dengan memasukkan prediktor siswa (L1) dan sekolah/guru (L2).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-full bg-[#008080] text-white flex items-center justify-center font-bold shrink-0 text-xs shadow-xs">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                    Sintesis Laporan & Ekspor (Menu Draft Laporan APA)
                  </h4>
                  <p>
                    Buat draf Bab 4 lengkap dengan narasi akademik berstandar APA 7th, salin tabel ke Microsoft Word, atau cetak/simpan ke PDF.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Models Guide */}
        <TabsContent value="models" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">1. Uji-t (t-Test)</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                <p>• <strong>Independent Samples</strong>: Membandingkan 2 kelompok independen (misal: Laki-laki vs Perempuan pada nilai literasi).</p>
                <p>• <strong>Paired Samples</strong>: Membandingkan 2 skor pada subjek yang sama (misal: Literasi vs Numerasi).</p>
                <p>• <strong>One-Sample</strong>: Membandingkan nilai rata-rata sampel dengan benchmark standar nasional (misal nilai patokan 50).</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">2. ANOVA Faktorial</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                <p>• <strong>One-Way ANOVA</strong>: Membandingkan 3 kelompok atau lebih pada 1 faktor.</p>
                <p>• <strong>Two-Way ANOVA</strong>: Menguji efek utama dari 2 faktor sekaligus beserta pengaruh interaksi antar faktor. Dilengkapi uji lanjut Tukey HSD.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">3. ANCOVA</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                <p>• Menguji perbedaan kelompok setelah memurnikan pengaruh variabel kovariat (seperti status sosioekonomi / SES).</p>
                <p>• Menyediakan <em>Adjusted Marginal Means</em> dan uji homogenitas kelurusan lereng regresi.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">4. Multilevel Modeling (HLM)</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                <p>• Mengakomodasi kluster sekolah untuk mengatasi pelanggaran independensi observasi.</p>
                <p>• Menghitung <em>Intraclass Correlation</em> (ICC) dan memisahkan variasi murni siswa vs variasi sekolah.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: R Syntax Equivalents */}
        <TabsContent value="r_code" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                Padanan Sintaks Analisis di R (lme4 & stats)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  1. Independent Samples t-test di R:
                </p>
                <pre className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono overflow-x-auto">
{`t.test(nilai_literasi ~ jenis_kelamin, data = df, var.equal = TRUE)`}
                </pre>
              </div>

              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  2. Two-Way ANOVA di R:
                </p>
                <pre className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono overflow-x-auto">
{`fit_anova <- aov(nilai_literasi ~ status_sekolah * status_wilayah, data = df)
summary(fit_anova)
TukeyHSD(fit_anova)`}
                </pre>
              </div>

              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                  3. Multilevel Modeling (HLM) dengan lme4 di R:
                </p>
                <pre className="p-3 rounded-lg bg-zinc-900 text-zinc-100 font-mono overflow-x-auto">
{`library(lme4)
# Model 1: Null Model (ICC)
null_model <- lmer(nilai_literasi ~ 1 + (1 | kd_sekolah), data = df, REML = FALSE)

# Model 2: Random Intercept dengan Prediktor Siswa & Guru
model_2 <- lmer(nilai_literasi ~ ses_siswa + status_sekolah + guru_iklim_kelas + (1 | kd_sekolah), 
                data = df, REML = FALSE)
summary(model_2)`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
