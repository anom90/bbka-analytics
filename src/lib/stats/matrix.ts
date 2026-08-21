/**
 * Matrix Algebra Utility for Statistical Modeling (OLS, ANCOVA, MANOVA, HLM)
 */

export type Matrix = number[][];
export type Vector = number[];

export const Mat = {
  zeros(rows: number, cols: number): Matrix {
    return Array.from({ length: rows }, () => Array(cols).fill(0));
  },

  eye(n: number): Matrix {
    const I = Mat.zeros(n, n);
    for (let i = 0; i < n; i++) I[i][i] = 1;
    return I;
  },

  transpose(A: Matrix): Matrix {
    const r = A.length;
    const c = A[0].length;
    const At = Mat.zeros(c, r);
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        At[j][i] = A[i][j];
      }
    }
    return At;
  },

  multiply(A: Matrix, B: Matrix): Matrix {
    const rA = A.length;
    const cA = A[0].length;
    const rB = B.length;
    const cB = B[0].length;
    if (cA !== rB) {
      throw new Error(`Matrix dimension mismatch: [${rA}x${cA}] * [${rB}x${cB}]`);
    }
    const C = Mat.zeros(rA, cB);
    for (let i = 0; i < rA; i++) {
      for (let k = 0; k < cA; k++) {
        const aik = A[i][k];
        if (aik === 0) continue;
        for (let j = 0; j < cB; j++) {
          C[i][j] += aik * B[k][j];
        }
      }
    }
    return C;
  },

  matVecMul(A: Matrix, x: Vector): Vector {
    const r = A.length;
    const c = A[0].length;
    const y = Array(r).fill(0);
    for (let i = 0; i < r; i++) {
      let sum = 0;
      for (let j = 0; j < c; j++) {
        sum += A[i][j] * x[j];
      }
      y[i] = sum;
    }
    return y;
  },

  add(A: Matrix, B: Matrix): Matrix {
    const r = A.length;
    const c = A[0].length;
    const C = Mat.zeros(r, c);
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        C[i][j] = A[i][j] + B[i][j];
      }
    }
    return C;
  },

  subtract(A: Matrix, B: Matrix): Matrix {
    const r = A.length;
    const c = A[0].length;
    const C = Mat.zeros(r, c);
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        C[i][j] = A[i][j] - B[i][j];
      }
    }
    return C;
  },

  scale(A: Matrix, s: number): Matrix {
    return A.map(row => row.map(val => val * s));
  },

  /**
   * Gauss-Jordan matrix inversion with partial pivoting and ridge regularization
   */
  inverse(A: Matrix, ridge = 1e-10): Matrix {
    const n = A.length;
    // Clone and augment with Identity
    const M: Matrix = A.map((row, i) => {
      const r = [...row];
      r[i] += ridge; // numerical stability
      const id = Array(n).fill(0);
      id[i] = 1;
      return [...r, ...id];
    });

    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      let maxVal = Math.abs(M[i][i]);
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > maxVal) {
          maxVal = Math.abs(M[k][i]);
          maxRow = k;
        }
      }

      if (maxRow !== i) {
        const tmp = M[i];
        M[i] = M[maxRow];
        M[maxRow] = tmp;
      }

      const pivot = M[i][i];
      if (Math.abs(pivot) < 1e-15) {
        continue;
      }

      for (let j = 0; j < 2 * n; j++) {
        M[i][j] /= pivot;
      }

      for (let k = 0; k < n; k++) {
        if (k === i) continue;
        const factor = M[k][i];
        for (let j = 0; j < 2 * n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }

    return M.map(row => row.slice(n));
  },

  determinant(A: Matrix): number {
    const n = A.length;
    if (n === 1) return A[0][0];
    if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
    if (n === 3) {
      return (
        A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
        A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
        A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])
      );
    }

    // LU decomposition for NxN
    const M = A.map(r => [...r]);
    let det = 1;
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
      }
      if (maxRow !== i) {
        const tmp = M[i];
        M[i] = M[maxRow];
        M[maxRow] = tmp;
        det = -det;
      }
      if (Math.abs(M[i][i]) < 1e-14) return 0;
      det *= M[i][i];
      for (let k = i + 1; k < n; k++) {
        const factor = M[k][i] / M[i][i];
        for (let j = i; j < n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
    return det;
  },

  trace(A: Matrix): number {
    let sum = 0;
    for (let i = 0; i < Math.min(A.length, A[0].length); i++) {
      sum += A[i][i];
    }
    return sum;
  },

  /**
   * OLS Regression: solves beta = (X'X)^(-1) X' y
   */
  solveOLS(X: Matrix, y: Vector): {
    beta: Vector;
    xtxInv: Matrix;
    yHat: Vector;
    residuals: Vector;
    rss: number;
    dfResidual: number;
    sigma2: number;
    se: Vector;
  } {
    const n = X.length;
    const p = X[0].length;
    const Xt = Mat.transpose(X);
    const XtX = Mat.multiply(Xt, X);
    const XtXInv = Mat.inverse(XtX);
    const Xty = Mat.matVecMul(Xt, y);
    const beta = Mat.matVecMul(XtXInv, Xty);

    const yHat = Mat.matVecMul(X, beta);
    const residuals = y.map((yi, i) => yi - yHat[i]);
    const rss = residuals.reduce((sum, r) => sum + r * r, 0);
    const dfResidual = Math.max(1, n - p);
    const sigma2 = rss / dfResidual;
    const se = Array(p).fill(0).map((_, i) => Math.sqrt(Math.max(0, sigma2 * XtXInv[i][i])));

    return {
      beta,
      xtxInv: XtXInv,
      yHat,
      residuals,
      rss,
      dfResidual,
      sigma2,
      se
    };
  },

  /**
   * Eigenvalues of a square matrix using QR algorithm
   */
  eigenvalues(A: Matrix, maxIter = 50): number[] {
    const n = A.length;
    let Ak = A.map(row => [...row]);

    for (let iter = 0; iter < maxIter; iter++) {
      // Gram-Schmidt QR decomposition
      const Q = Mat.zeros(n, n);
      const R = Mat.zeros(n, n);

      for (let j = 0; j < n; j++) {
        let v = Ak.map(row => row[j]);
        for (let i = 0; i < j; i++) {
          let dot = 0;
          for (let k = 0; k < n; k++) dot += Q[k][i] * Ak[k][j];
          R[i][j] = dot;
          for (let k = 0; k < n; k++) v[k] -= dot * Q[k][i];
        }
        const norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
        R[j][j] = norm;
        if (norm > 1e-12) {
          for (let k = 0; k < n; k++) Q[k][j] = v[k] / norm;
        }
      }

      // Next iteration: A_{k+1} = R * Q
      Ak = Mat.multiply(R, Q);
    }

    return Ak.map((row, i) => Math.max(0, row[i]));
  }
};
