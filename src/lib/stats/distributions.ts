// @ts-ignore
import jstat from 'jstat';

/**
 * Probability distribution helpers using jstat with numerical protections.
 */
export const Dist = {
  // Student-t CDF & 2-tailed p-value
  tCdf(t: number, df: number): number {
    if (df <= 0 || isNaN(t) || isNaN(df)) return NaN;
    return jstat.studentt.cdf(t, df);
  },

  tPValue(t: number, df: number, twoTailed = true): number {
    if (df <= 0 || isNaN(t) || isNaN(df)) return NaN;
    const pOne = 1 - jstat.studentt.cdf(Math.abs(t), df);
    const p = twoTailed ? 2 * pOne : pOne;
    return Math.max(0, Math.min(1, p));
  },

  tInv(p: number, df: number): number {
    if (df <= 0 || p <= 0 || p >= 1) return NaN;
    return jstat.studentt.inv(p, df);
  },

  // F Distribution CDF & p-value (right tail)
  fCdf(f: number, df1: number, df2: number): number {
    if (df1 <= 0 || df2 <= 0 || isNaN(f)) return NaN;
    return jstat.centralF.cdf(f, df1, df2);
  },

  fPValue(f: number, df1: number, df2: number): number {
    if (df1 <= 0 || df2 <= 0 || isNaN(f) || f < 0) return NaN;
    const p = 1 - jstat.centralF.cdf(f, df1, df2);
    return Math.max(0, Math.min(1, p));
  },

  // Chi-Square Distribution
  chisqPValue(x: number, df: number): number {
    if (df <= 0 || isNaN(x) || x < 0) return NaN;
    const p = 1 - jstat.chisquare.cdf(x, df);
    return Math.max(0, Math.min(1, p));
  },

  // Standard Normal Distribution
  normalCdf(z: number): number {
    return jstat.normal.cdf(z, 0, 1);
  },

  normalInv(p: number): number {
    return jstat.normal.inv(p, 0, 1);
  },

  // Studentized Range distribution approximation for Tukey HSD
  tukeyQtoP(q: number, k: number, df: number): number {
    if (df <= 0 || k < 2 || isNaN(q) || q <= 0) return 1;
    // Standard approximation of studentized range distribution using F-statistic conversion
    // q ~ sqrt(2) * t, or approximate via studentized maximum modulus
    const tEquivalent = q / Math.SQRT2;
    const pSingle = Dist.tPValue(tEquivalent, df);
    // Sidak / Dunn-Bonferroni approximation for k groups comparisons
    const numComparisons = (k * (k - 1)) / 2;
    const pAdj = 1 - Math.pow(1 - pSingle, numComparisons);
    return Math.max(0, Math.min(1, isNaN(pAdj) ? pSingle * numComparisons : pAdj));
  }
};
