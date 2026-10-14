import React, { useState } from 'react';
import {
  Database,
  Play,
  Download,
  RotateCcw,
  Clock,
  Sparkles,
  Table,
  CheckCircle2
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { ThemeMode } from '../../types';

interface ImpalaQueryConsoleProps {
  theme?: ThemeMode;
}

export const ImpalaQueryConsole: React.FC<ImpalaQueryConsoleProps> = ({ theme = 'hadoop' }) => {
  const isAcademic = theme === 'academic';
  const [queryText, setQueryText] = useState(
    `SELECT student_id, name, department, attendance_rate, current_gpa, dropout_risk, cohort\nFROM student_records\nWHERE dropout_risk > 50\nORDER BY dropout_risk DESC;`
  );

  const [queryResult, setQueryResult] = useState<{
    columns: string[];
    rows: Record<string, unknown>[];
    executionTimeMs: number;
  }>(() => dataService.executeSql('SELECT * FROM students WHERE risk > 50'));

  const [executing, setExecuting] = useState(false);

  const sampleQueries = [
    {
      title: 'Students Needing Dropout Prevention Support',
      sql: `SELECT student_id, name, department, attendance_rate, current_gpa, dropout_risk, cohort\nFROM student_records\nWHERE dropout_risk > 50\nORDER BY dropout_risk DESC;`
    },
    {
      title: 'Class Attendance Below Required 75%',
      sql: `SELECT student_id, name, department, attendance_rate, current_gpa\nFROM student_records\nWHERE attendance < 75;`
    },
    {
      title: 'Unusual Discrepancies (High Attendance but Low Exam)',
      sql: `SELECT student_id, name, department, attendance_rate, current_gpa, anomaly\nFROM student_records\nWHERE anomaly = 'FLAGGED';`
    },
    {
      title: 'Students Needing Study Engagement Guidance',
      sql: `SELECT student_id, name, department, lms_weekly_hours, midterms_avg, cluster\nFROM student_records\nWHERE cluster = 0;`
    }
  ];

  const handleRunQuery = () => {
    setExecuting(true);
    setTimeout(() => {
      const res = dataService.executeSql(queryText);
      setQueryResult(res);
      setExecuting(false);
    }, 180);
  };

  const handleExportCSV = () => {
    if (!queryResult.rows.length) return;
    const headers = queryResult.columns.join(',');
    const rows = queryResult.rows.map(r =>
      queryResult.columns.map(c => `"${String(r[c] ?? '')}"`).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_search_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border transition-all ${
        isAcademic
          ? 'bg-white border-slate-200 shadow-xs text-slate-900'
          : 'bg-[#0d1526] border-slate-800 shadow-xl text-slate-100'
      }`}>
        <div>
          <div className={`flex items-center gap-2 text-xs font-mono uppercase font-bold ${
            isAcademic ? 'text-amber-800' : 'text-amber-400'
          }`}>
            <span>Instant Student Record Search</span>
            <span className={isAcademic ? 'text-slate-300' : 'text-slate-600'}>·</span>
            <span>Campus Search Console</span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-display-academic font-bold mt-1 ${
            isAcademic ? 'text-slate-900' : 'text-white'
          }`}>
            Instant Student Record Finder & Search Tool
          </h1>
          <p className={`text-xs font-serif-academic italic mt-0.5 ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Quickly search, filter, and inspect student records, grades, and attendance metrics with sub-second instant response.
          </p>
        </div>

        <div className={`flex items-center gap-2 font-mono text-xs px-3.5 py-2 rounded-lg border ${
          isAcademic
            ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
            : 'text-emerald-300 bg-emerald-950/80 border-emerald-800'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Fast Search Engine Online</span>
        </div>
      </div>

      {/* Editor & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className={`lg:col-span-3 p-5 rounded-xl border shadow-xs space-y-3 transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold font-display-academic uppercase tracking-wider font-mono ${
              isAcademic ? 'text-slate-900' : 'text-white'
            }`}>
              Student Search & Filter Criteria
            </span>
            <button
              onClick={() => setQueryText('SELECT * FROM student_records LIMIT 50;')}
              className={`text-xs transition-colors ${
                isAcademic ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Reset Criteria
            </button>
          </div>

          <textarea
            rows={6}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            className="w-full bg-[#080d1a] border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-amber-300 leading-relaxed focus:outline-none focus:border-amber-500 selection:bg-amber-900 shadow-inner"
            spellCheck={false}
          />

          <div className="flex items-center justify-between pt-1">
            <div className={`flex items-center gap-2 text-[11px] font-mono ${
              isAcademic ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <Clock className={`w-3.5 h-3.5 ${isAcademic ? 'text-amber-700' : 'text-amber-400'}`} />
              <span>Search response time:</span>
              <span className={`font-bold ${isAcademic ? 'text-emerald-700' : 'text-emerald-400'}`}>
                {queryResult.executionTimeMs} ms
              </span>
            </div>

            <button
              onClick={handleRunQuery}
              disabled={executing}
              className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-xs disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{executing ? 'Searching...' : 'Run Student Search'}</span>
            </button>
          </div>
        </div>

        {/* Templates */}
        <div className={`p-5 rounded-xl border shadow-xs space-y-3 transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <h3 className={`text-xs font-bold font-display-academic uppercase tracking-wider ${
            isAcademic ? 'text-slate-900' : 'text-white'
          }`}>
            Quick Filter Shortcuts
          </h3>
          <div className="space-y-2">
            {sampleQueries.map((q) => (
              <button
                key={q.title}
                onClick={() => {
                  setQueryText(q.sql);
                  const res = dataService.executeSql(q.sql);
                  setQueryResult(res);
                }}
                className={`w-full p-2.5 rounded-lg border text-left transition-colors space-y-1 block group ${
                  isAcademic
                    ? 'bg-slate-50 hover:bg-amber-50/50 border-slate-200'
                    : 'bg-[#121c32] hover:bg-[#152238] border-slate-800 hover:border-amber-700'
                }`}
              >
                <div className={`font-bold text-xs transition-colors ${
                  isAcademic ? 'text-slate-800 group-hover:text-amber-800' : 'text-white group-hover:text-amber-400'
                }`}>
                  {q.title}
                </div>
                <div className={`font-mono text-[10px] truncate ${
                  isAcademic ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {q.sql.replace(/\n/g, ' ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className={`rounded-xl border shadow-xs p-5 space-y-4 transition-colors ${
        isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800 shadow-xl'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-bold font-display-academic ${
              isAcademic ? 'text-slate-900' : 'text-white'
            }`}>
              Found Student Records
            </h3>
            <span className={`text-xs font-mono font-bold ${
              isAcademic ? 'text-amber-800' : 'text-amber-400'
            }`}>
              ({queryResult.rows.length} students found in {queryResult.executionTimeMs} ms)
            </span>
          </div>

          <button
            onClick={handleExportCSV}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              isAcademic
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Download className={`w-3.5 h-3.5 ${isAcademic ? 'text-amber-700' : 'text-amber-400'}`} />
            <span>Download CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs font-mono">
            <thead className={`sticky top-0 z-10 ${
              isAcademic ? 'bg-slate-100' : 'bg-[#121c32]'
            }`}>
              <tr className={`border-b text-[10px] uppercase ${
                isAcademic ? 'border-slate-200 text-slate-700' : 'border-slate-800 text-slate-400'
              }`}>
                {queryResult.columns.map((col) => (
                  <th key={col} className="pb-2.5 pt-2 px-3">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y text-[11px] ${
              isAcademic ? 'divide-slate-100' : 'divide-slate-800'
            }`}>
              {queryResult.rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`transition-colors ${
                    isAcademic
                      ? 'hover:bg-slate-50 text-slate-800'
                      : 'hover:bg-[#131e33] text-slate-200'
                  }`}
                >
                  {queryResult.columns.map((col) => (
                    <td key={col} className="py-2.5 px-3">
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
