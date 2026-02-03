
export interface Industry {
  code: string;
  name: string;
  sector: string;
}

export interface SasbTopic {
  id: string;
  name: string;
  industryCode: string; // The primary industry it belongs to
  description: string;
  associatedMetrics: string[]; // Mocking the "Framework Builder" artifact
}

// Step 2: Global Configuration Types
export enum MagnitudeType {
  ABSOLUTE = 'ABSOLUTE', // $
  RELATIVE = 'RELATIVE', // %
}

export interface MagnitudeRange {
  label: string; // Low, Medium, High
  min: number;
  max: number | null; // null means infinite/plus
}

export interface Configuration {
  magnitude: {
    type: MagnitudeType;
    denominator?: string; // e.g., "Revenue", "EBITDA"
    currency?: string;
    ranges: {
      low: MagnitudeRange;
      medium: MagnitudeRange;
      high: MagnitudeRange;
    }
  };
  likelihood: {
    lowMax: number; // 0 to lowMax %
    mediumMax: number; // lowMax to mediumMax %
    highMin: number; // > highMin %
  };
  horizons: {
    shortTermYears: number;
    mediumTermYears: number;
    longTermYears: number;
  };
}

// Step 3: Assessment Data Types

export enum OmissionReason {
  IMMATERIAL = 'Immaterial',
  NOT_APPLICABLE = 'Not Applicable',
  UNDUE_COST = 'Undue Cost or Effort',
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

// Defined named types for nested objects to ensure they are properly identified as object types for spread operations.
export type AssessmentScores = {
  magnitude: ScoreLevel;
  likelihood: ScoreLevel;
  horizon: ScoreLevel;
};

export type IfrsBridge = {
  effectType?: EffectType;
  statementLink?: FinancialStatement;
  fsli?: string; // Financial Statement Line Item
};

export type AssessmentData = {
  topicId: string;
  isMaterial: boolean | null; // null = not started
  // If NO
  omissionReason?: OmissionReason;
  justification?: string;
  // If YES
  riskDescription?: string;
  valueChain: ValueChainStage[];
  scores: AssessmentScores;
  ifrsBridge: IfrsBridge;
  lastUpdated: number; // timestamp
};

// New Types for Listing Page
export enum AssessmentStatus {
  DRAFT = 'Draft',
  FINALIZED = 'Finalized',
  RE_ASSESSMENT_REQUIRED = 'Re-assessment Required'
}

export interface SavedAssessment {
  id: string; // Unique ID
  assessmentName: string; // New field
  timeline: {
    start: string; // YYYY-MM
    end: string;   // YYYY-MM
  };
  reportingYear: string; // Kept for backward compatibility or simple year
  version: number;
  status: AssessmentStatus;
  lastModified: number;
  reAssessmentReason?: string;
  
  // Snapshot of the state
  data: {
    primaryIndustry: Industry | null;
    secondaryIndustries: Industry[];
    config: Configuration;
    assessments: Record<string, AssessmentData>;
  };
}

export interface AppState {
  step: number; // 1, 2, 3, 4 (Dashboard)
  primaryIndustry: Industry | null;
  secondaryIndustries: Industry[];
  config: Configuration;
  assessments: Record<string, AssessmentData>; // Map topicId -> Data
}
