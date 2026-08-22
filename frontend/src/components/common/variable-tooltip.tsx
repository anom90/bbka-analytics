'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { VariableCodebookItem } from '@/constants/an-codebook';
import { Hash, Type, BookOpen, Layers, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VariableTooltipProps {
  item: VariableCodebookItem;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function VariableTooltip({
  item,
  children,
  side = 'right',
  className
}: VariableTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 180;
    const padding = 12;

    let top = rect.top;
    let left = rect.right + padding;

    // Boundary check for right edge of viewport
    if (left + tooltipWidth > window.innerWidth - 10) {
      left = Math.max(10, rect.left - tooltipWidth - padding);
    }

    // Boundary check for bottom edge of viewport
    if (top + tooltipHeight > window.innerHeight - 10) {
      top = Math.max(10, window.innerHeight - tooltipHeight - padding);
    }

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    updatePosition();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const isNumeric = item.dataType?.toLowerCase().includes('skala') ||
    item.dataType?.toLowerCase().includes('kontinu') ||
    item.dataType?.toLowerCase().includes('numeric');

  return (
    <div
      ref={triggerRef}
      className={cn('inline-flex max-w-full', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Global Fixed Floating Tooltip Rendered via Portal Directly into document.body */}
      {mounted && isOpen && coords && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 999999,
          }}
          className="w-72 md:w-80 p-3.5 rounded-2xl shadow-2xl border pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 bg-zinc-950/95 dark:bg-zinc-900/98 text-zinc-100 border-zinc-700/80 backdrop-blur-md ring-1 ring-white/10"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-1.5 min-w-0">
              {isNumeric ? (
                <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-teal-900/80 text-teal-300 font-bold font-mono text-[10px] shrink-0 border border-teal-700/60">
                  #
                </span>
              ) : (
                <span className="flex items-center justify-center w-5 h-5 rounded-lg bg-amber-900/80 text-amber-300 font-bold font-mono text-[10px] shrink-0 border border-amber-700/60">
                  T
                </span>
              )}
              <span className="font-mono font-bold text-xs text-white truncate">
                {item.code}
              </span>
            </div>

            <Badge
              variant="outline"
              className={cn(
                'text-[9px] font-mono px-1.5 py-0 shrink-0 font-bold whitespace-nowrap',
                item.level?.toLowerCase().includes('level 2') || item.level?.toLowerCase().includes('guru') || item.level?.toLowerCase().includes('sekolah')
                  ? 'bg-teal-950 text-teal-300 border-teal-700'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700'
              )}
            >
              {item.level || 'Level 1 (Siswa)'}
            </Badge>
          </div>

          {/* Label Title */}
          <div className="pt-2 space-y-1.5">
            <p className="text-xs font-bold text-teal-300 leading-snug">
              {item.label}
            </p>

            {/* Full Operational Definition */}
            <p className="text-[11px] text-zinc-300 leading-relaxed font-normal">
              {item.operationalDefinition || item.label || 'Indikator Asesmen Nasional.'}
            </p>
          </div>

          {/* Footer Metadata */}
          {item.domain && (
            <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center justify-between text-[9.5px] text-zinc-400">
              <span className="truncate max-w-[170px]" title={item.domain}>
                {item.domain}
              </span>
              <span className="font-mono text-zinc-400 font-semibold shrink-0">
                {item.dataType}
              </span>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
