export type VariableType = 'numeric' | 'nominal' | 'ordinal';
export type VariableRole = 'none' | 'dv' | 'iv' | 'covariate' | 'cluster' | 'id';

export interface ColumnMeta {
  name: string;
  type: VariableType;
  role?: VariableRole;
  label?: string;
  uniqueCount: number;
  missingCount: number;
  min?: number;
  max?: number;
  mean?: number;
  sd?: number;
  categories?: string[];
}

export type DataRow = Record<string, any>;

// ==================== ASSUMPTION CHECK TYPES ====================
export interface AssumptionCheckItem {
  name: string;
  category: string;
  status: 'passed' | 'warning' | 'failed';
  statisticName?: string;
  statisticValue?: number;
  df?: number | string;
  pValue?: number;
  shapiroW?: number;
  shapiroP?: number;
  andersonDarlingA?: number;
  andersonDarlingP?: number;
  kolmogorovSmirnovD?: number;
  kolmogorovSmirnovP?: number;
  jarqueBeraJB?: number;
  jarqueBeraP?: number;
  skewness?: number;
  kurtosis?: number;
  threshold?: string;
  conclusion: string;
  recommendation?: string;
}

// ==================== CONFIG TYPES ====================
export interface TTestConfig {
  type: TTestType;
  dv: string;
  groupVar?: string;
  testValue?: number;
  pairedVar2?: string;
}

export interface AnovaConfig {
  dv: string;
  factors: string[];
}

export interface AncovaConfig {
  dv: string;
  factor: string;
  covariates: string[];
}

export interface ManovaConfig {
  dvs: string[];
  factors: string[];
}

export interface MultilevelConfig {
  dv: string;
  clusterVar: string;
  level1Predictors?: string[];
  level2Predictors?: string[];
}

// ==================== T-TEST TYPES ====================
export type TTestType = 'independent' | 'paired' | 'one_sample';

export interface TTestResult {
  type: TTestType;
  dv: string;
  groupVar?: string;
  group1?: string;
  group2?: string;
  testValue?: number;
  // Student's t
  statistic: number;
  df: number;
  pValue: number;
  // Welch's t
  welchStatistic?: number;
  welchDf?: number;
  welchPValue?: number;
  // Effect Sizes
  meanDiff: number;
  stdErrorDiff: number;
  ciLower: number;
  ciUpper: number;
  cohensD: number;
  hedgesG?: number;
  // Assumption check: Levene's test for equality of variances
  leveneF?: number;
  leveneP?: number;
  rConsoleOutput?: string;
  assumptions?: AssumptionCheckItem[];
  // Descriptives
  descriptives: {
    group: string;
    n: number;
    mean: number;
    sd: number;
    se: number;
    median: number;
  }[];
}

// ==================== ANOVA TYPES ====================
export type AnovaType = 'one_way' | 'two_way';

export interface AnovaRow {
  source: string;
  ss: number;
  df: number;
  ms: number;
  f: number;
  pValue: number;
  etaSquared?: number;
  partialEtaSquared?: number;
  omegaSquared?: number;
}

export interface PostHocComparison {
  comparison: string;
  group1?: string;
  group2?: string;
  meanDiff: number;
  se: number;
  qValue: number;
  pValue: number;
  ciLower: number;
  ciUpper: number;
  significant?: boolean;
}

export interface AnovaResult {
  type: AnovaType;
  dv: string;
  factors: string[];
  table: AnovaRow[];
  leveneF?: number;
  leveneP?: number;
  descriptives: {
    cells: Record<string, string>;
    label: string;
    n: number;
    mean: number;
    sd: number;
    se: number;
  }[];
  postHoc?: Record<string, PostHocComparison[]>;
  assumptions?: AssumptionCheckItem[];
  rConsoleOutput?: string;
}

// ==================== ANCOVA TYPES ====================
export interface AncovaResult {
  dv: string;
  factor: string;
  covariates: string[];
  table: AnovaRow[];
  adjustedMeans: {
    group: string;
    unadjustedMean: number;
    adjustedMean: number;
    se: number;
    ciLower: number;
    ciUpper: number;
  }[];
  homogeneityOfSlopes?: {
    interactionF: number;
    interactionP: number;
    slopesAreParallel: boolean;
  };
  parameterEstimates: {
    term: string;
    b: number;
    se: number;
    t: number;
    pValue: number;
    ciLower: number;
    ciUpper: number;
  }[];
  assumptions?: AssumptionCheckItem[];
  rConsoleOutput?: string;
}

// ==================== MANOVA TYPES ====================
export interface ManovaStat {
  test: 'Wilks' | 'Pillai' | 'Hotelling' | 'Roy';
  value: number;
  approxF: number;
  numDf: number;
  denDf: number;
  pValue: number;
  partialEtaSq: number;
}

export interface ManovaEffect {
  source: string;
  stats: ManovaStat[];
}

export interface ManovaResult {
  dvs: string[];
  factors: string[];
  multivariateEffects: ManovaEffect[];
  boxM?: {
    mValue: number;
    approxF: number;
    df1: number;
    df2: number;
    pValue: number;
  };
  univariateAnovas: Record<string, AnovaResult>;
  assumptions?: AssumptionCheckItem[];
  rConsoleOutput?: string;
}

// ==================== MULTILEVEL (HLM) TYPES ====================
export interface MultilevelFixedEffect {
  term: string;
  level?: string;
  estimate: number; // unstandardized beta (b)
  stdBeta?: number; // standardized beta (beta*)
  se: number;
  tValue: number;
  df?: number;
  pValue: number;
  ciLower: number;
  ciUpper: number;
  varExplainedPct?: number; // unique variance explained %
}

export interface MultilevelRandomEffect {
  group: string;
  term: string;
  variance: number;
  sd: number;
}

export interface MultilevelModelStage {
  modelId: string;
  modelName: string; // e.g. 'Model 1: Null Model' | 'Model 2: Student Level' | 'Model 3: Full Multilevel Model'
  level: string;
  formula: string;
  fixedEffects: MultilevelFixedEffect[];
  tau00: number; // Between-school variance
  sigma2: number; // Within-school variance
  totalVariance: number;
  icc: number;
  pctBetweenVariance: number; // e.g. 40.71%
  pctWithinVariance: number; // e.g. 59.29%
  varExplainedL1?: number; // % Level 1 reduction
  varExplainedL2?: number; // % Level 2 reduction
  cumulativeVarExplainedL1?: number;
  cumulativeVarExplainedL2?: number;
  aic: number;
  bic: number;
  deviance: number; // -2LL
  logLikelihood?: number;
  devianceDiff?: number;
  chiSqPValue?: number;
}

export interface MultilevelResult {
  modelType?: 'null' | 'random_intercept';
  dv: string;
  clusterVar: string;
  level1Predictors?: string[];
  level2Predictors?: string[];
  nObservations: number;
  nClusters: number;

  // Incremental Model Stages (Table 1 & Appendix B Journal Standard)
  models: MultilevelModelStage[];
  
  // Null Model Summary (Panyin & Asamoah-Gyimah 2026)
  grandMean: number;
  grandMeanSE: number;
  tau00: number; // Between-cluster variance
  sigma2: number; // Within-cluster (residual) variance
  totalVariance: number;
  icc: number; // tau00 / (tau00 + sigma2)
  pctBetweenVariance: number;
  pctWithinVariance: number;
  schoolReliability?: number; // lambda (e.g. 0.95)
  schoolVarianceChiSq?: number;
  schoolVarianceDf?: number;
  schoolVariancePValue?: number;

  // Active / Full Model Effects
  fixedEffects: MultilevelFixedEffect[];
  randomEffects: MultilevelRandomEffect[];
  
  // Model fit of target model
  logLikelihood?: number;
  deviance: number; // -2LL
  aic: number;
  bic: number;
  r2Level1?: number; // Snijders & Bosker / Bryk & Raudenbush R2 L1
  r2Level2?: number; // Snijders & Bosker / Bryk & Raudenbush R2 L2

  clusterEstimates?: {
    clusterId: string;
    rawMean: number;
    blupIntercept: number;
    n: number;
    se: number;
  }[];

  // Statistical Assumptions
  assumptions?: AssumptionCheckItem[];
  rConsoleOutput?: string;
}

// ==================== HIERARCHICAL REGRESSION TYPES ====================
export interface RegressionBlockConfig {
  blockNumber: number;
  blockName?: string;
  variables: string[];
}

export interface RegressionConfig {
  mode?: 'standard' | 'hierarchical';
  dv: string;
  blocks: RegressionBlockConfig[];
  method?: 'enter' | 'stepwise';
}

export interface RegressionCoefficient {
  term: string;
  b: number; // Unstandardized B
  se: number; // Std. Error
  beta: number; // Standardized Beta
  tValue: number;
  pValue: number;
  ciLower: number;
  ciUpper: number;
  vif?: number; // Variance Inflation Factor
  tolerance?: number;
}

export interface RegressionModelSummary {
  modelNumber: number;
  modelName: string;
  predictors: string[];
  r: number;
  r2: number;
  adjR2: number;
  seEst: number;
  r2Change: number;
  fChange: number;
  df1: number;
  df2: number;
  pChange: number;
  durbinWatson?: number;
  coefficients: RegressionCoefficient[];
  anovaTable?: {
    source: string;
    ss: number;
    df: number;
    ms: number;
    f: number;
    pValue: number;
  }[];
}

export interface RegressionResult {
  dv: string;
  models: RegressionModelSummary[];
  finalModelCoefficients: RegressionCoefficient[];
  nObservations: number;
  assumptions?: AssumptionCheckItem[];
  rConsoleOutput?: string;
}

// ==================== IPD META-ANALYSIS TYPES ====================
export interface IPDMetaConfig {
  dv: string;
  focalPredictor: string;
  clusterVar: string;
  covariates: string[];
  method?: 'REML' | 'DL' | 'FE';
}

export interface IPDClusterResult {
  clusterId: string;
  n: number;
  beta: number; // effect size (slope)
  se: number;
  ciLower: number;
  ciUpper: number;
  zValue: number;
  pValue: number;
  weightPct: number;
}

export interface IPDMetaResult {
  dv: string;
  focalPredictor: string;
  clusterVar: string;
  covariates: string[];
  nTotalObservations: number;
  nClusters: number;
  method: string;
  pooledBeta: number;
  pooledSE: number;
  ciLower: number;
  ciUpper: number;
  zValue: number;
  pValue: number;
  i2: number; // e.g. 48.5%
  tau2: number; // between-cluster variance
  qStatistic: number;
  qPValue: number;
  dfQ: number;
  clusterResults: IPDClusterResult[];
  rConsoleOutput?: string;
  assumptions?: AssumptionCheckItem[];
}

// ==================== SEM / PATH ANALYSIS TYPES ====================
export interface SEMLatentConstruct {
  id: string;
  name: string;
  indicators: string[];
}

export interface SEMLatentRelation {
  outcomeLatent: string;
  /** Can be either another latent construct's name, or a manifest (observed) dataset variable name. */
  predictors: string[];
}

export interface SEMConfig {
  mode: 'visual' | 'latent' | 'syntax';
  dv?: string;
  exogenous?: string[];
  mediators?: string[];
  endogenous?: string[];
  customSyntax?: string;
  /** Persisted state for the "Visual SEM (Variabel Laten)" builder, so it survives navigation and project export/import. */
  latentConstructs?: SEMLatentConstruct[];
  latentRelations?: SEMLatentRelation[];
}

export interface SEMFitIndices {
  chisq: number;
  df: number;
  pvalue: number;
  cfi: number;
  tli: number;
  rmsea: number;
  rmseaCiLower?: number;
  rmseaCiUpper?: number;
  rmseaPclose?: number;
  srmr: number;
  aic: number;
  bic: number;
}

export interface SEMParameter {
  lhs: string;
  op: '~' | '=~' | '~~' | ':=';
  rhs: string;
  label?: string;
  type: 'regression' | 'measurement' | 'covariance' | 'defined' | 'indirect' | 'total';
  est: number; // Unstandardized estimate
  se: number;
  zValue: number;
  pValue: number;
  stdEst: number; // Standardized estimate (std.all)
  ciLower: number;
  ciUpper: number;
}

export interface SEMResult {
  mode: 'visual' | 'syntax';
  syntaxUsed: string;
  nObservations: number;
  fitIndices: SEMFitIndices;
  parameters: SEMParameter[];
  directEffects?: SEMParameter[];
  indirectEffects?: SEMParameter[];
  totalEffects?: SEMParameter[];
  rSquare?: Record<string, number>;
  assumptions?: AssumptionCheckItem[];
  rConsoleOutput?: string;
}
