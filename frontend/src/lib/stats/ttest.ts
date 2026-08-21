import { Dist } from './distributions';
import { DataRow, TTestResult, TTestType } from '../types';

export function runTTest(
  data: DataRow[],
  type: TTestType,
  dv: string,
  groupVar?: string,
  testValue = 0,
  pairedVar2?: string
): TTestResult {
  if (type === 'independent') {
    if (!groupVar) throw new Error('Variabel grup harus ditentukan untuk Independent Samples t-test.');

    // Filter valid rows
    const validRows = data.filter(
      r => r[dv] !== null && r[dv] !== undefined && !isNaN(Number(r[dv])) &&
           r[groupVar] !== null && r[groupVar] !== undefined && String(r[groupVar]).trim() !== ''
    );

    const groupsMap = new Map<string, number[]>();
    for (const r of validRows) {
      const g = String(r[groupVar]).trim();
      const val = Number(r[dv]);
      if (!groupsMap.has(g)) groupsMap.set(g, []);
      groupsMap.get(g)!.push(val);
    }

    const groupNames = Array.from(groupsMap.keys());
    if (groupNames.length < 2) {
      throw new Error(`Variabel grup '${groupVar}' harus memiliki minimal 2 kategori unik. Ditemukan: ${groupNames.length}`);
    }

    const g1Name = groupNames[0];
    const g2Name = groupNames[1];
    const vals1 = groupsMap.get(g1Name)!;
    const vals2 = groupsMap.get(g2Name)!;

    const n1 = vals1.length;
    const n2 = vals2.length;
    if (n1 < 2 || n2 < 2) throw new Error('Setiap grup harus memiliki minimal 2 observasi.');

    const mean1 = vals1.reduce((a, b) => a + b, 0) / n1;
    const mean2 = vals2.reduce((a, b) => a + b, 0) / n2;

    const var1 = vals1.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0) / (n1 - 1);
    const var2 = vals2.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0) / (n2 - 1);
    const sd1 = Math.sqrt(var1);
    const sd2 = Math.sqrt(var2);

    const sorted1 = [...vals1].sort((a, b) => a - b);
    const sorted2 = [...vals2].sort((a, b) => a - b);
    const med1 = sorted1[Math.floor(n1 / 2)];
    const med2 = sorted2[Math.floor(n2 / 2)];

    // Student's t (Pooled variance)
    const df = n1 + n2 - 2;
    const sp2 = ((n1 - 1) * var1 + (n2 - 1) * var2) / df;
    const sePooled = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
    const meanDiff = mean1 - mean2;
    const tStat = sePooled > 0 ? meanDiff / sePooled : 0;
    const pVal = Dist.tPValue(tStat, df);

    // Welch's t (Unequal variance)
    const seWelch = Math.sqrt(var1 / n1 + var2 / n2);
    const welchT = seWelch > 0 ? meanDiff / seWelch : 0;
    const num = Math.pow(var1 / n1 + var2 / n2, 2);
    const den = Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1);
    const welchDf = den > 0 ? num / den : df;
    const welchP = Dist.tPValue(welchT, welchDf);

    // Cohen's d & Hedges' g
    const sp = Math.sqrt(sp2);
    const cohensD = sp > 0 ? meanDiff / sp : 0;
    const jCorrection = 1 - 3 / (4 * df - 1);
    const hedgesG = cohensD * jCorrection;

    // 95% Confidence Interval
    const tCrit = Dist.tInv(0.975, df) || 1.96;
    const ciLower = meanDiff - tCrit * sePooled;
    const ciUpper = meanDiff + tCrit * sePooled;

    // Levene's test for equality of variances (approx)
    const z1 = vals1.map(v => Math.abs(v - med1));
    const z2 = vals2.map(v => Math.abs(v - med2));
    const zMean1 = z1.reduce((a, b) => a + b, 0) / n1;
    const zMean2 = z2.reduce((a, b) => a + b, 0) / n2;
    const zGrand = (z1.reduce((a, b) => a + b, 0) + z2.reduce((a, b) => a + b, 0)) / (n1 + n2);
    const ssBetween = n1 * Math.pow(zMean1 - zGrand, 2) + n2 * Math.pow(zMean2 - zGrand, 2);
    const ssWithin = z1.reduce((s, v) => s + Math.pow(v - zMean1, 2), 0) + z2.reduce((s, v) => s + Math.pow(v - zMean2, 2), 0);
    const leveneF = ssWithin > 0 ? (ssBetween / 1) / (ssWithin / (n1 + n2 - 2)) : 0;
    const leveneP = Dist.fPValue(leveneF, 1, n1 + n2 - 2);

    return {
      type: 'independent',
      dv,
      groupVar,
      group1: g1Name,
      group2: g2Name,
      statistic: tStat,
      df,
      pValue: pVal,
      welchStatistic: welchT,
      welchDf,
      welchPValue: welchP,
      meanDiff,
      stdErrorDiff: sePooled,
      ciLower,
      ciUpper,
      cohensD,
      hedgesG,
      leveneF,
      leveneP,
      descriptives: [
        { group: g1Name, n: n1, mean: mean1, sd: sd1, se: sd1 / Math.sqrt(n1), median: med1 },
        { group: g2Name, n: n2, mean: mean2, sd: sd2, se: sd2 / Math.sqrt(n2), median: med2 }
      ]
    };
  } else if (type === 'paired') {
    const v2 = pairedVar2 || groupVar;
    if (!v2) throw new Error('Variabel kedua harus dipilih untuk Paired Samples t-test.');

    const pairs: { y1: number; y2: number; diff: number }[] = [];
    for (const r of data) {
      const val1 = Number(r[dv]);
      const val2 = Number(r[v2]);
      if (!isNaN(val1) && !isNaN(val2)) {
        pairs.push({ y1: val1, y2: val2, diff: val1 - val2 });
      }
    }

    const n = pairs.length;
    if (n < 2) throw new Error('Diperlukan minimal 2 pasang data valid.');

    const mean1 = pairs.reduce((s, p) => s + p.y1, 0) / n;
    const mean2 = pairs.reduce((s, p) => s + p.y2, 0) / n;
    const sd1 = Math.sqrt(pairs.reduce((s, p) => s + Math.pow(p.y1 - mean1, 2), 0) / (n - 1));
    const sd2 = Math.sqrt(pairs.reduce((s, p) => s + Math.pow(p.y2 - mean2, 2), 0) / (n - 1));

    const meanDiff = pairs.reduce((s, p) => s + p.diff, 0) / n;
    const diffVar = pairs.reduce((s, p) => s + Math.pow(p.diff - meanDiff, 2), 0) / (n - 1);
    const sdDiff = Math.sqrt(diffVar);
    const seDiff = sdDiff / Math.sqrt(n);

    const df = n - 1;
    const tStat = seDiff > 0 ? meanDiff / seDiff : 0;
    const pVal = Dist.tPValue(tStat, df);
    const cohensD = sdDiff > 0 ? meanDiff / sdDiff : 0;
    const tCrit = Dist.tInv(0.975, df) || 1.96;

    return {
      type: 'paired',
      dv,
      group1: dv,
      group2: v2,
      statistic: tStat,
      df,
      pValue: pVal,
      meanDiff,
      stdErrorDiff: seDiff,
      ciLower: meanDiff - tCrit * seDiff,
      ciUpper: meanDiff + tCrit * seDiff,
      cohensD,
      hedgesG: cohensD * (1 - 3 / (4 * df - 1)),
      descriptives: [
        { group: dv, n, mean: mean1, sd: sd1, se: sd1 / Math.sqrt(n), median: mean1 },
        { group: v2, n, mean: mean2, sd: sd2, se: sd2 / Math.sqrt(n), median: mean2 }
      ]
    };
  } else {
    // One-Sample t-test
    const vals = data
      .map(r => Number(r[dv]))
      .filter(v => !isNaN(v));

    const n = vals.length;
    if (n < 2) throw new Error('Diperlukan minimal 2 observasi valid.');

    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const variance = vals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    const se = sd / Math.sqrt(n);
    const df = n - 1;
    const meanDiff = mean - testValue;
    const tStat = se > 0 ? meanDiff / se : 0;
    const pVal = Dist.tPValue(tStat, df);
    const cohensD = sd > 0 ? meanDiff / sd : 0;
    const tCrit = Dist.tInv(0.975, df) || 1.96;

    return {
      type: 'one_sample',
      dv,
      testValue,
      statistic: tStat,
      df,
      pValue: pVal,
      meanDiff,
      stdErrorDiff: se,
      ciLower: meanDiff - tCrit * se,
      ciUpper: meanDiff + tCrit * se,
      cohensD,
      hedgesG: cohensD * (1 - 3 / (4 * df - 1)),
      descriptives: [
        { group: dv, n, mean, sd, se, median: mean }
      ]
    };
  }
}
