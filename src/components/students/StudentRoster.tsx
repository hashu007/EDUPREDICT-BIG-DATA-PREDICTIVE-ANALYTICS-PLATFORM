import React, { useState, useRef } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  ShieldAlert,
  AlertTriangle,
  ArrowUpDown,
  PlusCircle,
  Eye,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Student, ThemeMode, UserRole } from '../../types';
import { dataService } from '../../services/dataService';
import { CSVImportModal, CSVRowPreview } from './CSVImportModal';

interface StudentRosterProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
  onOpenInterventionModal: (student: Student) => void;
  theme: ThemeMode;
  userRole?: UserRole;
  onImportStudents?: (newStudents: Student[]) => void;
}

export const StudentRoster: React.FC<StudentRosterProps> = ({
  students,
  onSelectStudent,
  onOpenInterventionModal,
  theme,
  userRole = 'admin',
  onImportStudents
}) => {
  const isAcademic = theme === 'academic';
  const canManageCSV = userRole === 'admin' || userRole === 'faculty';

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [clusterFilter, setClusterFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'risk' | 'attendance' | 'gpa' | 'name'>('risk');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // CSV Import State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<CSVRowPreview[]>([]);
  const [importedFileName, setImportedFileName] = useState('');
  const [rawCsvContent, setRawCsvContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const departments = Array.from(new Set(students.map(s => s.department)));

  const filtered = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || s.department === deptFilter;
    const matchesRisk = riskFilter === 'all' || s.predictions.riskLevel === riskFilter;
    const matchesCluster = clusterFilter === 'all' || String(s.predictions.clusterId) === clusterFilter;
    return matchesSearch && matchesDept && matchesRisk && matchesCluster;
  });

  const sorted = [...filtered].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'risk') {
      comp = a.predictions.dropoutRiskScore - b.predictions.dropoutRiskScore;
    } else if (sortBy === 'attendance') {
      comp = a.attendance.overallRate - b.attendance.overallRate;
    } else if (sortBy === 'gpa') {
      comp = a.academic.currentGPA - b.academic.currentGPA;
    } else if (sortBy === 'name') {
      comp = a.name.localeCompare(b.name);
    }
    return sortOrder === 'desc' ? -comp : comp;
  });

  const handleExportCSV = () => {
    const headers = ['StudentID,Name,Email,Department,Semester,AttendanceRate,CurrentGPA,MidtermsAvg,LMSWeeklyHours,DropoutRisk,RiskLevel,Cluster,Anomaly'];
    const rows = sorted.map(s =>
      `"${s.studentId}","${s.name}","${s.email}","${s.department}",${s.semester},${s.attendance.overallRate},${s.academic.currentGPA},${s.academic.midtermsAverage},${s.lms.weeklyHours},${s.predictions.dropoutRiskScore},"${s.predictions.riskLevel}","${s.predictions.clusterName}","${s.predictions.anomalyDetected ? 'YES' : 'NO'}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `edupredict_student_cohort_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadTemplate = () => {
    const templateContent = dataService.getCSVTemplateContent();
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + templateContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "edupredict_student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawCsvContent(content);
        const previews = dataService.parseStudentCSV(content);
        setParsedRows(previews);
        setImportModalOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmImport = (validStudents: Student[]) => {
    if (validStudents.length === 0) return;
    const added = dataService.addStudents(validStudents);
    if (rawCsvContent) {
      dataService.uploadCsvDataset({
        fileName: importedFileName || 'student_cohort_import.csv',
        rawCsv: rawCsvContent,
        datasetName: importedFileName.replace(/\.[^/.]+$/, '') || 'student_cohort_import',
        format: 'csv'
      });
    }
    if (onImportStudents) {
      onImportStudents(added);
    }
  };

  return (
    <div className="space-y-6">
      {/* CSV Import File Input */}
      {canManageCSV && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
      )}

      {/* Banner */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-xl border transition-all ${
        isAcademic
          ? 'bg-white border-slate-200 shadow-xs text-slate-900'
          : 'bg-[#0d1526] border-slate-800 shadow-xl text-slate-100'
      }`}>
        <div>
          <div className={`flex items-center gap-2 text-xs font-mono uppercase font-bold ${
            isAcademic ? 'text-amber-800' : 'text-amber-400'
          }`}>
            <span>Student Intelligence Registry</span>
            <span className={isAcademic ? 'text-slate-300' : 'text-slate-600'}>·</span>
            <span>Campus Cohort Directory</span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-display-academic font-bold mt-1 ${
            isAcademic ? 'text-slate-900' : 'text-white'
          }`}>
            Student Cohort Registry & Academic Audit Radar
          </h1>
          <p className={`text-xs font-serif-academic italic mt-0.5 ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Multi-dimensional risk profiles, attendance statistics, GPA trajectory, and machine learning cluster assignments.
          </p>
        </div>

        {canManageCSV && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={handleDownloadTemplate}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border shadow-xs ${
                isAcademic
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title="Download formatted CSV import template"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-500" />
              <span>CSV Template</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                isAcademic
                  ? 'bg-amber-700 hover:bg-amber-800 text-white border border-amber-800'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
              }`}
              title="Upload CSV to import new student records"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleExportCSV}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border shadow-xs ${
                isAcademic
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Export filtered student cohort as CSV"
            >
              <Download className={`w-3.5 h-3.5 ${isAcademic ? 'text-amber-700' : 'text-amber-400'}`} />
              <span>Export CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* CSV Validation Preview Modal */}
      <CSVImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        parsedRows={parsedRows}
        onConfirmImport={handleConfirmImport}
        theme={theme}
        fileName={importedFileName}
      />

      {/* Filter and Search Bar */}
      <div className={`p-4 sm:p-5 rounded-xl border shadow-xs space-y-3.5 transition-colors ${
        isAcademic
          ? 'bg-white border-slate-200'
          : 'bg-[#0d1526] border-slate-800'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name, ID, email..."
              className={`w-full rounded-lg pl-9 pr-4 py-2 text-xs border focus:outline-none ${
                isAcademic
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
              }`}
            />
          </div>

          {/* Dept */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className={`w-full rounded-lg p-2 text-xs border focus:outline-none ${
                isAcademic
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
              }`}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className={`w-full rounded-lg p-2 text-xs border focus:outline-none ${
                isAcademic
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
              }`}
            >
              <option value="all">All Risk Tiers</option>
              <option value="critical">Critical Risk (&gt;= 70%)</option>
              <option value="high">High Risk (50% - 69%)</option>
              <option value="moderate">Moderate Risk (30% - 49%)</option>
              <option value="low">Low Risk (&lt; 30%)</option>
            </select>
          </div>

          {/* Cluster Filter */}
          <div>
            <select
              value={clusterFilter}
              onChange={(e) => setClusterFilter(e.target.value)}
              className={`w-full rounded-lg p-2 text-xs border focus:outline-none ${
                isAcademic
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
              }`}
            >
              <option value="all">All Cohort Clusters</option>
              <option value="0">Cluster 0: Struggling</option>
              <option value="1">Cluster 1: Diligent</option>
              <option value="2">Cluster 2: Passive High-Potential</option>
              <option value="3">Cluster 3: Consistent Achiever</option>
            </select>
          </div>
        </div>

        {/* Sort Controls */}
        <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs ${
          isAcademic ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px]">Sort By:</span>
            <div className="flex items-center gap-1">
              {(['risk', 'attendance', 'gpa', 'name'] as const).map((col) => (
                <button
                  key={col}
                  onClick={() => {
                    if (sortBy === col) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(col);
                      setSortOrder(col === 'name' ? 'asc' : 'desc');
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    sortBy === col
                      ? isAcademic
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'bg-amber-950/80 text-amber-300 font-bold border border-amber-800'
                      : isAcademic
                      ? 'hover:bg-slate-100 text-slate-600'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {col.toUpperCase()} {sortBy === col && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] font-mono">
            <span>Showing </span>
            <span className={isAcademic ? 'font-bold text-slate-900' : 'font-bold text-white'}>{sorted.length}</span>
            <span> of {students.length} students</span>
          </div>
        </div>
      </div>

      {/* Mobile Card Grid (Visible on `<md` screens) */}
      <div className="grid grid-cols-1 gap-3.5 md:hidden">
        {sorted.map((s) => {
          const risk = s.predictions.dropoutRiskScore;
          const isCrit = s.predictions.riskLevel === 'critical' || s.predictions.riskLevel === 'high';

          return (
            <div
              key={s.id}
              className={`p-4 rounded-xl border space-y-3 transition-colors ${
                isAcademic
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-[#0d1526] border-slate-800 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  onClick={() => onSelectStudent(s.id)}
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                >
                  <div className="min-w-0">
                    <div className={`font-bold text-sm truncate ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
                      {s.name}
                    </div>
                    <div className={`text-[11px] font-mono ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                      {s.studentId} · Sem {s.semester}
                    </div>
                    <div className={`text-[11px] truncate ${isAcademic ? 'text-slate-600' : 'text-slate-400'}`}>
                      {s.department}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-base font-mono font-black ${
                    risk >= 70
                      ? isAcademic ? 'text-red-700' : 'text-red-400'
                      : risk >= 40
                      ? isAcademic ? 'text-amber-700' : 'text-amber-400'
                      : isAcademic ? 'text-emerald-700' : 'text-emerald-400'
                  }`}>
                    {risk}% Risk
                  </div>
                  <span className={`inline-block text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold border ${
                    risk >= 70
                      ? isAcademic ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/80 text-red-300 border-red-800'
                      : risk >= 40
                      ? isAcademic ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/80 text-amber-300 border-amber-800'
                      : isAcademic ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                  }`}>
                    {s.predictions.riskLevel}
                  </span>
                </div>
              </div>

              {/* Mini metric pills */}
              <div className={`grid grid-cols-3 gap-2 p-2 rounded-lg text-center text-xs font-mono border ${
                isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
              }`}>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Attendance</div>
                  <div className={`font-bold ${s.attendance.overallRate < 75 ? 'text-red-500' : isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                    {s.attendance.overallRate}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">GPA</div>
                  <div className={`font-bold ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
                    {s.academic.currentGPA}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">LMS Hrs</div>
                  <div className={`font-bold ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                    {s.lms.weeklyHours}h/wk
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onOpenInterventionModal(s)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                    isCrit
                      ? 'bg-red-700 hover:bg-red-800 text-white shadow-xs'
                      : isAcademic
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Intervene</span>
                </button>
                <button
                  onClick={() => onSelectStudent(s.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    isAcademic
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  Dossier
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Roster Table (Visible on `md:` and up) */}
      <div className={`hidden md:block rounded-xl border shadow-xs p-5 space-y-4 transition-colors ${
        isAcademic
          ? 'bg-white border-slate-200'
          : 'bg-[#0d1526] border-slate-800 shadow-xl'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b font-mono text-[10px] uppercase ${
                isAcademic ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
              }`}>
                <th className="pb-3">Candidate Details</th>
                <th className="pb-3 text-center">Faculty & Sem</th>
                <th className="pb-3 text-center">Attendance</th>
                <th className="pb-3 text-center">Current GPA</th>
                <th className="pb-3 text-center">Midterms</th>
                <th className="pb-3 text-center">LMS Hours</th>
                <th className="pb-3 text-center">Attrition Risk</th>
                <th className="pb-3 text-center">Cohort Cluster</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-sans ${
              isAcademic ? 'divide-slate-100' : 'divide-slate-800'
            }`}>
              {sorted.map((s) => {
                const risk = s.predictions.dropoutRiskScore;
                const isCrit = s.predictions.riskLevel === 'critical' || s.predictions.riskLevel === 'high';

                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isAcademic
                        ? 'hover:bg-slate-50/80'
                        : 'hover:bg-[#131e33]'
                    }`}
                  >
                    <td className="py-3">
                      <div
                        onClick={() => onSelectStudent(s.id)}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <div>
                          <div className={`font-bold transition-colors flex items-center gap-1.5 ${
                            isAcademic
                              ? 'text-slate-900 group-hover:text-amber-800'
                              : 'text-white group-hover:text-amber-400'
                          }`}>
                            <span>{s.name}</span>
                            {s.predictions.anomalyDetected && (
                              <span className="text-[10px]" title={s.predictions.anomalyReason}>
                                ⚠️
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] font-mono ${
                            isAcademic ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {s.studentId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-center">
                      <div className={`font-medium truncate max-w-[130px] mx-auto ${
                        isAcademic ? 'text-slate-800' : 'text-slate-200'
                      }`}>
                        {s.department}
                      </div>
                      <div className={`text-[10px] font-mono ${
                        isAcademic ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        Sem {s.semester}
                      </div>
                    </td>

                    <td className="py-3 text-center font-mono">
                      <span className={
                        s.attendance.overallRate < 75
                          ? isAcademic ? 'text-red-700 font-bold' : 'text-red-400 font-bold'
                          : isAcademic ? 'text-slate-800' : 'text-slate-200'
                      }>
                        {s.attendance.overallRate}%
                      </span>
                    </td>

                    <td className={`py-3 text-center font-mono font-bold ${
                      isAcademic ? 'text-slate-900' : 'text-white'
                    }`}>
                      {s.academic.currentGPA}
                    </td>

                    <td className="py-3 text-center font-mono">
                      <span className={
                        s.academic.midtermsAverage < 60
                          ? isAcademic ? 'text-red-700 font-bold' : 'text-red-400 font-bold'
                          : isAcademic ? 'text-slate-800' : 'text-slate-200'
                      }>
                        {s.academic.midtermsAverage}%
                      </span>
                    </td>

                    <td className={`py-3 text-center font-mono ${
                      isAcademic ? 'text-slate-700' : 'text-slate-300'
                    }`}>
                      {s.lms.weeklyHours}h
                    </td>

                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-xs ${
                            risk >= 70
                              ? isAcademic ? 'text-red-700' : 'text-red-400'
                              : risk >= 40
                              ? isAcademic ? 'text-amber-700' : 'text-amber-400'
                              : isAcademic ? 'text-emerald-700' : 'text-emerald-400'
                          }`}
                        >
                          {risk}%
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase border ${
                            risk >= 70
                              ? isAcademic
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-red-950/80 text-red-300 border-red-800'
                              : risk >= 40
                              ? isAcademic
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : isAcademic
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {s.predictions.riskLevel}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-serif-academic italic ${
                        isAcademic
                          ? 'text-slate-700 bg-slate-100 border-slate-200'
                          : 'text-slate-300 bg-slate-800/90 border-slate-700'
                      }`}>
                        {s.predictions.clusterName}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenInterventionModal(s)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                            isCrit
                              ? 'bg-red-700 hover:bg-red-800 text-white shadow-xs'
                              : isAcademic
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                          title="Log counseling intervention"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Intervene</span>
                        </button>
                        <button
                          onClick={() => onSelectStudent(s.id)}
                          className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                            isAcademic
                              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          Dossier
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
