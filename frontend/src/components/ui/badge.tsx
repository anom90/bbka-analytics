import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'indigo' | 'teal' | 'brand';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80 dark:bg-zinc-50 dark:text-zinc-900',
    secondary: 'border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50',
    destructive: 'border-transparent bg-red-500 text-white hover:bg-red-500/80 dark:bg-red-900 dark:text-zinc-50',
    outline: 'text-zinc-950 dark:text-zinc-50 border-zinc-200 dark:border-zinc-800',
    success: 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-950/50 border border-emerald-500/30',
    warning: 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300 dark:bg-amber-950/50 border border-amber-500/30',
    indigo: 'border-transparent bg-[#008080]/15 text-[#0a6a6a] dark:text-[#7fdcdc] dark:bg-[#14312f] border border-[#008080]/30',
    teal: 'border-transparent bg-[#e6f2f2] text-[#0a6a6a] dark:bg-[#14312f] dark:text-[#7fdcdc] border border-[#008080]/30',
    brand: 'border-transparent bg-[#008080] text-white dark:bg-[#14a3a3] dark:text-[#04211f]'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
