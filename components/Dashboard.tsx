
import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AssessmentData, SasbTopic, ScoreLevel } from '../types';
import { Download, CheckCircle, AlertCircle, Save, Calendar, Lock } from 'lucide-react';

interface Props {
  assessments: Record<string, AssessmentData>;
  topics: SasbTopic[];
  isReadOnly?: boolean;
  onSave: (year: string) => void;
  initialYear?: string;
}

export const Dashboard: React.FC<Props> = ({ 
  assessments, 
  topics, 
  isReadOnly = false, 
  onSave,
  initialYear = new Date().getFullYear().toString()
}) => {
  const [reportingYear, setReportingYear] = useState<string>(initialYear);
  
  const materialTopics = topics.filter(t => assessments[t.id]?.isMaterial === true);
  // Treat null/undefined as omitted for the report
  const omittedTopics = topics.filter(t => assessments[t.id]?.isMaterial !== true);

  const data = [
    { name: 'Material', value: materialTopics.length, color: '#10b981' }, // Emerald
    { name: 'Omitted / NA', value: omittedTopics.length, color: '#94a3b8' }, // Slate
  ];

  // Prepare Matrix Data (High Mag / High Likelihood count)
  const getMatrixCount = (mag: ScoreLevel, like: ScoreLevel) => {
    return materialTopics.filter(t => {
      const a = assessments[t.id];
      return a.scores.magnitude === mag && a.scores.likelihood === like;
    }).length;
  };

  const handleSaveClick = () => {
    if (!reportingYear) {
      alert("Please enter a reporting year.");
      return;
    }
    onSave(reportingYear);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {isReadOnly && (
           <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-bl border-b border-l border-slate-200 uppercase tracking-widest">
             <Lock className="w-3 h-3 inline-block mr-1 mb-0.5" />
             Read Only
           </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-slate-900">Assessment Complete</h2>
          <p className="text-slate-500">Your materiality roadmap is ready for export.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 ${isReadOnly ? 'opacity-75' : ''}`}>
            <Calendar className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={reportingYear}
              onChange={(e) => setReportingYear(e.target.value)}
              placeholder="YYYY"
              disabled={isReadOnly}
              className="bg-transparent border-none text-sm w-16 focus:ring-0 text-slate-700 font-medium disabled:cursor-not-allowed"
            />
          </div>
          {!isReadOnly && (
            <button 
              onClick={handleSaveClick}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Topic Disposition</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Topics List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Material Risk Register</h3>
          <div className="overflow-y-auto flex-1 pr-2">
            {materialTopics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <span>No material topics identified.</span>
              </div>
            ) : (
              <ul className="space-y-3">
                {materialTopics.map(t => (
                  <li key={t.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-slate-900 text-sm">{t.name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {assessments[t.id].ifrsBridge.fsli || 'No FSLI Tagged'} • {assessments[t.id].scores.horizon} Term
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Simple Heatmap Grid Visualization */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Materiality Matrix Distribution</h3>
        <div className="grid grid-cols-4 gap-1 w-full max-w-2xl mx-auto">
          {/* Headers */}
          <div className="col-span-1"></div>
          <div className="text-center text-xs font-bold text-slate-500">Low Mag</div>
          <div className="text-center text-xs font-bold text-slate-500">Med Mag</div>
          <div className="text-center text-xs font-bold text-slate-500">High Mag</div>

          {/* High Likelihood Row */}
          <div className="flex items-center justify-end pr-2 text-xs font-bold text-slate-500">High Prob</div>
          <div className="bg-amber-100 h-24 rounded flex items-center justify-center font-bold text-amber-800">{getMatrixCount(ScoreLevel.LOW, ScoreLevel.HIGH)}</div>
          <div className="bg-orange-200 h-24 rounded flex items-center justify-center font-bold text-orange-800">{getMatrixCount(ScoreLevel.MEDIUM, ScoreLevel.HIGH)}</div>
          <div className="bg-red-200 h-24 rounded flex items-center justify-center font-bold text-red-800">{getMatrixCount(ScoreLevel.HIGH, ScoreLevel.HIGH)}</div>

          {/* Med Likelihood Row */}
          <div className="flex items-center justify-end pr-2 text-xs font-bold text-slate-500">Med Prob</div>
          <div className="bg-green-100 h-24 rounded flex items-center justify-center font-bold text-green-800">{getMatrixCount(ScoreLevel.LOW, ScoreLevel.MEDIUM)}</div>
          <div className="bg-amber-100 h-24 rounded flex items-center justify-center font-bold text-amber-800">{getMatrixCount(ScoreLevel.MEDIUM, ScoreLevel.MEDIUM)}</div>
          <div className="bg-orange-200 h-24 rounded flex items-center justify-center font-bold text-orange-800">{getMatrixCount(ScoreLevel.HIGH, ScoreLevel.MEDIUM)}</div>

          {/* Low Likelihood Row */}
          <div className="flex items-center justify-end pr-2 text-xs font-bold text-slate-500">Low Prob</div>
          <div className="bg-slate-100 h-24 rounded flex items-center justify-center font-bold text-slate-600">{getMatrixCount(ScoreLevel.LOW, ScoreLevel.LOW)}</div>
          <div className="bg-green-100 h-24 rounded flex items-center justify-center font-bold text-green-800">{getMatrixCount(ScoreLevel.MEDIUM, ScoreLevel.LOW)}</div>
          <div className="bg-amber-100 h-24 rounded flex items-center justify-center font-bold text-amber-800">{getMatrixCount(ScoreLevel.HIGH, ScoreLevel.LOW)}</div>
        </div>
      </div>

    </div>
  );
};
