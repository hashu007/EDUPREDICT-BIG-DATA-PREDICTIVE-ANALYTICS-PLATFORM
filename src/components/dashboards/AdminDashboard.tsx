import React from 'react';
import {
  Users,
  AlertTriangle,
  Award,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  UserCheck,
  BrainCircuit,
  FileText,
  Activity,
  Filter
} from 'lucide-react';
import { Student, Course, Alert, TelemetryEvent, HdfsNode, ThemeMode } from '../../types';

interface AdminDashboardProps {
  students: Student[];
  courses: Course[];
  alerts: Alert[];
  telemetry: TelemetryEvent[];
  hdfsNodes: HdfsNode[];
  onSelectStudent: (studentId: string) => void;
  onNavigateTab: (tab: any) => void;
  theme: ThemeMode;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  courses,
  alerts,
  telemetry,
  hdfsNodes,
  onSelectStudent,
  onNavigateTab,
  theme
}) => {
  const isAcademic = theme === 'academic';

  // Key Institutional Computations
  const totalStudents = students.length;
  const criticalStudents = students.filter(
    s => s.predictions.riskLevel === 'critical' || s.predictions.riskLevel === 'high'
  );
  const avgGPA = Number(
    (students.reduce((acc, s) => acc + s.academic.currentGPA, 0) / (totalStudents || 1)).toFixed(2)
  );
  const avgAttendance = Math.round(
    students.reduce((acc, s) => acc + s.attendance.overallRate, 0) / (totalStudents || 1)
  );
  const retentionRate = Math.round(100 - (criticalStudents.length / (totalStudents || 1)) * 100);

  const departments = ['Computer Science', 'Data Science', 'Software Engineering', 'Information Technology'];
  const deptStats = departments.map(dept => {
    const list = students.filter(s => s.department === dept);
    const atRisk = list.filter(s => s.predictions.dropoutRiskScore >= 50).length;
    const count = list.length || 1;
    const retention = Math.round(100 - (atRisk / count) * 100);
    const meanGPA = Number((list.reduce((acc, s) => acc + s.academic.currentGPA, 0) / count).toFixed(2));
    return { dept, count, atRisk, retention, meanGPA };
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Executive Welcome Banner */}
      <div
        className={`rounded-2xl border p-6 transition-all ${
          isAcademic
            ? 'bg-white border-slate-200 shadow-xs text-slate-900'
            : 'bg-[#0d1526] border-slate-800 shadow-xl text-slate-100'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <span>Executive Workstation</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-slate-500 font-normal">Academic Year 2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display-academic font-bold tracking-tight">
              Institutional Overview & Student Performance Radar
            </h1>

            <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${
              isAcademic ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Real-time monitoring of student retention, academic progression, and early-warning predictive diagnostics across all university departments.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('students')}
              className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
            >
              <Users className="w-4 h-4" />
              <span>Student Cohort Directory</span>
            </button>
            <button
              onClick={() => onNavigateTab('management_analytics')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-2 ${
                isAcademic
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-800'
              }`}
            >
              <Filter className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Multi-Filter Studio</span>
            </button>
            <button
              onClick={() => onNavigateTab('analytics')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-2 ${
                isAcademic
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-amber-500" />
              <span>Predictive Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Clean Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enrolled Cohort */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Enrolled Scholars</span>
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono tracking-tight">{totalStudents}</span>
            <span className="text-xs text-emerald-600 font-semibold">+4.2% YoY</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Across 4 Academic Departments
          </div>
        </div>

        {/* Scholars Needing Support */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          criticalStudents.length > 0
            ? isAcademic
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-amber-950/20 border-amber-900/60'
            : isAcademic
            ? 'bg-white border-slate-200'
            : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-400">
            <span>Scholars Needing Support</span>
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-amber-900 dark:text-amber-300">
              {criticalStudents.length}
            </span>
            <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
              {((criticalStudents.length / (totalStudents || 1)) * 100).toFixed(1)}% of Roster
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Early Warning Active</span>
            <button
              onClick={() => onNavigateTab('students')}
              className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              Review Roster <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Overall Attendance Rate */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Average Attendance</span>
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono">{avgAttendance}%</span>
            <span className="text-xs text-slate-400">Target: 85%</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${avgAttendance}%` }}
            />
          </div>
        </div>

        {/* Institutional Cumulative GPA */}
        <div className={`p-5 rounded-2xl border transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Institutional Cumulative GPA</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono">{avgGPA}</span>
            <span className="text-xs text-slate-400">/ 4.0 Scale</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(avgGPA / 4.0) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Priority Intervention Board & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Action Board (2 Cols) */}
        <div className={`lg:col-span-2 p-5 sm:p-6 rounded-2xl border space-y-4 ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold font-display-academic">
                Scholars Requiring Academic Guidance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Students flagged with declining attendance or GPA trends for proactive advisor outreach
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              View Full Directory <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {criticalStudents.slice(0, 5).map(s => (
              <div
                key={s.id}
                onClick={() => onSelectStudent(s.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isAcademic
                    ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm truncate">{s.name}</span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                        ({s.studentId})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {s.program} · Semester {s.semester}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold">
                      GPA {s.academic.currentGPA.toFixed(2)} · Attendance {s.attendance.overallRate}%
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Risk Score: {s.predictions.dropoutRiskScore}%
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    s.predictions.riskLevel === 'critical'
                      ? isAcademic ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-950/80 text-red-300 border-red-800'
                      : isAcademic ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-950/80 text-amber-300 border-amber-800'
                  }`}>
                    {s.predictions.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Departmental Performance Overview (1 Col) */}
        <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold font-display-academic">Department Performance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Retention rate & mean GPA by academic discipline
            </p>
          </div>

          <div className="space-y-4">
            {deptStats.map(d => (
              <div key={d.dept} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{d.dept}</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">
                    Mean GPA {d.meanGPA}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{d.count} Scholars Enrolled</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{d.retention}% Retention</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${d.retention}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
