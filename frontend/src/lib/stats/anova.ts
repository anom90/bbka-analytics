import { Dist } from './distributions';
import { AnovaResult, AnovaRow, DataRow, PostHocComparison } from '../types';

export function runAnova(
  data: DataRow[],
  dv: string,
  factors: string[]
): AnovaResult {
  if (factors.length === 0) throw new Error('Minimal satu faktor (IV) harus dipilih.');

  // Clean data
  const validData = data.filter(r => {
    const y = Number(r[dv]);
    if (isNaN(y)) return false;
    for (const f of factors) {
      if (r[f] === null || r[f] === undefined || String(r[f]).trim() === '') return false;
    }
    return true;
  });

  const N = validData.length;
  if (N < 4) throw new Error('Jumlah data valid terlalu sedikit untuk analisis ANOVA.');

  const yVals = validData.map(r => Number(r[dv]));
  const grandMean = yVals.reduce((a, b) => a + b, 0) / N;
  const totalSS = yVals.reduce((s, y) => s + Math.pow(y - grandMean, 2), 0);
  const totalDf = N - 1;

  if (factors.length === 1) {
    const factor = factors[0];
    const groups = new Map<string, number[]>();
    for (const r of validData) {
      const g = String(r[factor]).trim();
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(Number(r[dv]));
    }

    const k = groups.size;
    if (k < 2) throw new Error(`Faktor '${factor}' harus memiliki minimal 2 level unik.`);

    let betweenSS = 0;
    const descriptives: AnovaResult['descriptives'] = [];
    const groupMeans: { group: string; mean: number; n: number; sd: number; se: number }[] = [];

    for (const [groupName, vals] of groups.entries()) {
      const n_j = vals.length;
      const mean_j = vals.reduce((a, b) => a + b, 0) / n_j;
      const var_j = vals.reduce((s, v) => s + Math.pow(v - mean_j, 2), 0) / Math.max(1, n_j - 1);
      const sd_j = Math.sqrt(var_j);
      const se_j = sd_j / Math.sqrt(n_j);

      betweenSS += n_j * Math.pow(mean_j - grandMean, 2);
      descriptives.push({
        cells: { [factor]: groupName },
        label: groupName,
        n: n_j,
        mean: mean_j,
        sd: sd_j,
        se: se_j
      });
      groupMeans.push({ group: groupName, mean: mean_j, n: n_j, sd: sd_j, se: se_j });
    }

    const withinSS = Math.max(0, totalSS - betweenSS);
    const dfBetween = k - 1;
    const dfWithin = N - k;

    const msBetween = betweenSS / dfBetween;
    const msWithin = withinSS / dfWithin;

    const fStat = msWithin > 0 ? msBetween / msWithin : 0;
    const pVal = Dist.fPValue(fStat, dfBetween, dfWithin);

    const etaSq = totalSS > 0 ? betweenSS / totalSS : 0;
    const omegaSq = totalSS + msWithin > 0 ? (betweenSS - dfBetween * msWithin) / (totalSS + msWithin) : 0;

    const table: AnovaRow[] = [
      {
        source: factor,
        ss: betweenSS,
        df: dfBetween,
        ms: msBetween,
        f: fStat,
        pValue: pVal,
        etaSquared: etaSq,
        partialEtaSquared: etaSq,
        omegaSquared: Math.max(0, omegaSq)
      },
      {
        source: 'Residuals (Error)',
        ss: withinSS,
        df: dfWithin,
        ms: msWithin,
        f: NaN,
        pValue: NaN
      },
      {
        source: 'Total',
        ss: totalSS,
        df: totalDf,
        ms: totalSS / totalDf,
        f: NaN,
        pValue: NaN
      }
    ];

    // Post-Hoc Tukey HSD
    const postHocComparisons: PostHocComparison[] = [];
    for (let i = 0; i < groupMeans.length; i++) {
      for (let j = i + 1; j < groupMeans.length; j++) {
        const g1 = groupMeans[i];
        const g2 = groupMeans[j];
        const meanDiff = g1.mean - g2.mean;
        // Standard error for Tukey
        const se = Math.sqrt((msWithin / 2) * (1 / g1.n + 1 / g2.n));
        const q = se > 0 ? Math.abs(meanDiff) / Math.sqrt((msWithin / 2) * (1 / g1.n + 1 / g2.n)) : 0;
        const p = Dist.tukeyQtoP(q, k, dfWithin);

        const qCrit = 2.77; // conservative approximation
        const ciMargin = qCrit * se;

        postHocComparisons.push({
          comparison: `${g1.group} vs ${g2.group}`,
          group1: g1.group,
          group2: g2.group,
          meanDiff,
          se,
          qValue: q,
          pValue: p,
          ciLower: meanDiff - ciMargin,
          ciUpper: meanDiff + ciMargin,
          significant: p < 0.05
        });
      }
    }

    return {
      type: 'one_way',
      dv,
      factors: [factor],
      table,
      descriptives,
      postHoc: { [factor]: postHocComparisons }
    };
  } else {
    // Two-Way ANOVA (Factor A, Factor B, Factor A x Factor B)
    const factorA = factors[0];
    const factorB = factors[1];

    const cellMap = new Map<string, number[]>();
    const aMap = new Map<string, number[]>();
    const bMap = new Map<string, number[]>();

    for (const r of validData) {
      const a = String(r[factorA]).trim();
      const b = String(r[factorB]).trim();
      const cellKey = `${a}:::${b}`;
      const val = Number(r[dv]);

      if (!cellMap.has(cellKey)) cellMap.set(cellKey, []);
      cellMap.get(cellKey)!.push(val);

      if (!aMap.has(a)) aMap.set(a, []);
      aMap.get(a)!.push(val);

      if (!bMap.has(b)) bMap.set(b, []);
      bMap.get(b)!.push(val);
    }

    const aLevels = Array.from(aMap.keys());
    const bLevels = Array.from(bMap.keys());
    const kA = aLevels.length;
    const kB = bLevels.length;

    // SSA (Main effect A)
    let ssA = 0;
    for (const [_, vals] of aMap.entries()) {
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      ssA += vals.length * Math.pow(mean - grandMean, 2);
    }

    // SSB (Main effect B)
    let ssB = 0;
    for (const [_, vals] of bMap.entries()) {
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      ssB += vals.length * Math.pow(mean - grandMean, 2);
    }

    // SS Cells (Model SS)
    let ssCells = 0;
    let ssWithin = 0;
    const descriptives: AnovaResult['descriptives'] = [];

    for (const [key, vals] of cellMap.entries()) {
      const [a, b] = key.split(':::');
      const n = vals.length;
      const mean = vals.reduce((sum, v) => sum + v, 0) / n;
      const variance = vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / Math.max(1, n - 1);
      const sd = Math.sqrt(variance);

      ssCells += n * Math.pow(mean - grandMean, 2);
      ssWithin += vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);

      descriptives.push({
        cells: { [factorA]: a, [factorB]: b },
        label: `${a} - ${b}`,
        n,
        mean,
        sd,
        se: sd / Math.sqrt(n)
      });
    }

    // SS Interaction AxB = SS Cells - SSA - SSB
    const ssAB = Math.max(0, ssCells - ssA - ssB);

    const dfA = kA - 1;
    const dfB = kB - 1;
    const dfAB = dfA * dfB;
    const dfWithin = Math.max(1, N - kA * kB);

    const msA = ssA / dfA;
    const msB = ssB / dfB;
    const msAB = ssAB / Math.max(1, dfAB);
    const msWithin = ssWithin / dfWithin;

    const fA = msWithin > 0 ? msA / msWithin : 0;
    const fB = msWithin > 0 ? msB / msWithin : 0;
    const fAB = msWithin > 0 ? msAB / msWithin : 0;

    const pA = Dist.fPValue(fA, dfA, dfWithin);
    const pB = Dist.fPValue(fB, dfB, dfWithin);
    const pAB = Dist.fPValue(fAB, dfAB, dfWithin);

    const table: AnovaRow[] = [
      {
        source: factorA,
        ss: ssA,
        df: dfA,
        ms: msA,
        f: fA,
        pValue: pA,
        etaSquared: totalSS > 0 ? ssA / totalSS : 0,
        partialEtaSquared: (ssA + ssWithin) > 0 ? ssA / (ssA + ssWithin) : 0
      },
      {
        source: factorB,
        ss: ssB,
        df: dfB,
        ms: msB,
        f: fB,
        pValue: pB,
        etaSquared: totalSS > 0 ? ssB / totalSS : 0,
        partialEtaSquared: (ssB + ssWithin) > 0 ? ssB / (ssB + ssWithin) : 0
      },
      {
        source: `${factorA} × ${factorB}`,
        ss: ssAB,
        df: dfAB,
        ms: msAB,
        f: fAB,
        pValue: pAB,
        etaSquared: totalSS > 0 ? ssAB / totalSS : 0,
        partialEtaSquared: (ssAB + ssWithin) > 0 ? ssAB / (ssAB + ssWithin) : 0
      },
      {
        source: 'Residuals (Error)',
        ss: ssWithin,
        df: dfWithin,
        ms: msWithin,
        f: NaN,
        pValue: NaN
      },
      {
        source: 'Total',
        ss: totalSS,
        df: totalDf,
        ms: totalSS / totalDf,
        f: NaN,
        pValue: NaN
      }
    ];

    return {
      type: 'two_way',
      dv,
      factors: [factorA, factorB],
      table,
      descriptives
    };
  }
}
