import React, { useState } from 'react';
import { 
  SasbTopic, 
  AssessmentData, 
  Configuration, 
  OmissionReason, 
  ValueChainStage, 
  ScoreLevel, 
  FinancialStatement,
  MagnitudeType
} from '../types';
import { suggestRiskNarrative } from '../services/geminiService';
import { 
  ChevronDown, 
  ChevronUp, 
  Wand2, 
  FileText, 
  Link as LinkIcon, 
  Check, 
  X,
  AlertTriangle,
  Layers
} from 'lucide-react';

interface Props {
  topics: SasbTopic[];
  assessments: Record<string, AssessmentData>;
  config: Configuration;
  onUpdateAssessment: (topicId: string, data: Partial<AssessmentData>) => void;
}

export const AssessmentEngine: React.FC<Props> = ({ 
  topics, 
  assessments, 
  config, 
  onUpdateAssessment 
}) => {
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(topics[0]?.id || null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleGenerateRisk = async (topic: SasbTopic) => {
    setIsGenerating(topic.id);
    const narrative = await suggestRiskNarrative(topic.name, topic.industryCode);
    onUpdateAssessment(topic.id, { riskDescription: narrative });
    setIsGenerating(null);
  };

  const toggleValueChain = (current: ValueChainStage[], stage: ValueChainStage): ValueChainStage[] => {
    if (current.includes(stage)) return current.filter(s => s !== stage);
    return [...current, stage];
  };

  const getStatusColor = (data?: AssessmentData) => {
    if (!data || data.isMaterial === null) return 'border-l-4 border-l-slate-200 bg-white'; 
    if (data.isMaterial === false) return 'border-l-4 border-l-slate-400 bg-slate-50/50';
    const isComplete = data.valueChain.length > 0 && data.ifrsBridge.statementLink;
    return isComplete ? 'border-l-4 border-l-emerald-500 bg-emerald-50/30' : 'border-l-4 border-l-amber-500 bg-amber-50/30';
  };

  const magUnit = config.magnitude.type === MagnitudeType.RELATIVE ? '%' : 'M';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2">
         <h2 className="text-xl font-semibold text-slate-800">Topic Assessment Queue</h2>
         <div className="flex gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            {(Object.values(assessments) as AssessmentData[]).filter(a => a.isMaterial === true).length} Material Risks
         </div>
      </div>

      {topics.map(topic => {
        const existingData = assessments[topic.id];
        const data: AssessmentData = existingData || { 
          topicId: topic.id, 
          isMaterial: null, 
          valueChain: [], 
          scores: { magnitude: ScoreLevel.LOW, likelihood: ScoreLevel.LOW, horizon: ScoreLevel.LOW },
          ifrsBridge: {},
          lastUpdated: Date.now()
        };
        
        const isExpanded = expandedTopicId === topic.id;
        const isMaterial = data.isMaterial;

        return (
          <div key={topic.id} className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${getStatusColor(existingData)} ${isExpanded ? 'ring-1 ring-indigo-100 shadow-md' : ''}`}>
            
            <div 
              className="p-5 flex items-start justify-between cursor-pointer group"
              onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{topic.id}</span>
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{topic.name}</h3>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end min-w-[80px]">
                   {isMaterial === true && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Material</span>}
                   {isMaterial === false && <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Omitted</span>}
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
              </div>
            </div>

            {isExpanded && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-white rounded-b-xl">
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">{topic.description}</p>

                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Materiality Determination</h4>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => onUpdateAssessment(topic.id, { isMaterial: true })}
                      className={`flex-1 p-4 rounded-xl text-left border-2 transition-all flex items-center justify-between ${isMaterial === true ? 'border-indigo-600 bg-white ring-4 ring-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    >
                      <span className={`font-bold ${isMaterial === true ? 'text-indigo-900' : 'text-slate-600'}`}>Identify as Material Risk</span>
                      {isMaterial === true && <Check className="text-indigo-600 w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => onUpdateAssessment(topic.id, { isMaterial: false })}
                      className={`flex-1 p-4 rounded-xl text-left border-2 transition-all flex items-center justify-between ${isMaterial === false ? 'border-slate-400 bg-white shadow-inner' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    >
                      <span className={`font-bold ${isMaterial === false ? 'text-slate-900' : 'text-slate-600'}`}>Omit from Reporting</span>
                      {isMaterial === false && <X className="text-slate-500 w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {isMaterial === false && (
                  <div className="bg-amber-50/50 rounded-xl border border-amber-100 p-5 space-y-4">
                    <h5 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Justification of Omission
                    </h5>
                    <div className="relative">
                      <select 
                        className="w-full border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 bg-white font-medium outline-none appearance-none shadow-sm transition-all focus:ring-2 focus:ring-amber-500"
                        value={data.omissionReason || ''}
                        onChange={e => onUpdateAssessment(topic.id, { omissionReason: e.target.value as OmissionReason })}
                      >
                        <option value="" disabled className="text-slate-400">Select SASB-aligned reason...</option>
                        {Object.values(OmissionReason).map(r => <option key={r} value={r} className="text-slate-700">{r}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 text-amber-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                    <textarea 
                      className="w-full border border-amber-200 rounded-lg px-4 py-3 text-sm h-28 text-slate-700 bg-white placeholder-slate-400 focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                      placeholder="Required rationale for internal audit log..."
                      value={data.justification || ''}
                      onChange={e => onUpdateAssessment(topic.id, { justification: e.target.value })}
                    />
                  </div>
                )}

                {isMaterial === true && (
                  <div className="space-y-8 pt-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <FileText className="w-4 h-4" /> Risk Narrative (IFRS S1 Focused)
                        </label>
                        <button 
                          onClick={() => handleGenerateRisk(topic)}
                          disabled={!!isGenerating}
                          className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                        >
                          <Wand2 className="w-3 h-3" /> AI Suggestion
                        </button>
                      </div>
                      <textarea 
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm h-28 text-slate-700 bg-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                        placeholder="Detail how this topic impacts enterprise value..."
                        value={data.riskDescription || ''}
                        onChange={e => onUpdateAssessment(topic.id, { riskDescription: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Impact Magnitude</label>
                        <select 
                          className="w-full border border-slate-300 rounded-lg text-sm p-3 bg-white text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                          value={data.scores.magnitude}
                          onChange={e => onUpdateAssessment(topic.id, { scores: { ...data.scores, magnitude: e.target.value as ScoreLevel } })}
                        >
                          <option value={ScoreLevel.LOW} className="text-slate-700">Low (&lt;{config.magnitude.lowThreshold}{magUnit})</option>
                          <option value={ScoreLevel.MEDIUM} className="text-slate-700">Med ({config.magnitude.lowThreshold}-{config.magnitude.mediumThreshold}{magUnit})</option>
                          <option value={ScoreLevel.HIGH} className="text-slate-700">High (&gt;{config.magnitude.mediumThreshold}{magUnit})</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Likelihood</label>
                        <select 
                          className="w-full border border-slate-300 rounded-lg text-sm p-3 bg-white text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                          value={data.scores.likelihood}
                          onChange={e => onUpdateAssessment(topic.id, { scores: { ...data.scores, likelihood: e.target.value as ScoreLevel } })}
                        >
                          <option value={ScoreLevel.LOW} className="text-slate-700">Low (&lt;{config.likelihood.lowThreshold}%)</option>
                          <option value={ScoreLevel.MEDIUM} className="text-slate-700">Med ({config.likelihood.lowThreshold}-{config.likelihood.mediumThreshold}%)</option>
                          <option value={ScoreLevel.HIGH} className="text-slate-700">Probable (&gt;{config.likelihood.mediumThreshold}%)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Time Horizon</label>
                        <select 
                          className="w-full border border-slate-300 rounded-lg text-sm p-3 bg-white text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                          value={data.scores.horizon}
                          onChange={e => onUpdateAssessment(topic.id, { scores: { ...data.scores, horizon: e.target.value as ScoreLevel } })}
                        >
                          <option value={ScoreLevel.LOW} className="text-slate-700">Short ({config.horizons.shortTerm}y)</option>
                          <option value={ScoreLevel.MEDIUM} className="text-slate-700">Medium ({config.horizons.mediumTerm}y)</option>
                          <option value={ScoreLevel.HIGH} className="text-slate-700">Long (&gt;{config.horizons.mediumTerm}y)</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-indigo-900 rounded-xl p-6 text-white">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> SASB Disclosure Metric Preview
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {topic.associatedMetrics.map(metric => (
                          <div key={metric} className="bg-white/10 border border-white/20 rounded-lg p-3 text-xs font-mono flex items-center justify-between">
                            {metric}
                            <span className="text-[8px] font-black uppercase bg-white/20 px-1 rounded">Linked</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-[10px] text-indigo-200 italic">These metrics will automatically populate your Disclosure Roadmap upon finalization.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};