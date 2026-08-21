import { Dist } from './distributions';
import { Mat, Matrix } from './matrix';
import { runAnova } from './anova';
import { DataRow, ManovaEffect, ManovaResult, ManovaStat } from '../types';

export function runManova(
  data: DataRow[],
  dvs: string[],
  factors: string[]
): ManovaResult {
  if (dvs.length < 2) throw new Error('MANOVA membutuhkan minimal 2 variabel dependen (DV).');
  if (factors.length === 0) throw new Error('Minimal satu faktor (IV) harus dipilih.');

  // Clean data
  const validData = data.filter(r => {
    for (const dv of dvs) {
      if (isNaN(Number(r[dv]))) return false;
    }
    for (const f of factors) {
      if (r[f] === null || r[f] === undefined || String(r[f]).trim() === '') return false;
    }
    return true;
  });

  const N = validData.length;
  const p = dvs.length; // Number of DVs
  if (N < p + factors.length + 2) {
    throw new Error('Jumlah data tidak mencukupi untuk analisis MANOVA.');
  }

  // Calculate univariate ANOVAs for each DV as follow-ups
  const univariateAnovas: Record<string, any> = {};
  for (const dv of dvs) {
    univariateAnovas[dv] = runAnova(validData, dv, factors);
  }

  // Main factor (Factor A)
  const factor = factors[0];
  const groupsMap = new Map<string, number[][]>();
  for (const r of validData) {
    const g = String(r[factor]).trim();
    if (!groupsMap.has(g)) groupsMap.set(g, []);
    const yVec = dvs.map(dv => Number(r[dv]));
    groupsMap.get(g)!.push(yVec);
  }

  const k = groupsMap.size; // number of groups
  if (k < 2) throw new Error(`Faktor '${factor}' harus memiliki minimal 2 kelompok.`);

  // Calculate Overall Grand Mean vector
  const grandMean: number[] = Array(p).fill(0);
  for (const r of validData) {
    for (let j = 0; j < p; j++) {
      grandMean[j] += Number(r[dvs[j]]);
    }
  }
  for (let j = 0; j < p; j++) grandMean[j] /= N;

  // Calculate Error (Within) Sum of Squares & Cross Products (SSCP) Matrix E: pxp
  // Calculate Hypothesis (Between) SSCP Matrix H: pxp
  const E: Matrix = Mat.zeros(p, p);
  const H: Matrix = Mat.zeros(p, p);
  const groupCovariances: Matrix[] = [];
  const groupSizes: number[] = [];

  for (const [_, vals] of groupsMap.entries()) {
    const nj = vals.length;
    groupSizes.push(nj);
    const mean_j = Array(p).fill(0);
    for (const v of vals) {
      for (let j = 0; j < p; j++) mean_j[j] += v[j];
    }
    for (let j = 0; j < p; j++) mean_j[j] /= nj;

    // Between-group SSCP: nj * (mean_j - grandMean) * (mean_j - grandMean)^T
    for (let i = 0; i < p; i++) {
      for (let j = 0; j < p; j++) {
        H[i][j] += nj * (mean_j[i] - grandMean[i]) * (mean_j[j] - grandMean[j]);
      }
    }

    // Within-group SSCP
    const Ej: Matrix = Mat.zeros(p, p);
    for (const v of vals) {
      for (let i = 0; i < p; i++) {
        for (let j = 0; j < p; j++) {
          const diffI = v[i] - mean_j[i];
          const diffJ = v[j] - mean_j[j];
          E[i][j] += diffI * diffJ;
          Ej[i][j] += diffI * diffJ;
        }
      }
    }

    const Sj = Mat.scale(Ej, 1 / Math.max(1, nj - 1));
    groupCovariances.push(Sj);
  }

  const dfHypothesis = k - 1;
  const dfError = N - k;

  // Compute eigenvalues of E^(-1) * H
  const EInv = Mat.inverse(E);
  const EInvH = Mat.multiply(EInv, H);
  const rawEigen = Mat.eigenvalues(EInvH);
  // Sort descending and keep positive eigenvalues
  const eigen = rawEigen.map(v => Math.max(0, v)).sort((a, b) => b - a);

  // 1. Wilks' Lambda: product of 1 / (1 + lambda_i) = |E| / |H + E|
  const detE = Mat.determinant(E);
  const detHE = Mat.determinant(Mat.add(H, E));
  let wilksLambda = (detHE !== 0 && detE >= 0) ? detE / detHE : 1;
  if (isNaN(wilksLambda) || wilksLambda <= 0) {
    wilksLambda = eigen.reduce((acc, val) => acc * (1 / (1 + val)), 1);
  }
  wilksLambda = Math.max(1e-10, Math.min(1, wilksLambda));

  // Wilks' Lambda Rao's F approximation
  const sRao = Math.sqrt(
    Math.max(1, (p * p * dfHypothesis * dfHypothesis - 4) / (p * p + dfHypothesis * dfHypothesis - 5))
  );
  const wRao = dfError + dfHypothesis - (p + dfHypothesis + 1) / 2;
  const df1Wilks = p * dfHypothesis;
  const df2Wilks = Math.max(1, wRao * sRao - (p * dfHypothesis - 2) / 2);
  const fWilks = df1Wilks > 0 ? ((1 - Math.pow(wilksLambda, 1 / sRao)) / Math.pow(wilksLambda, 1 / sRao)) * (df2Wilks / df1Wilks) : 0;
  const pWilks = Dist.fPValue(fWilks, df1Wilks, df2Wilks);

  // 2. Pillai's Trace: sum(lambda_i / (1 + lambda_i))
  const pillaiTrace = eigen.reduce((acc, val) => acc + (val / (1 + val)), 0);
  const sPillai = Math.min(p, dfHypothesis);
  const mPillai = (Math.abs(p - dfHypothesis) - 1) / 2;
  const nPillai = (dfError - p - 1) / 2;
  const df1Pillai = sPillai * (2 * mPillai + sPillai + 1);
  const df2Pillai = Math.max(1, sPillai * (2 * nPillai + sPillai + 1));
  const fPillai = (pillaiTrace / (sPillai - pillaiTrace)) * (df2Pillai / df1Pillai);
  const pPillai = Dist.fPValue(fPillai, df1Pillai, df2Pillai);

  // 3. Hotelling-Lawley Trace: sum(lambda_i)
  const hotellingTrace = eigen.reduce((acc, val) => acc + val, 0);
  const bHotelling = (dfError - p - 1);
  const fHotelling = (hotellingTrace / sPillai) * (df2Pillai / df1Pillai);
  const pHotelling = Dist.fPValue(fHotelling, df1Pillai, df2Pillai);

  // 4. Roy's Largest Root: lambda_max
  const royRoot = eigen.length > 0 ? eigen[0] : 0;
  const df1Roy = p;
  const df2Roy = Math.max(1, dfError);
  const fRoy = (royRoot * df2Roy) / df1Roy;
  const pRoy = Dist.fPValue(fRoy, df1Roy, df2Roy);

  const stats: ManovaStat[] = [
    {
      test: 'Wilks',
      value: wilksLambda,
      approxF: fWilks,
      numDf: df1Wilks,
      denDf: df2Wilks,
      pValue: pWilks,
      partialEtaSq: 1 - Math.pow(wilksLambda, 1 / sRao)
    },
    {
      test: 'Pillai',
      value: pillaiTrace,
      approxF: fPillai,
      numDf: df1Pillai,
      denDf: df2Pillai,
      pValue: pPillai,
      partialEtaSq: pillaiTrace / sPillai
    },
    {
      test: 'Hotelling',
      value: hotellingTrace,
      approxF: fHotelling,
      numDf: df1Pillai,
      denDf: df2Pillai,
      pValue: pHotelling,
      partialEtaSq: hotellingTrace / (hotellingTrace + sPillai)
    },
    {
      test: 'Roy',
      value: royRoot,
      approxF: fRoy,
      numDf: df1Roy,
      denDf: df2Roy,
      pValue: pRoy,
      partialEtaSq: royRoot / (1 + royRoot)
    }
  ];

  const multivariateEffects: ManovaEffect[] = [
    {
      source: factor,
      stats
    }
  ];

  // Box's M Test for Equality of Covariance Matrices
  let boxMResult;
  try {
    const Spooled = Mat.scale(E, 1 / dfError);
    const detSpooled = Mat.determinant(Spooled);

    if (detSpooled > 0) {
      let sumLogDet = 0;
      let sumInverseDf = 0;
      let validGroups = true;

      for (let g = 0; g < k; g++) {
        const dfg = groupSizes[g] - 1;
        const detSg = Mat.determinant(groupCovariances[g]);
        if (detSg <= 0 || isNaN(detSg)) {
          validGroups = false;
          break;
        }
        sumLogDet += dfg * Math.log(detSg);
        sumInverseDf += 1 / dfg;
      }

      if (validGroups) {
        const M = dfError * Math.log(detSpooled) - sumLogDet;
        const c1 = ((2 * p * p + 3 * p - 1) / (6 * (p + 1) * (k - 1))) * (sumInverseDf - 1 / dfError);
        const dfBox1 = (p * (p + 1) * (k - 1)) / 2;
        const dfBox2 = Math.max(1, (dfBox1 + 2) / Math.abs(((p - 1) * (p + 2) / (6 * (k - 1))) * (sumInverseDf * sumInverseDf - 1 / (dfError * dfError)) - c1 * c1));
        const fBox = (M * (1 - c1)) / dfBox1;
        const pBox = Dist.fPValue(fBox, dfBox1, dfBox2);

        boxMResult = {
          mValue: M,
          approxF: fBox,
          df1: dfBox1,
          df2: dfBox2,
          pValue: pBox
        };
      }
    }
  } catch (e) {
    // box M fallback
  }

  return {
    dvs,
    factors: [factor],
    multivariateEffects,
    boxM: boxMResult,
    univariateAnovas
  };
}
