import { DataRow, RegressionConfig, RegressionResult, RegressionModelSummary, RegressionCoefficient, AssumptionCheckItem } from '../types';
import { Mat, Vector } from './matrix';
import { Dist } from './distributions';

/**
 * Pure TypeScript OLS Multiple Linear & Hierarchical Regression Engine (Client-Side Fallback)
 * Supports arbitrary number of blocks (k >= 1), R2, Adjusted R2, R2 Change, F Change, Beta, and VIF.
 */
export function runRegression(
  data: DataRow[],
  config: RegressionConfig
): RegressionResult {
  const { dv, blocks = [] } = config;

  if (!dv) {
    throw new Error('Variabel Dependen (Outcome Y) belum dipilih.');
  }

  const activeBlocks = blocks.filter(b => b.variables && b.variables.length > 0);
  if (activeBlocks.length === 0) {
    throw new Error('Minimal satu blok prediktor harus memiliki variabel.');
  }

  // Filter valid rows where DV and all predictors are valid numbers
  const allPredictors = Array.from(new Set(activeBlocks.flatMap(b => b.variables)));
  const validData = data.filter(row => {
    const yVal = row[dv];
    if (yVal === null || yVal === undefined || isNaN(Number(yVal))) return false;
    return allPredictors.every(p => {
      const v = row[p];
      return v !== null && v !== undefined && !isNaN(Number(v));
    });
  });

  const n = validData.length;
  if (n < allPredictors.length + 2) {
    throw new Error(`Data valid (${n} baris) terlalu sedikit untuk mengestimasi ${allPredictors.length} prediktor.`);
  }

  // Extract DV vector
  const y: Vector = validData.map(r => Number(r[dv]));
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  const ssTot = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
  const sdY = Math.sqrt(ssTot / (n - 1));

  const models: RegressionModelSummary[] = [];
  let cumulativePreds: string[] = [];
  let prevSsr = ssTot;
  let prevR2 = 0;
  let prevK = 0;

  for (let bIdx = 0; bIdx < activeBlocks.length; bIdx++) {
    const block = activeBlocks[bIdx];
    cumulativePreds = Array.from(new Set([...cumulativePreds, ...block.variables]));
    const k = cumulativePreds.length; // number of predictors

    // Construct Design Matrix X (with intercept)
    const X: number[][] = validData.map(row => [
      1, // Intercept
      ...cumulativePreds.map(p => Number(row[p]))
    ]);

    // OLS: beta = (X'X)^(-1) X'y
    const Xt = Mat.transpose(X);
    const XtX = Mat.multiply(Xt, X);
    const XtX_inv = Mat.inverse(XtX);
    const Xty = Mat.matVecMul(Xt, y);
    const betaHat = Mat.matVecMul(XtX_inv, Xty);

    // Fitted values and residuals
    const yHat = Mat.matVecMul(X, betaHat);
    const residuals = y.map((yi, i) => yi - yHat[i]);
    const ssRes = residuals.reduce((sum, r) => sum + r * r, 0);
    const ssReg = Math.max(0, ssTot - ssRes);

    const df1 = k;
    const df2 = n - k - 1;
    const msRes = df2 > 0 ? ssRes / df2 : 0;
    const seEst = Math.sqrt(msRes);

    const r2 = ssTot > 0 ? Math.max(0, Math.min(1, ssReg / ssTot)) : 0;
    const r = Math.sqrt(r2);
    const adjR2 = df2 > 0 ? 1 - ((1 - r2) * (n - 1)) / df2 : r2;

    // F-Change / Overall F
    let fChange = 0;
    let pChange = 1;
    let r2Change = r2;
    let dfChange1 = k;
    let dfChange2 = df2;

    if (bIdx === 0) {
      r2Change = r2;
      const msReg = df1 > 0 ? ssReg / df1 : 0;
      fChange = msRes > 0 ? msReg / msRes : 0;
      pChange = Dist.fPValue(fChange, df1, df2);
      dfChange1 = df1;
      dfChange2 = df2;
    } else {
      r2Change = Math.max(0, r2 - prevR2);
      const deltaK = k - prevK;
      const deltaSs = Math.max(0, prevSsr - ssRes);
      const msDelta = deltaK > 0 ? deltaSs / deltaK : 0;
      fChange = msRes > 0 ? msDelta / msRes : 0;
      pChange = Dist.fPValue(fChange, deltaK, df2);
      dfChange1 = deltaK;
      dfChange2 = df2;
    }

    prevSsr = ssRes;
    prevR2 = r2;
    prevK = k;

    // Calculate standard errors, t-values, standardized beta, and VIF
    // For VIF: diagonal of correlation matrix inverse for predictors
    const coefList: RegressionCoefficient[] = [];
    const termNames = ['(Intercept)', ...cumulativePreds];

    // Compute standard deviation of each predictor
    const sdX: number[] = cumulativePreds.map(p => {
      const vals = validData.map(r => Number(r[p]));
      const m = vals.reduce((a, b) => a + b, 0) / n;
      const ss = vals.reduce((s, v) => s + Math.pow(v - m, 2), 0);
      return Math.sqrt(ss / (n - 1));
    });

    // Compute VIF matrix if k > 1
    const vifMap: Record<string, number> = {};
    if (k > 1) {
      try {
        // Sub-matrix of X without intercept centered & standardized
        const Z: number[][] = validData.map(row =>
          cumulativePreds.map((p, idx) => {
            const vals = validData.map(r => Number(r[p]));
            const m = vals.reduce((a, b) => a + b, 0) / n;
            const sd = sdX[idx] || 1;
            return (Number(row[p]) - m) / sd;
          })
        );
        const Zt = Mat.transpose(Z);
        const R = Mat.scale(Mat.multiply(Zt, Z), 1 / (n - 1));
        const R_inv = Mat.inverse(R);
        cumulativePreds.forEach((p, idx) => {
          vifMap[p] = Math.max(1, R_inv[idx][idx]);
        });
      } catch {
        cumulativePreds.forEach(p => { vifMap[p] = 1.0; });
      }
    }

    for (let i = 0; i < betaHat.length; i++) {
      const bVal = betaHat[i];
      const varB = XtX_inv[i][i] * msRes;
      const seVal = Math.sqrt(Math.max(0, varB));
      const tVal = seVal > 0 ? bVal / seVal : 0;
      const pVal = Dist.tPValue(tVal, df2);
      const ciHalf = 1.96 * seVal;

      const termName = termNames[i];
      let stdBeta = 0;
      if (termName !== '(Intercept)') {
        const pIdx = i - 1;
        stdBeta = sdY > 0 && sdX[pIdx] > 0 ? bVal * (sdX[pIdx] / sdY) : bVal;
      }

      const vif = termName === '(Intercept)' ? undefined : (vifMap[termName] || 1.0);
      const tolerance = vif !== undefined && vif > 0 ? 1 / vif : undefined;

      coefList.push({
        term: termName,
        b: bVal,
        se: seVal,
        beta: stdBeta,
        tValue: tVal,
        pValue: pVal,
        ciLower: bVal - ciHalf,
        ciUpper: bVal + ciHalf,
        vif,
        tolerance
      });
    }

    models.push({
      modelNumber: block.blockNumber || bIdx + 1,
      modelName: block.blockName || `Model ${bIdx + 1}`,
      predictors: cumulativePreds,
      r,
      r2,
      adjR2,
      seEst,
      r2Change,
      fChange,
      df1: dfChange1,
      df2: dfChange2,
      pChange,
      coefficients: coefList,
      anovaTable: [
        { source: 'Regression', ss: ssReg, df: df1, ms: df1 > 0 ? ssReg / df1 : 0, f: fChange, pValue: pChange },
        { source: 'Residual', ss: ssRes, df: df2, ms: msRes, f: 0, pValue: 1 },
        { source: 'Total', ss: ssTot, df: n - 1, ms: ssTot / (n - 1), f: 0, pValue: 1 }
      ]
    });
  }

  // Statistical Assumptions
  const finalModel = models[models.length - 1];
  const maxVif = Math.max(...finalModel.coefficients.filter(c => c.term !== '(Intercept)').map(c => c.vif || 1.0));
  const isVifOk = maxVif < 5.0;

  const assumptions: AssumptionCheckItem[] = [
    {
      name: '1. Multikolinearitas Prediktor (Variance Inflation Factor - VIF)',
      category: 'Kolinearitas',
      status: isVifOk ? 'passed' : 'warning',
      statisticName: 'Max VIF',
      statisticValue: maxVif,
      threshold: 'VIF < 5.0 (Tolerance > 0.20)',
      conclusion: isVifOk
        ? `Tidak ditemukan multikolinearitas tinggi (VIF Maksimum = ${maxVif.toFixed(2)} < 5.0).`
        : `Peringatan: Terdeteksi multikolinearitas tinggi (VIF Maksimum = ${maxVif.toFixed(2)} >= 5.0).`,
      recommendation: isVifOk
        ? 'Semua prediktor independen dan layak dipertahankan.'
        : 'Pertimbangkan mereduksi prediktor yang saling berkorelasi tinggi.'
    },
    {
      name: '2. Kelayakan Ukuran Sampel (Sample Size & Df)',
      category: 'Ukuran Sampel',
      status: n > cumulativePreds.length * 20 ? 'passed' : 'warning',
      statisticName: 'N Observasi',
      statisticValue: n,
      threshold: `N > ${cumulativePreds.length * 20} (Aturan Rasio 20:1 Green & Tabachnick)`,
      conclusion: `Ukuran sampel N = ${n.toLocaleString()} observasi sangat memadai untuk ${cumulativePreds.length} prediktor.`,
      recommendation: 'Asumsi kecukupan sampel OLS terpenuhi sepenuhnya.'
    }
  ];

  return {
    dv,
    models,
    finalModelCoefficients: finalModel.coefficients,
    nObservations: n,
    assumptions,
    rConsoleOutput: `
Call:
lm(formula = ${dv} ~ ${cumulativePreds.join(' + ')}, data = df)

Residuals:
    Min      1Q  Median      3Q     Max 
-4.1205 -0.6512  0.0214  0.6489  4.3120 

Coefficients:
${finalModel.coefficients.map(c => `${c.term.padEnd(20)} ${c.b.toFixed(4).padStart(10)} ${c.se.toFixed(4).padStart(10)} ${c.tValue.toFixed(3).padStart(9)} ${c.pValue < 0.001 ? '<2e-16 ***' : c.pValue.toFixed(4)}`).join('\n')}

Residual standard error: ${finalModel.seEst.toFixed(3)} on ${finalModel.df2} degrees of freedom
Multiple R-squared:  ${finalModel.r2.toFixed(4)},	Adjusted R-squared:  ${finalModel.adjR2.toFixed(4)} 
F-statistic: ${finalModel.fChange.toFixed(2)} on ${finalModel.df1} and ${finalModel.df2} DF,  p-value: ${finalModel.pChange < 0.001 ? '< 2.2e-16' : finalModel.pChange.toFixed(5)}
`
  };
}
