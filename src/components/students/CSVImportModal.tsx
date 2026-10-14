import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Upload,
  ArrowRight,
  ShieldAlert,
  Users
} from 'lucide-react';
import { Student, ThemeMode } from '../../types';

export interface CSVRowPreview {
  rawLineNumber: number;
  student: Student;
  status: 'valid' | 'duplicate' | 'error';
  message: string;
}

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedRows: CSVRowPreview[];
  onConfirmImport: (validStudents: Student[]) => void;
  theme: ThemeMode;
  fileName?: string;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  parsedRows,
  onConfirmImport,
  theme,
  fileName
}) => {
  if (!isOpen) return null;

  const isAcademic = theme === 'academic';
  const validRows = parsedRows.filter(r => r.status === 'valid');
  const duplicateRows = parsedRows.filter(r => r.status === 'duplicate');
  const errorRows = parsedRows.filter(r => r.status === 'error');

  const [filter, setFilter] = useState<'all' | 'valid' | 'duplicate' | 'error'>('all');

  const displayedRows = parsedRows.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const handleConfirm = () => {
    const validStudents = validRows.map(r => r.student);
    onConfirmImport(validStudents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-5xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto transition-all ${
          isAcademic
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0b101b] border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isAcademic
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-amber-950/80 text-amber-400 border border-amber-800'
            }`}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display-academic font-bold text-base sm:text-lg">
                  CSV Student Ingestion Validation Preview
                </h3>
                {fileName && (
                  <span className={`text-xs font-mono px-2 py-0.5 rounded font-medium border ${
                    isAcademic ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}>
                    {fileName}
                  </span>
                )}
              </div>
              <p className={`text-xs ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                Review parsed student records, predictive risk scoring, and validation status before adding to the cohort registry.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isAcademic
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Statistics Bar */}
        <div className={`p-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 ${
          isAcademic ? 'bg-slate-100/60 border-slate-200' : 'bg-[#080d17] border-slate-800'
        }`}>
          <button
            onClick={() => setFilter('all')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filter === 'all'
                ? isAcademic
                  ? 'bg-white border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-slate-800 border-amber-500 ring-2 ring-amber-500/20'
                : isAcademic
                ? 'bg-white/80 border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total CSV Rows</div>
            <div className="text-xl font-bold font-mono mt-0.5">{parsedRows.length}</div>
          </button>

          <button
            onClick={() => setFilter('valid')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filter === 'valid'
                ? isAcademic
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/20'
                : isAcademic
                ? 'bg-white/80 border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[10px] font-mono uppercase text-emerald-500 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Valid Ready</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">{validRows.length}</div>
          </button>

          <button
            onClick={() => setFilter('duplicate')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filter === 'duplicate'
                ? isAcademic
                  ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/20'
                : isAcademic
                ? 'bg-white/80 border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[10px] font-mono uppercase text-amber-500 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Duplicates</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-500 mt-0.5">{duplicateRows.length}</div>
          </button>

          <button
            onClick={() => setFilter('error')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filter === 'error'
                ? isAcademic
                  ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20'
                  : 'bg-red-950/60 border-red-500 ring-2 ring-red-500/20'
                : isAcademic
                ? 'bg-white/80 border-slate-200'
                : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="text-[10px] font-mono uppercase text-red-500 font-bold flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              <span>Errors</span>
            </div>
            <div className="text-xl font-bold font-mono text-red-500 mt-0.5">{errorRows.length}</div>
          </button>
        </div>

        {/* Scrollable Preview Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[250px]">
          {displayedRows.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic text-sm">
              No parsed records match the selected status filter.
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] font-mono uppercase tracking-wider font-bold ${
                    isAcademic ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    <th className="p-3">Status</th>
                    <th className="p-3">Student ID & Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">GPA</th>
                    <th className="p-3">Calculated Risk</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isAcademic ? 'divide-slate-200' : 'divide-slate-800'}`}>
                  {displayedRows.map((row, idx) => {
                    const s = row.student;
                    return (
                      <tr key={idx} className={`transition-colors ${
                        row.status === 'valid'
                          ? isAcademic ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'
                          : row.status === 'duplicate'
                          ? isAcademic ? 'bg-amber-50/50' : 'bg-amber-950/20'
                          : isAcademic ? 'bg-red-50/50' : 'bg-red-950/20'
                      }`}>
                        <td className="p-3 whitespace-nowrap">
                          {row.status === 'valid' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Ready
                            </span>
                          )}
                          {row.status === 'duplicate' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" title={row.message}>
                              <AlertTriangle className="w-3 h-3" />
                              Duplicate ID
                            </span>
                          )}
                          {row.status === 'error' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800" title={row.message}>
                              <XCircle className="w-3 h-3" />
                              Invalid
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-xs">{s.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">{s.studentId}</span>
                            {row.message.includes('Auto-assigned') && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                                AUTO-ID
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-600 dark:text-slate-300">{s.department}</td>
                        <td className="p-3 font-mono">Sem {s.semester}</td>
                        <td className="p-3 font-mono font-bold">
                          <span className={s.attendance.overallRate < 75 ? 'text-red-500' : 'text-emerald-500'}>
                            {s.attendance.overallRate}%
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold">
                          <span className={s.academic.currentGPA < 2.5 ? 'text-red-500' : 'text-emerald-500'}>
                            {s.academic.currentGPA.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold border ${
                              s.predictions.riskLevel === 'critical'
                                ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                                : s.predictions.riskLevel === 'high'
                                ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            }`}>
                              {s.predictions.riskLevel} ({s.predictions.dropoutRiskScore}%)
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
          isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="text-xs text-slate-500">
            {validRows.length} valid student records will be added to the registry. Duplicates/errors will be safely skipped.
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                isAcademic
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={validRows.length === 0}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                validRows.length === 0
                  ? 'bg-slate-400 text-slate-200 cursor-not-allowed opacity-50'
                  : isAcademic
                  ? 'bg-amber-700 hover:bg-amber-800 text-white border border-amber-800'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Confirm & Ingest {validRows.length} Students</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
