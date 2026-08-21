'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  badgeText?: string;
  badgeIcon?: LucideIcon;
  description: string | React.ReactNode;
  children?: React.ReactNode; // Action buttons: Reset, Auto-Run, Run, etc.
  className?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  badgeText,
  badgeIcon: BadgeIcon,
  description,
  children,
  className
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-zinc-900/90 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all",
        className
      )}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200/80 dark:border-teal-800/70 text-[#008080] dark:text-[#14a3a3] flex items-center justify-center shrink-0 shadow-2xs">
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-nowrap">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
              {title}
            </h2>
            {badgeText && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-medium border border-teal-500/25 bg-teal-50/70 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 whitespace-nowrap shrink-0">
                {BadgeIcon && <BadgeIcon className="w-3 h-3 text-teal-600 dark:text-teal-400" />}
                {badgeText}
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {description}
          </div>
        </div>
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
          {children}
        </div>
      )}
    </div>
  );
}
