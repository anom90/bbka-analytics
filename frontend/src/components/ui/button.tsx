import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer';
    
    const variants = {
      default: 'bg-[#008080] hover:bg-[#006666] dark:bg-[#14a3a3] dark:hover:bg-[#0f8787] text-white dark:text-[#04211f] shadow-xs font-semibold rounded-xl',
      secondary: 'bg-[#f1f5f5] hover:bg-[#e2e8e8] text-[#0e1a1a] dark:bg-[#172626] dark:hover:bg-[#1f3333] dark:text-[#e8f0f0] rounded-xl',
      destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-xs rounded-xl',
      outline: 'border border-[#e2e8e8] dark:border-white/12 bg-transparent hover:bg-[#f1f5f5] dark:hover:bg-[#172626] text-zinc-900 dark:text-zinc-100 rounded-xl',
      ghost: 'hover:bg-[#e6f2f2] dark:hover:bg-[#14312f] text-zinc-700 dark:text-zinc-300 hover:text-[#0a6a6a] dark:hover:text-[#7fdcdc] rounded-xl',
      link: 'text-[#008080] dark:text-[#14a3a3] underline-offset-4 hover:underline'
    };

    const sizes = {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-9 w-9'
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
