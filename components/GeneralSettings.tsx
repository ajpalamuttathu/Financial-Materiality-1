
import * as React from 'react';
import { Layout, Calendar } from 'lucide-react';

interface Props {
  name: string;
  setName: (val: string) => void;
  year: string;
  setYear: (val: string) => void;
}

/**
 * GeneralSettings component using standard function declaration to resolve JSX type issues.
 */
export function GeneralSettings({
  name,
  setName,
  year,
  setYear
}: Props) {
  const years = ["2024", "2025", "2026", "2027", "2028"];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-semibold text-slate-800 mb-2 flex items-center gap-2">
        <div className="p-1.5 bg-indigo-50 rounded-lg">
          <Layout className="w-5 h-5 text-indigo-600" />
        </div>
        General Information
      </h2>
      <p className="text-slate-500 mb-6 text-sm ml-10">
        Align this assessment with your entity's fiscal reporting cycle.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Assessment Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all outline-none"
            placeholder="[Company Name] Financial Materiality Assessment"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Reporting Year
          </label>
          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm appearance-none bg-white text-slate-700 font-medium outline-none transition-all cursor-pointer"
            >
              <option value="" disabled>Select Fiscal Year...</option>
              {years.map(y => <option key={y} value={y} className="text-slate-700">FY{y}</option>)}
            </select>
            <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
