'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';

interface CaterpillarPlotProps {
  title?: string;
  subtitle?: string;
  clusterEstimates: {
    clusterId: string;
    rawMean: number;
    blupIntercept: number;
    n: number;
    se: number;
  }[];
  overallMean: number;
}

export function CaterpillarPlot({
  title = 'Gambar 1. Caterpillar Forest Plot: Distribusi Intercept Efek Acak Satuan Pendidikan (BLUPs)',
  subtitle = 'Estimasi performa sekolah dengan interval kepercayaan 95%. Seluruh satuan pendidikan diurutkan berdasarkan peringkat intercept (BLUP empirical Bayes).',
  clusterEstimates,
  overallMean
}: CaterpillarPlotProps) {
  const [hoveredCluster, setHoveredCluster] = React.useState<any | null>(null);

  if (!clusterEstimates || clusterEstimates.length === 0) return null;

  // Sort all clusters in ascending order of BLUP intercepts to form the characteristic S-curve
  const sorted = [...clusterEstimates].sort((a, b) => a.blupIntercept - b.blupIntercept);
  const totalClusters = sorted.length;

  // Calculate X-axis bounds with padding
  const rawMinX = Math.min(...sorted.map(c => c.blupIntercept - 1.96 * c.se), overallMean);
  const rawMaxX = Math.max(...sorted.map(c => c.blupIntercept + 1.96 * c.se), overallMean);
  const span = rawMaxX - rawMinX || 1;
  const minX = Math.floor(rawMinX - span * 0.06);
  const maxX = Math.ceil(rawMaxX + span * 0.06);
  const xRange = maxX - minX || 1;

  // SVG Coordinate Geometry (Fixed ViewBox for 100% Vector Scalability & PDF Printing)
  const svgWidth = 840;
  const svgHeight = 440;
  const padLeft = 75;
  const padRight = 35;
  const padTop = 35;
  const padBottom = 55;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const getX = (val: number) => padLeft + ((val - minX) / xRange) * plotWidth;
  const getY = (idx: number) => padTop + (totalClusters > 1 ? (1 - idx / (totalClusters - 1)) * plotHeight : plotHeight / 2);

  // Generate 6 evenly spaced X-axis tick marks
  const tickCount = 6;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = minX + (i / tickCount) * (maxX - minX);
    return {
      value: val,
      x: getX(val)
    };
  });

  const grandMeanX = getX(overallMean);

  // Count significant clusters
  const sigAbove = sorted.filter(c => c.blupIntercept - 1.96 * c.se > overallMean).length;
  const sigBelow = sorted.filter(c => c.blupIntercept + 1.96 * c.se < overallMean).length;
  const notSig = totalClusters - sigAbove - sigBelow;

  return (
    <Card className="print-avoid-break break-inside-avoid page-break-inside-avoid shadow-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#101c1c] overflow-hidden">
      <CardHeader className="pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              {title}
              <Badge variant="teal" className="text-[10px] font-mono font-normal">
                {totalClusters} Sekolah
              </Badge>
            </CardTitle>
            {subtitle && (
              <CardDescription className="text-xs mt-0.5">{subtitle}</CardDescription>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-zinc-600 dark:text-zinc-400">
            <span>
              Grand Mean (γ₀₀) = <strong className="text-red-600 dark:text-red-400">{formatNumber(overallMean, 2)}</strong>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* SVG Vector Plot (100% Vector Scalability, Zero Page Cutoff) */}
        <div className="relative w-full rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 p-2">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-[420px] block font-sans"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            {/* Background Grid Lines & Ticks */}
            {ticks.map((t, idx) => (
              <g key={idx}>
                <line
                  x1={t.x}
                  y1={padTop}
                  x2={t.x}
                  y2={padTop + plotHeight}
                  stroke="currentColor"
                  className="text-zinc-200 dark:text-zinc-800"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={t.x}
                  y={padTop + plotHeight + 18}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-zinc-500 dark:fill-zinc-400"
                >
                  {formatNumber(t.value, 1)}
                </text>
              </g>
            ))}

            {/* Y-Axis Grid Marks (Bottom & Top bounds) */}
            <line
              x1={padLeft}
              y1={padTop + plotHeight}
              x2={padLeft + plotWidth}
              y2={padTop + plotHeight}
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-600"
              strokeWidth="1.5"
            />
            <line
              x1={padLeft}
              y1={padTop}
              x2={padLeft}
              y2={padTop + plotHeight}
              stroke="currentColor"
              className="text-zinc-400 dark:text-zinc-600"
              strokeWidth="1.5"
            />

            {/* Y-Axis Label */}
            <text
              x={-(padTop + plotHeight / 2)}
              y={20}
              transform="rotate(-90)"
              textAnchor="middle"
              className="text-[11px] font-medium fill-zinc-600 dark:fill-zinc-400"
            >
              Peringkat Satuan Pendidikan (Rank 1 s.d. {totalClusters})
            </text>

            {/* X-Axis Label */}
            <text
              x={padLeft + plotWidth / 2}
              y={svgHeight - 12}
              textAnchor="middle"
              className="text-[11px] font-medium fill-zinc-600 dark:fill-zinc-400"
            >
              Estimasi Intercept BLUP Satuan Pendidikan (dengan 95% Confidence Interval)
            </text>

            {/* Vertical Grand Mean Reference Line */}
            <line
              x1={grandMeanX}
              y1={padTop - 8}
              x2={grandMeanX}
              y2={padTop + plotHeight + 4}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <text
              x={grandMeanX}
              y={padTop - 12}
              textAnchor="middle"
              className="text-[10px] font-bold fill-red-600 dark:fill-red-400"
            >
              γ₀₀ = {formatNumber(overallMean, 1)}
            </text>

            {/* Render All Cluster Lines and Points (The Authentic Caterpillar S-Curve) */}
            {sorted.map((c, idx) => {
              const y = getY(idx);
              const ciLeft = getX(c.blupIntercept - 1.96 * c.se);
              const ciRight = getX(c.blupIntercept + 1.96 * c.se);
              const dotX = getX(c.blupIntercept);

              const isSigAbove = c.blupIntercept - 1.96 * c.se > overallMean;
              const isSigBelow = c.blupIntercept + 1.96 * c.se < overallMean;

              const strokeColor = isSigAbove ? '#10b981' : isSigBelow ? '#f59e0b' : '#008080';
              const dotRadius = totalClusters > 80 ? 2 : totalClusters > 40 ? 2.5 : 3.5;
              const lineWidth = totalClusters > 80 ? 1 : 1.5;

              return (
                <g
                  key={c.clusterId || idx}
                  className="cursor-pointer transition-opacity hover:opacity-100"
                  onMouseEnter={() => setHoveredCluster(c)}
                  onMouseLeave={() => setHoveredCluster(null)}
                >
                  {/* CI Line */}
                  <line
                    x1={ciLeft}
                    y1={y}
                    x2={ciRight}
                    y2={y}
                    stroke={strokeColor}
                    strokeWidth={lineWidth}
                    strokeLinecap="round"
                    opacity={hoveredCluster && hoveredCluster.clusterId !== c.clusterId ? 0.3 : 0.85}
                  />

                  {/* Intercept Point */}
                  <circle
                    cx={dotX}
                    cy={y}
                    r={hoveredCluster?.clusterId === c.clusterId ? dotRadius + 2 : dotRadius}
                    fill={strokeColor}
                    stroke="#ffffff"
                    strokeWidth={totalClusters > 60 ? 0.5 : 1}
                  />

                  <title>
                    {`ID Sekolah: ${c.clusterId}\nIntercept (BLUP): ${formatNumber(c.blupIntercept, 2)}\n95% CI: [${formatNumber(c.blupIntercept - 1.96 * c.se, 2)}, ${formatNumber(c.blupIntercept + 1.96 * c.se, 2)}]\nN Siswa: ${c.n}`}
                  </title>
                </g>
              );
            })}
          </svg>

          {/* Interactive Hover Tooltip for Screen Viewing */}
          {hoveredCluster && (
            <div className="no-print absolute top-3 right-3 p-2.5 rounded-lg bg-zinc-900/90 text-white text-xs shadow-lg border border-zinc-700 pointer-events-none font-mono">
              <p className="font-bold text-[#7fdcdc]">Satuan Pendidikan: {hoveredCluster.clusterId}</p>
              <p className="text-[11px] text-zinc-300">
                BLUP Intercept: <strong>{formatNumber(hoveredCluster.blupIntercept, 2)}</strong> (SE = {formatNumber(hoveredCluster.se, 2)})
              </p>
              <p className="text-[10px] text-zinc-400">
                95% CI: [{formatNumber(hoveredCluster.blupIntercept - 1.96 * hoveredCluster.se, 2)}, {formatNumber(hoveredCluster.blupIntercept + 1.96 * hoveredCluster.se, 2)}] | N = {hoveredCluster.n} siswa
              </p>
            </div>
          )}
        </div>

        {/* Scientific Publication Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-1 text-xs text-zinc-700 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Signifikan di Atas Rata-rata (n = {sigAbove})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#008080] dark:bg-[#14a3a3]" />
            <span>Setara Rata-rata Nasional (n = {notSig})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Signifikan di Bawah Rata-rata (n = {sigBelow})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-red-500 border-t border-dashed" />
            <span>Garis Acuan Nasional (γ₀₀)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
