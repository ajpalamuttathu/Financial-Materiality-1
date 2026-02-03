import React from 'react';
import { Industry } from '../types';
import { MOCK_INDUSTRIES } from '../constants';
import { Building2, Plus, X, ChevronsUpDown } from 'lucide-react';

interface Props {
  primaryIndustry: Industry | null;
  secondaryIndustries: Industry[];
  onSelectPrimary: (ind: Industry) => void;
  onToggleSecondary: (ind: Industry) => void;
}

export const IndustrySelector: React.FC<Props> = ({
  primaryIndustry,
  secondaryIndustries,
  onSelectPrimary,
  onToggleSecondary
}) => {
  // Filter available options for secondary industries (exclude primary and already selected)
  const availableSecondary = MOCK_INDUSTRIES.filter(
    ind => ind.code !== primaryIndustry?.code && !secondaryIndustries.some(s => s.code === ind.code)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Primary Industry Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          Primary Industry (Mandatory)
        </h2>
        <p className="text-slate-500 mb-6 text-sm">
          Select the SICS® industry that best describes your primary revenue stream. This defines your core reporting boundary.
        </p>

        <div className="relative">
          <select
            value={primaryIndustry?.code || ""}
            onChange={(e) => {
              const selected = MOCK_INDUSTRIES.find(i => i.code === e.target.value);
              if (selected) onSelectPrimary(selected);
            }}
            className="w-full appearance-none bg-white border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-4 pr-10 shadow-sm"
          >
            <option value="" disabled>Select your primary industry...</option>
            {MOCK_INDUSTRIES.map((ind) => (
              <option key={ind.code} value={ind.code}>
                {ind.name} ({ind.sector})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <ChevronsUpDown className="w-4 h-4" />
          </div>
        </div>
        
        {primaryIndustry && (
          <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-3">
             <div className="mt-0.5 min-w-[1.25rem] flex justify-center">
                <span className="text-xs font-bold text-indigo-600 border border-indigo-200 bg-white px-1.5 rounded">Code</span>
             </div>
             <div>
                <p className="text-sm font-medium text-indigo-900">{primaryIndustry.code} - {primaryIndustry.name}</p>
                <p className="text-xs text-indigo-700 mt-0.5">Sector: {primaryIndustry.sector}</p>
             </div>
          </div>
        )}
      </div>

      {/* Secondary Industries Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm opacity-90">
        <h2 className="text-xl font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <Plus className="w-5 h-5 text-slate-500" />
          Secondary Industries (Optional)
        </h2>
        <p className="text-slate-500 mb-6 text-sm">
          Does your entity straddle multiple sectors? Add secondary industries to aggregate relevant topics into your assessment.
        </p>

        <div className="space-y-4">
          <div className="relative">
            <select
              value=""
              onChange={(e) => {
                const selected = MOCK_INDUSTRIES.find(i => i.code === e.target.value);
                if (selected) onToggleSecondary(selected);
              }}
              disabled={!primaryIndustry}
              className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-slate-500 focus:border-slate-500 block p-3 pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {primaryIndustry ? "Add a secondary industry..." : "Select a primary industry first"}
              </option>
              {availableSecondary.map((ind) => (
                <option key={ind.code} value={ind.code}>
                  {ind.name} ({ind.sector})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <Plus className="w-4 h-4" />
            </div>
          </div>

          {/* Selected Chips */}
          <div className="flex flex-wrap gap-2">
            {secondaryIndustries.length === 0 && (
              <span className="text-xs text-slate-400 italic pl-1">No secondary industries selected.</span>
            )}
            {secondaryIndustries.map((ind) => (
              <div 
                key={ind.code}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-700 transition-all hover:bg-slate-200"
              >
                <span>{ind.name}</span>
                <button 
                  onClick={() => onToggleSecondary(ind)}
                  className="p-0.5 hover:bg-slate-300 rounded-full text-slate-500 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
