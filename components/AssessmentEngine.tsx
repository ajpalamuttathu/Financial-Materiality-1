import React, { useState } from 'react';
import { 
  SasbTopic, 
  AssessmentData, 
  Configuration, 
  OmissionReason, 
  ValueChainStage, 
  ScoreLevel, 
  FinancialStatement 
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
  AlertTriangle 
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

  const magUnit = config.magnitude.type === 'RELATIVE' ? '%' : 'M';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-2">
         <h2 className="text-xl font-semibold text-slate-800">Topic Assessment Queue</h2>
         <div className="flex gap-2">
            <div className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
               {(Object.values(assessments) as AssessmentData[]).filter(a => a.isMaterial === true).length} Material
            </div>
            <div className="text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
               {(Object.values(assessments) as AssessmentData[]).filter(a => a.isMaterial === false).length} Omitted
            </div>
         </div>
      </div>

      {topics.map(topic => {
        const data: AssessmentData = (assessments[topic.id] || { 
          topicId: topic.id, 
          isMaterial: null, 
          valueChain: [], 
          scores: { magnitude: ScoreLevel.LOW, likelihood: ScoreLevel.LOW, horizon: ScoreLevel.LOW },
          ifrsBridge: {},
          lastUpdated: Date.now()
        }) as AssessmentData;
        
        const isExpanded = expandedTopicId === topic.id;
        const isMaterial = data.isMaterial;

        return (
          <div key={topic.id} className={`bg-white rounded-xl shadow-sm border transition-all duration-300 ${getStatusColor(assessments[topic.id])} ${isExpanded ? 'ring-1 ring-indigo-100 shadow-md' : ''}`}>
            
            <div 
              className="p-5 flex items-start justify-between cursor-pointer group"
              onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{topic.id}</span>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">{topic.industryCode}</span>
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{topic.name}</h3>
                {!isExpanded && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-1">{topic.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end min-w-[80px]">
                   {isMaterial === true && (
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Material</span>
                   )}
                   {isMaterial === false && (
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded border border-slate-200">Omitted</span>
                   )}
                   {isMaterial === null && (
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-1 rounded border border-amber-100">Pending</span>
                   )}
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
              </div>
            </div>

            {isExpanded && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-white rounded-b-xl">
                
                <p className="text-sm text-slate-600 mb-6 italic">{topic.description}</p>

                <div className="mb-8">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Is this topic a material financial risk?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => onUpdateAssessment(topic.id, { isMaterial: true })}
                      className={`relative p-4 rounded-xl text-left border-2 transition-all duration-200 flex flex-col gap-2 ${
                        isMaterial === true ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-semibold ${isMaterial === true ? 'text-emerald-900' : 'text-slate-700'}`}>Yes, Material Risk</span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isMaterial === true ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                          {isMaterial === true && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => onUpdateAssessment(topic.id, { isMaterial: false })}
                      className={`relative p-4 rounded-xl text-left border-2 transition-all duration-200 flex flex-col gap-2 ${
                        isMaterial === false ? 'border-slate-500 bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`font-semibold ${isMaterial === false ? 'text-slate-900' : 'text-slate-700'}`}>No, Omit from Report</span>
                         <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isMaterial === false ? 'border-slate-600 bg-slate-600 text-white' : 'border-slate-300'}`}>
                          {isMaterial === false && <X size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {isMaterial === false && (
                  <div className="animate-in fade-in slide-in-from-top-2 bg-slate-50 rounded-xl border border-slate-200 p-5">
                    <h5 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Omission Justification (Mandatory)
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason Category</label>
                        <select 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white shadow-sm"
                          value={data.omissionReason || ''}
                          onChange={(e) => onUpdateAssessment(topic.id, { omissionReason: e.target.value as OmissionReason })}
                        >
                          <option value="">Select a reason...</option>
                          {Object.values(OmissionReason).map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-1.5">
                        <textarea 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm min-h-[100px]"
                          placeholder="Provide rationale..."
                          value={data.justification || ''}
                          onChange={(e) => onUpdateAssessment(topic.id, { justification: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isMaterial === true && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-top-2 pt-4">
                    <div>
                       <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Risk Narrative
                          </label>
                          <button 
                            onClick={() => handleGenerateRisk(topic)}
                            disabled={!!isGenerating}
                            className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 font-medium bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 transition-colors"
                          >
                            <Wand2 className="w-3 h-3" />
                            {isGenerating === topic.id ? 'Generating...' : 'AI Suggestion'}
                          </button>
                       </div>
                       <textarea 
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-32 text-slate-700"
                          placeholder="Describe the specific risk..."
                          value={data.riskDescription || ''}
                          onChange={(e) => onUpdateAssessment(topic.id, { riskDescription: e.target.value })}
                       />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Value Chain Connectivity</label>
                      <div className="flex gap-2">
                        {Object.values(ValueChainStage).map(stage => {
                          const isActive = data.valueChain.includes(stage);
                          return (
                            <button
                              key={stage}
                              onClick={() => onUpdateAssessment(topic.id, { valueChain: toggleValueChain(data.valueChain, stage) })}
                              className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors shadow-sm
                                ${isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                              {stage}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-slate-50 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Magnitude</label>
                        <select 
                          className="w-full border border-slate-300 rounded-lg text-sm px-3 py-2.5 bg-white text-slate-700 shadow-sm"
                          value={data.scores.magnitude}
                          onChange={(e) => onUpdateAssessment(topic.id, { 
                            scores: { 
                              magnitude: e.target.value as ScoreLevel,
                              likelihood: data.scores.likelihood,
                              horizon: data.scores.horizon
                            } 
                          })}
                        >
                          <option value={ScoreLevel.LOW}>Low (&lt; {config.magnitude.ranges.low.max}{magUnit})</option>
                          <option value={ScoreLevel.MEDIUM}>Medium ({config.magnitude.ranges.low.max}{magUnit}-{config.magnitude.ranges.medium.max}{magUnit})</option>
                          <option value={ScoreLevel.HIGH}>High (&gt; {config.magnitude.ranges.medium.max}{magUnit})</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Likelihood</label>
                        <select 
                          className="w-full border border-slate-300 rounded-lg text-sm px-3 py-2.5 bg-white text-slate-700 shadow-sm"
                          value={data.scores.likelihood}
                          onChange={(e) => onUpdateAssessment(topic.id, { 
                            scores: { 
                              magnitude: data.scores.magnitude,
                              likelihood: e.target.value as ScoreLevel,
                              horizon: data.scores.horizon
                            } 
                          })}
                        >
                          <option value={ScoreLevel.LOW}>Low (&lt; {config.likelihood.lowMax}%)</option>
                          <option value={ScoreLevel.MEDIUM}>Medium ({config.likelihood.lowMax}%-{config.likelihood.mediumMax}%)</option>
                          <option value={ScoreLevel.HIGH}>High (&gt; {config.likelihood.mediumMax}%)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time Horizon</label>
                        <select 
                          className="w-full border border-slate-300 rounded-lg text-sm px-3 py-2.5 bg-white text-slate-700 shadow-sm"
                          value={data.scores.horizon}
                          onChange={(e) => onUpdateAssessment(topic.id, { 
                            scores: { 
                              magnitude: data.scores.magnitude,
                              likelihood: data.scores.likelihood,
                              horizon: e.target.value as ScoreLevel
                            } 
                          })}
                        >
                          <option value={ScoreLevel.LOW}>Short (&lt; {config.horizons.shortTermYears}y)</option>
                          <option value={ScoreLevel.MEDIUM}>Medium ({config.horizons.shortTermYears}-{config.horizons.mediumTermYears}y)</option>
                          <option value={ScoreLevel.HIGH}>Long (&gt; {config.horizons.mediumTermYears}y)</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl">
                      <h5 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" /> IFRS Connectivity Bridge
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select 
                          className="w-full border border-indigo-200 rounded-lg text-sm px-3 py-2.5 bg-white text-slate-700 shadow-sm"
                          value={data.ifrsBridge.statementLink || ''}
                          onChange={(e) => onUpdateAssessment(topic.id, { 
                            ifrsBridge: { 
                              statementLink: e.target.value as FinancialStatement,
                              fsli: data.ifrsBridge.fsli,
                              effectType: data.ifrsBridge.effectType
                            } 
                          })}
                        >
                          <option value="">Select Statement...</option>
                          <option value={FinancialStatement.BALANCE_SHEET}>Balance Sheet</option>
                          <option value={FinancialStatement.PNL}>Profit & Loss</option>
                          <option value={FinancialStatement.CASH_FLOW}>Cash Flow</option>
                        </select>
                        <input 
                          type="text"
                          className="w-full border border-indigo-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 shadow-sm"
                          placeholder="Line Item Tag (FSLI)..."
                          value={data.ifrsBridge.fsli || ''}
                          onChange={(e) => onUpdateAssessment(topic.id, { 
                            ifrsBridge: { 
                              statementLink: data.ifrsBridge.statementLink,
                              fsli: e.target.value,
                              effectType: data.ifrsBridge.effectType
                            } 
                          })}
                        />
                      </div>
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