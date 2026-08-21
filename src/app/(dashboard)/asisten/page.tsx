'use client';

import * as React from 'react';
import { GraduationCap, Send, User, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { RichMarkdown } from '@/components/common/rich-markdown';
import { PageHeader } from '@/components/common/page-header';
import { useAiStore } from '@/stores/ai-store';
import { useDatasetStore } from '@/stores/dataset-store';
import { useAnalysisStore } from '@/stores/analysis-store';
import { callGemini } from '@/lib/gemini';
import { formatNumber } from '@/lib/utils';
import { formatCodebookContext } from '@/constants/an-codebook';

export default function AsistenPage() {
  const { data, columns, fileName, customCodebook } = useDatasetStore();
  const { tTestResult, multilevelResult, anovaResult, regressionResult } = useAnalysisStore();
  const { chatMessages, addChatMessage, clearChatHistory, geminiApiKey, referenceText } = useAiStore();
  const [inputMsg, setInputMsg] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async (customPromptOrEvent?: React.FormEvent | string) => {
    let userText = inputMsg.trim();
    if (typeof customPromptOrEvent === 'string') {
      userText = customPromptOrEvent;
    } else if (customPromptOrEvent && typeof customPromptOrEvent === 'object' && 'preventDefault' in customPromptOrEvent) {
      customPromptOrEvent.preventDefault();
    }
    if (!userText || isLoading) return;

    setInputMsg('');
    addChatMessage('user', userText);
    setIsLoading(true);

    const codebookInfo = formatCodebookContext(columns.map(c => c.name), customCodebook);
    const regModel = regressionResult?.models?.[regressionResult.models.length - 1];

    // Build rich context
    const datasetContext = `
Konteks Dataset Aktif Asesmen Nasional:
- Nama file: ${fileName || 'Data Asesmen Nasional'}
- Jumlah baris data: ${data.length}
- Variabel tersedia: ${columns.map(c => `${c.name} (${c.type})`).join(', ')}

Codebook Variabel Penelitian:
${codebookInfo}

Ringkasan Hasil Analisis Terkini:
- t-test: ${tTestResult ? `t(${tTestResult.df}) = ${formatNumber(tTestResult.statistic, 2)}, p = ${formatNumber(tTestResult.pValue, 3)}, d = ${formatNumber(tTestResult.cohensD, 2)}` : 'Belum dijalankan'}
- ANOVA: ${anovaResult ? `F = ${formatNumber(anovaResult.table?.[0]?.f || 0, 2)}, p = ${formatNumber(anovaResult.table?.[0]?.pValue || 0, 3)}, η²_p = ${formatNumber(anovaResult.table?.[0]?.partialEtaSquared || 0, 3)}` : 'Belum dijalankan'}
- Regresi: ${regModel ? `R² = ${formatNumber(regModel.r2, 3)}, F_Change = ${formatNumber(regModel.fChange, 2)}, p = ${formatNumber(regModel.pChange, 3)}` : 'Belum dijalankan'}
- Multilevel (HLM): ${multilevelResult ? `ICC = ${(multilevelResult.icc * 100).toFixed(2)}%, τ₀₀ = ${formatNumber(multilevelResult.tau00, 2)}, σ² = ${formatNumber(multilevelResult.sigma2, 2)}` : 'Belum dijalankan'}

Teks Panduan/Referensi Tambahan Pengguna:
${referenceText || 'Tidak ada naskah referensi khusus.'}
`;

    const systemPrompt = `Anda adalah Konsultan Metodologi & Statistik Pendidikan Ahli untuk program riset Asesmen Nasional (AN). 
Tugas Anda:
1. Menjawab pertanyaan metodologis, pemilihan analisis, interpretasi output software (JASP, R, SPSS), dan kaidah penulisan APA 7th.
2. Memberikan penjelasan yang akademis, lugas, presisi secara rumus statistik, dan praktis diaplikasikan.
3. Selalu integrasikan konteks dataset AN (siswa bersarang di sekolah, kluster, skor literasi/numerasi, SES, iklim sekolah, dll) bila relevan.
4. Gunakan bahasa Indonesia akademis yang baku dan formal.`;

    try {
      if (geminiApiKey && geminiApiKey.trim() !== '') {
        const historyForApi = chatMessages.map(m => ({ role: m.role, content: m.content }));
        const fullPrompt = `${datasetContext}\n\n${systemPrompt}\n\nPertanyaan / Instruksi Peneliti:\n${userText}\n\nPetunjuk: Jawablah dengan mengaitkan secara kontekstual dengan nama indikator resmi Asesmen Nasional Kemendikbudristek di atas.`;
        const responseText = await callGemini(geminiApiKey, fullPrompt, historyForApi);
        addChatMessage('model', responseText);
      } else {
        // Rule-based fallback assistance
        let reply = `Pertanyaan Anda mengenai **"${userText}"**:\n\n`;
        if (userText.toLowerCase().includes('icc') || userText.toLowerCase().includes('multilevel')) {
          reply += `Nilai **ICC (Intraclass Correlation Coefficient)** mengukur proporsi variansi capaian siswa yang dapat diatribusikan ke level sekolah.\n\n- Jika ICC $\\ge 0.05$, pemodelan hierarkis / multilevel modeling (HLM) sangat direkomendasikan karena asumsi independensi observasi pada regresi OLS standar terlanggar.\n- Di dataset Asesmen Nasional ini, efek iklim sekolah (\`guru_iklim_kelas\`) dan kepemimpinan (\`guru_fokus_akademik\`) bertindak sebagai prediktor Level 2 yang dapat menjelaskan variabilitas antarsekolah tersebut.`;
        } else if (userText.toLowerCase().includes('cohen') || userText.toLowerCase().includes('effect size')) {
          reply += `**Ukuran Pengaruh (Effect Size)** mengukur signifikansi praktis di luar signifikansi statistik (*p-value*):\n\n- $d = 0.20$ : Efek kecil\n- $d = 0.50$ : Efek sedang\n- $d = 0.80$ : Efek besar\n\nPada data bersampel besar seperti Asesmen Nasional, nilai $p$ hampir selalu kecil (< .001), sehingga *Cohen's d* dan *Partial Eta Squared* ($\\eta^2_p$) sangat krusial untuk menentukan seberapa bermakna perbedaan tersebut secara nyata.`;
        } else {
          reply += `Dalam konteks analisis data Asesmen Nasional berstandar JASP dan R:\n\n1. **Uji-t**: Digunakan untuk menguji perbedaan 2 kelompok (misal jenis kelamin atau status sekolah).\n2. **ANOVA / ANCOVA**: Digunakan jika ada $\\ge 3$ kelompok atau ingin mengontrol kovariat seperti sosioekonomi (\`ses_siswa\`).\n3. **MANOVA**: Menguji literasi dan numerasi secara simultan.\n4. **Multilevel Modeling (HLM)**: Mengakomodasi kluster sekolah (\`kd_sekolah\`).\n\n*(Tip: Masukkan Gemini API Key di menu Pengaturan untuk konsultasi interaktif tanpa batas).*`;
        }
        addChatMessage('model', reply);
      }
    } catch (err: any) {
      addChatMessage('model', `Maaf, terjadi kendala saat memproses konsultasi: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Bagaimana cara menginterpretasikan nilai ICC pada data Asesmen Nasional?',
    'Apa perbedaan antara Welch t-test dan Student t-test?',
    'Mengapa kita perlu mengontrol kovariat SES dalam ANCOVA?',
    'Bagaimana langkah melaporkan hasil Multilevel Modeling di APA 7th?'
  ];

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <PageHeader
        icon={GraduationCap}
        title="Konsultasi Metodologi & Statistik"
        badgeIcon={CheckCircle2}
        badgeText="Standar Metodologi Ilmiah"
        description="Konsultasikan metodologi penelitian, pemilihan uji hipotesis yang tepat, interpretasi formula matematis, dan panduan penulisan akademik berstandar APA 7th."
      >
        <Button
          size="sm"
          variant="outline"
          onClick={clearChatHistory}
          className="h-9 px-3 text-xs cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 gap-1.5 rounded-xl border-zinc-200 dark:border-zinc-800 shadow-2xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Bersihkan Percakapan
        </Button>
      </PageHeader>

      {/* Chat Messages Body */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white/80 dark:bg-[#101c1c]/80">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  msg.role === 'user' ? 'bg-zinc-800 dark:bg-zinc-700' : 'bg-[#008080] dark:bg-[#14a3a3] dark:text-[#04211f] shadow-xs'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-[#008080] text-white dark:bg-[#14a3a3] dark:text-[#04211f] rounded-tr-none'
                    : 'bg-[#f1f5f5] dark:bg-[#172626] text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-[#e2e8e8] dark:border-white/10 font-serif'
                }`}
              >
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  <RichMarkdown content={msg.content} />
                )}
                <span className="text-[9px] opacity-60 mt-1.5 block text-right font-sans">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#008080] text-white dark:bg-[#14a3a3] dark:text-[#04211f] flex items-center justify-center shrink-0 shadow-xs">
                <GraduationCap className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-zinc-500 italic">
                Konsultan sedang menganalisis data dan merumuskan jawaban akademik...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-zinc-50/60 dark:bg-zinc-900/60 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-semibold text-zinc-400 shrink-0">Saran:</span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputMsg(q);
              }}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-teal-500 hover:text-teal-700 dark:hover:border-teal-400 dark:hover:text-teal-300 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <Textarea
            placeholder="Tanyakan sesuatu seputar analisis data asesmen nasional, metodologi statistik, atau APA 7th..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            className="resize-none min-h-[40px] text-xs rounded-xl"
          />
          <Button
            type="submit"
            disabled={!inputMsg.trim() || isLoading}
            className="h-10 px-4 bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer rounded-xl font-semibold shadow-xs"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
