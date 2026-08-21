'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface InteractionPlotProps {
  title?: string;
  subtitle?: string;
  dvName: string;
  factorAName: string;
  factorBName: string;
  descriptives: {
    cells?: Record<string, string>;
    label?: string;
    n?: number;
    mean?: number;
    sd?: number;
    se?: number;
  }[];
}

const COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#9333ea', '#0284c7'];

export function InteractionPlot({
  title = 'Interaction Plot: Efek Interaksi Dua Faktor',
  subtitle,
  dvName,
  factorAName,
  factorBName,
  descriptives
}: InteractionPlotProps) {
  if (!descriptives || !Array.isArray(descriptives) || descriptives.length === 0) return null;

  // Extract levels of Factor A (X-axis) and Factor B (Lines) safely as string[]
  const aLevels: string[] = Array.from(
    new Set(
      descriptives
        .map(d => d?.cells?.[factorAName])
        .filter((v): v is string => Boolean(v && String(v).trim() !== ''))
    )
  );

  const bLevels: string[] = Array.from(
    new Set(
      descriptives
        .map(d => d?.cells?.[factorBName])
        .filter((v): v is string => Boolean(v && String(v).trim() !== ''))
    )
  );

  if (aLevels.length === 0 || bLevels.length === 0) return null;

  // Build chart dataset with structure: [{ factorA: 'URBAN', Swasta: 48.5, Negeri: 54.2 }]
  const chartData = aLevels.map(aLvl => {
    const row: Record<string, any> = { [factorAName]: aLvl };
    bLevels.forEach(bLvl => {
      const match = descriptives.find(
        d => d?.cells?.[factorAName] === aLvl && d?.cells?.[factorBName] === bLvl
      );
      if (match && isFinite(Number(match.mean))) {
        row[bLvl] = Number(match.mean);
      }
    });
    return row;
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </CardTitle>
        <CardDescription className="text-xs">
          {subtitle || `Pengaruh interaksi antara ${factorAName} (sumbu X) dan ${factorBName} (garis warna) terhadap ${dvName}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis
                dataKey={factorAName}
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
                label={{
                  value: `Mean ${dvName}`,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: '#71717a' }
                }}
              />
              <Tooltip
                formatter={(val: any, name: any) => [formatNumber(Number(val), 2), `${factorBName}: ${name}`]}
                contentStyle={{ borderRadius: '8px', fontSize: '12px', background: '#18181b', color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {bLevels.map((bLvl, idx) => (
                <Line
                  key={bLvl}
                  type="monotone"
                  dataKey={bLvl}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 5, strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic text-center mt-1">
          Garis yang berpotongan (tidak sejajar) mengindikasikan adanya efek interaksi yang signifikan.
        </p>
      </CardContent>
    </Card>
  );
}
