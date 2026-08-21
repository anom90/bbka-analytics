import { Dist } from './distributions';
import { Mat } from './matrix';
import { AncovaResult, AnovaRow, DataRow } from '../types';

export function runAncova(
  data: DataRow[],
  dv: string,
  factor: string,
  covariates: string[]
): AncovaResult {
  if (!factor) throw new Error('Faktor (Independent Variable) harus dipilih.');
  if (covariates.length === 0) throw new Error('Minimal satu Kovariat harus dipilih.');

  // Clean data
  const validData = data.filter(r => {
    const y = Number(r[dv]);
    if (isNaN(y)) return false;
    if (r[factor] === null || r[factor] === undefined || String(r[factor]).trim() === '') return false;
    for (const cov of covariates) {
      if (isNaN(Number(r[cov]))) return false;
    }
    return true;
  });

  const N = validData.length;
  if (N < covariates.length + 4) {
    throw new Error('Jumlah sampel tidak mencukupi untuk estimasi model ANCOVA.');
  }

  // Identify factor levels
  const groupsMap = new Map<string, DataRow[]>();
  for (const r of validData) {
    const g = String(r[factor]).trim();
    if (!groupsMap.has(g)) groupsMap.set(g, []);
    groupsMap.get(g)!.push(r);
  }

  const levels = Array.from(groupsMap.keys());
  const k = levels.length;
  if (k < 2) throw new Error(`Faktor '${factor}' harus memiliki minimal 2 level unik.`);

  const refLevel = levels[0];
  const dummyLevels = levels.slice(1);

  // Build Full Model Design Matrix X_full: [Intercept, Dummy1, ..., Dummy_{k-1}, Cov1, ..., Cov_m]
  const X_full: number[][] = [];
  const y: number[] = [];

  for (const r of validData) {
    const row = [1];
    const g = String(r[factor]).trim();
    for (const dl of dummyLevels) {
      row.push(g === dl ? 1 : 0);
    }
    for (const cov of covariates) {
      row.push(Number(r[cov]));
    }
    X_full.push(row);
    y.push(Number(r[dv]));
  }

  const fitFull = Mat.solveOLS(X_full, y);
  const ssResidualFull = fitFull.rss;
  const dfResidualFull = fitFull.dfResidual;
  const msResidual = ssResidualFull / dfResidualFull;

  // Build Model without Factor (Covariates only) to test Factor SS:
  const X_covOnly: number[][] = validData.map(r => [
    1,
    ...covariates.map(cov => Number(r[cov]))
  ]);
  const fitCovOnly = Mat.solveOLS(X_covOnly, y);
  const ssFactor = Math.max(0, fitCovOnly.rss - ssResidualFull);
  const dfFactor = k - 1;
  const msFactor = ssFactor / dfFactor;
  const fFactor = msResidual > 0 ? msFactor / msResidual : 0;
  const pFactor = Dist.fPValue(fFactor, dfFactor, dfResidualFull);

  // Build Model without Covariates (Factor only) to test Covariates SS:
  const X_factorOnly: number[][] = validData.map(r => {
    const g = String(r[factor]).trim();
    return [1, ...dummyLevels.map(dl => (g === dl ? 1 : 0))];
  });
  const fitFactorOnly = Mat.solveOLS(X_factorOnly, y);
  const ssCovariates = Math.max(0, fitFactorOnly.rss - ssResidualFull);
  const dfCovariates = covariates.length;
  const msCovariates = ssCovariates / dfCovariates;
  const fCovariates = msResidual > 0 ? msCovariates / msResidual : 0;
  const pCovariates = Dist.fPValue(fCovariates, dfCovariates, dfResidualFull);

  const grandMean = y.reduce((a, b) => a + b, 0) / N;
  const ssTotal = y.reduce((s, val) => s + Math.pow(val - grandMean, 2), 0);

  const table: AnovaRow[] = [
    {
      source: factor,
      ss: ssFactor,
      df: dfFactor,
      ms: msFactor,
      f: fFactor,
      pValue: pFactor,
      partialEtaSquared: (ssFactor + ssResidualFull) > 0 ? ssFactor / (ssFactor + ssResidualFull) : 0
    },
    {
      source: `Kovariat (${covariates.join(', ')})`,
      ss: ssCovariates,
      df: dfCovariates,
      ms: msCovariates,
      f: fCovariates,
      pValue: pCovariates,
      partialEtaSquared: (ssCovariates + ssResidualFull) > 0 ? ssCovariates / (ssCovariates + ssResidualFull) : 0
    },
    {
      source: 'Residuals (Error)',
      ss: ssResidualFull,
      df: dfResidualFull,
      ms: msResidual,
      f: NaN,
      pValue: NaN
    },
    {
      source: 'Total',
      ss: ssTotal,
      df: N - 1,
      ms: ssTotal / (N - 1),
      f: NaN,
      pValue: NaN
    }
  ];

  // Parameter estimates table
  const terms = ['Intercept', ...dummyLevels.map(dl => `${factor} (${dl})`), ...covariates];
  const parameterEstimates = terms.map((term, i) => {
    const b = fitFull.beta[i];
    const se = fitFull.se[i];
    const t = se > 0 ? b / se : 0;
    const p = Dist.tPValue(t, dfResidualFull);
    const tCrit = Dist.tInv(0.975, dfResidualFull) || 1.96;
    return {
      term,
      b,
      se,
      t,
      pValue: p,
      ciLower: b - tCrit * se,
      ciUpper: b + tCrit * se
    };
  });

  // Calculate Adjusted Means (Estimated Marginal Means) at Covariates Grand Means
  const covMeans = covariates.map(cov => {
    const vals = validData.map(r => Number(r[cov]));
    return vals.reduce((a, b) => a + b, 0) / N;
  });

  const adjustedMeans = levels.map((lvl, idx) => {
    const rows = groupsMap.get(lvl)!;
    const unadjustedMean = rows.reduce((s, r) => s + Number(r[dv]), 0) / rows.length;

    // Evaluate y_hat with dummy coding and cov at mean
    let adj = fitFull.beta[0];
    if (idx > 0) {
      adj += fitFull.beta[idx]; // dummy idx
    }
    for (let c = 0; c < covariates.length; c++) {
      adj += fitFull.beta[1 + (k - 1) + c] * covMeans[c];
    }

    const se = Math.sqrt(msResidual / rows.length);
    const tCrit = 1.96;

    return {
      group: lvl,
      unadjustedMean,
      adjustedMean: adj,
      se,
      ciLower: adj - tCrit * se,
      ciUpper: adj + tCrit * se
    };
  });

  // Test Homogeneity of Regression Slopes (Interaction Factor x Covariates)
  let interactionF = 0;
  let interactionP = 1;
  try {
    const X_inter: number[][] = validData.map(r => {
      const row = [1];
      const g = String(r[factor]).trim();
      for (const dl of dummyLevels) {
        row.push(g === dl ? 1 : 0);
      }
      for (const cov of covariates) {
        row.push(Number(r[cov]));
      }
      // Interactions
      for (const dl of dummyLevels) {
        const isLvl = g === dl ? 1 : 0;
        for (const cov of covariates) {
          row.push(isLvl * Number(r[cov]));
        }
      }
      return row;
    });

    const fitInter = Mat.solveOLS(X_inter, y);
    const dfInter = (k - 1) * covariates.length;
    const ssInter = Math.max(0, ssResidualFull - fitInter.rss);
    const msInter = ssInter / Math.max(1, dfInter);
    const msResidualInter = fitInter.rss / fitInter.dfResidual;
    interactionF = msResidualInter > 0 ? msInter / msResidualInter : 0;
    interactionP = Dist.fPValue(interactionF, dfInter, fitInter.dfResidual);
  } catch (e) {
    // skip if rank deficient
  }

  return {
    dv,
    factor,
    covariates,
    table,
    adjustedMeans,
    parameterEstimates,
    homogeneityOfSlopes: {
      interactionF,
      interactionP,
      slopesAreParallel: interactionP >= 0.05
    }
  };
}
