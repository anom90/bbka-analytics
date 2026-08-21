'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ErrorBar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface GroupDataPoint {
  group: string;
  mean: number;
  sd: number;
  se: number;
  ciLower: number;
  ciUpper: number;
  n: number;
  error?: [number, number];
}

interface GroupMeanChartProps {
  title?: string;
  subtitle?: string;
  dvName: string;
  data: {
    group: string;
    mean: any;
    sd: any;
    se: any;
    n: any;
  }[];
}

export function GroupMeanChart({
  title = 'Visualisasi Perbandingan Rata-rata Kelompok',
  subtitle,
  dvName,
  data
}: GroupMeanChartProps) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const chartData: GroupDataPoint[] = data.map(d => {
    const meanNum = isFinite(Number(d.mean)) ? Number(d.mean) : 0;
    const seNum = isFinite(Number(d.se)) ? Number(d.se) : 0;
    const sdNum = isFinite(Number(d.sd)) ? Number(d.sd) : 0;
    const nNum = isFinite(Number(d.n)) ? Number(d.n) : 0;
    const margin = 1.96 * seNum;

    return {
      group: String(d.group || 'Grup'),
      mean: meanNum,
      sd: sdNum,
      se: seNum,
      n: nNum,
      ciLower: meanNum - margin,
      ciUpper: meanNum + margin,
      error: [margin, margin]
    };
  });

  const minVals = chartData.map(d => d.ciLower).filter(v => isFinite(v));
  const maxVals = chartData.map(d => d.ciUpper).filter(v => isFinite(v));

  const minVal = minVals.length > 0 ? Math.min(...minVals) : 0;
  const maxVal = maxVals.length > 0 ? Math.max(...maxVals) : 100;

  const yDomain: [number, number] = [
    Math.max(0, Math.floor(minVal - 5)),
    Math.ceil(maxVal + 5)
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </CardTitle>
        {subtitle && (
          <CardDescription className="text-xs">{subtitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis
                dataKey="group"
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
                label={{
                  value: `Rata-rata ${dvName}`,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: '#71717a' }
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as GroupDataPoint;
                    return (
                      <div className="p-2.5 rounded-lg bg-zinc-900 text-white text-xs shadow-lg space-y-1">
                        <p className="font-bold border-b border-zinc-700 pb-1">{d.group}</p>
                        <p>Mean (M): <span className="font-mono text-teal-300 font-bold">{formatNumber(d.mean, 2)}</span></p>
                        <p>Std. Error (SE): <span className="font-mono">{formatNumber(d.se, 2)}</span></p>
                        <p>95% CI: <span className="font-mono">[{formatNumber(d.ciLower, 2)}, {formatNumber(d.ciUpper, 2)}]</span></p>
                        <p>N Sampel: <span className="font-mono">{d.n.toLocaleString()}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="mean"
                fill="#4f46e5"
                radius={[6, 6, 0, 0]}
                barSize={48}
              >
                <ErrorBar
                  dataKey="error"
                  width={8}
                  strokeWidth={2}
                  stroke="#1e1b4b"
                  direction="y"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic text-center mt-1">
          Bilah grafik menunjukkan nilai Mean (M) dengan garis error 95% Confidence Interval (± 1.96 × SE).
        </p>
      </CardContent>
    </Card>
  );
}
