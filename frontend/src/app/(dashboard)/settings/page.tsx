'use client';

import * as React from 'react';
import { Settings, Key, Database, BookOpen, Check, RefreshCw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/common/page-header';
import { useAiStore } from '@/stores/ai-store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { callGemini } from '@/lib/gemini';

export default function SettingsPage() {
  const {
    geminiApiKey,
    setGeminiApiKey,
    groqApiKey,
    setGroqApiKey,
    aiProvider,
    setAiProvider,
    referenceText,
    setReferenceText,
    resetReferenceToDefault
  } = useAiStore();

  const [geminiKeyInput, setGeminiKeyInput] = React.useState('');
  const [groqKeyInput, setGroqKeyInput] = React.useState('');
  const [providerInput, setProviderInput] = React.useState<'auto' | 'gemini' | 'groq'>('auto');
  const [refInput, setRefInput] = React.useState(referenceText);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  
  const [geminiTestLoading, setGeminiTestLoading] = React.useState(false);
  const [geminiTestResult, setGeminiTestResult] = React.useState<{ status: 'success' | 'error'; message: string } | null>(null);

  const [groqTestLoading, setGroqTestLoading] = React.useState(false);
  const [groqTestResult, setGroqTestResult] = React.useState<{ status: 'success' | 'error'; message: string } | null>(null);

  // Sync inputs from store / localStorage
  React.useEffect(() => {
    if (geminiApiKey) {
      setGeminiKeyInput(geminiApiKey);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stats_an_gemini_key');
      if (stored) {
        setGeminiKeyInput(stored);
        setGeminiApiKey(stored);
      }
    }

    if (groqApiKey) {
      setGroqKeyInput(groqApiKey);
    } else if (typeof window !== 'undefined') {
      const storedGroq = localStorage.getItem('stats_an_groq_key');
      if (storedGroq) {
        setGroqKeyInput(storedGroq);
        setGroqApiKey(storedGroq);
      }
    }

    if (aiProvider) {
      setProviderInput(aiProvider);
    } else if (typeof window !== 'undefined') {
      const storedProv = (localStorage.getItem('stats_an_ai_provider') as any) || 'auto';
      setProviderInput(storedProv);
    }
  }, [geminiApiKey, groqApiKey, aiProvider]);

  const handleSave = () => {
    const cleanGemini = geminiKeyInput.trim();
    const cleanGroq = groqKeyInput.trim();
    setGeminiApiKey(cleanGemini);
    setGroqApiKey(cleanGroq);
    setAiProvider(providerInput);
    setReferenceText(refInput);

    if (typeof window !== 'undefined') {
      if (cleanGemini) localStorage.setItem('stats_an_gemini_key', cleanGemini);
      else localStorage.removeItem('stats_an_gemini_key');

      if (cleanGroq) localStorage.setItem('stats_an_groq_key', cleanGroq);
      else localStorage.removeItem('stats_an_groq_key');

      localStorage.setItem('stats_an_ai_provider', providerInput);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestGemini = async () => {
    const keyToTest = geminiKeyInput.trim();
    if (!keyToTest) return;
    setGeminiTestLoading(true);
    setGeminiTestResult(null);
    try {
      const reply = await callGemini(keyToTest, 'Katakan "OK" jika terhubung.');
      setGeminiTestResult({ status: 'success', message: `Koneksi Google Gemini API Berhasil! (${reply.slice(0, 40)})` });
      setGeminiApiKey(keyToTest);
      if (typeof window !== 'undefined') {
        localStorage.setItem('stats_an_gemini_key', keyToTest);
      }
    } catch (err: any) {
      setGeminiTestResult({ status: 'error', message: err.message || 'Koneksi Gemini gagal.' });
    } finally {
      setGeminiTestLoading(false);
    }
  };

  const handleTestGroq = async () => {
    const keyToTest = groqKeyInput.trim();
    if (!keyToTest) return;
    setGroqTestLoading(true);
    setGroqTestResult(null);
    try {
      const reply = await callGemini(keyToTest, 'Katakan "OK" jika terhubung.');
      setGroqTestResult({ status: 'success', message: `Koneksi Groq AI Engine Berhasil! (${reply.slice(0, 40)})` });
      setGroqApiKey(keyToTest);
      if (typeof window !== 'undefined') {
        localStorage.setItem('stats_an_groq_key', keyToTest);
      }
    } catch (err: any) {
      setGroqTestResult({ status: 'error', message: err.message || 'Koneksi Groq gagal.' });
    } finally {
      setGroqTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <PageHeader
        icon={Settings}
        title="Pengaturan Aplikasi & Konfigurasi AI Engine"
        badgeIcon={CheckCircle2}
        badgeText="Multi-Provider AI"
        description="Kelola Google Gemini & Groq AI API Key, status integrasi database Supabase, dan acuan parameter teoritis penulisan laporan."
      >
        <Button
          onClick={handleSave}
          className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] text-xs gap-1.5 cursor-pointer font-semibold rounded-xl shadow-xs h-9 px-4"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" /> Tersimpan!
            </>
          ) : (
            'Simpan Konfigurasi'
          )}
        </Button>
      </PageHeader>

      {/* Groq Engine Key Section */}
      <Card className="border-teal-500/30 bg-teal-50/20 dark:bg-teal-950/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                Groq AI Engine (Ultra Fast & Kuota Besar / Anti-Limit)
              </CardTitle>
              <CardDescription className="text-xs">
                Menggunakan LPU ultra cepat (Compound, GPT-OSS 120B, Qwen 3.6). Sangat direkomendasikan jika kuota Google Gemini gratis Anda terkena rate-limit.
              </CardDescription>
            </div>
            <Badge variant={groqApiKey ? 'default' : 'secondary'} className="text-xs">
              {groqApiKey ? 'Groq Terpasang' : 'Belum Terpasang'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              API Key (Groq Cloud):
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="password"
                placeholder="gsk_..."
                value={groqKeyInput}
                onChange={(e) => {
                  setGroqKeyInput(e.target.value);
                  setGroqApiKey(e.target.value.trim());
                }}
                className="text-xs font-mono flex-1"
              />
              <Button
                type="button"
                onClick={handleTestGroq}
                disabled={groqTestLoading || !groqKeyInput.trim()}
                variant="outline"
                className="text-xs shrink-0 cursor-pointer h-9 px-3 gap-1.5 font-semibold"
              >
                {groqTestLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                {groqTestLoading ? 'Menguji...' : 'Uji Koneksi Groq'}
              </Button>
            </div>

            {groqTestResult && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                  groqTestResult.status === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                {groqTestResult.status === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Settings className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{groqTestResult.message}</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-zinc-500">
            Dapatkan API key gratis tanpa batas dari{' '}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-[#008080] dark:text-[#14a3a3] underline font-medium"
            >
              Groq Cloud Console
            </a>.
          </p>
        </CardContent>
      </Card>

      {/* Gemini Engine Key Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Google Gemini API (Gemini 3.5 Flash)
              </CardTitle>
              <CardDescription className="text-xs">
                Model generatif resmi Google AI Studio untuk penalaran akademik berstandar jurnal internasional.
              </CardDescription>
            </div>
            <Badge variant={geminiApiKey ? 'default' : 'secondary'} className="text-xs">
              {geminiApiKey ? 'Gemini Terpasang' : 'Belum Terpasang'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
              API Key (Google AI Studio):
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKeyInput}
                onChange={(e) => {
                  setGeminiKeyInput(e.target.value);
                  setGeminiApiKey(e.target.value.trim());
                }}
                className="text-xs font-mono flex-1"
              />
              <Button
                type="button"
                onClick={handleTestGemini}
                disabled={geminiTestLoading || !geminiKeyInput.trim()}
                variant="outline"
                className="text-xs shrink-0 cursor-pointer h-9 px-3 gap-1.5 font-semibold"
              >
                {geminiTestLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                {geminiTestLoading ? 'Menguji...' : 'Uji Koneksi Gemini'}
              </Button>
            </div>

            {geminiTestResult && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                  geminiTestResult.status === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                {geminiTestResult.status === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Settings className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{geminiTestResult.message}</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-zinc-500">
            Dapatkan API key gratis di{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-400 underline font-medium"
            >
              Google AI Studio
            </a>.
          </p>
        </CardContent>
      </Card>

      {/* Supabase Status Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Status Database & Storage Supabase
              </CardTitle>
              <CardDescription className="text-xs">
                Penyimpanan cloud untuk dataset Asesmen Nasional dan riwayat proyek analisis.
              </CardDescription>
            </div>
            <Badge variant={isSupabaseConfigured() ? 'success' : 'secondary'} className="text-xs">
              {isSupabaseConfigured() ? 'Supabase Connected' : 'Local Storage Mode'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Aplikasi saat ini berjalan secara optimal menggunakan browser storage lokal dan file dataset bawaan. Jika Anda ingin menghubungkan Supabase kustom, Anda dapat mengatur <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di file <code>.env.local</code> saat deploy ke Vercel.
          </p>
        </CardContent>
      </Card>

      {/* Reference Literature & Prompt Guidelines Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                Dokumen Acuan & Standar Parameter Teori
              </CardTitle>
              <CardDescription className="text-xs">
                Teks panduan ini disisipkan secara otomatis sebagai konteks acuan saat menyusun naskah dan interpretasi laporan penelitian.
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                resetReferenceToDefault();
                setRefInput(referenceText);
              }}
              className="h-7 text-xs cursor-pointer text-zinc-600 dark:text-zinc-400"
            >
              <RefreshCw className="w-3 h-3 mr-1" /> Reset ke Default
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={10}
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            className="text-xs font-mono leading-relaxed"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {savedSuccess && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Check className="w-4 h-4" /> Pengaturan berhasil disimpan!
          </span>
        )}
        <Button
          onClick={handleSave}
          className="bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] cursor-pointer px-6 text-xs font-semibold rounded-xl shadow-xs h-9"
        >
          Simpan Semua Pengaturan
        </Button>
      </div>
    </div>
  );
}
