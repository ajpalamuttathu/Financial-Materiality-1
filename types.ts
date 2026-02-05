
export interface Industry {
  code: string;
  name: string;
  sector: string;
}

export interface SasbTopic {
  id: string;
  name: string;
  industryCode: string;
  description: string;
  associatedMetrics: string[];
}

export enum MagnitudeType {
  ABSOLUTE = 'ABSOLUTE',
  RELATIVE = 'RELATIVE',
}

export interface Configuration {
  magnitude: {
    type: MagnitudeType;
    denominator?: string;
    lowThreshold: number;
    mediumThreshold: number;
    maxCap: number;
  };
  likelihood: {
    lowThreshold: number;
    mediumThreshold: number;
  };
  horizons: {
    shortTerm: number;
    mediumTerm: number;
    longTermMax: number;
  };
}

export enum OmissionReason {
  IMMATERIAL = 'Immaterial (Financial)',
  NOT_APPLICABLE = 'Not Applicable to Business Model',
  PROHIBITED = 'Disclosure Prohibited by Law',
  SENSITIVE = 'Commercially Sensitive Information',
}

export enum ValueChainStage {
  UPSTREAM = 'Upstream',
  DIRECT_OPS = 'Direct Operations',
  DOWNSTREAM = 'Downstream',
}

export enum EffectType {
  CURRENT = 'Current',
  ANTICIPATED = 'Anticipated',
}

export enum FinancialStatement {
  BALANCE_SHEET = 'Balance Sheet',
  PNL = 'Profit & Loss',
  CASH_FLOW = 'Cash Flow',
}

export enum ScoreLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export type AssessmentScores = {
  magnitude: ScoreLevel;
  likelihood: ScoreLevel;
  horizon: ScoreLevel;
};

export type IfrsBridge = {
  effectType?: EffectType;
  statementLink?: FinancialStatement;
  fsli?: string;
};

export type AssessmentData = {
  topicId: string;
  isMaterial: boolean | null;
  omissionReason?: OmissionReason;
  justification?: string;
  riskDescription?: string;
  valueChain: ValueChainStage[];
  scores: AssessmentScores;
  ifrsBridge: IfrsBridge;
  lastUpdated: number;
};

export enum AssessmentStatus {
  DRAFT = 'Draft',
  FINALIZED = 'Finalized',
  RE_ASSESSMENT_REQUIRED = 'Re-assessment Required'
}

export interface SavedAssessment {
  id: string;
  assessmentName: string;
  reportingYear: string;
  version: number;
  status: AssessmentStatus;
  lastModified: number;
  reAssessmentReason?: string;
  data: {
    primaryIndustry: Industry | null;
    secondaryIndustries: Industry[];
    config: Configuration;
    assessments: Record<string, AssessmentData>;
  };
}
