import {
  Database,
  Binary,
  GitGraph,
  TrendingUp,
  Boxes,
  Network,
  LineChart,
  Workflow,
  Scale,
  FileText,
  GraduationCap,
  Settings,
  BookOpen,
} from 'lucide-react';

export const SIDEBAR_MENU_LIST = [
  {
    group: 'Manajemen Data',
    items: [
      { title: 'Manajemen Dataset', url: '/data', icon: Database },
    ],
  },
  {
    group: 'Analisis Statistik',
    items: [
      { title: 'Uji-t (t-Test)', url: '/t-test', icon: Binary },
      { title: 'ANOVA Faktorial', url: '/anova', icon: GitGraph },
      { title: 'ANCOVA (Kovariat)', url: '/ancova', icon: TrendingUp },
      { title: 'MANOVA (Multivariate)', url: '/manova', icon: Boxes },
      { title: 'Regresi Linier & Blok', url: '/regression', icon: LineChart },
      { title: 'SEM / Path Analysis', url: '/sem', icon: Workflow },
      { title: 'Multilevel / HLM', url: '/multilevel', icon: Network },
      { title: 'Meta-Analisis IPD', url: '/ipd-meta', icon: Scale },
    ],
  },
  {
    group: 'Publikasi & Metodologi',
    items: [
      { title: 'Draft Laporan', url: '/draft-report', icon: FileText },
      { title: 'Konsultasi Metodologi', url: '/asisten', icon: GraduationCap },
      { title: 'Pengaturan & API', url: '/settings', icon: Settings },
      { title: 'Panduan Praktik', url: '/panduan', icon: BookOpen },
    ],
  },
];
