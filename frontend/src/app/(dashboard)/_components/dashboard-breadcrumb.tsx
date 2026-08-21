'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

const ROUTE_LABELS: Record<string, string> = {
  data: 'Manajemen Dataset',
  't-test': 'Uji-t (t-Test)',
  anova: 'ANOVA Faktorial',
  ancova: 'ANCOVA (Kovariat)',
  manova: 'MANOVA (Multivariate)',
  regression: 'Regresi Linier & Blok',
  sem: 'SEM / Path Analysis',
  multilevel: 'Multilevel / HLM',
  'ipd-meta': 'Meta-Analisis IPD',
  'draft-report': 'Draft Laporan',
  asisten: 'Konsultasi Metodologi',
  settings: 'Pengaturan & API',
  panduan: 'Panduan Praktik'
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const currentKey = segments[0] || 'data';
  const label = ROUTE_LABELS[currentKey] || currentKey;

  return (
    <nav className="flex items-center text-xs text-zinc-500 font-medium space-x-1.5">
      <Link href="/data" className="hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        <span>Dashboard</span>
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
      <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{label}</span>
    </nav>
  );
}

export default DashboardBreadcrumb;
