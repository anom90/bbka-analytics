import allCodebooksJson from './all_an_codebooks.json';

export interface VariableCodebookItem {
  code: string;
  label: string;
  domain: string;
  dataType: 'Kontinu (Skala)' | 'Kategorik (2 Kelompok)' | 'Kategorik (>2 Kelompok)' | 'Identitas / ID' | string;
  pisaConceptEquivalent?: string;
  timssEquivalent?: string;
  operationalDefinition: string;
  level: 'Level 1 (Siswa)' | 'Level 2 (Sekolah)' | 'Level 2 (Guru/Satuan PAUD)' | 'Level 2 (Kepala Satuan PAUD)' | 'Identitas' | string;
  possibleRoles?: string[];
}

export const BASE_AN_CODEBOOK_DICTIONARY: Record<string, VariableCodebookItem> = {
  kd_sekolah: {
    code: 'kd_sekolah',
    label: 'Kode Satuan Pendidikan (NPSN)',
    domain: 'Identitas Kluster',
    dataType: 'Identitas / ID',
    pisaConceptEquivalent: 'CNTSCHID (School ID)',
    timssEquivalent: 'IDSCHOOL',
    operationalDefinition: 'Nomor Pokok Sekolah Nasional (NPSN) atau kode acuan satuan pendidikan sebagai unit analisis Level 2.',
    level: 'Identitas',
    possibleRoles: ['Cluster ID (Level 2 Unit)']
  },
  kd_siswa_an: {
    code: 'kd_siswa_an',
    label: 'Nomor Peserta Siswa Asesmen Nasional',
    domain: 'Identitas Responden',
    dataType: 'Identitas / ID',
    pisaConceptEquivalent: 'CNTSTUID (Student ID)',
    timssEquivalent: 'IDSTUD',
    operationalDefinition: 'Kode unik identifikasi peserta didik sebagai unit analisis Level 1.',
    level: 'Identitas',
    possibleRoles: ['Respondent ID (Level 1 Unit)']
  },
  nilai_literasi: {
    code: 'nilai_literasi',
    label: 'Capaian Kompetensi Literasi Membaca',
    domain: 'Capaian Akademik (Hasil Belajar)',
    dataType: 'Kontinu (Skala)',
    pisaConceptEquivalent: 'PISA Reading Literacy (PV1READ - PV10READ)',
    timssEquivalent: 'PIRLS Reading Score',
    operationalDefinition: 'Skor kemampuan membaca, memahami, mengevaluasi, dan merefleksikan berbagai jenis teks (skala 0–100).',
    level: 'Level 1 (Siswa)',
    possibleRoles: ['Dependent Variable (Outcome Y)', 'Level 1 Outcome']
  },
  nilai_numerasi: {
    code: 'nilai_numerasi',
    label: 'Capaian Kompetensi Numerasi Matematika',
    domain: 'Capaian Akademik (Hasil Belajar)',
    dataType: 'Kontinu (Skala)',
    pisaConceptEquivalent: 'PISA Mathematics Literacy (PV1MATH - PV10MATH)',
    timssEquivalent: 'TIMSS Mathematics Score (BSMMAT01-05)',
    operationalDefinition: 'Skor kemampuan berpikir menggunakan konsep, prosedur, fakta, dan alat matematika untuk menyelesaikan masalah (skala 0–100).',
    level: 'Level 1 (Siswa)',
    possibleRoles: ['Dependent Variable (Outcome Y)', 'Level 1 Outcome']
  },
  jenis_kelamin: {
    code: 'jenis_kelamin',
    label: 'Jenis Kelamin Peserta Didik',
    domain: 'Demografi Siswa',
    dataType: 'Kategorik (2 Kelompok)',
    pisaConceptEquivalent: 'ST004D01T (Gender: Female / Male)',
    timssEquivalent: 'ITSEX (Student Gender)',
    operationalDefinition: 'Identitas gender siswa yang dikategorikan menjadi L (Laki-laki) dan P (Perempuan).',
    level: 'Level 1 (Siswa)',
    possibleRoles: ['Independent Variable (Factor)', 'Level 1 Control Predictor', 'Group Variable']
  },
  ses_siswa: {
    code: 'ses_siswa',
    label: 'Status Sosial Ekonomi (SES) Siswa',
    domain: 'Latar Belakang Sosial Ekonomi',
    dataType: 'Kontinu (Skala)',
    pisaConceptEquivalent: 'ESCS (Index of Economic, Social and Cultural Status)',
    timssEquivalent: 'Home Educational Resources (HER)',
    operationalDefinition: 'Indeks komposit latar belakang sosial ekonomi keluarga berdasarkan pendidikan orang tua, pekerjaan, dan kepemilikan fasilitas belajar di rumah.',
    level: 'Level 1 (Siswa)',
    possibleRoles: ['Level 1 Predictor', 'Covariate (Kovariat ANCOVA)', 'Control Variable']
  },
  status_sekolah: {
    code: 'status_sekolah',
    label: 'Status Satuan Pendidikan (Negeri / Swasta)',
    domain: 'Karakteristik Kelembagaan Sekolah',
    dataType: 'Kategorik (2 Kelompok)',
    pisaConceptEquivalent: 'SCHLTYPE (School Ownership: Public / Private)',
    timssEquivalent: 'School Ownership',
    operationalDefinition: 'Klasifikasi kepemilikan dan pengelolaan sekolah (N = Negeri, S = Swasta).',
    level: 'Level 2 (Sekolah)',
    possibleRoles: ['Independent Variable (Factor)', 'Level 2 School Predictor']
  },
  status_wilayah: {
    code: 'status_wilayah',
    label: 'Lokasi Geografis Satuan Pendidikan (Urban/Rural)',
    domain: 'Geografi & Lingkungan Sekolah',
    dataType: 'Kategorik (2 Kelompok)',
    pisaConceptEquivalent: 'SC001Q01TA (School Location: Urban / Rural)',
    timssEquivalent: 'School Community Location',
    operationalDefinition: 'Letak satuan pendidikan diklasifikasikan ke dalam wilayah Perkotaan (URBAN) atau Perdesaan (RURAL).',
    level: 'Level 2 (Sekolah)',
    possibleRoles: ['Independent Variable (Factor)', 'Level 2 School Predictor']
  },
  prop_guru_s1: {
    code: 'prop_guru_s1',
    label: 'Proporsi Guru Berkualifikasi Akademik S1/D4',
    domain: 'Kualifikasi Pendidik',
    dataType: 'Kontinu (Skala)',
    pisaConceptEquivalent: 'PROATCE (Proportion of Teachers with Higher Qualification)',
    timssEquivalent: 'Teacher Highest Educational Level',
    operationalDefinition: 'Persentase guru di satuan pendidikan yang memiliki kualifikasi akademik minimal Sarjana (S1/D4).',
    level: 'Level 2 (Sekolah)',
    possibleRoles: ['Level 2 School Predictor', 'Covariate']
  },
  prop_guru_sertif: {
    code: 'prop_guru_sertif',
    label: 'Proporsi Guru Bersertifikasi Pendidik',
    domain: 'Profesionalitas Guru',
    dataType: 'Kontinu (Skala)',
    pisaConceptEquivalent: 'PROATCE (Proportion of Fully Certified Teachers)',
    timssEquivalent: 'Teacher Certification Status',
    operationalDefinition: 'Persentase guru yang telah lulus sertifikasi pendidik profesional.',
    level: 'Level 2 (Sekolah)',
    possibleRoles: ['Level 2 School Predictor']
  },
  rasio_guru_siswa: {
    code: 'rasio_guru_siswa',
    label: 'Rasio Kecukupan Guru terhadap Siswa',
    domain: 'Sumber Daya Sekolah',
    dataType: 'Kontinu (Skala)',
    pisaConceptEquivalent: 'STRATIO (Student-Teacher Ratio)',
    timssEquivalent: 'Class Size / Student-Teacher Ratio',
    operationalDefinition: 'Perbandingan jumlah guru terhadap total peserta didik aktif di satuan pendidikan.',
    level: 'Level 2 (Sekolah)',
    possibleRoles: ['Level 2 School Predictor', 'Covariate']
  },
  guru_iklim_kelas: {
    code: 'guru_iklim_kelas',
    label: 'Indeks Iklim Keamanan & Keteraturan Kelas',
    domain: 'Iklim Pembelajaran & Lingkungan Belajar',
    dataType: 'Kontinu (Skala)',
    pisaConceptEquivalent: 'DISCLIMA (Disciplinary Climate in Classroom)',
    timssEquivalent: 'SOS (Safe and Orderly Schools)',
    operationalDefinition: 'Skor persepsi guru dan siswa mengenai suasana kelas yang tertib, kondusif, dan bebas gangguan saat pembelajaran berlangsung.',
    level: 'Level 2 (Sekolah)',
    possibleRoles: ['Level 2 School Predictor', 'Independent Variable']
  },
  guru_fokus_akademik: {
    code: 'guru_fokus_akademik',
    label: 'Indeks Penekanan Keberhasilan Akademik Sekolah',
    domain: 'Kepemimpinan Instruksional',
    dataType: 'Kontinu (Skala)',
    pisaConceptEquivalent: 'TEACHSUP (Teacher Support & Academic Expectations)',
    timssEquivalent: 'SEAS (School Emphasis on Academic Success)',
    operationalDefinition: 'Skor komitmen guru dan pimpinan sekolah dalam menetapkan ekspektasi akademik tinggi bagi seluruh peserta didik.',
    level: 'Level 2 (Sekolah)',
    possibleRoles: ['Level 2 School Predictor', 'Independent Variable']
  },
  guru_aman_perundungan: {
    code: 'guru_aman_perundungan',
    label: 'Indeks Iklim Keamanan dari Perundungan (Anti-Bullying)',
    domain: 'Keamanan & Kesejahteraan Siswa',
    dataType: 'Kontinu (Skala)',
    pisaConceptEquivalent: 'BEHIND (Student Bullying Scale)',
    timssEquivalent: 'SDS (School Discipline and Safety)',
    operationalDefinition: 'Tingkat rasa aman dan perlindungan siswa dari segala bentuk perundungan fisik, verbal, maupun sosial di lingkungan sekolah.',
    level: 'Level 2 (Sekolah)',
    possibleRoles: ['Level 2 School Predictor', 'Independent Variable']
  },
  guru_aman_hukuman: {
    code: 'guru_aman_hukuman',
    label: 'Indeks Pencegahan Kekerasan & Hukuman Fisik',
    domain: 'Kesejahteraan & Perlindungan Peserta Didik',
    dataType: 'Kontinu (Skala)',
    pisaConceptEquivalent: 'STUWB (Student Well-Being & Safe Environment)',
    timssEquivalent: 'School Climate and Discipline',
    operationalDefinition: 'Indeks penerapan disiplin positif tanpa hukuman fisik dan kekerasan emosional di satuan pendidikan.',
    level: 'Level 2 (Sekolah)',
    possibleRoles: ['Level 2 School Predictor', 'Independent Variable']
  }
};

// Normalized master dictionary containing all 250+ variables from all education levels (PAUD, SD, SMP, SMA)
const parsedAllCodebooks: Record<string, VariableCodebookItem> = {};
if (allCodebooksJson && typeof allCodebooksJson === 'object') {
  for (const [key, raw] of Object.entries(allCodebooksJson as Record<string, any>)) {
    parsedAllCodebooks[key] = {
      code: raw.code || key,
      label: raw.label || key,
      domain: raw.domain || raw.source || (raw.level ? `Lingkup ${raw.level}` : 'Survei Lingkungan Belajar (Sulingjar)'),
      dataType: raw.dataType || (raw.range?.includes('%') || raw.range?.includes('0-100') ? 'Kontinu (Skala)' : 'Kontinu (Skala)'),
      pisaConceptEquivalent: raw.pisaConceptEquivalent || '-',
      timssEquivalent: raw.timssEquivalent || '-',
      operationalDefinition: raw.operationalDef || raw.def || raw.conceptualDef || raw.label || `Variabel ${key}`,
      level: raw.level || 'Level 2 (Sekolah)',
      possibleRoles: raw.possibleRoles || ['Level 2 Predictor', 'Kovariat']
    };
  }
}

export const AN_CODEBOOK_DICTIONARY: Record<string, VariableCodebookItem> = {
  ...parsedAllCodebooks,
  ...BASE_AN_CODEBOOK_DICTIONARY
};

/**
 * Get variable codebook item with prefix awareness (e.g. guru_TOC, kepsek_SPAB_1):
 * 1. Custom codebook parsed from the uploaded Excel sheet
 * 2. Exact match in master dictionary
 * 3. Prefix-stripped match (e.g., 'guru_TOC' -> base 'TOC' -> '[Agregat Guru] Toleransi Budaya')
 * 4. Case-insensitive / normalized search
 * 5. Formatted fallback
 */
export function getVariableCodebook(
  varName: string,
  customCodebook?: Record<string, VariableCodebookItem>
): VariableCodebookItem {
  if (!varName) {
    return {
      code: '',
      label: '-',
      domain: '-',
      dataType: 'Kontinu (Skala)',
      operationalDefinition: '-',
      level: 'Level 1 (Siswa)',
      possibleRoles: []
    };
  }

  // 1. Custom codebook from active dataset
  if (customCodebook && customCodebook[varName]) {
    return customCodebook[varName];
  }

  // 2. Exact match in master dictionary (including role-prefixed keys like guru_TSC, siswa_TSC, kepsek_SPAB_1)
  if (AN_CODEBOOK_DICTIONARY[varName]) {
    const raw = AN_CODEBOOK_DICTIONARY[varName];
    // Prepend role tag if not already in label
    let cleanLabel = raw.label;
    if (varName.startsWith('guru_') && !cleanLabel.toLowerCase().includes('guru') && !cleanLabel.toLowerCase().includes('pendidik')) {
      cleanLabel = `[Agregat Pendidik/Guru] ${cleanLabel}`;
    } else if (varName.startsWith('siswa_') && !cleanLabel.toLowerCase().includes('siswa') && !cleanLabel.toLowerCase().includes('murid')) {
      cleanLabel = `[Peserta Didik] ${cleanLabel}`;
    } else if (varName.startsWith('kepsek_') || varName.startsWith('kepala_')) {
      cleanLabel = `[Data Kepala Satuan] ${cleanLabel}`;
    }
    return {
      ...raw,
      label: cleanLabel
    };
  }

  // 3. Prefix-Aware Resolution for Aggregated / Merged Variables (e.g. guru_TOC, kepsek_SPAB_1, guru_jumlah_perpus)
  const prefixMatch = varName.match(/^(guru|kepsek|kepala|sekolah|school|l2|mean|agg)[_.-](.+)$/i);
  if (prefixMatch) {
    const rawPrefix = prefixMatch[1].toLowerCase();
    const baseVarName = prefixMatch[2];

    // Try role-specific key first in dictionary (e.g. guru_TOC)
    const roleKey = `${rawPrefix === 'kepala' ? 'kepsek' : rawPrefix}_${baseVarName}`;
    if (AN_CODEBOOK_DICTIONARY[roleKey]) {
      return AN_CODEBOOK_DICTIONARY[roleKey];
    }

    const baseItem = getVariableCodebook(baseVarName, customCodebook);
    if (baseItem && baseItem.label && baseItem.label !== baseVarName) {
      let prefixLabel = '[Agregat Pendidik/Guru]';
      if (rawPrefix === 'kepsek' || rawPrefix === 'kepala') prefixLabel = '[Data Kepala Satuan]';
      else if (rawPrefix === 'guru') prefixLabel = '[Agregat Pendidik/Guru]';
      else if (rawPrefix === 'sekolah' || rawPrefix === 'school' || rawPrefix === 'l2') prefixLabel = '[Agregat Level 2 Sekolah]';

      return {
        code: varName,
        label: `${prefixLabel} ${baseItem.label}`,
        domain: baseItem.domain ? `[Level 2] ${baseItem.domain}` : 'Karakteristik Satuan Pendidikan (Level 2)',
        dataType: baseItem.dataType || 'Kontinu (Skala)',
        pisaConceptEquivalent: baseItem.pisaConceptEquivalent || '-',
        timssEquivalent: baseItem.timssEquivalent || '-',
        operationalDefinition: `Rerata tingkat satuan pendidikan (Level 2) dari: ${baseItem.operationalDefinition || baseItem.label}`,
        level: 'Level 2 (Sekolah / Pendidik)',
        possibleRoles: ['Level 2 School Predictor', 'Kovariat', 'Independent Variable']
      };
    }
  }

  // 4. Default Student fallback if siswa_varName exists
  const siswaKey = `siswa_${varName}`;
  if (AN_CODEBOOK_DICTIONARY[siswaKey]) {
    return AN_CODEBOOK_DICTIONARY[siswaKey];
  }

  // 4. Normalized / case-insensitive search
  const lower = varName.toLowerCase().trim();
  const foundKey = Object.keys(AN_CODEBOOK_DICTIONARY).find(
    k => k.toLowerCase() === lower || k.toLowerCase().replace(/[._-]/g, '') === lower.replace(/[._-]/g, '')
  );

  if (foundKey) {
    return AN_CODEBOOK_DICTIONARY[foundKey];
  }

  // 5. Fallback with formatted title
  const formatted = varName
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return {
    code: varName,
    label: formatted,
    domain: 'Variabel Kustom / Tambahan',
    dataType: 'Kontinu (Skala)',
    pisaConceptEquivalent: '-',
    operationalDefinition: `Variabel ${varName} dari dataset Asesmen Nasional.`,
    level: 'Level 1 (Siswa)',
    possibleRoles: ['Prediktor / Kovariat']
  };
}

// Administrative/structural columns (Dapodik-sourced school attributes) that appear as a
// column in the student-level file too, but are conceptually Level 2 (one value per school,
// just repeated across every student row) regardless of which respondent-type codebook
// sheet they were read from.
const LEVEL2_SCHOOL_STRUCTURAL_CODES = new Set([
  'kd_sekolah', 'kd_individu', 'pendidikan_sederajat', 'jenis_sek', 'sts_sek', 'kurikulum',
  'daerah_khusus', 'kd_kokab', 'wilayah_bagian', 'jenis_wilayah', 'status_wilayah',
  'proporsi_pendidik_min_s1', 'proporsi_pendidik_sertifikasi', 'jumlah_peserta_didik',
  'jumlah_pendidik', 'rasio_pendidik_peserta_didik', 'jumlah_r_kelas',
  'ketersediaan_internet', 'ketersediaan_listrik', 'jumlah_komp_milik', 'jumlah_perpus',
  'jumlah_rombel', 'jumlah_siswa_rombel', 'jumlah_siswa_penerima_PIP',
  'rasio_siswa_penerima_PIP', 'SES_sekolah', 'IASP'
]);

/**
 * Infer the correct analysis level for a variable extracted from an uploaded workbook's
 * codebook sheet, based on the sheet name it came from (e.g. `codebook_siswa` -> Level 1,
 * `codebook_guru` -> Level 2). Used instead of a single hardcoded level, since a codebook
 * sheet parsed wholesale used to tag every single variable "Level 2 (Satuan/Pendidik)" even
 * when it was read from a student ("codebook_siswa") sheet.
 */
export function inferCodebookLevelFromSheetName(sheetName: string, code: string): string {
  if (code === 'kd_siswa_an') return 'Identitas';
  if (LEVEL2_SCHOOL_STRUCTURAL_CODES.has(code)) return 'Level 2 (Sekolah)';

  const s = sheetName.toLowerCase();
  if (s.includes('siswa')) return 'Level 1 (Peserta Didik)';
  if (s.includes('guru')) return 'Level 2 (Pendidik/Guru)';
  if (s.includes('kepsek') || s.includes('kepala')) return 'Level 2 (Kepala Satuan Pendidikan)';
  return 'Level 2 (Satuan/Pendidik)';
}

export function getVariableLabel(
  varName: string,
  customCodebook?: Record<string, VariableCodebookItem>
): string {
  const item = getVariableCodebook(varName, customCodebook);
  return item.label || varName;
}

export function getVariableDescription(
  varName: string,
  customCodebook?: Record<string, VariableCodebookItem>
): string {
  const item = getVariableCodebook(varName, customCodebook);
  return item.operationalDefinition || item.label || varName;
}

/**
 * Format full contextual codebook information for variables involved in an analysis,
 * to be injected into Gemini AI prompts so the generated narratives are deeply contextual.
 */
export function formatCodebookContext(
  varNames: string[],
  customCodebook?: Record<string, VariableCodebookItem>
): string {
  const uniqueVars = Array.from(new Set(varNames.filter(Boolean)));
  if (uniqueVars.length === 0) return '';

  let text = '### Kamus Definisi Operasional & Konseptual Variabel (Asesmen Nasional Kemendikbudristek):\n';
  for (const v of uniqueVars) {
    const cb = getVariableCodebook(v, customCodebook);
    text += `- **Variabel \`${v}\`**:\n`;
    text += `  * Nama Indikator: ${cb.label}\n`;
    text += `  * Definisi Operasional: ${cb.operationalDefinition || cb.label}\n`;
    text += `  * Level Analisis: ${cb.level}\n`;
    if (cb.domain && cb.domain !== '-') {
      text += `  * Lingkup Domain: ${cb.domain}\n`;
    }
    if (cb.pisaConceptEquivalent && cb.pisaConceptEquivalent !== '-') {
      text += `  * Padanan Konsep PISA/TIMSS: ${cb.pisaConceptEquivalent}\n`;
    }
  }
  return text;
}
