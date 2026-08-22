import {
  AncovaResult,
  AnovaResult,
  ManovaResult,
  MultilevelResult,
  TTestResult
} from '@/lib/types';
import { formatNumber, formatPValue } from '@/lib/utils';
import { DEFAULT_STATS_REFERENCE } from '@/constants/default-reference';

const GEMINI_CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.7-flash",
  "gemini-3.5-pro",
  "gemini-2.5-flash"
];

const GROQ_CANDIDATE_MODELS = [
  "groq/compound",
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
  "groq/compound-mini",
  "openai/gpt-oss-20b"
];

type GeminiPart = { role: "user" | "model"; parts: [{ text: string }] };

export async function callGroq(
  apiKey: string,
  prompt: string,
  history: Array<{ role: "user" | "model" | "assistant"; content: string }> = []
): Promise<string> {
  let key = apiKey?.trim();
  if (!key && typeof window !== "undefined") {
    key = localStorage.getItem("stats_an_groq_key") || "";
  }

  if (!key || key.trim() === "") {
    throw new Error("API Key Groq belum disetel. Silakan isi di menu Pengaturan & API.");
  }

  const messages = [
    ...history.map((h) => ({
      role: h.role === "model" ? ("assistant" as const) : (h.role as "user" | "assistant"),
      content: h.content,
    })),
    { role: "user" as const, content: prompt },
  ];

  let lastErrorMsg = "";

  for (const model of GROQ_CANDIDATE_MODELS) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.5,
          max_tokens: 4096,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        lastErrorMsg = errMsg;
        if (res.status === 401 || errMsg.includes("Invalid API Key")) {
          throw new Error(`API Key Groq tidak valid: ${errMsg}`);
        }
        continue;
      }
    } catch (err: any) {
      if (err.message?.includes("API Key Groq tidak valid")) throw err;
      lastErrorMsg = err.message || "Gagal terhubung ke layanan Groq.";
    }
  }

  throw new Error(`Gagal memproses layanan Groq: ${lastErrorMsg}`);
}

export async function callGemini(
  apiKey: string,
  prompt: string,
  history: Array<{ role: "user" | "model"; content: string }> = []
): Promise<string> {
  let key = apiKey?.trim();
  let groqKey = "";
  let provider = "auto";

  if (typeof window !== "undefined") {
    if (!key) key = localStorage.getItem("stats_an_gemini_key") || "";
    groqKey = localStorage.getItem("stats_an_groq_key") || "";
    provider = localStorage.getItem("stats_an_ai_provider") || "auto";
  }

  // 1. If key passed is explicitly a Groq key (starts with gsk_)
  if (key && key.startsWith("gsk_")) {
    return await callGroq(key, prompt, history);
  }

  // 2. If provider is set to groq and groqKey is available
  if (provider === "groq" && groqKey) {
    return await callGroq(groqKey, prompt, history);
  }

  // 3. If no Gemini key is set, check if Groq key exists
  if ((!key || key.trim() === "") && groqKey) {
    return await callGroq(groqKey, prompt, history);
  }

  if (!key || key.trim() === "") {
    throw new Error("API Key belum disetel. Silakan isi Google Gemini atau Groq API Key di menu Pengaturan & API.");
  }

  const contents: GeminiPart[] = [
    ...history.map((h) => ({ role: h.role, parts: [{ text: h.content }] as [{ text: string }] })),
    { role: "user", parts: [{ text: prompt }] },
  ];

  let lastErrorMsg = "";

  for (const model of GEMINI_CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (res.ok) {
        const data = await res.json();
        const parts: Array<{ text?: string }> = data?.candidates?.[0]?.content?.parts ?? [];
        const text = parts.map((p) => p.text ?? "").join("\n\n").trim();
        if (text) return text;
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        lastErrorMsg = errMsg;

        // Auto fallback to Groq if rate limit / quota exceeded
        if ((res.status === 429 || errMsg.includes("quota") || errMsg.includes("rate-limit") || errMsg.includes("ResourceExhausted")) && groqKey) {
          try {
            return await callGroq(groqKey, prompt, history);
          } catch {
            // continue gemini error handling
          }
        }

        if (res.status === 400 && (errMsg.includes("API key") || errMsg.includes("API_KEY_INVALID"))) {
          throw new Error(`API Key tidak valid: ${errMsg}`);
        }
        continue;
      }
    } catch (err: any) {
      if (err.message?.includes("API Key tidak valid")) throw err;
      lastErrorMsg = err.message || "Gagal terhubung ke layanan komputasi.";
    }
  }

  // Final fallback to Groq if available before throwing
  if (groqKey) {
    try {
      return await callGroq(groqKey, prompt, history);
    } catch {
      // fallback failed
    }
  }

  throw new Error(`Gagal memproses layanan konsultasi: ${lastErrorMsg}`);
}

// ── Built-in Intelligent Academic Rule-Based Narrator (Offline / Free Mode) ──────

export function generateLocalTTestNarrative(res: TTestResult): string {
  const isSig = res.pValue < 0.05;
  const g1 = res.descriptives[0];
  const g2 = res.descriptives[1];

  let narrative = `### Ringkasan Hasil Analisis Uji-t (APA 7th Format)\n\n`;

  if (res.type === 'independent') {
    narrative += `Telah dilakukan uji *Independent Samples t-test* untuk membandingkan capaian **${res.dv}** antara kelompok **${res.group1}** ($M = ${formatNumber(g1.mean)}$, $SD = ${formatNumber(g1.sd)}$) dan kelompok **${res.group2}** ($M = ${formatNumber(g2.mean)}$, $SD = ${formatNumber(g2.sd)}$).\n\n`;

    if (res.leveneP !== undefined && res.leveneP < 0.05) {
      narrative += `> **Catatan Asumsi Homogenitas**: Uji Levene menunjukkan varians tidak homogen ($F = ${formatNumber(res.leveneF)}$, $p = ${formatPValue(res.leveneP)}$), sehingga statistik **Welch's t-test** dilaporkan: $t(${formatNumber(res.welchDf, 1)}) = ${formatNumber(res.welchStatistic)}$, $p = ${formatPValue(res.welchPValue)}$.\n\n`;
    } else {
      narrative += `Hasil uji homogenitas varians Levene mengindikasikan asumsi homoskedastisitas terpenuhi ($p > .05$). Pengujian Student's $t$ menunjukkan nilai $t(${res.df}) = ${formatNumber(res.statistic)}$, $p = ${formatPValue(res.pValue)}$.\n\n`;
    }

    if (isSig) {
      narrative += `**Kesimpulan**: Terdapat perbedaan yang **signifikan secara statistik** pada variabel *${res.dv}* antara kedua kelompok dengan selisih rata-rata sebesar $\\Delta M = ${formatNumber(res.meanDiff)}$ [95% CI: ${formatNumber(res.ciLower)}, ${formatNumber(res.ciUpper)}]. Ukuran pengaruh (effect size) tergolong ${Math.abs(res.cohensD) >= 0.8 ? 'besar' : Math.abs(res.cohensD) >= 0.5 ? 'sedang' : 'kecil'} (*Cohen's d* = ${formatNumber(res.cohensD)}).\n\n`;
      narrative += `**Implikasi Pedagogis & Kebijakan Asesmen**: Kesenjangan ini mengindikasikan perlunya intervensi terfokus pada kelompok ${g1.mean < g2.mean ? res.group1 : res.group2} guna mencapai pemerataan capaian kompetensi dasar.`;
    } else {
      narrative += `**Kesimpulan**: Tidak ditemukan perbedaan yang signifikan secara statistik antara kelompok ${res.group1} dan ${res.group2} ($p > .05$). Hal ini menunjukkan capaian relatif setara di antara kedua kelompok.`;
    }
  }

  return narrative;
}

export function generateLocalAnovaNarrative(res: AnovaResult): string {
  const mainFactor = res.table[0];
  const isSig = mainFactor.pValue < 0.05;

  let narrative = `### Ringkasan Hasil Analisis ANOVA (APA 7th Format)\n\n`;
  narrative += `Pengujian **Analysis of Variance (ANOVA)** dilakukan pada variabel terikat **${res.dv}** terhadap faktor **${res.factors.join(' & ')}**.\n\n`;

  for (const row of res.table.filter(r => r.source !== 'Residuals (Error)' && r.source !== 'Total')) {
    const sig = row.pValue < 0.05;
    narrative += `- **Pengaruh ${row.source}**: $F(${row.df}, ${res.table.find(t => t.source.includes('Residuals'))?.df}) = ${formatNumber(row.f)}$, $p = ${formatPValue(row.pValue)}$, $\\eta^2_p = ${formatNumber(row.partialEtaSquared)}$. Pengaruh ini dinyatakan **${sig ? 'signifikan' : 'tidak signifikan'}**.\n`;
  }

  if (res.postHoc && Object.keys(res.postHoc).length > 0) {
    narrative += `\n#### Uji Lanjut Post-Hoc (Tukey HSD):\n`;
    for (const [fac, comps] of Object.entries(res.postHoc)) {
      for (const comp of comps) {
        narrative += `- Perbandingan *${comp.comparison}*: Selisih rata-rata $\\Delta M = ${formatNumber(comp.meanDiff)}$, $q = ${formatNumber(comp.qValue)}$, $p = ${formatPValue(comp.pValue)}$ (${comp.significant ? 'Signifikan' : 'Tidak Signifikan'}).\n`;
      }
    }
  }

  return narrative;
}

export function generateLocalMultilevelNarrative(res: MultilevelResult): string {
  let narrative = `### Ringkasan Hasil Pemodelan Multilevel / HLM (Standar APA 7th)\n\n`;
  narrative += `Analisis *Hierarchical Linear Modeling* (Linear Mixed Models) diterapkan untuk memperhitungkan struktur data hierarkis bersarang (*nested*) siswa ($N = ${res.nObservations.toLocaleString()}$) di dalam **${res.nClusters} satuan pendidikan (kluster Level 2)** pada variabel terikat **${res.dv}**.\n\n`;

  narrative += `#### 1. Intraclass Correlation Coefficient (ICC) & Dekomposisi Varians\n`;
  narrative += `- **Varians Antar-Sekolah ($\\tau_{00}$)**: **${formatNumber(res.tau00, 2)}**\n`;
  narrative += `- **Varians Dalam-Sekolah / Residual ($\\sigma^2$)**: **${formatNumber(res.sigma2, 2)}**\n`;
  narrative += `- **Koefisien Korelasi Intrakelas (ICC / $\\rho$)**: **${formatNumber(res.icc, 4)}** (${(res.icc * 100).toFixed(2)}% variasi capaian berada pada tingkat sekolah).\n\n`;

  if (res.icc >= 0.05) {
    narrative += `> **Justifikasi Model**: Karena nilai ICC $\\ge 0.05$ (5%), penerapan analisis multilevel **sangat tepat dan esensial** guna mengontrol efek kluster dan mencegah bias estimasi *standard error* pada regresi OLS standar.\n\n`;
  }

  narrative += `#### 2. Estimasi Parameter Model Penuh (Fixed Effects):\n`;
  for (const fx of res.fixedEffects) {
    const termLabel = fx.term === '(Intercept)' ? 'Intercept ($\\gamma_{00}$)' : fx.term;
    narrative += `- **${termLabel}** (${fx.level || 'Prediktor'}): $b = ${formatNumber(fx.estimate)}$, $SE = ${formatNumber(fx.se)}$, $t = ${formatNumber(fx.tValue)}$, $p = ${formatPValue(fx.pValue)}$ [95% CI: ${formatNumber(fx.ciLower)}, ${formatNumber(fx.ciUpper)}].\n`;
  }

  if (res.r2Level1 !== undefined || res.r2Level2 !== undefined) {
    narrative += `\n#### 3. Proporsi Reduksi Varians (Snijders & Bosker $R^2$):\n`;
    if (res.r2Level1 !== undefined && res.r2Level1 !== null) {
      const val1 = res.r2Level1 > 1 ? res.r2Level1 : res.r2Level1 * 100;
      narrative += `- **$R^2_{\\text{Level 1}}$ (Tingkat Siswa)**: ${val1.toFixed(2)}%\n`;
    }
    if (res.r2Level2 !== undefined && res.r2Level2 !== null) {
      const val2 = res.r2Level2 > 1 ? res.r2Level2 : res.r2Level2 * 100;
      narrative += `- **$R^2_{\\text{Level 2}}$ (Tingkat Sekolah)**: ${val2.toFixed(2)}%\n`;
    }
  }

  narrative += `\n#### 4. Kebaikan Suai Model (Model Fit):\n`;
  narrative += `- Deviance (-2LL) = **${formatNumber(res.deviance, 1)}**, AIC = **${formatNumber(res.aic, 1)}**, BIC = **${formatNumber(res.bic, 1)}**.`;

  return narrative;
}
