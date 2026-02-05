
import React, { useState, useMemo, useEffect } from 'react';
import { Industry, Configuration, AssessmentData, SasbTopic, SavedAssessment, AssessmentStatus, ScoreLevel } from './types';
import { DEFAULT_CONFIG, MOCK_TOPICS } from './constants';
import { IndustrySelector } from './components/IndustrySelector';
import { ConfigurationBuilder } from './components/ConfigurationBuilder';
import { AssessmentEngine } from './components/AssessmentEngine';
import { Dashboard } from './components/Dashboard';
import { AssessmentList } from './components/AssessmentList';
import { GeneralSettings } from './components/GeneralSettings';
import { Settings, ClipboardList, BarChart3, ChevronRight, Lock, Save, ArrowLeft } from 'lucide-react';

const MOCK_SAVED_ASSESSMENTS: SavedAssessment[] = [
  {
    id: 'mock-1',
    assessmentName: 'Diginex Global Materiality Assessment',
    reportingYear: '2024',
    version: 1,
    status: AssessmentStatus.FINALIZED,
    lastModified: Date.now() - 86400000,
    data: {
      primaryIndustry: { code: 'TC-SI', name: 'Software & IT Services', sector: 'Technology & Communications' },
      secondaryIndustries: [],
      config: DEFAULT_CONFIG,
      assessments: {}
    }
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'WIZARD'>('LIST');
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>(MOCK_SAVED_ASSESSMENTS);
  const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [assessmentName, setAssessmentName] = useState('');
  const [reportingYear, setReportingYear] = useState('2025');
  const [primaryIndustry, setPrimaryIndustry] = useState<Industry | null>(null);
  const [secondaryIndustries, setSecondaryIndustries] = useState<Industry[]>([]);
  const [config, setConfig] = useState<Configuration>(DEFAULT_CONFIG);
  const [assessments, setAssessments] = useState<Record<string, AssessmentData>>({});
  const [isFinalized, setIsFinalized] = useState(false);

  // Smart Pre-population of Name as [Company Name] Financial Materiality Assessment
  useEffect(() => {
    if (view === 'WIZARD' && !assessmentName && !currentAssessmentId) {
      setAssessmentName('[Company Name] Financial Materiality Assessment');
    }
  }, [view, currentAssessmentId]);

  const activeTopics = useMemo(() => {
    if (!primaryIndustry) return [];
    const codes = [primaryIndustry.code, ...secondaryIndustries.map(i => i.code)];
    return MOCK_TOPICS.filter(t => codes.includes(t.industryCode));
  }, [primaryIndustry, secondaryIndustries]);

  const handleToggleSecondary = (ind: Industry) => {
    if (secondaryIndustries.find(i => i.code === ind.code)) {
      setSecondaryIndustries(prev => prev.filter(i => i.code !== ind.code));
    } else {
      setSecondaryIndustries(prev => [...prev, ind]);
    }
  };

  const generateId = () => crypto.randomUUID();

  const handleUpdateAssessment = (topicId: string, updates: Partial<AssessmentData>) => {
    setAssessments(prev => {
       const existing = prev[topicId] || { 
         topicId, isMaterial: null, valueChain: [], 
         scores: { magnitude: ScoreLevel.LOW, likelihood: ScoreLevel.LOW, horizon: ScoreLevel.LOW }, 
         ifrsBridge: {}, lastUpdated: 0
       };
       return { ...prev, [topicId]: { ...existing, ...updates, lastUpdated: Date.now() } };
    });
  };

  const handleCreateNew = () => {
    setCurrentAssessmentId(null);
    setAssessmentName('');
    setReportingYear('2025');
    setPrimaryIndustry(null);
    setSecondaryIndustries([]);
    setConfig(DEFAULT_CONFIG);
    setAssessments({});
    setStep(1);
    setIsFinalized(false);
    setView('WIZARD');
  };

  const handleOpenAssessment = (saved: SavedAssessment) => {
    setCurrentAssessmentId(saved.id);
    setAssessmentName(saved.assessmentName);
    setReportingYear(saved.reportingYear);
    setPrimaryIndustry(saved.data.primaryIndustry);
    setSecondaryIndustries(saved.data.secondaryIndustries);
    setConfig(saved.data.config);
    setAssessments(saved.data.assessments);
    setIsFinalized(saved.status === AssessmentStatus.FINALIZED);
    setStep(saved.status === AssessmentStatus.FINALIZED ? 3 : 1);
    setView('WIZARD');
  };

  const handleSaveAndExit = () => {
    const isNew = !currentAssessmentId;
    const idToUse = isNew ? generateId() : currentAssessmentId!;
    const toSave: SavedAssessment = {
      id: idToUse,
      assessmentName: assessmentName || 'Untitled Assessment',
      reportingYear,
      version: isNew ? 1 : (savedAssessments.find(a => a.id === idToUse)?.version || 1),
      status: AssessmentStatus.DRAFT,
      lastModified: Date.now(),
      data: { primaryIndustry, secondaryIndustries, config, assessments }
    };
    setSavedAssessments(prev => isNew ? [toSave, ...prev] : prev.map(a => a.id === idToUse ? toSave : a));
    setView('LIST');
  };

  const handleFinalize = () => {
    setIsFinalized(true);
    const idToUse = currentAssessmentId || generateId();
    const finalized: SavedAssessment = {
      id: idToUse,
      assessmentName,
      reportingYear,
      version: currentAssessmentId ? (savedAssessments.find(a => a.id === currentAssessmentId)?.version || 1) : 1,
      status: AssessmentStatus.FINALIZED,
      lastModified: Date.now(),
      data: { primaryIndustry, secondaryIndustries, config, assessments }
    };
    setSavedAssessments(prev => {
      const exists = prev.some(a => a.id === idToUse);
      return exists ? prev.map(a => a.id === idToUse ? finalized : a) : [finalized, ...prev];
    });
    setCurrentAssessmentId(idToUse);
  };

  const steps = [
    { id: 1, title: 'Scope', icon: Settings },
    { id: 2, title: 'Assessment', icon: ClipboardList },
    { id: 3, title: 'Summary', icon: BarChart3 },
  ];

  if (view === 'LIST') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Materiality<span className="text-indigo-600">Architect</span></h1>
          </div>
        </header>
        <AssessmentList 
          assessments={savedAssessments}
          onCreateNew={handleCreateNew}
          onOpenAssessment={handleOpenAssessment}
          onRequestReassessment={(id, reason) => setSavedAssessments(prev => prev.map(a => a.id === id ? {...a, status: AssessmentStatus.RE_ASSESSMENT_REQUIRED, reAssessmentReason: reason, version: a.version+1} : a))}
          onInitiateSurvey={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-5xl mx-auto px-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={() => setView('LIST')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><ArrowLeft size={20}/></button>
             <span className="font-bold text-slate-900">{assessmentName}</span>
          </div>
          <div className="flex gap-4">
             {steps.map(s => (
               <div key={s.id} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${step === s.id ? 'text-indigo-600' : 'text-slate-300'}`}>
                 <s.icon size={14}/> {s.title}
               </div>
             ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {step === 1 && (
          <div className="space-y-8">
            <GeneralSettings name={assessmentName} setName={setAssessmentName} year={reportingYear} setYear={setReportingYear} />
            <IndustrySelector primaryIndustry={primaryIndustry} secondaryIndustries={secondaryIndustries} onSelectPrimary={setPrimaryIndustry} onToggleSecondary={handleToggleSecondary} />
            <ConfigurationBuilder config={config} setConfig={setConfig} />
          </div>
        )}
        {step === 2 && <AssessmentEngine topics={activeTopics} assessments={assessments} config={config} onUpdateAssessment={handleUpdateAssessment} />}
        {step === 3 && <Dashboard assessments={assessments} topics={activeTopics} isReadOnly={isFinalized} onSave={() => setView('LIST')} initialYear={reportingYear} />}
      </main>

      <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={handleSaveAndExit} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
             <Save size={18}/> Save & Exit
          </button>
          <div className="flex items-center gap-4">
             {step > 1 && <button onClick={() => setStep(prev => prev - 1)} disabled={isFinalized} className="px-6 py-2.5 font-bold text-slate-500">Back</button>}
             {step < 3 ? (
               <button onClick={() => setStep(prev => prev + 1)} disabled={!primaryIndustry} className="px-8 py-2.5 bg-slate-900 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg">
                 Next Step <ChevronRight size={18}/>
               </button>
             ) : isFinalized ? (
               <button onClick={() => setView('LIST')} className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Close Roadmap</button>
             ) : (
               <button onClick={handleFinalize} className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg">
                 <Lock size={18}/> Finalize & Lock
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
