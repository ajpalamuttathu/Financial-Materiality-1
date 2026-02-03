import { Configuration, MagnitudeType, Industry, SasbTopic } from './types';

// Mock SASB Industries (Subset for demo)
export const MOCK_INDUSTRIES: Industry[] = [
  { code: 'TC-SI', name: 'Software & IT Services', sector: 'Technology & Communications' },
  { code: 'TC-HW', name: 'Hardware', sector: 'Technology & Communications' },
  { code: 'CG-MR', name: 'Multiline Retail', sector: 'Consumer Goods' },
  { code: 'CG-AA', name: 'Apparel, Accessories & Footwear', sector: 'Consumer Goods' },
  { code: 'EM-EP', name: 'Exploration & Production', sector: 'Extractives & Minerals Processing' },
  { code: 'FB-RN', name: 'Restaurants', sector: 'Food & Beverage' },
  { code: 'TR-MT', name: 'Marine Transportation', sector: 'Transportation' },
  { code: 'FN-CB', name: 'Commercial Banks', sector: 'Financials' },
];

// Mock Topics linked to Industries
export const MOCK_TOPICS: SasbTopic[] = [
  // Software
  { 
    id: 'TC-SI-001', 
    industryCode: 'TC-SI', 
    name: 'Environmental Footprint of Hardware Infrastructure', 
    description: 'Energy and water usage of data centers.',
    associatedMetrics: ['TC-SI-130a.1', 'TC-SI-130a.2', 'TC-SI-130a.3']
  },
  { 
    id: 'TC-SI-002', 
    industryCode: 'TC-SI', 
    name: 'Data Privacy & Freedom of Expression', 
    description: 'Management of risks related to collection and use of user data.',
    associatedMetrics: ['TC-SI-220a.1', 'TC-SI-220a.2', 'TC-SI-220a.3']
  },
  { 
    id: 'TC-SI-003', 
    industryCode: 'TC-SI', 
    name: 'Data Security', 
    description: 'Identifying and addressing security threats.',
    associatedMetrics: ['TC-SI-230a.1', 'TC-SI-230a.2']
  },
  // Apparel
  { 
    id: 'CG-AA-001', 
    industryCode: 'CG-AA', 
    name: 'Management of Chemicals in Products', 
    description: 'use of restricted substances in manufacturing.',
    associatedMetrics: ['CG-AA-250a.1', 'CG-AA-250a.2']
  },
  { 
    id: 'CG-AA-002', 
    industryCode: 'CG-AA', 
    name: 'Labor Conditions in the Supply Chain', 
    description: 'Human rights and fair labor practices.',
    associatedMetrics: ['CG-AA-430a.1', 'CG-AA-430a.2']
  },
  // Oil & Gas
  { 
    id: 'EM-EP-001', 
    industryCode: 'EM-EP', 
    name: 'Greenhouse Gas Emissions', 
    description: 'Direct scope 1 emissions and methane management.',
    associatedMetrics: ['EM-EP-110a.1', 'EM-EP-110a.2']
  },
];

export const DEFAULT_CONFIG: Configuration = {
  magnitude: {
    type: MagnitudeType.RELATIVE,
    denominator: 'EBITDA',
    ranges: {
      low: { label: 'Low', min: 0, max: 1 },
      medium: { label: 'Medium', min: 1, max: 5 },
      high: { label: 'High', min: 5, max: null },
    }
  },
  likelihood: {
    lowMax: 20,
    mediumMax: 60,
    highMin: 60,
  },
  horizons: {
    shortTermYears: 1,
    mediumTermYears: 5,
    longTermYears: 10,
  }
};
