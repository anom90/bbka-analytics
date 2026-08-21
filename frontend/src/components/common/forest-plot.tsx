'use client';

import * as React from 'react';
import { IPDMetaResult } from '@/lib/types';
import { formatNumber, formatPValue, cn } from '@/lib/utils';
import { Download, Copy, Check, BarChart2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ForestPlotProps {
  result: IPDMetaResult;
  title?: string;
  subtitle?: string;
}

export function ForestPlot({
  result,
  title = 'Forest Plot Sintesis Meta-Analisis IPD (Random-Effects REML)',
  subtitle = 'Estimasi efek spesifik per klaster/provinsi dan estimasi gabungan (pooled effect)'
}: ForestPlotProps) {
  const [copied, setCopied] = React.useState(false);
  const [hoveredCluster, setHoveredCluster] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const {
    clusterResults = [],
    pooledBeta = 0,
    ciLower = 0,
    ciUpper = 0,
    i2 = 0,
    tau2 = 0,
    qStatistic = 0,
    dfQ = 0,
    qPValue = 0,
    focalPredictor = '',
    dv = ''
  } = result;

  // Calculate dynamic axis range for SVG
  const allMin = Math.min(...clusterResults.map(c => c.ciLower), ciLower, -0.2);
  const allMax = Math.max(...clusterResults.map(c => c.ciUpper), ciUpper, 0.2);
  const xMin = Math.floor(allMin * 10) / 10 - 0.1;
  const xMax = Math.ceil(allMax * 10) / 10 + 0.1;
  const xRange = xMax - xMin || 1;

  // SVG Dimensions
  const rowHeight = 28;
  const headerHeight = 45;
  const footerHeight = 70;
  const totalRows = clusterResults.length;
  const plotWidth = 320;
  const leftColWidth = 180;
  const rightColWidth = 190;
  const svgWidth = leftColWidth + plotWidth + rightColWidth + 30;
  const svgHeight = headerHeight + totalRows * rowHeight + footerHeight;

  // Map value to X pixel on plot
  const getX = (val: number) => {
    const clamped = Math.max(xMin, Math.min(xMax, val));
    return leftColWidth + ((clamped - xMin) / xRange) * plotWidth;
  };

  const zeroX = getX(0);

  // Export SVG handler
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `forest_plot_${focalPredictor}_${dv}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const handleCopySummary = () => {
    const summaryText = `Forest Plot IPD Meta-Analysis:\nPooled Beta = ${formatNumber(pooledBeta, 3)} [${formatNumber(ciLower, 3)}, ${formatNumber(ciUpper, 3)}], I² = ${formatNumber(i2, 1)}%, τ² = ${formatNumber(tau2, 4)}, Q(${dfQ}) = ${formatNumber(qStatistic, 2)}, p = ${formatPValue(qPValue)}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 shadow-2xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/40">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#008080] dark:text-[#14a3a3]" />
            {title}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="h-8 px-2.5 rounded-xl text-xs gap-1.5 cursor-pointer text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin Metrik'}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportSvg}
            className="h-8 px-2.5 rounded-xl text-xs gap-1.5 cursor-pointer text-[#008080] dark:text-[#14a3a3] border-[#008080]/30 dark:border-[#14a3a3]/30 hover:bg-[#e6f2f2] dark:hover:bg-[#14312f]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor SVG (Vector)</span>
          </Button>
        </div>
      </div>

      {/* SVG Forest Plot Container */}
      <div className="p-4 sm:p-6 overflow-x-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[720px] font-sans select-none"
          style={{ maxHeight: `${Math.max(450, totalRows * 30 + 120)}px` }}
        >
          {/* Background */}
          <rect width={svgWidth} height={svgHeight} fill="transparent" />

          {/* Table Headers */}
          <g className="text-xs font-bold fill-zinc-800 dark:fill-zinc-200">
            <text x="15" y="24" className="font-bold">Klaster / Wilayah</text>
            <text x={leftColWidth - 15} y="24" textAnchor="end" className="font-bold">N</text>
            <text x={leftColWidth + plotWidth / 2} y="15" textAnchor="middle" className="font-bold">
              Koefisien Efek (Slope β & 95% CI)
            </text>
            <text x={leftColWidth + plotWidth + 30} y="24" className="font-bold">95% CI</text>
            <text x={svgWidth - 25} y="24" textAnchor="end" className="font-bold">Bobot</text>
          </g>

          {/* Subtitle axis values */}
          <g className="text-[10px] fill-zinc-400 font-mono">
            <text x={getX(xMin)} y="36" textAnchor="start">{xMin.toFixed(1)}</text>
            <text x={zeroX} y="36" textAnchor="middle">0.0</text>
            <text x={getX(xMax)} y="36" textAnchor="end">{xMax.toFixed(1)}</text>
          </g>

          {/* Header Divider */}
          <line
            x1="15"
            y1="42"
            x2={svgWidth - 15}
            y2="42"
            stroke="currentColor"
            className="stroke-zinc-300 dark:stroke-zinc-700"
            strokeWidth="1.5"
          />

          {/* Zero Reference Line */}
          <line
            x1={zeroX}
            y1={headerHeight}
            x2={zeroX}
            y2={headerHeight + totalRows * rowHeight + 15}
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />

          {/* Plot Rows */}
          {clusterResults.map((cluster, idx) => {
            const y = headerHeight + idx * rowHeight + rowHeight / 2;
            const ptX = getX(cluster.beta);
            const lowerX = getX(cluster.ciLower);
            const upperX = getX(cluster.ciUpper);
            const boxSize = Math.max(4, Math.min(12, (cluster.weightPct / 100) * 45 + 4));
            const isHovered = hoveredCluster === cluster.clusterId;

            return (
              <g
                key={cluster.clusterId}
                onMouseEnter={() => setHoveredCluster(cluster.clusterId)}
                onMouseLeave={() => setHoveredCluster(null)}
                className="transition-opacity cursor-pointer group"
              >
                {/* Row Hover Background */}
                <rect
                  x="10"
                  y={headerHeight + idx * rowHeight}
                  width={svgWidth - 20}
                  height={rowHeight}
                  fill={isHovered ? 'currentColor' : 'transparent'}
                  className="fill-teal-50/60 dark:fill-teal-950/30"
                  rx="4"
                />

                {/* Cluster Name & N */}
                <text
                  x="15"
                  y={y + 4}
                  className={cn(
                    "text-xs fill-zinc-800 dark:fill-zinc-200 transition-colors",
                    isHovered && "font-bold fill-[#008080] dark:fill-[#14a3a3]"
                  )}
                >
                  {cluster.clusterId}
                </text>
                <text
                  x={leftColWidth - 15}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs font-mono fill-zinc-500 dark:fill-zinc-400"
                >
                  {cluster.n.toLocaleString()}
                </text>

                {/* 95% CI Line */}
                <line
                  x1={lowerX}
                  y1={y}
                  x2={upperX}
                  y2={y}
                  stroke={isHovered ? '#008080' : '#475569'}
                  strokeWidth="1.5"
                />

                {/* CI End Caps */}
                <line x1={lowerX} y1={y - 3} x2={lowerX} y2={y + 3} stroke="#475569" strokeWidth="1" />
                <line x1={upperX} y1={y - 3} x2={upperX} y2={y + 3} stroke="#475569" strokeWidth="1" />

                {/* Point Estimate Square (sized by weight) */}
                <rect
                  x={ptX - boxSize / 2}
                  y={y - boxSize / 2}
                  width={boxSize}
                  height={boxSize}
                  fill={isHovered ? '#008080' : '#0d9488'}
                  className="stroke-white dark:stroke-zinc-900"
                  strokeWidth="0.8"
                  rx="1"
                />

                {/* Beta and CI Text */}
                <text
                  x={leftColWidth + plotWidth + 30}
                  y={y + 4}
                  className="text-xs font-mono fill-zinc-700 dark:fill-zinc-300"
                >
                  {formatNumber(cluster.beta, 2)} [{formatNumber(cluster.ciLower, 2)}, {formatNumber(cluster.ciUpper, 2)}]
                </text>

                {/* Weight Percentage */}
                <text
                  x={svgWidth - 25}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs font-mono fill-zinc-500 dark:fill-zinc-400"
                >
                  {cluster.weightPct.toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* Divider before Pooled Estimate */}
          <line
            x1="15"
            y1={headerHeight + totalRows * rowHeight + 10}
            x2={svgWidth - 15}
            y2={headerHeight + totalRows * rowHeight + 10}
            stroke="currentColor"
            className="stroke-zinc-300 dark:stroke-zinc-700"
            strokeWidth="1.5"
          />

          {/* Pooled Random-Effects Diamond */}
          {(() => {
            const diamondY = headerHeight + totalRows * rowHeight + 30;
            const midX = getX(pooledBeta);
            const lX = getX(ciLower);
            const rX = getX(ciUpper);
            const h = 7;
            const diamondPoints = `${midX},${diamondY - h} ${rX},${diamondY} ${midX},${diamondY + h} ${lX},${diamondY}`;

            return (
              <g className="font-bold">
                <text
                  x="15"
                  y={diamondY + 4}
                  className="text-xs font-bold fill-zinc-900 dark:fill-zinc-100"
                >
                  Random effects model (Pooled)
                </text>

                {/* Diamond Polygon */}
                <polygon
                  points={diamondPoints}
                  fill="#008080"
                  stroke="#004d4d"
                  strokeWidth="1"
                  className="drop-shadow-xs"
                />

                {/* Pooled CI Text */}
                <text
                  x={leftColWidth + plotWidth + 30}
                  y={diamondY + 4}
                  className="text-xs font-mono font-bold fill-zinc-900 dark:fill-zinc-100"
                >
                  {formatNumber(pooledBeta, 2)} [{formatNumber(ciLower, 2)}, {formatNumber(ciUpper, 2)}]
                </text>

                {/* 100% Weight */}
                <text
                  x={svgWidth - 25}
                  y={diamondY + 4}
                  textAnchor="end"
                  className="text-xs font-mono font-bold fill-zinc-900 dark:fill-zinc-100"
                >
                  100.0%
                </text>
              </g>
            );
          })()}

          {/* Footer Heterogeneity Metrics */}
          <g className="text-[11px] fill-zinc-500 dark:fill-zinc-400">
            <text
              x="15"
              y={headerHeight + totalRows * rowHeight + 58}
              className="font-mono italic"
            >
              Heterogeneity: I² = {formatNumber(i2, 1)}%, τ² = {formatNumber(tau2, 4)}, Q(df = {dfQ}) = {formatNumber(qStatistic, 2)}, p {qPValue < 0.001 ? '< .001' : `= ${formatNumber(qPValue, 3)}`}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
