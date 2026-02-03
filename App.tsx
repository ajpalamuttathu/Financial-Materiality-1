import React, { useState, useMemo } from 'react';
import { Industry, Configuration, AssessmentData, SasbTopic, SavedAssessment, AssessmentStatus, ScoreLevel } from './types';
import { DEFAULT_CONFIG, MOCK_TOPICS } from './constants';
import { IndustrySelector } from './components/IndustrySelector';
import { ConfigurationBuilder } from './components/ConfigurationBuilder';
import { AssessmentEngine } from './components/AssessmentEngine';
import { Dashboard } from './components/Dashboard';
import { AssessmentList } from './components/AssessmentList';
import { GeneralSettings } from './components/GeneralSettings';
import { Settings, ClipboardList, BarChart3, ChevronRight, Lock, Users, Check, Loader2, ArrowLeft } from 'lucide-react';

const MOCK_SAVED_ASSESSMENTS: SavedAssessment[] = [
  {
    id: 'mock-1',
    assessmentName: 'FY2023 Sustainability Assessment',
    timeline: { start: '2023-01', end: '2023-12' },
    reportingYear: '2023',
    version: 1,
    status: AssessmentStatus.FINALIZED,
    lastModified: Date.now() - 86400000 * 5,
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
  const [timelineStart, setTimelineStart] = useState('');
  const [timelineEnd, setTimelineEnd] = useState('');
  const [primaryIndustry, setPrimaryIndustry] = useState<Industry | null>(null);
  const [secondaryIndustries, setSecondaryIndustries] = useState<Industry[]>([]);
  const [config, setConfig] = useState<Configuration>(DEFAULT_CONFIG);
  const [assessments, setAssessments] = useState<Record<string, AssessmentData>>({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [surveyStatus, setSurveyStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

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

  const generateId = () => {
    try {
      return crypto.randomUUID();
    } catch {
      return Math.random().toString(36).substring(2, 15);
    }
  };

  const handleUpdateAssessment = (topicId: string, updates: Partial<AssessmentData>) => {
    setAssessments(prev => {
       const existing = prev[topicId] || { 
         topicId, 
         isMaterial: null, 
         valueChain: [], 
         scores: { magnitude: ScoreLevel.LOW, likelihood: ScoreLevel.LOW, horizon: ScoreLevel.LOW }, 
         ifrsBridge: {},
         lastUpdated: 0
       };
       return {
         ...prev,
         [topicId]: { ...existing, ...updates, lastUpdated: Date.now() }
       };
    });
  };

  const handleCreateNew = () => {
    setCurrentAssessmentId(null);
    setAssessmentName('');
    setTimelineStart('');
    setTimelineEnd('');
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
    setTimelineStart(saved.timeline.start);
    setTimelineEnd(saved.timeline.end);
    setPrimaryIndustry(saved.data.primaryIndustry);
    setSecondaryIndustries(saved.data.secondaryIndustries);
    setConfig(saved.data.config);
    setAssessments(saved.data.assessments);
    setIsFinalized(saved.status === AssessmentStatus.FINALIZED);
    setStep(saved.status === AssessmentStatus.FINALIZED ? 3 : 1);
    setView('WIZARD');
  };

  const handleRequestReassessment = (id: string, reason: string) => {
    setSavedAssessments(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: AssessmentStatus.RE_ASSESSMENT_REQUIRED,
          reAssessmentReason: reason,
          lastModified: Date.now(),
          version: a.version + 1
        };
      }
      return a;
    }));
  };

  const handleSaveAssessment = (year: string) => {
    const timestamp = Date.now();
    const isNew = !currentAssessmentId;
    const idToUse = isNew ? generateId() : currentAssessmentId!;
    
    const assessmentToSave: SavedAssessment = {
      id: idToUse,
      assessmentName: assessmentName || 'Untitled Assessment',
      timeline: { start: timelineStart, end: timelineEnd },
      reportingYear: year,
      version: isNew ? 1 : (savedAssessments.find(a => a.id === idToUse)?.version || 1), 
      status: isFinalized ? AssessmentStatus.FINALIZED : AssessmentStatus.DRAFT,
      lastModified: timestamp,
      data: {
        primaryIndustry,
        secondaryIndustries,
        config,
        assessments
      }
    };

    setSavedAssessments(prev => {
      if (isNew) return [assessmentToSave, ...prev];
      return prev.map(a => a.id === idToUse ? assessmentToSave : a);
    });

    setCurrentAssessmentId(idToUse);
    if (!isFinalized) setView('LIST');
  };

  const handleFinalize = (year: string) => {
    setIsFinalized(true);
    const timestamp = Date.now();
    const idToUse = currentAssessmentId || generateId();
    
    const finalizedRecord: SavedAssessment = {
      id: idToUse,
      assessmentName: assessmentName || 'Untitled Assessment',
      timeline: { start: timelineStart, end: timelineEnd },
      reportingYear: year,
      version: currentAssessmentId ? (savedAssessments.find(a => a.id === currentAssessmentId)?.version || 1) : 1,
      status: AssessmentStatus.FINALIZED,
      lastModified: timestamp,
      data: {
        primaryIndustry,
        secondaryIndustries,
        config,
        assessments
      }
    };

    setSavedAssessments(prev => {
      const exists = prev.some(a => a.id === idToUse);
      if (exists) return prev.map(a => a.id === idToUse ? finalizedRecord : a);
      return [finalizedRecord, ...prev];
    });

    setCurrentAssessmentId(idToUse);
  };

  const handleInitiateSurvey = () => {
    setSurveyStatus('sending');
    setTimeout(() => {
      setSurveyStatus('sent');
      setTimeout(() => setSurveyStatus('idle'), 3000);
    }, 1500);
  };
  
  const handleListInitiateSurvey = (id: string) => {
     alert(`Stakeholder Survey process initiated for assessment ID: ${id}`);
  };

  const canProceed = () => {
    if (step === 1) {
       return assessmentName.length > 0 && timelineStart.length > 0 && timelineEnd.length > 0 && !!primaryIndustry;
    }
    return true;
  };

  const steps = [
    { id: 1, title: 'Settings', icon: Settings },
    { id: 2, title: 'Assessment', icon: ClipboardList },
    { id: 3, title: 'Report', icon: BarChart3 },
  ];

  if (view === 'LIST') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Materiality<span className="text-indigo-600">Architect</span></h1>
            </div>
          </div>
        </header>
        <AssessmentList 
          assessments={savedAssessments}
          onCreateNew={handleCreateNew}
          onOpenAssessment={handleOpenAssessment}
          onRequestReassessment={handleRequestReassessment}
          onInitiateSurvey={handleListInitiateSurvey}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setView('LIST')} className="p-1 hover:bg-slate-100 rounded-full mr-2">
               <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Materiality<span className="text-indigo-600">Architect</span></h1>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto py-4">
          <div className="flex items-center justify-between relative">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />
             {steps.map((s) => {
               const Icon = s.icon;
               const isActive = s.id === step;
               const isCompleted = s.id < step;
               return (
                 <div key={s.id} className="flex flex-col items-center gap-2 bg-white px-2">
                   <button
                     onClick={() => (s.id < step && !isFinalized ? setStep(s.id) : null)}
                     disabled={s.id > step || isFinalized}
                     className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                       ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 
                         isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}
                       `}
                   >
                     <Icon className="w-5 h-5" />
                   </button>
                   <span className={`text-xs font-medium ${isActive ? 'text-indigo-700' : 'text-slate-500'}`}>{s.title}</span>
                 </div>
               );
             })}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
          <div className="space-y-12">
            <section>
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-900">Entity & Industry Scope</h2>
                    <p className="text-slate-500 mt-1">Define the reporting boundaries for your assessment.</p>
                 </div>
              </div>
              <GeneralSettings 
                name={assessmentName} setName={setAssessmentName}
                startDate={timelineStart} setStartDate={setTimelineStart}
                endDate={timelineEnd} setEndDate={setTimelineEnd}
              />
              <div className="h-6"></div>
              <IndustrySelector 
                primaryIndustry={primaryIndustry}
                secondaryIndustries={secondaryIndustries}
                onSelectPrimary={setPrimaryIndustry}
                onToggleSecondary={handleToggleSecondary}
              />
            </section>
            <section>
               <ConfigurationBuilder config={config} setConfig={setConfig} />
            </section>
          </div>
        )}
        {step === 2 && (
          <AssessmentEngine 
            topics={activeTopics} assessments={assessments}
            config={config} onUpdateAssessment={handleUpdateAssessment}
          />
        )}
        {step === 3 && (
          <Dashboard 
             assessments={assessments} topics={activeTopics}
             isReadOnly={isFinalized} onSave={handleSaveAssessment}
             initialYear={timelineEnd ? timelineEnd.split('-')[0] : undefined}
          />
        )}
      </main>

      <div className="bg-white border-t border-slate-200 p-4 sticky bottom-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => setView('LIST')} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1">
             <ArrowLeft className="w-4 h-4" /> Cancel & Exit
          </button>
          <div className="flex items-center gap-4">
             {step > 1 && (
               <button onClick={() => setStep(prev => Math.max(1, prev - 1))} disabled={isFinalized} className="px-6 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 font-medium">
                 Back
               </button>
             )}
             {step < 3 ? (
               <button onClick={() => setStep(prev => prev + 1)} disabled={!canProceed()} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 font-medium flex items-center gap-2">
                 Next Step <ChevronRight className="w-4 h-4" />
               </button>
             ) : isFinalized ? (
                <button onClick={handleInitiateSurvey} disabled={surveyStatus !== 'idle'} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm transition-all flex items-center gap-2">
                  <Users className="w-4 h-4" /> Initiate Stakeholder Survey
                </button>
             ) : (
               <button onClick={() => handleFinalize(timelineEnd ? timelineEnd.split('-')[0] : '2025')} className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium shadow-sm flex items-center gap-2">
                 <Lock className="w-4 h-4" /> Finalize & Lock
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;