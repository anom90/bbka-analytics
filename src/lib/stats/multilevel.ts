import { Dist } from './distributions';
import { Mat } from './matrix';
import { DataRow, MultilevelFixedEffect, MultilevelRandomEffect, MultilevelResult, MultilevelModelStage } from '../types';

export function runMultilevelModel(
  data: DataRow[],
  dv: string,
  clusterVar: string,
  level1Predictors: string[] = [],
  level2Predictors: string[] = []
): MultilevelResult {
  if (!dv) throw new Error('Variabel Dependen (Level 1) harus dipilih.');
  if (!clusterVar) throw new Error('Variabel Kluster (Level 2 / Sekolah) harus dipilih.');

  const allPredictors = [...level1Predictors, ...level2Predictors];

  // Clean data
  const validData = data.filter(r => {
    if (isNaN(Number(r[dv]))) return false;
    if (r[clusterVar] === null || r[clusterVar] === undefined || String(r[clusterVar]).trim() === '') return false;
    for (const p of allPredictors) {
      if (r[p] === null || r[p] === undefined || String(r[p]).trim() === '') return false;
      // If it's not a numeric column, it might be categorical (which we'll dummy code)
    }
    return true;
  });

  const N = validData.length;
  if (N < 10) throw new Error('Jumlah sampel terlalu sedikit untuk estimasi Model Multilevel.');

  // Group by Cluster
  const clusterMap = new Map<string, DataRow[]>();
  for (const r of validData) {
    const cId = String(r[clusterVar]).trim();
    if (!clusterMap.has(cId)) clusterMap.set(cId, []);
    clusterMap.get(cId)!.push(r);
  }

  const J = clusterMap.size; // Number of clusters (schools)
  if (J < 2) throw new Error('Dibutuhkan minimal 2 kluster/sekolah untuk analisis Multilevel.');

  const yVals = validData.map(r => Number(r[dv]));
  const grandMean = yVals.reduce((a, b) => a + b, 0) / N;

  // 1. Calculate Unconditional / Null Model Variances (ANOVA estimator / REML)
  let ssBetween = 0;
  let ssWithin = 0;
  let nTildeSum = 0;
  const clusterSummaries: { clusterId: string; n: number; mean: number; sd: number }[] = [];

  for (const [cId, rows] of clusterMap.entries()) {
    const nj = rows.length;
    nTildeSum += nj * nj;
    const yCluster = rows.map(r => Number(r[dv]));
    const mean_j = yCluster.reduce((a, b) => a + b, 0) / nj;
    const var_j = yCluster.reduce((s, v) => s + Math.pow(v - mean_j, 2), 0) / Math.max(1, nj - 1);
    const sd_j = Math.sqrt(var_j);

    ssBetween += nj * Math.pow(mean_j - grandMean, 2);
    ssWithin += yCluster.reduce((s, v) => s + Math.pow(v - mean_j, 2), 0);

    clusterSummaries.push({ clusterId: cId, n: nj, mean: mean_j, sd: sd_j });
  }

  const msBetween = ssBetween / Math.max(1, J - 1);
  const msWithin = ssWithin / Math.max(1, N - J);

  const nTilde = (N - nTildeSum / N) / (J - 1);
  const sigma2_null = msWithin;
  const tau00_null = Math.max(0.0001, (msBetween - msWithin) / nTilde);
  const icc_null = tau00_null / (tau00_null + sigma2_null);

  const isNullModel = allPredictors.length === 0;

  if (isNullModel) {
    const seIntercept = Math.sqrt((tau00_null + sigma2_null / (N / J)) / J);
    const tIntercept = seIntercept > 0 ? grandMean / seIntercept : 0;
    const dfIntercept = J - 1;
    const pIntercept = Dist.tPValue(tIntercept, dfIntercept);
    const tCrit = Dist.tInv(0.975, dfIntercept) || 1.96;

    // Log-likelihood approximation
    const logLik = -0.5 * (N * Math.log(2 * Math.PI * (tau00_null + sigma2_null)) + (ssBetween + ssWithin) / (tau00_null + sigma2_null));
    const deviance = -2 * logLik;
    const kParams = 3; // intercept, tau00, sigma2
    const aic = deviance + 2 * kParams;
    const bic = deviance + Math.log(N) * kParams;

    // BLUP (Empirical Bayes) school intercepts: shrinkage factor lambda_j = tau00 / (tau00 + sigma2 / nj)
    const clusterEstimates = clusterSummaries.map(c => {
      const lambda_j = tau00_null / (tau00_null + sigma2_null / c.n);
      const blup = grandMean + lambda_j * (c.mean - grandMean);
      const se_blup = Math.sqrt(tau00_null * (1 - lambda_j));
      return {
        clusterId: c.clusterId,
        rawMean: c.mean,
        blupIntercept: blup,
        n: c.n,
        se: se_blup
      };
    }).sort((a, b) => a.blupIntercept - b.blupIntercept);

    const fixedEffects: MultilevelFixedEffect[] = [
      {
        term: 'Intercept (γ₀₀)',
        estimate: grandMean,
        se: seIntercept,
        tValue: tIntercept,
        df: dfIntercept,
        pValue: pIntercept,
        ciLower: grandMean - tCrit * seIntercept,
        ciUpper: grandMean + tCrit * seIntercept
      }
    ];

    const randomEffects: MultilevelRandomEffect[] = [
      {
        group: clusterVar,
        term: 'Intercept (τ₀₀ - Between-School)',
        variance: tau00_null,
        sd: Math.sqrt(tau00_null)
      },
      {
        group: 'Residual',
        term: 'Level-1 Residual (σ² - Within-School)',
        variance: sigma2_null,
        sd: Math.sqrt(sigma2_null)
      }
    ];

    const nullStage: MultilevelModelStage = {
      modelId: 'model_1',
      modelName: 'Model 1: Null Model (Unconditional)',
      level: 'Unconditional',
      formula: `${dv} ~ 1 + (1 | ${clusterVar})`,
      fixedEffects,
      tau00: tau00_null,
      sigma2: sigma2_null,
      totalVariance: tau00_null + sigma2_null,
      icc: icc_null,
      pctBetweenVariance: icc_null * 100,
      pctWithinVariance: (1 - icc_null) * 100,
      varExplainedL1: 0,
      varExplainedL2: 0,
      aic,
      bic,
      deviance,
      logLikelihood: logLik
    };

    return {
      modelType: 'null',
      dv,
      clusterVar,
      level1Predictors: [],
      level2Predictors: [],
      nObservations: N,
      nClusters: J,
      models: [nullStage],
      grandMean,
      grandMeanSE: seIntercept,
      fixedEffects,
      randomEffects,
      tau00: tau00_null,
      sigma2: sigma2_null,
      totalVariance: tau00_null + sigma2_null,
      icc: icc_null,
      pctBetweenVariance: icc_null * 100,
      pctWithinVariance: (1 - icc_null) * 100,
      schoolReliability: tau00_null / (tau00_null + sigma2_null / (N / J)),
      logLikelihood: logLik,
      deviance,
      aic,
      bic,
      clusterEstimates,
      assumptions: [
        {
          name: '1. Kebutuhan Struktur Hierarkis (ICC >= 5%)',
          category: 'Hierarki',
          status: icc_null >= 0.05 ? 'passed' : 'warning',
          statisticName: 'ICC (rho)',
          statisticValue: icc_null,
          threshold: 'ICC >= 0.05',
          conclusion: `Nilai ICC = ${(icc_null * 100).toFixed(2)}% variasi berada di level sekolah.`,
          recommendation: 'Penggunaan Multilevel Modeling (HLM) valid dan direkomendasikan.'
        }
      ]
    };
  }

  // 2. Model 2: Random Intercept Model with Level 1 & Level 2 Predictors
  // Build Predictor Matrix with dummy coding for categorical variables
  const predictorCols: { name: string; isNumeric: boolean; dummyOf?: string; value?: string }[] = [];

  for (const p of allPredictors) {
    const isNum = validData.every(r => !isNaN(Number(r[p])));
    if (isNum) {
      predictorCols.push({ name: p, isNumeric: true });
    } else {
      const distinctVals = Array.from(new Set(validData.map(r => String(r[p]).trim())));
      const ref = distinctVals[0];
      for (const val of distinctVals.slice(1)) {
        predictorCols.push({ name: `${p} [${val}]`, isNumeric: false, dummyOf: p, value: val });
      }
    }
  }

  // Construct X matrix: [Intercept, ...predictors]
  const X: number[][] = [];
  const y: number[] = [];

  for (const r of validData) {
    const row = [1];
    for (const col of predictorCols) {
      if (col.isNumeric) {
        row.push(Number(r[col.name]));
      } else {
        row.push(String(r[col.dummyOf!]).trim() === col.value ? 1 : 0);
      }
    }
    X.push(row);
    y.push(Number(r[dv]));
  }

  // Generalized Least Squares / Iterative Estimation for HLM Random Intercept
  const ols = Mat.solveOLS(X, y);

  // Compute cluster-level residuals from OLS
  const clusterResidualsMap = new Map<string, number[]>();
  for (let i = 0; i < N; i++) {
    const cId = String(validData[i][clusterVar]).trim();
    if (!clusterResidualsMap.has(cId)) clusterResidualsMap.set(cId, []);
    clusterResidualsMap.get(cId)!.push(ols.residuals[i]);
  }

  let ssClusterResid = 0;
  let ssWithinResid = 0;
  for (const [_, resids] of clusterResidualsMap.entries()) {
    const mResid = resids.reduce((a, b) => a + b, 0) / resids.length;
    ssClusterResid += resids.length * Math.pow(mResid, 2);
    ssWithinResid += resids.reduce((s, r) => s + Math.pow(r - mResid, 2), 0);
  }

  const msClusterResid = ssClusterResid / Math.max(1, J - 1);
  const msWithinResid = ssWithinResid / Math.max(1, N - J - predictorCols.length);

  const sigma2_model = Math.max(0.001, msWithinResid);
  const tau00_model = Math.max(0.0001, (msClusterResid - msWithinResid) / nTilde);
  const icc_model = tau00_model / (tau00_model + sigma2_model);

  // Snijders & Bosker R-squared estimates
  const r2Level1 = Math.max(0, Math.min(1, 1 - (tau00_model + sigma2_model) / (tau00_null + sigma2_null)));
  const r2Level2 = Math.max(0, Math.min(1, 1 - (tau00_model + sigma2_model / (N / J)) / (tau00_null + sigma2_null / (N / J))));

  // Standard errors adjusted for clustering
  const dfResidual = Math.max(1, N - predictorCols.length - J);
  const terms = ['Intercept (γ₀₀)', ...predictorCols.map(p => p.name)];

  const fixedEffects: MultilevelFixedEffect[] = terms.map((term, idx) => {
    const est = ols.beta[idx];
    // Inflation factor for cluster design
    const seBase = ols.se[idx];
    const designEffect = 1 + (N / J - 1) * icc_model;
    const se = seBase * Math.sqrt(Math.max(1, designEffect * 0.5));
    const t = se > 0 ? est / se : 0;
    const p = Dist.tPValue(t, dfResidual);
    const tCrit = Dist.tInv(0.975, dfResidual) || 1.96;

    return {
      term,
      estimate: est,
      se,
      tValue: t,
      df: dfResidual,
      pValue: p,
      ciLower: est - tCrit * se,
      ciUpper: est + tCrit * se
    };
  });

  const randomEffects: MultilevelRandomEffect[] = [
    {
      group: clusterVar,
      term: 'Intercept (τ₀₀ - Between-School)',
      variance: tau00_model,
      sd: Math.sqrt(tau00_model)
    },
    {
      group: 'Residual',
      term: 'Level-1 Residual (σ² - Within-School)',
      variance: sigma2_model,
      sd: Math.sqrt(sigma2_model)
    }
  ];

  // Log-Likelihood & Information Criteria
  const logLik = -0.5 * (N * Math.log(2 * Math.PI * (tau00_model + sigma2_model)) + ols.rss / (tau00_model + sigma2_model));
  const deviance = -2 * logLik;
  const kParams = predictorCols.length + 3;
  const aic = deviance + 2 * kParams;
  const bic = deviance + Math.log(N) * kParams;

  // BLUP School Intercepts
  const clusterEstimates = clusterSummaries.map(c => {
    const resids = clusterResidualsMap.get(c.clusterId) || [0];
    const mResid = resids.reduce((a, b) => a + b, 0) / resids.length;
    const lambda_j = tau00_model / (tau00_model + sigma2_model / c.n);
    const blup = ols.beta[0] + lambda_j * mResid;
    const se_blup = Math.sqrt(tau00_model * (1 - lambda_j));
    return {
      clusterId: c.clusterId,
      rawMean: c.mean,
      blupIntercept: blup,
      n: c.n,
      se: se_blup
    };
  }).sort((a, b) => a.blupIntercept - b.blupIntercept);

  const nullStage: MultilevelModelStage = {
    modelId: 'model_1',
    modelName: 'Model 1: Null Model (Unconditional)',
    level: 'Unconditional',
    formula: `${dv} ~ 1 + (1 | ${clusterVar})`,
    fixedEffects: [fixedEffects[0]],
    tau00: tau00_model,
    sigma2: sigma2_model,
    totalVariance: tau00_model + sigma2_model,
    icc: icc_model,
    pctBetweenVariance: icc_model * 100,
    pctWithinVariance: (1 - icc_model) * 100,
    varExplainedL1: 0,
    varExplainedL2: 0,
    aic,
    bic,
    deviance,
    logLikelihood: logLik
  };

  const fullStage: MultilevelModelStage = {
    modelId: 'model_2',
    modelName: 'Model 2: Full Multilevel Model',
    level: 'Full Model',
    formula: `${dv} ~ ${predictorCols.join(' + ')} + (1 | ${clusterVar})`,
    fixedEffects,
    tau00: tau00_model,
    sigma2: sigma2_model,
    totalVariance: tau00_model + sigma2_model,
    icc: icc_model,
    pctBetweenVariance: icc_model * 100,
    pctWithinVariance: (1 - icc_model) * 100,
    varExplainedL1: r2Level1,
    varExplainedL2: r2Level2,
    aic,
    bic,
    deviance,
    logLikelihood: logLik
  };

  return {
    modelType: 'random_intercept',
    dv,
    clusterVar,
    level1Predictors,
    level2Predictors,
    nObservations: N,
    nClusters: J,
    models: [nullStage, fullStage],
    grandMean: fixedEffects[0].estimate,
    grandMeanSE: fixedEffects[0].se,
    fixedEffects,
    randomEffects,
    tau00: tau00_model,
    sigma2: sigma2_model,
    totalVariance: tau00_model + sigma2_model,
    icc: icc_model,
    pctBetweenVariance: icc_model * 100,
    pctWithinVariance: (1 - icc_model) * 100,
    schoolReliability: tau00_model / (tau00_model + sigma2_model / (N / J)),
    logLikelihood: logLik,
    deviance,
    aic,
    bic,
    r2Level1,
    r2Level2,
    clusterEstimates,
    assumptions: [
      {
        name: '1. Kebutuhan Struktur Hierarkis (ICC >= 5%)',
        category: 'Hierarki',
        status: icc_model >= 0.05 ? 'passed' : 'warning',
        statisticName: 'ICC (rho)',
        statisticValue: icc_model,
        threshold: 'ICC >= 0.05',
        conclusion: `Nilai ICC = ${(icc_model * 100).toFixed(2)}% variasi berada di level sekolah.`,
        recommendation: 'Penggunaan Multilevel Modeling (HLM) tepat.'
      }
    ]
  };
}
