'use client';

import * as React from 'react';
import { Search, ChevronLeft, ChevronRight, Hash, Type, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useDatasetStore } from '@/stores/dataset-store';
import { formatNumber } from '@/lib/utils';
import { getVariableCodebook } from '@/constants/an-codebook';

export function DataTable() {
  const { data, columns, isLoading, setColumnType, customCodebook } = useDatasetStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);
  const [sortCol, setSortCol] = React.useState<string | null>(null);
  const [sortAsc, setSortAsc] = React.useState(true);

  // Filtered rows
  const filteredRows = React.useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row => {
      return Object.values(row).some(v =>
        String(v).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm]);

  // Sorted rows
  const sortedRows = React.useMemo(() => {
    if (!sortCol) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const vA = a[sortCol];
      const vB = b[sortCol];
      if (vA === vB) return 0;
      if (vA === null || vA === undefined) return 1;
      if (vB === null || vB === undefined) return -1;
      if (typeof vA === 'number' && typeof vB === 'number') {
        return sortAsc ? vA - vB : vB - vA;
      }
      return sortAsc
        ? String(vA).localeCompare(String(vB))
        : String(vB).localeCompare(String(vA));
    });
  }, [filteredRows, sortCol, sortAsc]);

  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (colName: string) => {
    if (sortCol === colName) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colName);
      setSortAsc(true);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-zinc-500">
        <div className="animate-spin w-8 h-8 border-4 border-[#008080] dark:border-[#14a3a3] border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Sedang memproses dataset...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-16 text-center border rounded-xl border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Belum ada data yang dimuat.
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
          Silakan upload file CSV/Excel atau klik &apos;Muat Data Asesmen Nasional Bawaan&apos; di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Filter and Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Cari dalam dataset..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-8 text-xs bg-white dark:bg-zinc-900"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>
            Total: <strong>{data.length.toLocaleString()}</strong> baris, <strong>{columns.length}</strong> variabel
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-8 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 text-xs"
          >
            <option value={10}>10 / hal</option>
            <option value={15}>15 / hal</option>
            <option value={25}>25 / hal</option>
            <option value={50}>50 / hal</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center text-xs">#</TableHead>
              {columns.map(col => {
                const cb = getVariableCodebook(col.name, customCodebook);
                return (
                  <TableHead
                    key={col.name}
                    onClick={() => handleSort(col.name)}
                    className="cursor-pointer select-none text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 min-w-[110px]">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{col.name}</span>
                        {cb.label && cb.label !== col.name && (
                          <span className="text-[10px] font-normal text-[#008080] dark:text-[#14a3a3] truncate max-w-[180px] font-sans" title={cb.label}>
                            {cb.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {col.type === 'numeric' ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 h-4 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setColumnType(col.name, 'nominal');
                            }}
                            title="Klik untuk ubah ke Kategori (Nominal)"
                          >
                            <Hash className="w-2.5 h-2.5 mr-0.5" /> Skala
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1 py-0 h-4 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              setColumnType(col.name, 'numeric');
                            }}
                            title="Klik untuk ubah ke Numerik (Skala)"
                          >
                            <Type className="w-2.5 h-2.5 mr-0.5" /> Nominal
                          </Badge>
                        )}
                        {sortCol === col.name && (
                          <span className="text-[10px] text-teal-600 font-bold">{sortAsc ? '▲' : '▼'}</span>
                        )}
                      </div>
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRows.map((row, idx) => {
              const rowIndex = (currentPage - 1) * pageSize + idx + 1;
              return (
                <TableRow key={idx}>
                  <TableCell className="text-center text-xs text-zinc-400 font-mono">
                    {rowIndex}
                  </TableCell>
                  {columns.map(col => {
                    const val = row[col.name];
                    const isNum = col.type === 'numeric' && typeof val === 'number';
                    return (
                      <TableCell key={col.name} className="text-xs font-mono">
                        {val === null || val === undefined || val === '' ? (
                          <span className="text-zinc-300 dark:text-zinc-600 italic">NA</span>
                        ) : isNum ? (
                          formatNumber(val, 2)
                        ) : (
                          String(val)
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-zinc-500">
          Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedRows.length)} dari {sortedRows.length} baris
        </p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="h-8 text-xs cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Sebelumnya
          </Button>
          <span className="text-xs font-medium px-2">
            Halaman {currentPage} dari {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="h-8 text-xs cursor-pointer"
          >
            Berikutnya <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
