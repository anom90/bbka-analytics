import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ColumnMeta, DataRow, VariableType } from '@/lib/types';
import { get, set as idbSet, del } from 'idb-keyval';
import { getVariableCodebook } from '@/constants/an-codebook';

// IndexedDB storage adapter for safe, unlimited local storage persistence.
// Writes are debounced per key: a large dataset (tens of thousands of rows) means every
// setItem() call re-serializes and commits a multi-MB blob, so several state updates firing
// in quick succession (e.g. a multi-step import/imputation) would otherwise queue up
// redundant overlapping writes and visibly stall the UI. Coalescing them into one write of
// the latest value after a short quiet period keeps that cost to a single commit.
const pendingWrites = new Map<string, ReturnType<typeof setTimeout>>();

const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === 'undefined') return null;
    try {
      const val = await get(name);
      return val || null;
    } catch {
      return localStorage.getItem(name);
    }
  },
  setItem: (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve();
    return new Promise((resolve) => {
      const existingTimer = pendingWrites.get(name);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(async () => {
        pendingWrites.delete(name);
        try {
          await idbSet(name, value);
        } catch {
          try {
            localStorage.setItem(name, value);
          } catch (e) {
            console.warn('Storage quota exceeded', e);
          }
        }
        resolve();
      }, 400);

      pendingWrites.set(name, timer);
    });
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    const existingTimer = pendingWrites.get(name);
    if (existingTimer) {
      clearTimeout(existingTimer);
      pendingWrites.delete(name);
    }
    try {
      await del(name);
    } catch {
      localStorage.removeItem(name);
    }
  },
};

export interface DataFilterRule {
  id: string;
  col: string;
  op: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
  val: string;
}

export interface MissingColumnDiagnostic {
  name: string;
  type: VariableType;
  validCount: number;
  missingCount: number;
  missingPct: number;
}

export interface MissingPatternDiagnostic {
  patternId: string;
  count: number;
  pct: number;
  missingVars: string[];
  isComplete: boolean;
}

export interface DatasetMissingDiagnostics {
  totalRows: number;
  totalCols: number;
  totalCells: number;
  totalMissingCells: number;
  overallMissingPct: number;
  completeRowsCount: number;
  completeRowsPct: number;
  incompleteRowsCount: number;
  incompleteRowsPct: number;
  columnStats: MissingColumnDiagnostic[];
  patterns: MissingPatternDiagnostic[];
}

export type ImputationMethod = 'mean' | 'median' | 'pmm' | 'rf' | 'cart';

interface DatasetState {
  data: DataRow[];
  columns: ColumnMeta[];
  fileName: string;
  isLoading: boolean;
  error: string | null;
  selectedRowIndex: number | null;

  // History & Filter state
  originalData: DataRow[];
  filterRules: DataFilterRule[];
  selectedSubsetCols: string[];
  customCodebook: Record<string, any>;

  // Actions
  loadDefaultDataset: () => Promise<void>;
  loadFromCsvString: (csvString: string, fileName?: string) => void;
  loadFromFile: (file: File) => Promise<void>;
  loadFromParsedData: (parsedData: DataRow[], fileName: string, customCodebook?: Record<string, any>) => void;
  setColumnType: (colName: string, type: VariableType) => void;
  clearData: () => void;

  // Advanced Data Tools
  applyFilters: (rules: DataFilterRule[]) => void;
  applySubsetColumns: (cols: string[]) => void;
  resetToOriginalData: () => void;
  dropMissingRows: () => { droppedCount: number; remainingCount: number };
  dropEmptyColumns: (thresholdPct?: number) => { droppedCols: string[]; remainingCols: number };
  dropSpecificColumns: (cols: string[]) => { droppedCols: string[]; remainingCols: number };
  imputeMissingData: (method: ImputationMethod) => Promise<{ imputedCount: number }>;
  mergeWithSecondaryData: (
    secondaryData: DataRow[],
    primaryKey: string,
    secondaryKey: string,
    joinType?: 'left' | 'inner',
    selectedColsToMerge?: string[],
    aggregatePrefix?: string,
    ignoreEmptySecondaryCols?: boolean
  ) => {
    addedCols: number;
    totalRows: number;
    matchedRows: number;
    matchPct: number;
    matchedSchools: number;
    totalSchools: number;
    skippedEmptyColsCount: number;
  };
  exportData: (format: 'csv' | 'xlsx' | 'json', customName?: string) => void;
}

export function isMissingValue(v: any): boolean {
  return (
    v === null ||
    v === undefined ||
    v === '' ||
    v === 'NA' ||
    v === 'NULL' ||
    v === 'NaN' ||
    (typeof v === 'number' && isNaN(v))
  );
}

export function calculateMissingDiagnostics(data: DataRow[], columns: ColumnMeta[]): DatasetMissingDiagnostics {
  const totalRows = data.length;
  const totalCols = columns.length;
  const totalCells = totalRows * totalCols;

  if (totalRows === 0 || totalCols === 0) {
    return {
      totalRows: 0,
      totalCols: 0,
      totalCells: 0,
      totalMissingCells: 0,
      overallMissingPct: 0,
      completeRowsCount: 0,
      completeRowsPct: 100,
      incompleteRowsCount: 0,
      incompleteRowsPct: 0,
      columnStats: [],
      patterns: []
    };
  }

  const colStatsMap = new Map<string, { missingCount: number; validCount: number }>();
  for (const c of columns) {
    colStatsMap.set(c.name, { missingCount: 0, validCount: 0 });
  }

  let completeRowsCount = 0;
  const patternCounts = new Map<string, { count: number; missingVars: string[] }>();

  for (let i = 0; i < totalRows; i++) {
    const row = data[i];
    let rowHasMissing = false;
    const missingVarsInRow: string[] = [];

    for (const col of columns) {
      const v = row[col.name];
      const isMissing = isMissingValue(v);
      const stat = colStatsMap.get(col.name)!;

      if (isMissing) {
        stat.missingCount++;
        rowHasMissing = true;
        missingVarsInRow.push(col.name);
      } else {
        stat.validCount++;
      }
    }

    if (!rowHasMissing) {
      completeRowsCount++;
    }

    const patternKey = missingVarsInRow.length === 0 ? 'COMPLETE' : missingVarsInRow.sort().join('|');
    if (!patternCounts.has(patternKey)) {
      patternCounts.set(patternKey, { count: 0, missingVars: missingVarsInRow });
    }
    patternCounts.get(patternKey)!.count++;
  }

  let totalMissingCells = 0;
  const columnStats: MissingColumnDiagnostic[] = columns.map(c => {
    const stat = colStatsMap.get(c.name)!;
    totalMissingCells += stat.missingCount;
    return {
      name: c.name,
      type: c.type,
      validCount: stat.validCount,
      missingCount: stat.missingCount,
      missingPct: totalRows > 0 ? (stat.missingCount / totalRows) * 100 : 0
    };
  });

  const incompleteRowsCount = totalRows - completeRowsCount;
  const completeRowsPct = totalRows > 0 ? (completeRowsCount / totalRows) * 100 : 100;
  const incompleteRowsPct = totalRows > 0 ? (incompleteRowsCount / totalRows) * 100 : 0;
  const overallMissingPct = totalCells > 0 ? (totalMissingCells / totalCells) * 100 : 0;

  const patterns: MissingPatternDiagnostic[] = Array.from(patternCounts.entries())
    .map(([key, val], idx) => ({
      patternId: `P${idx + 1}`,
      count: val.count,
      pct: (val.count / totalRows) * 100,
      missingVars: val.missingVars,
      isComplete: key === 'COMPLETE'
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalRows,
    totalCols,
    totalCells,
    totalMissingCells,
    overallMissingPct,
    completeRowsCount,
    completeRowsPct,
    incompleteRowsCount,
    incompleteRowsPct,
    columnStats,
    patterns
  };
}

export function inferColumnMeta(data: DataRow[]): ColumnMeta[] {
  if (!data || data.length === 0) return [];
  const firstRow = data[0];
  const colNames = Object.keys(firstRow);

  return colNames.map(colName => {
    const lowerName = colName.toLowerCase();
    
    const isExplicitId =
      lowerName.startsWith('kd_') ||
      lowerName.startsWith('id_') ||
      lowerName.startsWith('kode_') ||
      lowerName.endsWith('_id') ||
      lowerName.endsWith('_kd') ||
      lowerName === 'id' ||
      lowerName === 'nisn' ||
      lowerName === 'npsn';

    let numericCount = 0;
    let missingCount = 0;
    const values: any[] = [];

    for (let i = 0; i < Math.min(data.length, 500); i++) {
      const v = data[i][colName];
      if (isMissingValue(v)) {
        missingCount++;
      } else {
        values.push(v);
        if (!isNaN(Number(v)) && String(v).trim() !== '') {
          numericCount++;
        }
      }
    }

    const isPurelyNumeric = !isExplicitId && values.length > 0 && numericCount / values.length >= 0.8;
    const uniqueValues = Array.from(new Set(values.map(v => String(v))));

    let min: number | undefined;
    let max: number | undefined;
    let mean: number | undefined;
    let sd: number | undefined;

    if (isPurelyNumeric) {
      const numVals = data
        .map(r => Number(r[colName]))
        .filter(n => !isNaN(n));

      if (numVals.length > 0) {
        min = Math.min(...numVals);
        max = Math.max(...numVals);
        mean = numVals.reduce((a, b) => a + b, 0) / numVals.length;
        const variance = numVals.reduce((s, v) => s + Math.pow(v - mean!, 2), 0) / Math.max(1, numVals.length - 1);
        sd = Math.sqrt(variance);
      }
    }

    return {
      name: colName,
      type: isPurelyNumeric ? 'numeric' : 'nominal',
      uniqueCount: uniqueValues.length,
      missingCount,
      min,
      max,
      mean,
      sd,
      categories: !isPurelyNumeric ? uniqueValues.slice(0, 50) : undefined
    };
  });
}

export const useDatasetStore = create<DatasetState>()(
  persist(
    (set, get) => ({
      data: [],
      originalData: [],
      columns: [],
      fileName: '',
      isLoading: false,
      error: null,
      selectedRowIndex: null,
      filterRules: [],
      selectedSubsetCols: [],
      customCodebook: {},

      loadDefaultDataset: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/data/data_latihan_jasp_multilevel.csv');
          if (!res.ok) throw new Error('Gagal memuat dataset bawaan.');
          const csvText = await res.text();
          
          Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              const parsedData = results.data as DataRow[];
              const meta = inferColumnMeta(parsedData);
              set({
                data: parsedData,
                originalData: parsedData,
                columns: meta,
                selectedSubsetCols: meta.map(m => m.name),
                fileName: 'data_latihan_jasp_multilevel.csv (Asesmen Nasional)',
                customCodebook: {},
                isLoading: false,
                error: null
              });
            },
            error: (err: Error) => {
              set({ isLoading: false, error: err.message });
            }
          });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Terjadi kesalahan saat memuat data.' });
        }
      },

      loadFromParsedData: (parsedData: DataRow[], fileName: string, customCodebook?: Record<string, any>) => {
        const meta = inferColumnMeta(parsedData);
        set({
          data: parsedData,
          originalData: parsedData,
          columns: meta,
          selectedSubsetCols: meta.map(m => m.name),
          fileName,
          customCodebook: customCodebook || get().customCodebook || {},
          isLoading: false,
          error: null
        });
      },

      loadFromCsvString: (csvString: string, fileName = 'uploaded_data.csv') => {
        Papa.parse(csvString, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data as DataRow[];
            get().loadFromParsedData(parsedData, fileName);
          }
        });
      },

      loadFromFile: async (file: File) => {
        set({ isLoading: true, error: null });
        try {
          const name = file.name.toLowerCase();
          if (name.endsWith('.csv')) {
            const text = await file.text();
            get().loadFromCsvString(text, file.name);
          } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null }) as DataRow[];
            get().loadFromParsedData(jsonData, `${file.name} [${firstSheetName}]`);
          } else {
            throw new Error('Format file tidak didukung. Silakan gunakan file .csv atau .xlsx');
          }
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Gagal memproses file.' });
        }
      },

      setColumnType: (colName: string, type: VariableType) => {
        set(state => ({
          columns: state.columns.map(col =>
            col.name === colName ? { ...col, type } : col
          )
        }));
      },

      clearData: () => set({
        data: [],
        originalData: [],
        columns: [],
        fileName: '',
        filterRules: [],
        selectedSubsetCols: [],
        error: null
      }),

      // Advanced Data Tools
      applyFilters: (rules: DataFilterRule[]) => {
        const base = get().originalData.length > 0 ? get().originalData : get().data;
        if (rules.length === 0) {
          const meta = inferColumnMeta(base);
          set({ data: base, filterRules: [], columns: meta });
          return;
        }

        const filtered = base.filter(row => {
          return rules.every(rule => {
            const rawVal = row[rule.col];
            const colVal = rawVal !== null && rawVal !== undefined ? String(rawVal).trim() : '';
            const targetVal = String(rule.val).trim();
            const isNum = !isNaN(Number(rawVal)) && !isNaN(Number(targetVal));

            switch (rule.op) {
              case '==':
                return isNum ? Number(rawVal) === Number(targetVal) : colVal.toLowerCase() === targetVal.toLowerCase();
              case '!=':
                return isNum ? Number(rawVal) !== Number(targetVal) : colVal.toLowerCase() !== targetVal.toLowerCase();
              case '>':
                return isNum ? Number(rawVal) > Number(targetVal) : false;
              case '<':
                return isNum ? Number(rawVal) < Number(targetVal) : false;
              case '>=':
                return isNum ? Number(rawVal) >= Number(targetVal) : false;
              case '<=':
                return isNum ? Number(rawVal) <= Number(targetVal) : false;
              case 'contains':
                return colVal.toLowerCase().includes(targetVal.toLowerCase());
              default:
                return true;
            }
          });
        });

        const meta = inferColumnMeta(filtered);
        set({ data: filtered, filterRules: rules, columns: meta });
      },

      applySubsetColumns: (cols: string[]) => {
        if (cols.length === 0) return;
        const currentData = get().data;
        const subsetted = currentData.map(row => {
          const newRow: DataRow = {};
          cols.forEach(c => {
            if (row[c] !== undefined) newRow[c] = row[c];
          });
          return newRow;
        });

        const meta = inferColumnMeta(subsetted);
        set({ data: subsetted, selectedSubsetCols: cols, columns: meta });
      },

      resetToOriginalData: () => {
        const orig = get().originalData;
        if (orig && orig.length > 0) {
          const meta = inferColumnMeta(orig);
          set({
            data: orig,
            columns: meta,
            filterRules: [],
            selectedSubsetCols: meta.map(m => m.name)
          });
        }
      },

      // Drop Missing Rows (Listwise Deletion / Complete Cases)
      dropMissingRows: () => {
        const currentData = get().data;
        const columns = get().columns;
        if (currentData.length === 0 || columns.length === 0) {
          return { droppedCount: 0, remainingCount: 0 };
        }

        const completeRows = currentData.filter(row => {
          return columns.every(c => !isMissingValue(row[c.name]));
        });

        const droppedCount = currentData.length - completeRows.length;
        const meta = inferColumnMeta(completeRows);

        set({
          data: completeRows,
          columns: meta
        });

        return { droppedCount, remainingCount: completeRows.length };
      },

      // Drop Columns that are 100% Empty / NA
      dropEmptyColumns: (thresholdPct = 100) => {
        const currentData = get().data;
        const currentCols = get().columns;
        if (currentData.length === 0 || currentCols.length === 0) {
          return { droppedCols: [], remainingCols: 0 };
        }

        const totalRows = currentData.length;
        const colsToDrop: string[] = [];
        const keptCols: ColumnMeta[] = [];

        for (const col of currentCols) {
          let missingCount = 0;
          for (let i = 0; i < totalRows; i++) {
            if (isMissingValue(currentData[i][col.name])) {
              missingCount++;
            }
          }
          const missingPct = (missingCount / totalRows) * 100;
          if (missingPct >= thresholdPct) {
            colsToDrop.push(col.name);
          } else {
            keptCols.push(col);
          }
        }

        if (colsToDrop.length === 0) {
          return { droppedCols: [], remainingCols: currentCols.length };
        }

        const cleanedData = currentData.map(row => {
          const newRow = { ...row };
          for (const dropName of colsToDrop) {
            delete newRow[dropName];
          }
          return newRow;
        });

        set({
          data: cleanedData,
          columns: keptCols
        });

        return { droppedCols: colsToDrop, remainingCols: keptCols.length };
      },

      // Drop Specific Columns by Name
      dropSpecificColumns: (cols: string[]) => {
        const currentData = get().data;
        const currentCols = get().columns;
        if (!cols || cols.length === 0 || currentData.length === 0 || currentCols.length === 0) {
          return { droppedCols: [], remainingCols: currentCols.length };
        }

        const keptCols = currentCols.filter(c => !cols.includes(c.name));
        const cleanedData = currentData.map(row => {
          const newRow = { ...row };
          for (const dropName of cols) {
            delete newRow[dropName];
          }
          return newRow;
        });

        set({
          data: cleanedData,
          columns: keptCols,
          selectedSubsetCols: keptCols.map(c => c.name)
        });

        return { droppedCols: cols, remainingCols: keptCols.length };
      },

      // Impute Missing Data (PMM, Random Forest, CART, Mean, Median)
      imputeMissingData: async (method: ImputationMethod) => {
        const currentData = get().data;
        const columns = get().columns;
        if (currentData.length === 0 || columns.length === 0) {
          return { imputedCount: 0 };
        }

        // Try calling R MICE API endpoint (Machine Learning RF/CART/PMM)
        try {
          const res = await fetch('/api/stats/impute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: currentData, method })
          });

          if (res.ok) {
            const resJson = await res.json();
            if (resJson.success && resJson.data) {
              const meta = inferColumnMeta(resJson.data);
              set({
                data: resJson.data,
                columns: meta
              });
              return { imputedCount: resJson.imputedCells || 0 };
            }
          }
        } catch {
          // Fallback to client-side fast imputation
        }

        // Client-side Imputation Fallback
        const colStats = new Map<string, any>();
        for (const col of columns) {
          if (col.type === 'numeric') {
            const validNums = currentData
              .map(r => Number(r[col.name]))
              .filter(n => !isNaN(n) && isFinite(n));

            if (validNums.length > 0) {
              if (method === 'median' || method === 'pmm' || method === 'rf' || method === 'cart') {
                validNums.sort((a, b) => a - b);
                const mid = Math.floor(validNums.length / 2);
                const med = validNums.length % 2 !== 0 ? validNums[mid] : (validNums[mid - 1] + validNums[mid]) / 2;
                colStats.set(col.name, med);
              } else {
                const mean = validNums.reduce((a, b) => a + b, 0) / validNums.length;
                colStats.set(col.name, mean);
              }
            } else {
              colStats.set(col.name, 0);
            }
          } else {
            // Mode for Categorical
            const counts: Record<string, number> = {};
            for (const r of currentData) {
              const v = r[col.name];
              if (!isMissingValue(v)) {
                const s = String(v);
                counts[s] = (counts[s] || 0) + 1;
              }
            }
            const mode = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b), 'Kategori');
            colStats.set(col.name, mode);
          }
        }

        let imputedCount = 0;
        const imputedRows = currentData.map(row => {
          const newRow = { ...row };
          for (const col of columns) {
            if (isMissingValue(newRow[col.name])) {
              newRow[col.name] = colStats.get(col.name);
              imputedCount++;
            }
          }
          return newRow;
        });

        const meta = inferColumnMeta(imputedRows);
        set({
          data: imputedRows,
          columns: meta
        });

        return { imputedCount };
      },

      mergeWithSecondaryData: (
        secondaryData,
        primaryKey,
        secondaryKey,
        joinType = 'left',
        selectedColsToMerge,
        aggregatePrefix = 'guru_',
        ignoreEmptySecondaryCols = true
      ) => {
        const primary = get().data.length > 0 ? get().data : get().originalData;
        if (primary.length === 0 || !secondaryData || secondaryData.length === 0) {
          throw new Error('Dataset utama dan dataset sekunder harus terisi.');
        }

        const norm = (v: any): string => {
          if (v === null || v === undefined) return '';
          return String(v).trim().toLowerCase().replace(/\.0+$/, '');
        };

        // 1. Group secondary data by normalized secondary key
        const secondaryGrouped = new Map<string, DataRow[]>();
        for (const row of secondaryData) {
          const k = norm(row[secondaryKey]);
          if (k !== '') {
            if (!secondaryGrouped.has(k)) secondaryGrouped.set(k, []);
            secondaryGrouped.get(k)!.push(row);
          }
        }

        // 2. Identify candidate columns from secondary data
        const allSecCols = Object.keys(secondaryData[0] || {}).filter(
          c => norm(c) !== norm(secondaryKey) && c !== 'id' && c !== '__rowNum__'
        );

        let initialTargetCols = selectedColsToMerge && selectedColsToMerge.length > 0
          ? selectedColsToMerge.filter(c => norm(c) !== norm(secondaryKey))
          : allSecCols;

        // Auto filter out 100% empty columns (e.g. SMK questions in SMA dataset)
        let skippedEmptyColsCount = 0;
        let targetCols = initialTargetCols;
        if (ignoreEmptySecondaryCols) {
          targetCols = initialTargetCols.filter(col => {
            const hasAnyValid = secondaryData.some(r => !isMissingValue(r[col]));
            if (!hasAnyValid) {
              skippedEmptyColsCount++;
              return false;
            }
            return true;
          });
        }

        // 3. Pre-aggregate secondary cluster data (e.g. average teacher score per school)
        const secondaryAggMap = new Map<string, Record<string, any>>();
        for (const [k, rows] of secondaryGrouped.entries()) {
          const agg: Record<string, any> = {};
          
          for (const col of targetCols) {
            const numVals = rows
              .map(r => r[col])
              .filter(v => v !== null && v !== undefined && v !== '' && !isNaN(Number(v)))
              .map(v => Number(v));
            const finalColName = col.startsWith(aggregatePrefix) ? col : `${aggregatePrefix}${col}`;
            
            if (numVals.length > 0) {
              // Mean aggregation for numeric indicators
              agg[finalColName] = numVals.reduce((a, b) => a + b, 0) / numVals.length;
            } else {
              // Take first valid value for categorical
              const validVal = rows.find(r => r[col] !== null && r[col] !== undefined && r[col] !== '')?.[col];
              agg[finalColName] = validVal !== undefined ? validVal : null;
            }
          }
          secondaryAggMap.set(k, agg);
        }

        // 4. Merge with primary dataset
        const mergedRows: DataRow[] = [];
        let matchedCount = 0;
        const matchedSchoolsSet = new Set<string>();
        const totalSchoolsSet = new Set<string>();

        for (const pRow of primary) {
          const pKeyVal = norm(pRow[primaryKey]);
          if (pKeyVal) totalSchoolsSet.add(pKeyVal);
          
          const sec = secondaryAggMap.get(pKeyVal);
          if (sec) {
            matchedCount++;
            matchedSchoolsSet.add(pKeyVal);
            mergedRows.push({ ...pRow, ...sec });
          } else if (joinType === 'left') {
            // Fill target merged columns with null/NA if school is missing in secondary data
            const emptySec: Record<string, any> = {};
            for (const col of targetCols) {
              const finalColName = col.startsWith(aggregatePrefix) ? col : `${aggregatePrefix}${col}`;
              emptySec[finalColName] = null;
            }
            mergedRows.push({ ...pRow, ...emptySec });
          }
        }

        const matchPct = primary.length > 0 ? (matchedCount / primary.length) * 100 : 0;

        if (matchedCount === 0) {
          const samplePrimary = primary.slice(0, 3).map(r => String(r[primaryKey])).join(', ');
          const sampleSecondary = secondaryData.slice(0, 3).map(r => String(r[secondaryKey])).join(', ');
          throw new Error(
            `Kunci penggabungan '${primaryKey}' vs '${secondaryKey}' tidak menemukan kecocokan sama sekali (0% cocok).\n` +
            `Contoh data utama: [${samplePrimary}], contoh data sekunder: [${sampleSecondary}].\n` +
            `Pastikan Anda memilih kolom ID/Kode Sekolah yang tepat pada kedua dataset.`
          );
        }

        const newMeta = inferColumnMeta(mergedRows);
        const addedCols = newMeta.length - get().columns.length;

        // Enrich customCodebook with metadata for all merged columns
        const updatedCodebook = { ...(get().customCodebook || {}) };
        for (const col of targetCols) {
          const finalColName = col.startsWith(aggregatePrefix) ? col : `${aggregatePrefix}${col}`;
          updatedCodebook[finalColName] = getVariableCodebook(finalColName, updatedCodebook);
        }

        set({
          data: mergedRows,
          originalData: mergedRows,
          columns: newMeta,
          fileName: `merged_${get().fileName || 'asesmen_nasional'}`,
          customCodebook: updatedCodebook
        });

        return {
          addedCols,
          totalRows: mergedRows.length,
          matchedRows: matchedCount,
          matchPct,
          matchedSchools: matchedSchoolsSet.size,
          totalSchools: totalSchoolsSet.size,
          skippedEmptyColsCount
        };
      },

      exportData: (format, customName = 'data_asesmen_nasional_clean') => {
        const rows = get().data;
        if (!rows || rows.length === 0) return;

        const baseName = customName.replace(/\s+/g, '_').toLowerCase();

        if (format === 'csv') {
          const csvStr = Papa.unparse(rows);
          const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${baseName}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        } else if (format === 'xlsx') {
          const ws = XLSX.utils.json_to_sheet(rows);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          XLSX.writeFile(wb, `${baseName}.xlsx`);
        } else if (format === 'json') {
          const jsonStr = JSON.stringify(rows, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${baseName}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    }),
    {
      name: 'stats-an-dataset-idb-storage',
      storage: createJSONStorage(() => indexedDBStorage),
      // `originalData` is a full duplicate of `data`, kept only to support "Reset ke Data
      // Asli". Right after upload (before any filter/drop is applied) they're the exact same
      // array reference, so persisting both would double the JSON payload — and thus the
      // serialize + IndexedDB write cost — on every single action. Skip the duplicate in
      // that common case; `merge` below restores it from `data` on rehydrate if it was
      // omitted, so the reset button still degrades safely to a no-op instead of erroring.
      partialize: (state) => ({
        data: state.data,
        originalData: state.originalData === state.data ? undefined : state.originalData,
        columns: state.columns,
        fileName: state.fileName,
        filterRules: state.filterRules,
        selectedSubsetCols: state.selectedSubsetCols,
        customCodebook: state.customCodebook
      }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as object) } as DatasetState;
        if (!merged.originalData || merged.originalData.length === 0) {
          merged.originalData = merged.data;
        }
        return merged;
      }
    }
  )
);
