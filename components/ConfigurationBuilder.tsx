import React from 'react';
import { Configuration, MagnitudeType } from '../types';
import { Sliders, Clock, AlertTriangle, ChevronDown } from 'lucide-react';

interface Props {
  config: Configuration;
  setConfig: React.Dispatch<React.SetStateAction<Configuration>>;
}

export const ConfigurationBuilder: React.FC<Props> = ({ config, setConfig }) => {
  
  const PREDEFINED_DENOMINATORS = [
    'Annual Revenue',
    'EBITDA',
    'Total Assets',
    'Net Income',
    'Operating Expenses'
  ];

  const handleMagnitudeChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      magnitude: { ...prev.magnitude, [field]: value }
    }));
  };

  const handleRangeChange = (level: 'low' | 'medium' | 'high', field: 'min' | 'max', value: number) => {
    setConfig(prev => ({
      ...prev,
      magnitude: {
        ...prev.magnitude,
        ranges: {
          ...prev.magnitude.ranges,
          [level]: { ...prev.magnitude.ranges[level], [field]: value }
        }
      }
    }));
  };

  const currentDenominator = config.magnitude.denominator || '';
  const isCustomBasis = !PREDEFINED_DENOMINATORS.includes(currentDenominator);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Magnitude Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Financial Impact Magnitude</h3>
            <p className="text-sm text-slate-500">Define the ruler for "Materiality" against your financial statements.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Methodology</label>
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => handleMagnitudeChange('type', MagnitudeType.RELATIVE)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md border ${config.magnitude.type === MagnitudeType.RELATIVE ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
              >
                Relative (%)
              </button>
              <button
                onClick={() => handleMagnitudeChange('type', MagnitudeType.ABSOLUTE)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${config.magnitude.type === MagnitudeType.ABSOLUTE ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
              >
                Absolute ($)
              </button>
            </div>
          </div>

          {config.magnitude.type === MagnitudeType.RELATIVE && (
             <div className="col-span-2">
               <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Denominator Basis</label>
               <div className="flex flex-col gap-3">
                 <div className="relative">
                   <select
                      value={isCustomBasis ? 'Custom' : currentDenominator}
                      onChange={(e) => {
                        if (e.target.value === 'Custom') {
                           handleMagnitudeChange('denominator', ''); 
                        } else {
                           handleMagnitudeChange('denominator', e.target.value);
                        }
                      }}
                      className="w-full appearance-none border border-slate-300 rounded-md pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700"
                   >
                      <option value="" disabled>Select Basis...</option>
                      {PREDEFINED_DENOMINATORS.map(opt => (
                         <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="Custom">Custom Basis...</option>
                   </select>
                   <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                 </div>
                 
                 {isCustomBasis && (
                   <input 
                      type="text" 
                      value={currentDenominator}
                      onChange={(e) => handleMagnitudeChange('denominator', e.target.value)}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none animate-in fade-in slide-in-from-top-1"
                      placeholder="Enter custom denominator (e.g. Adjusted EBITDA)..."
                      autoFocus
                   />
                 )}
               </div>
             </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 border-t pt-6 border-slate-100">
           <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">Low Impact</div>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-slate-400">&lt;</span>
                 <input 
                    type="number" 
                    value={config.magnitude.ranges.low.max || 0}
                    onChange={(e) => handleRangeChange('low', 'max', parseFloat(e.target.value))}
                    className="w-20 border border-slate-300 rounded px-2 py-1 text-sm text-center"
                 />
                 <span className="text-xs text-slate-500">{config.magnitude.type === MagnitudeType.RELATIVE ? '%' : 'M'}</span>
              </div>
           </div>
           <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">Medium Impact</div>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-slate-500">Between Low &</span>
                 <input 
                    type="number" 
                    value={config.magnitude.ranges.medium.max || 0}
                    onChange={(e) => handleRangeChange('medium', 'max', parseFloat(e.target.value))}
                    className="w-20 border border-slate-300 rounded px-2 py-1 text-sm text-center"
                 />
                 <span className="text-xs text-slate-500">{config.magnitude.type === MagnitudeType.RELATIVE ? '%' : 'M'}</span>
              </div>
           </div>
           <div className="space-y-2">
              <div className="text-sm font-medium text-slate-700">High Impact</div>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-slate-400">&gt;</span>
                 <span className="text-sm font-semibold text-slate-900">{config.magnitude.ranges.medium.max}</span>
                 <span className="text-xs text-slate-500">{config.magnitude.type === MagnitudeType.RELATIVE ? '%' : 'M'}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Likelihood Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Probability</h3>
              <p className="text-sm text-slate-500">Define likelihood thresholds.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
              <span className="text-slate-600">Low Probability Max</span>
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={config.likelihood.lowMax}
                  onChange={(e) => setConfig(prev => ({...prev, likelihood: {...prev.likelihood, lowMax: parseFloat(e.target.value)}}))}
                  className="w-16 border border-slate-300 rounded px-2 py-1 text-right"
                />
                <span>%</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
              <span className="text-slate-600">Medium Probability Max</span>
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={config.likelihood.mediumMax}
                  onChange={(e) => setConfig(prev => ({...prev, likelihood: {...prev.likelihood, mediumMax: parseFloat(e.target.value)}}))}
                  className="w-16 border border-slate-300 rounded px-2 py-1 text-right"
                />
                <span>%</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm pt-1">
              <span className="font-semibold text-slate-700">High Probability</span>
              <span className="font-semibold text-slate-900">&gt; {config.likelihood.mediumMax}%</span>
            </div>
          </div>
        </div>

        {/* Time Horizon Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Time Horizons</h3>
              <p className="text-sm text-slate-500">Align with business planning.</p>
            </div>
          </div>
          <div className="space-y-4">
             <div className="flex items-center gap-4">
               <label className="text-sm w-24 text-slate-600">Short Term</label>
               <input 
                  type="range" min="1" max="3" step="1"
                  value={config.horizons.shortTermYears}
                  onChange={(e) => setConfig(prev => ({...prev, horizons: {...prev.horizons, shortTermYears: parseInt(e.target.value)}}))}
                  className="flex-1 accent-emerald-600"
               />
               <span className="text-sm font-medium w-12 text-right">{config.horizons.shortTermYears} yr</span>
             </div>
             <div className="flex items-center gap-4">
               <label className="text-sm w-24 text-slate-600">Medium Term</label>
               <input 
                  type="range" min="3" max="10" step="1"
                  value={config.horizons.mediumTermYears}
                  onChange={(e) => setConfig(prev => ({...prev, horizons: {...prev.horizons, mediumTermYears: parseInt(e.target.value)}}))}
                  className="flex-1 accent-emerald-600"
               />
               <span className="text-sm font-medium w-12 text-right">{config.horizons.mediumTermYears} yrs</span>
             </div>
             <div className="flex items-center gap-4">
               <label className="text-sm w-24 text-slate-600">Long Term</label>
               <div className="flex-1 text-xs text-slate-400">Everything beyond medium term</div>
               <span className="text-sm font-medium w-12 text-right">&gt;{config.horizons.mediumTermYears}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
