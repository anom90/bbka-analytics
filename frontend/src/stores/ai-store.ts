import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_STATS_REFERENCE } from '@/constants/default-reference';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface AiState {
  geminiApiKey: string;
  groqApiKey: string;
  aiProvider: 'auto' | 'gemini' | 'groq';
  geminiModel: string;
  groqModel: string;
  referenceText: string;
  isGenerating: boolean;
  error: string | null;
  interpretations: Record<string, string>;
  chatMessages: ChatMessage[];

  // Actions
  setGeminiApiKey: (key: string) => void;
  setGroqApiKey: (key: string) => void;
  setAiProvider: (provider: 'auto' | 'gemini' | 'groq') => void;
  setGeminiModel: (model: string) => void;
  setGroqModel: (model: string) => void;
  setReferenceText: (text: string) => void;
  setInterpretation: (key: string, text: string) => void;
  setIsGenerating: (status: boolean) => void;
  addChatMessage: (role: 'user' | 'model', content: string) => void;
  clearChatHistory: () => void;
  resetReferenceToDefault: () => void;
}

export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      geminiApiKey: typeof window !== 'undefined' ? (localStorage.getItem('stats_an_gemini_key') || '') : '',
      groqApiKey: typeof window !== 'undefined' ? (localStorage.getItem('stats_an_groq_key') || '') : '',
      aiProvider: typeof window !== 'undefined' ? ((localStorage.getItem('stats_an_ai_provider') as any) || 'auto') : 'auto',
      geminiModel: typeof window !== 'undefined' ? (localStorage.getItem('stats_an_gemini_model') || 'gemini-3.5-flash') : 'gemini-3.5-flash',
      groqModel: typeof window !== 'undefined' ? (localStorage.getItem('stats_an_groq_model') || 'groq/compound') : 'groq/compound',
      referenceText: DEFAULT_STATS_REFERENCE,
      isGenerating: false,
      error: null,
      interpretations: {},
      chatMessages: [
        {
          id: 'welcome-msg',
          role: 'model',
          content: 'Halo! Saya adalah Konsultan Metodologi & Statistik untuk Riset Asesmen Nasional & Analisis Data Skala Besar (JASP & R). Saya dapat membantu Anda merumuskan operasionalisasi variabel, memilih teknik statistik yang tepat, menginterpretasikan output uji-t, ANOVA, ANCOVA, MANOVA, Regresi, SEM/Mediasi, hingga Multilevel Modeling (HLM), serta memberikan panduan penulisan laporan penelitian berstandar APA 7th. Ada yang ingin Anda diskusikan?',
          timestamp: new Date().toLocaleTimeString()
        }
      ],

      setGeminiApiKey: (key: string) => {
        const clean = key ? key.trim() : '';
        if (typeof window !== 'undefined') {
          if (clean) localStorage.setItem('stats_an_gemini_key', clean);
          else localStorage.removeItem('stats_an_gemini_key');
        }
        set({ geminiApiKey: clean });
      },
      setGroqApiKey: (key: string) => {
        const clean = key ? key.trim() : '';
        if (typeof window !== 'undefined') {
          if (clean) localStorage.setItem('stats_an_groq_key', clean);
          else localStorage.removeItem('stats_an_groq_key');
        }
        set({ groqApiKey: clean });
      },
      setAiProvider: (provider: 'auto' | 'gemini' | 'groq') => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('stats_an_ai_provider', provider);
        }
        set({ aiProvider: provider });
      },
      setGeminiModel: (model: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('stats_an_gemini_model', model);
        }
        set({ geminiModel: model });
      },
      setGroqModel: (model: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('stats_an_groq_model', model);
        }
        set({ groqModel: model });
      },
      setReferenceText: (text: string) => set({ referenceText: text }),
      setInterpretation: (key: string, text: string) =>
        set((s) => ({ interpretations: { ...s.interpretations, [key]: text } })),
      setIsGenerating: (status: boolean) => set({ isGenerating: status }),
      addChatMessage: (role, content) =>
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            {
              id: Math.random().toString(36).substring(2, 9),
              role,
              content,
              timestamp: new Date().toLocaleTimeString()
            }
          ]
        })),
      clearChatHistory: () => set({ chatMessages: [] }),
      resetReferenceToDefault: () => set({ referenceText: DEFAULT_STATS_REFERENCE })
    }),
    {
      name: 'stats-an-ai-storage'
    }
  )
);
