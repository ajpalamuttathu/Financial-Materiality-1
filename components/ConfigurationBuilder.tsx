
import * as React from 'react';
import { useState } from 'react';
import { Configuration, MagnitudeType } from '../types';
import { Sliders, Clock, AlertTriangle, HelpCircle, ChevronDown, Info } from 'lucide-react';

interface Props {
  config: Configuration;
  setConfig: React.Dispatch<React.SetStateAction<Configuration>>;
}

/**
 * ConfigurationBuilder component using standard function declaration to resolve JSX type issues.
 */
export function ConfigurationBuilder({ config, setConfig }: Props) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const TOOLTIPS = {
    magnitude: {
      header: "Why define Financial Impact?",
      body: "Under IFRS S1, information is considered 'material' if omitting or misstating it could reasonably influence the decisions of primary users. Defining clear quantitative thresholds establishes an objective 'ruler' to separate operational noise from significant risks affecting cash flows or cost of capital."
    },
    probability: {
      header: "Why define Probability?",
      body: "IFRS S1 requires disclosure of risks that could 'reasonably be expected' to affect prospects. Setting probability thresholds helps filter 'remote' risks from those that are 'reasonably possible' or 'probable', ensuring reporting focuses on scenarios impacting enterprise value."
    },
    horizon: {
      header: "Why define Time Horizons?",
      body: "IFRS S1 (Para 77) requires defining short, medium, and long-term horizons linked to strategic planning cycles. These must be consistent with horizons used in your general purpose financial statements."
    }
  };

  const handleMagChange = (field: keyof Configuration['magnitude'], value: any) => {
    setConfig(prev => ({ ...prev, magnitude: { ...prev.magnitude, [field]: value } }));
  };

  const magUnit = config.magnitude.type === MagnitudeType.RELATIVE ? '%' : 'M';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Tooltip Modal/Overlay */}
      {activeTooltip && (
        <div className="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setActiveTooltip(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-indigo-600 mb-4">
              <Info className="w-6 h-6" />
              <h4 className="text-xl font-bold text-slate-900">{TOOLTIPS[activeTooltip as keyof typeof TOOLTIPS].header}</h4>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
              {TOOLTIPS[activeTooltip as keyof typeof TOOLTIPS].body}
            </p>
            <button onClick={() => setActiveTooltip(null)} className="mt-8 w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Magnitude Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                Financial Impact Magnitude
                <button onClick={() => setActiveTooltip('magnitude')} className="text-slate-400 hover:text-indigo-600 transition-colors">
                  <HelpCircle className="w-4 h-4" />
                </button>
              </h3>
            </div>
          </div>
          <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
            <button 
              onClick={() => handleMagChange('type', MagnitudeType.RELATIVE)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${config.magnitude.type === MagnitudeType.RELATIVE ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              %
            </button>
            <button 
              onClick={() => handleMagChange('type', MagnitudeType.ABSOLUTE)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${config.magnitude.type === MagnitudeType.ABSOLUTE ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              $
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span>Low Range: 0-{config.magnitude.lowThreshold}{magUnit}</span>
              <span>Medium: {config.magnitude.lowThreshold}-{config.magnitude.mediumThreshold}{magUnit}</span>
              <span>High Cap: {config.magnitude.maxCap}{magUnit}</span>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-600 w-32">Low Limit</label>
                <input 
                  type="range" min="1" max="10" step="0.5" 
                  value={config.magnitude.lowThreshold}
                  onChange={e => handleMagChange('lowThreshold', parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="text-sm font-bold text-slate-900 w-12 text-right">{config.magnitude.lowThreshold}{magUnit}</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-600 w-32">Medium Limit</label>
                <input 
                  type="range" min={config.magnitude.lowThreshold + 1} max="30" step="1" 
                  value={config.magnitude.mediumThreshold}
                  onChange={e => handleMagChange('mediumThreshold', parseFloat(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="text-sm font-bold text-slate-900 w-12 text-right">{config.magnitude.mediumThreshold}{magUnit}</span>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-600 w-32">Max Risk Ceiling</label>
                <input 
                  type="range" min={config.magnitude.mediumThreshold + 5} max="100" step="5" 
                  value={config.magnitude.maxCap}
                  onChange={e => handleMagChange('maxCap', parseFloat(e.target.value))}
                  className="flex-1 accent-slate-900"
                />
                <span className="text-sm font-bold text-slate-900 w-12 text-right">{config.magnitude.maxCap}{magUnit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Probability Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              Probability Thresholds
              <button onClick={() => setActiveTooltip('probability')} className="text-slate-400 hover:text-indigo-600 transition-colors">
                <HelpCircle className="w-4 h-4" />
              </button>
            </h3>
          </div>
          <div className="space-y-6">
             <div className="flex items-center gap-4">
               <label className="text-sm font-medium text-slate-600 w-24">Low Prob</label>
               <input 
                  type="range" min="5" max="40" step="5"
                  value={config.likelihood.lowThreshold}
                  onChange={e => setConfig(prev => ({...prev, likelihood: {...prev.likelihood, lowThreshold: parseInt(e.target.value)}}))}
                  className="flex-1 accent-amber-600"
               />
               <span className="text-sm font-bold text-slate-900 w-12 text-right">{config.likelihood.lowThreshold}%</span>
             </div>
             <div className="flex items-center gap-4">
               <label className="text-sm font-medium text-slate-600 w-24">Medium Prob</label>
               <input 
                  type="range" min={config.likelihood.lowThreshold + 10} max="90" step="5"
                  value={config.likelihood.mediumThreshold}
                  onChange={e => setConfig(prev => ({...prev, likelihood: {...prev.likelihood, mediumThreshold: parseInt(e.target.value)}}))}
                  className="flex-1 accent-amber-600"
               />
               <span className="text-sm font-bold text-slate-900 w-12 text-right">{config.likelihood.mediumThreshold}%</span>
             </div>
          </div>
        </div>

        {/* Time Horizon Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              Time Horizons
              <button onClick={() => setActiveTooltip('horizon')} className="text-slate-400 hover:text-indigo-600 transition-colors">
                <HelpCircle className="w-4 h-4" />
              </button>
            </h3>
          </div>
          <div className="space-y-6">
             <div className="flex items-center gap-4">
               <label className="text-sm font-medium text-slate-600 w-24">Short Term</label>
               <input 
                  type="range" min="1" max="3" step="1"
                  value={config.horizons.shortTerm}
                  onChange={e => setConfig(prev => ({...prev, horizons: {...prev.horizons, shortTerm: parseInt(e.target.value)}}))}
                  className="flex-1 accent-emerald-600"
               />
               <span className="text-sm font-bold text-slate-900 w-12 text-right">{config.horizons.shortTerm}y</span>
             </div>
             <div className="flex items-center gap-4">
               <label className="text-sm font-medium text-slate-600 w-24">Medium Term</label>
               <input 
                  type="range" min={config.horizons.shortTerm + 1} max="10" step="1"
                  value={config.horizons.mediumTerm}
                  onChange={e => setConfig(prev => ({...prev, horizons: {...prev.horizons, mediumTerm: parseInt(e.target.value)}}))}
                  className="flex-1 accent-emerald-600"
               />
               <span className="text-sm font-bold text-slate-900 w-12 text-right">{config.horizons.mediumTerm}y</span>
             </div>
             <div className="flex items-center gap-4">
               <label className="text-sm font-medium text-slate-600 w-24">Long Term</label>
               <input 
                  type="range" min={config.horizons.mediumTerm + 1} max="30" step="1"
                  value={config.horizons.longTermMax}
                  onChange={e => setConfig(prev => ({...prev, horizons: {...prev.horizons, longTermMax: parseInt(e.target.value)}}))}
                  className="flex-1 accent-slate-900"
               />
               <span className="text-sm font-bold text-slate-900 w-12 text-right">{config.horizons.longTermMax}y</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
