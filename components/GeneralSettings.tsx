
import React from 'react';
import { Layout, CalendarDays } from 'lucide-react';

interface Props {
  name: string;
  setName: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
}

export const GeneralSettings: React.FC<Props> = ({
  name,
  setName,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-semibold text-slate-800 mb-2 flex items-center gap-2">
        <Layout className="w-5 h-5 text-indigo-600" />
        General Information
      </h2>
      <p className="text-slate-500 mb-6 text-sm">
        Provide a unique name for this assessment and define the reporting period.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assessment Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Assessment Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            placeholder="e.g. FY2025 Global Sustainability Risk Assessment"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Start Period
          </label>
          <div className="relative">
            <input
              type="month"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
            <CalendarDays className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            End Period
          </label>
          <div className="relative">
             <input
              type="month"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
            <CalendarDays className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
