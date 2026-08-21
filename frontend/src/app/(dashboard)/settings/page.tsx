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
    referenceText,
    setReferenceText,
    resetReferenceToDefault
  } = useAiStore();

  const [apiKeyInput, setApiKeyInput] = React.useState('');
  const [refInput, setRefInput] = React.useState(referenceText);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [testLoading, setTestLoading] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ status: 'success' | 'error'; message: string } | null>(null);

  // Sync apiKeyInput from store / localStorage
  React.useEffect(() => {
    if (geminiApiKey) {
      setApiKeyInput(geminiApiKey);
    } else if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stats_an_gemini_key');
      if (stored) {
        setApiKeyInput(stored);
        setGeminiApiKey(stored);
      }
    }
  }, [geminiApiKey]);

  const handleSave = () => {
    const cleanKey = apiKeyInput.trim();
    setGeminiApiKey(cleanKey);
    setReferenceText(refInput);
    if (typeof window !== 'undefined') {
      if (cleanKey) localStorage.setItem('stats_an_gemini_key', cleanKey);
      else localStorage.removeItem('stats_an_gemini_key');
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestKey = async () => {
    const keyToTest = apiKeyInput.trim();
    if (!keyToTest) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const reply = await callGemini(keyToTest, 'Katakan "OK" jika terhubung.');
      setTestResult({ status: 'success', message: `Koneksi Google Gemini API Berhasil! (${reply.slice(0, 40)})` });
      // Auto save if successful
      setGeminiApiKey(keyToTest);
      if (typeof window !== 'undefined') {
        localStorage.setItem('stats_an_gemini_key', keyToTest);
      }
    } catch (err: any) {
      setTestResult({ status: 'error', message: err.message || 'Koneksi gagal.' });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <PageHeader
        icon={Settings}
        title="Pengaturan Aplikasi & Konfigurasi API"
        badgeIcon={CheckCircle2}
        badgeText="Konfigurasi Sistem"
        description="Kelola Google Gemini API Key, status integrasi database Supabase, dan acuan parameter teoritis penulisan laporan."
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

      {/* Gemini Engine Key Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
                Konektivitas Model Bahasa Akademik (Google Gemini API)
              </CardTitle>
              <CardDescription className="text-xs">
                Digunakan untuk mendukung perumusan narasi ilmiah APA 7th dan modul konsultasi metodologi interaktif.
              </CardDescription>
            </div>
            <Badge variant={geminiApiKey ? 'default' : 'secondary'} className="text-xs">
              {geminiApiKey ? 'API Key Terpasang' : 'Mode Offline / Local Fallback'}
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
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setGeminiApiKey(e.target.value.trim());
                }}
                className="text-xs font-mono flex-1"
              />
              <Button
                type="button"
                onClick={handleTestKey}
                disabled={testLoading || !apiKeyInput.trim()}
                variant="outline"
                className="text-xs shrink-0 cursor-pointer h-9 px-3 gap-1.5 font-semibold"
              >
                {testLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                {testLoading ? 'Menguji...' : 'Uji Koneksi'}
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                {testResult.status === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Settings className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
          <p className="text-[11px] text-zinc-500">
            Kunci API disimpan secara aman di browser lokal Anda (localStorage) dan tidak pernah dibagikan. Dapatkan API key gratis di{' '}
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
