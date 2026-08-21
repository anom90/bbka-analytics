'use client';

import * as React from 'react';
import { Hash, Type, Plus, X, AlertCircle, Check, Info, BookOpen, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColumnMeta, VariableType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getVariableCodebook } from '@/constants/an-codebook';
import { useDatasetStore } from '@/stores/dataset-store';
import { VariableTooltip } from '@/components/common/variable-tooltip';

export interface VariableSlot {
  id: string;
  label: string;
  description?: string;
  typeFilter?: 'numeric' | 'nominal' | 'all';
  multi?: boolean;
  selected: string[];
  onChange: (selected: string[]) => void;
}

interface VariableSelectorProps {
  columns: ColumnMeta[];
  slots: VariableSlot[];
  className?: string;
}

export function VariableSelector({ columns, slots, className }: VariableSelectorProps) {
  const { customCodebook } = useDatasetStore();
  const [activeVar, setActiveVar] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'numeric' | 'nominal'>('all');

  // Auto select first variable if none selected
  React.useEffect(() => {
    if (!activeVar && columns.length > 0) {
      setActiveVar(columns[0].name);
    }
  }, [columns, activeVar]);

  const activeColMeta = columns.find(c => c.name === activeVar);
  const activeColType = activeColMeta?.type;
  const activeCb = activeVar ? getVariableCodebook(activeVar, customCodebook) : null;

  const filteredColumns = React.useMemo(() => {
    return columns.filter(col => {
      if (typeFilter !== 'all') {
        if (typeFilter === 'numeric' && col.type !== 'numeric') return false;
        if (typeFilter === 'nominal' && col.type === 'numeric') return false;
      }
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      const cb = getVariableCodebook(col.name, customCodebook);
      return (
        col.name.toLowerCase().includes(q) ||
        (cb?.label && cb.label.toLowerCase().includes(q)) ||
        (cb?.operationalDefinition && cb.operationalDefinition.toLowerCase().includes(q))
      );
    });
  }, [columns, searchTerm, typeFilter, customCodebook]);

  const numericCount = React.useMemo(() => columns.filter(c => c.type === 'numeric').length, [columns]);
  const nominalCount = columns.length - numericCount;

  const isTypeCompatible = (slot: VariableSlot, colType?: VariableType) => {
    if (!slot.typeFilter || slot.typeFilter === 'all') return true;
    if (slot.typeFilter === 'numeric') return colType === 'numeric';
    if (slot.typeFilter === 'nominal') return colType === 'nominal' || colType === 'ordinal';
    return true;
  };

  const handleToggleToSlot = (slot: VariableSlot, colName: string) => {
    const meta = columns.find(c => c.name === colName);
    if (!isTypeCompatible(slot, meta?.type)) {
      return; // Reject incompatible type
    }

    if (slot.multi) {
      if (slot.selected.includes(colName)) {
        slot.onChange(slot.selected.filter(v => v !== colName));
      } else {
        slot.onChange([...slot.selected, colName]);
      }
    } else {
      if (slot.selected.includes(colName)) {
        slot.onChange([]);
      } else {
        slot.onChange([colName]);
      }
    }
  };

  const isAssignedInSlot = (slot: VariableSlot, colName: string) => {
    return slot.selected.includes(colName);
  };

  const isAssignedAnywhere = (colName: string) => {
    return slots.some(s => s.selected.includes(colName));
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-12 gap-4 items-start', className)}>
      {/* Left Pane: Available Variables in Dataset (Expanded & Scrollable) */}
      <div className="md:col-span-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-4 space-y-3 shadow-xs flex flex-col">
        <div className="space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider block">
                Variabel Dataset ({filteredColumns.length}/{columns.length})
              </span>
              <span className="text-[10.5px] text-zinc-400">Klik variabel lalu pilih slot target</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-300">
              {columns.length} Total
            </Badge>
          </div>

          {/* Quick Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari variabel / indikator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#008080]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs cursor-pointer"
              >
                ×
              </button>
            )}
          </div>

          {/* Type Filter Chips */}
          <div className="flex items-center gap-1 text-[10.5px] pb-1">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-2 py-0.5 rounded-lg font-medium cursor-pointer transition-all ${typeFilter === 'all' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-bold' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Semua ({columns.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('numeric')}
              className={`px-2 py-0.5 rounded-lg font-medium cursor-pointer transition-all flex items-center gap-1 ${typeFilter === 'numeric' ? 'bg-teal-700 text-white font-bold' : 'text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40'}`}
            >
              <Hash className="w-2.5 h-2.5" /> Skala ({numericCount})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('nominal')}
              className={`px-2 py-0.5 rounded-lg font-medium cursor-pointer transition-all flex items-center gap-1 ${typeFilter === 'nominal' ? 'bg-amber-700 text-white font-bold' : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'}`}
            >
              <Type className="w-2.5 h-2.5" /> Kategori ({nominalCount})
            </button>
          </div>

          {/* Extended High-Capacity Variable List */}
          <div className="space-y-1.5 min-h-[420px] max-h-[580px] md:max-h-[680px] overflow-y-auto pr-1">
            {filteredColumns.length === 0 ? (
              <p className="text-xs text-zinc-400 py-10 text-center italic">
                {searchTerm ? 'Tidak ada variabel yang cocok dengan pencarian.' : 'Dataset belum dimuat.'}
              </p>
            ) : (
              filteredColumns.map(col => {
                const assigned = isAssignedAnywhere(col.name);
                const isActive = activeVar === col.name;
                const cb = getVariableCodebook(col.name, customCodebook);

                return (
                  <VariableTooltip key={col.name} item={cb} side="right" className="w-full">
                    <div
                      onMouseEnter={() => setActiveVar(col.name)}
                      onClick={() => setActiveVar(col.name)}
                      className={cn(
                        'flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer border w-full text-left',
                        isActive
                          ? 'bg-[#e6f2f2] dark:bg-[#14312f] border-[#008080] dark:border-[#14a3a3] text-[#0a6a6a] dark:text-[#7fdcdc] font-semibold shadow-xs ring-1 ring-[#008080]/30'
                          : assigned
                          ? 'bg-zinc-50/80 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-400'
                          : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-1 flex-1">
                        {col.type === 'numeric' ? (
                          <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 shrink-0 font-bold font-mono text-[11px]">
                            #
                          </span>
                        ) : (
                          <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 shrink-0 font-bold font-mono text-[11px]">
                            T
                          </span>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-mono font-bold truncate leading-tight text-zinc-900 dark:text-zinc-100">
                            {col.name}
                          </span>
                          {cb.label && cb.label !== col.name && (
                            <span className="text-[10px] font-normal text-zinc-500 dark:text-zinc-400 truncate leading-tight" title={cb.label}>
                              {cb.label}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[9px] px-1.5 py-0 h-4 font-mono font-medium',
                            col.type === 'numeric'
                              ? 'border-teal-300 text-teal-800 bg-teal-50/50 dark:border-teal-900 dark:text-teal-300 dark:bg-teal-950/30'
                              : 'border-amber-300 text-amber-800 bg-amber-50/50 dark:border-amber-900 dark:text-amber-300 dark:bg-amber-950/30'
                          )}
                        >
                          {col.type === 'numeric' ? 'Skala' : 'Nominal'}
                        </Badge>
                      </div>
                    </div>
                  </VariableTooltip>
                );
              })
            )}
          </div>
        </div>

        {/* Active Variable Info Box with Codebook Details (Full Text, No Truncation) */}
        {activeColMeta && activeCb ? (
          <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl text-[11px] border border-zinc-200 dark:border-zinc-700/60 shadow-2xs">
            <div className="flex items-center justify-between gap-1.5">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono flex items-center gap-1.5 text-xs">
                <BookOpen className="w-3.5 h-3.5 text-[#008080] dark:text-[#14a3a3]" />
                {activeColMeta.name}
              </span>
              <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 font-semibold">
                {activeCb.level || 'Level 1'}
              </Badge>
            </div>
            <p className="font-bold text-[#008080] dark:text-[#14a3a3] text-xs leading-snug">
              {activeCb.label}
            </p>
            <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
              {activeCb.operationalDefinition || activeCb.label}
            </p>
            {activeCb.domain && (
              <div className="pt-1 text-[10px] text-zinc-400 font-medium">
                Domain: {activeCb.domain}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 text-center text-[11px] text-zinc-400 border border-dashed rounded-2xl">
            Arahkan kursor atau klik variabel untuk melihat definisi lengkap.
          </div>
        )}
      </div>

      {/* Right Pane: Target Slots (DV, IVs, Covariates, Cluster) */}
      <div className="md:col-span-7 space-y-3">
        {slots.map(slot => {
          const compatible = activeColMeta ? isTypeCompatible(slot, activeColType) : false;
          const isSlotNumericOnly = slot.typeFilter === 'numeric';
          const isSlotNominalOnly = slot.typeFilter === 'nominal';

          return (
            <div
              key={slot.id}
              className={cn(
                'rounded-xl border p-4 shadow-sm space-y-2.5 transition-all',
                activeVar && !compatible
                  ? 'border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-900/40 opacity-90'
                  : activeVar && compatible
                  ? 'border-[#008080]/60 dark:border-[#14a3a3]/60 bg-white dark:bg-zinc-900 ring-1 ring-[#008080]/20 dark:ring-[#14a3a3]/20'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      {slot.label}
                    </h5>

                    {/* Required Type Badge */}
                    {isSlotNumericOnly && (
                      <Badge className="bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 text-[10px] px-1.5 py-0 border-teal-200 dark:border-teal-800 font-mono gap-1">
                        <Hash className="w-2.5 h-2.5" /> Skala / Numerik
                      </Badge>
                    )}
                    {isSlotNominalOnly && (
                      <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-[10px] px-1.5 py-0 border-amber-200 dark:border-amber-800 font-mono gap-1">
                        <Type className="w-2.5 h-2.5" /> Nominal / Grup
                      </Badge>
                    )}

                    <span className="text-[10px] text-zinc-400 font-normal">
                      {slot.multi ? '(Bisa banyak)' : '(1 variabel)'}
                    </span>
                  </div>

                  {slot.description && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{slot.description}</p>
                  )}
                </div>

                {/* Intelligent Insert Button / Type Mismatch Warning */}
                {activeVar && (
                  <div>
                    {compatible ? (
                      <Button
                        size="sm"
                        onClick={() => handleToggleToSlot(slot, activeVar)}
                        className={cn(
                          'h-7 text-xs px-2.5 cursor-pointer font-semibold gap-1 shadow-xs transition-colors rounded-xl',
                          isAssignedInSlot(slot, activeVar)
                            ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200'
                            : 'bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f]'
                        )}
                      >
                        {isAssignedInSlot(slot, activeVar) ? (
                          <>
                            <X className="w-3 h-3 text-red-500" /> Hapus &apos;{activeVar}&apos;
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" /> Masukkan &apos;{activeVar}&apos;
                          </>
                        )}
                      </Button>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-2 py-1 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-800/40 cursor-not-allowed font-medium gap-1"
                      >
                        <AlertCircle className="w-3 h-3 text-zinc-400" />
                        {isSlotNominalOnly ? 'Butuh Nominal' : 'Butuh Skala'}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Variables Chips in Slot */}
              <div className="min-h-[44px] p-2 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-2">
                {slot.selected.length === 0 ? (
                  <span className="text-xs text-zinc-400 italic">
                    Belum ada variabel dipilih ({isSlotNumericOnly ? 'pilih variabel Skala #' : isSlotNominalOnly ? 'pilih variabel Nominal T' : 'pilih variabel'})
                  </span>
                ) : (
                  slot.selected.map(vName => {
                    const meta = columns.find(c => c.name === vName);
                    const cb = getVariableCodebook(vName, customCodebook);
                    const isNum = meta?.type === 'numeric';
                    const isInvalid = !isTypeCompatible(slot, meta?.type);

                    return (
                      <VariableTooltip key={vName} item={cb} side="top">
                        <div
                          className={cn(
                            'flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium border shadow-2xs transition-all max-w-[280px]',
                            isInvalid
                              ? 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-200 ring-1 ring-rose-500/40'
                              : isNum
                              ? 'bg-teal-50/90 border-teal-200 text-teal-950 dark:bg-teal-950/60 dark:border-teal-800 dark:text-teal-200'
                              : 'bg-amber-50/90 border-amber-200 text-amber-950 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200'
                          )}
                        >
                          {isInvalid ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : isNum ? (
                            <Hash className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          ) : (
                            <Type className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-mono font-bold leading-tight truncate">{vName}</span>
                            {cb.label && cb.label !== vName && (
                              <span className="text-[9.5px] opacity-75 truncate max-w-[170px] leading-tight font-sans">
                                {cb.label}
                              </span>
                            )}
                          </div>
                          {isInvalid && (
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold shrink-0">
                              !
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              slot.onChange(slot.selected.filter(v => v !== vName));
                            }}
                            className="text-zinc-400 hover:text-red-500 cursor-pointer ml-auto shrink-0 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </VariableTooltip>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
