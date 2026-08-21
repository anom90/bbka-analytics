import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ensureArray<T>(val: T | T[] | null | undefined): T[] {
  if (val === null || val === undefined) return [];
  if (Array.isArray(val)) return val;
  return [val];
}

export function formatNumber(val: any, decimals = 3): string {
  if (val === null || val === undefined) return '-';
  const raw = Array.isArray(val) ? val[0] : val;
  const num = Number(raw);
  if (isNaN(num) || raw === '' || raw === 'NaN') return '-';
  if (!isFinite(num)) return num > 0 ? '+Inf' : '-Inf';
  return num.toFixed(decimals);
}

export function formatPValue(p: any): string {
  if (p === null || p === undefined) return '-';
  const raw = Array.isArray(p) ? p[0] : p;
  const num = Number(raw);
  if (isNaN(num) || raw === '' || raw === 'NaN') return '-';
  if (num < 0.001) return '< .001***';
  if (num < 0.01) return `${num.toFixed(3)}**`;
  if (num < 0.05) return `${num.toFixed(3)}*`;
  return num.toFixed(3);
}

export function getSignificanceStars(p: any): string {
  if (p === null || p === undefined) return '';
  const raw = Array.isArray(p) ? p[0] : p;
  const num = Number(raw);
  if (isNaN(num)) return '';
  if (num < 0.001) return '***';
  if (num < 0.01) return '**';
  if (num < 0.05) return '*';
  return '';
}
