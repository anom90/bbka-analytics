'use client';

import * as React from 'react';
import { Copy, Check, Download, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableHasilProps<T> {
  title?: string;
  subtitle?: string;
  columns: ColumnDef<T>[];
  data: T[];
  notes?: string;
  className?: string;
}

export function DataTableHasil<T extends Record<string, any>>({
  title,
  subtitle,
  columns,
  data,
  notes,
  className
}: DataTableHasilProps<T>) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyTable = () => {
    if (!data || data.length === 0) return;

    const headers = columns.map(c => c.header).join('\t');
    const rows = data.map(row => {
      return columns.map(col => {
        if (col.accessorKey) {
          const val = row[col.accessorKey as string];
          return val !== null && val !== undefined ? String(val) : '';
        }
        return '';
      }).join('\t');
    }).join('\n');

    const textToCopy = `${title ? `${title}\n` : ''}${headers}\n${rows}${notes ? `\n${notes}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportExcel = () => {
    if (!data || data.length === 0) return;
    const exportData = data.map(row => {
      const obj: Record<string, any> = {};
      columns.forEach(col => {
        if (col.accessorKey) {
          obj[col.header] = row[col.accessorKey as string];
        }
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Analisis');
    XLSX.writeFile(workbook, `${(title || 'tabel_hasil').replace(/\s+/g, '_').toLowerCase()}.xlsx`);
  };

  return (
    <div className={cn('rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-sm overflow-hidden p-5 space-y-3', className)}>
      {/* Title & Action Buttons Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          {title && (
            <h4 className="font-serif text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
              {title}
            </h4>
          )}
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyTable}
            className="h-8 text-xs cursor-pointer gap-1.5"
            title="Salin tabel ke clipboard (bisa langsung paste ke Word/Excel)"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin!' : 'Salin Tabel'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            className="h-8 text-xs cursor-pointer gap-1.5"
            title="Download file Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Excel
          </Button>
        </div>
      </div>

      {/* APA-Style Table Body */}
      <div className="overflow-x-auto">
        <Table className="border-y-2 border-zinc-900 dark:border-zinc-100">
          <TableHeader>
            <TableRow className="border-b border-zinc-900 dark:border-zinc-100 bg-transparent hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead
                  key={i}
                  className={cn(
                    'font-serif text-xs font-semibold text-zinc-900 dark:text-zinc-100 py-2.5',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right'
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rIdx) => (
              <TableRow
                key={rIdx}
                className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 border-b border-zinc-200/50 dark:border-zinc-800/50"
              >
                {columns.map((col, cIdx) => {
                  const content = col.cell
                    ? col.cell(row, rIdx)
                    : col.accessorKey
                    ? String(row[col.accessorKey as string] ?? '-')
                    : '-';

                  return (
                    <TableCell
                      key={cIdx}
                      className={cn(
                        'text-xs py-2',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right font-mono'
                      )}
                    >
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* APA Table Notes */}
      {notes && (
        <p className="text-[11px] font-serif text-zinc-500 dark:text-zinc-400 italic pt-1 border-t border-zinc-100 dark:border-zinc-800">
          {notes}
        </p>
      )}
    </div>
  );
}
