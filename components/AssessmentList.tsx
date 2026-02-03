
import React, { useState, useEffect, useRef } from 'react';
import { SavedAssessment, AssessmentStatus } from '../types';
import { 
  Plus, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  RotateCcw,
  Lock,
  MoreVertical,
  Users,
  Eye,
  Pencil
} from 'lucide-react';

interface Props {
  assessments: SavedAssessment[];
  onCreateNew: () => void;
  onOpenAssessment: (assessment: SavedAssessment) => void;
  onRequestReassessment: (id: string, reason: string) => void;
  onInitiateSurvey: (id: string) => void;
}

export const AssessmentList: React.FC<Props> = ({ 
  assessments, 
  onCreateNew, 
  onOpenAssessment,
  onRequestReassessment,
  onInitiateSurvey
}) => {
  const [reassessModalId, setReassessModalId] = useState<string | null>(null);
  const [reassessReason, setReassessReason] = useState('');
  
  // State to track which dropdown is open
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReassessSubmit = () => {
    if (reassessModalId && reassessReason.trim()) {
      onRequestReassessment(reassessModalId, reassessReason);
      setReassessModalId(null);
      setReassessReason('');
    }
  };

  const getStatusBadge = (status: AssessmentStatus) => {
    switch (status) {
      case AssessmentStatus.FINALIZED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <Lock className="w-3 h-3" />
            Finalized
          </span>
        );
      case AssessmentStatus.RE_ASSESSMENT_REQUIRED:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <RotateCcw className="w-3 h-3" />
            Re-assessment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            <FileText className="w-3 h-3" />
            Draft
          </span>
        );
    }
  };

  const formatMonthYear = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    // dateStr is YYYY-MM
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 min-h-[500px]">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Materiality Assessments</h1>
          <p className="text-slate-500 mt-1">Manage your historical and active materiality roadmaps.</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4" />
          New Assessment
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
        {assessments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No assessments found</h3>
            <p className="mt-1">Create your first materiality assessment to get started.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assessment Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timeline</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Primary Industry</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Modified</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {assessments.map((assessment) => (
                <tr key={assessment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded text-indigo-600">
                         <FileText className="w-4 h-4" />
                      </div>
                      <div>
                         <div className="font-medium text-slate-900 text-sm">{assessment.assessmentName || 'Untitled Assessment'}</div>
                         <div className="text-xs text-slate-400 font-mono">v{assessment.version}.0</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3.5 h-3.5 text-slate-400" />
                       {formatMonthYear(assessment.timeline.start)} - {formatMonthYear(assessment.timeline.end)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {assessment.data.primaryIndustry?.name || 'No Industry Selected'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(assessment.status)}
                    {assessment.reAssessmentReason && (
                      <div className="mt-1 text-xs text-amber-600 max-w-[150px] truncate" title={assessment.reAssessmentReason}>
                        Reason: {assessment.reAssessmentReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(assessment.lastModified).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === assessment.id ? null : assessment.id);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {openMenuId === assessment.id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-8 top-8 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 origin-top-right overflow-hidden"
                      >
                        <div className="py-1">
                          
                          {/* Resume / View */}
                          <button 
                            onClick={() => {
                              onOpenAssessment(assessment);
                              setOpenMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2"
                          >
                             {assessment.status === AssessmentStatus.FINALIZED ? (
                               <>
                                 <Eye className="w-4 h-4" /> View Details
                               </>
                             ) : (
                               <>
                                 <Pencil className="w-4 h-4" /> Resume Edit
                               </>
                             )}
                          </button>

                          {/* Stakeholder Survey - Only if Finalized */}
                          {assessment.status === AssessmentStatus.FINALIZED && (
                            <button 
                              onClick={() => {
                                onInitiateSurvey(assessment.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 border-t border-slate-50"
                            >
                              <Users className="w-4 h-4" /> Stakeholder Survey
                            </button>
                          )}

                          {/* Re-assess - Only if Finalized */}
                          {assessment.status === AssessmentStatus.FINALIZED && (
                            <button 
                              onClick={() => {
                                setReassessModalId(assessment.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2 border-t border-slate-50"
                            >
                              <RotateCcw className="w-4 h-4" /> Request Re-assessment
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Re-assessment Modal */}
      {reassessModalId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Re-assessment Required</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-4">
              You are about to flag this finalized assessment for revision. This will allow you to edit the data and create a new version. Please provide a reason for the audit trail.
            </p>

            <div className="space-y-2 mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Reason for Change</label>
              <textarea 
                value={reassessReason}
                onChange={(e) => setReassessReason(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                placeholder="e.g., Change in business strategy, new regulatory requirements..."
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => { setReassessModalId(null); setReassessReason(''); }}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleReassessSubmit}
                disabled={!reassessReason.trim()}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium text-sm disabled:opacity-50"
              >
                Flag & Unlock
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
