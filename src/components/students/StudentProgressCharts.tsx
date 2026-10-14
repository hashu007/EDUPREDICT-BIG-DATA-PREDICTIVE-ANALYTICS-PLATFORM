import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  BookOpen,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Info
} from 'lucide-react';
import { Student, ThemeMode } from '../../types';

interface StudentProgressChartsProps {
  student: Student;
  theme?: ThemeMode;
}

export const StudentProgressCharts: React.FC<StudentProgressChartsProps> = ({
  student,
  theme = 'hadoop'
}) => {
  const isAcademic = theme === 'academic';
  const [activeChartTab, setActiveChartTab] = useState<'attendance' | 'grades' | 'study_hours'>('attendance');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);

  // 8-week attendance data
  const attendanceHistory = student.attendance.weeklyAttendanceHistory || [85, 82, 88, 90, 84, 86, 89, student.attendance.overallRate];
  const lmsHistory = student.lms.weeklyActivityHistory || [12, 14, 11, 15, 13, 16, 14, student.lms.weeklyHours];
  
  const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];

  // Calculate safe absence buffer (75% mandatory institutional policy)
  const totalClasses = student.attendance.totalClasses || 40;
  const currentAbsences = student.attendance.absentDays || 0;
  const maxAllowedAbsences = Math.floor(totalClasses * 0.25);
  const safeAbsencesRemaining = Math.max(0, maxAllowedAbsences - currentAbsences);
  const isBelowMandatory = student.attendance.overallRate < 75;

  // Grade point mapping for subject chart
  const gradeToGPA = (grade: string): number => {
    switch (grade) {
      case 'A+': return 4.0;
      case 'A': return 4.0;
      case 'A-': return 3.7;
      case 'B+': return 3.3;
      case 'B': return 3.0;
      case 'B-': return 2.7;
      case 'C+': return 2.3;
      case 'C': return 2.0;
      case 'C-': return 1.7;
      case 'D': return 1.0;
      case 'F': return 0.0;
      default: return 3.0;
    }
  };

  const coursesWithGPA = (student.currentCourses || []).map(c => ({
    ...c,
    studentGPA: gradeToGPA(c.gradeCurrent),
    classAvgGPA: Math.min(4.0, Math.max(2.0, gradeToGPA(c.gradeCurrent) + (Math.sin(c.code.charCodeAt(3) || 1) * 0.4)))
  }));

  // SVG dimensions for 8-week attendance chart
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingY = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Compute points for SVG Area / Line Chart
  const minVal = 40;
  const maxVal = 100;
  const getY = (val: number) => paddingY + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
  const getX = (index: number) => paddingX + (index / (attendanceHistory.length - 1)) * chartWidth;

  const points = attendanceHistory.map((val, idx) => ({
    x: getX(idx),
    y: getY(val),
    val,
    week: weekLabels[idx]
  }));

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;
  const y75 = getY(75);

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 space-y-5 transition-all shadow-xs ${
      isAcademic
        ? 'bg-white border-slate-200 text-slate-900'
        : 'bg-[#0d1526] border-slate-800 text-slate-100'
    }`}>
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-amber-700 dark:text-amber-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Academic Progress & Trajectory</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold font-display-academic mt-0.5">
            Visual Learning & Performance Charts
          </h2>
        </div>

        {/* Chart View Switcher */}
        <div className={`flex items-center p-1 rounded-xl border text-xs font-medium ${
          isAcademic ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <button
            onClick={() => setActiveChartTab('attendance')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeChartTab === 'attendance'
                ? isAcademic
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'bg-amber-700 text-white font-bold shadow-2xs'
                : isAcademic
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Attendance Trend</span>
          </button>

          <button
            onClick={() => setActiveChartTab('grades')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeChartTab === 'grades'
                ? isAcademic
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'bg-amber-700 text-white font-bold shadow-2xs'
                : isAcademic
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Course Grades</span>
          </button>

          <button
            onClick={() => setActiveChartTab('study_hours')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeChartTab === 'study_hours'
                ? isAcademic
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'bg-amber-700 text-white font-bold shadow-2xs'
                : isAcademic
                ? 'text-slate-600 hover:text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Study Hours</span>
          </button>
        </div>
      </div>

      {/* CHART 1: ATTENDANCE TRAJECTORY */}
      {activeChartTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Current Attendance</span>
              <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {student.attendance.overallRate}%
              </div>
              <span className="text-[11px] text-slate-500">
                {student.attendance.totalClasses - student.attendance.absentDays} of {student.attendance.totalClasses} classes attended
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Safe Absence Allowance</span>
              <div className={`text-xl font-bold font-mono ${
                safeAbsencesRemaining > 2
                  ? isAcademic ? 'text-emerald-700' : 'text-emerald-400'
                  : isAcademic ? 'text-amber-800' : 'text-amber-400'
              }`}>
                {safeAbsencesRemaining} Days Remaining
              </div>
              <span className="text-[11px] text-slate-500">
                Max {maxAllowedAbsences} absences before &lt;75% threshold
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Policy Standing</span>
              <div className="flex items-center gap-1.5 text-xs font-bold mt-1">
                {isBelowMandatory ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span className="text-red-700 dark:text-red-400">Below 75% Requirement</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-400">Good Attendance Standing</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                {student.attendance.trend === 'improving' ? 'Trending upward past 3 weeks' : 'Stable weekly check-ins'}
              </span>
            </div>
          </div>

          {/* Interactive SVG Area Chart */}
          <div className={`p-4 rounded-xl border relative overflow-hidden ${
            isAcademic ? 'bg-slate-50/70 border-slate-200' : 'bg-[#090f1d] border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                8-Week Classroom Attendance Trajectory (%)
              </span>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  <span>Student Rate</span>
                </span>
                <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                  <span className="w-3 h-0.5 border-b border-dashed border-red-500" />
                  <span>75% Policy Minimum</span>
                </span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full min-w-[500px] h-52 select-none"
              >
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                {[50, 60, 70, 80, 90, 100].map(gridVal => {
                  const y = getY(gridVal);
                  return (
                    <g key={gridVal}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke={isAcademic ? '#e2e8f0' : '#1e293b'}
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        fill={isAcademic ? '#94a3b8' : '#64748b'}
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {gridVal}%
                      </text>
                    </g>
                  );
                })}

                {/* 75% Mandatory Policy Reference Line */}
                <line
                  x1={paddingX}
                  y1={y75}
                  x2={svgWidth - paddingX}
                  y2={y75}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={svgWidth - paddingX - 4}
                  y={y75 - 5}
                  fill="#ef4444"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                  fontWeight="bold"
                >
                  75% Required
                </text>

                {/* Area Fill */}
                <path d={areaD} fill="url(#attendanceGradient)" />

                {/* Main Trajectory Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {points.map((p, idx) => {
                  const isHovered = hoveredWeek === idx;
                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredWeek(idx)}
                      onMouseLeave={() => setHoveredWeek(null)}
                    >
                      {/* Vertical Hover Guide */}
                      {isHovered && (
                        <line
                          x1={p.x}
                          y1={paddingY}
                          x2={p.x}
                          y2={paddingY + chartHeight}
                          stroke={isAcademic ? '#cbd5e1' : '#334155'}
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Outer Circle */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 6 : 4}
                        fill={isAcademic ? '#ffffff' : '#0d1526'}
                        stroke="#d97706"
                        strokeWidth={isHovered ? 3 : 2}
                        className="transition-all duration-150"
                      />

                      {/* Tooltip Box */}
                      {isHovered && (
                        <g transform={`translate(${Math.min(svgWidth - 90, Math.max(30, p.x - 35))}, ${Math.max(10, p.y - 42)})`}>
                          <rect
                            width="70"
                            height="32"
                            rx="6"
                            fill={isAcademic ? '#0f172a' : '#ffffff'}
                            className="shadow-md"
                          />
                          <text
                            x="35"
                            y="14"
                            fill={isAcademic ? '#94a3b8' : '#475569'}
                            fontSize="8"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {p.week}
                          </text>
                          <text
                            x="35"
                            y="26"
                            fill={isAcademic ? '#fbbf24' : '#b45309'}
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                            fontFamily="monospace"
                          >
                            {p.val}%
                          </text>
                        </g>
                      )}

                      {/* X Axis Labels */}
                      <text
                        x={p.x}
                        y={svgHeight - 10}
                        fill={isHovered ? (isAcademic ? '#0f172a' : '#ffffff') : (isAcademic ? '#64748b' : '#94a3b8')}
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight={isHovered ? 'bold' : 'normal'}
                      >
                        {p.week}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* CHART 2: COURSE GRADES COMPARISON */}
      {activeChartTab === 'grades' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Current Semester Enrolled Subjects vs Class Average (4.0 GPA Scale)
            </span>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                <span className="w-2.5 h-2.5 rounded bg-amber-600" />
                <span>Your Grade</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-slate-400" />
                <span>Class Average</span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {coursesWithGPA.map((c) => {
              const studentPct = (c.studentGPA / 4.0) * 100;
              const avgPct = (c.classAvgGPA / 4.0) * 100;

              return (
                <div
                  key={c.code}
                  className={`p-3.5 rounded-xl border space-y-2 transition-colors ${
                    isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 mr-2">
                        {c.code}
                      </span>
                      <span className="text-xs font-medium text-slate-900 dark:text-white">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Grade: <strong className="text-amber-700 dark:text-amber-400">{c.gradeCurrent}</strong> ({c.studentGPA.toFixed(1)} GPA)
                      </span>
                      <span className="text-slate-500">
                        Attendance: {c.attendance}%
                      </span>
                    </div>
                  </div>

                  {/* Dual Bar Comparison */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span className="w-20 truncate">Your Standing:</span>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${studentPct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-bold text-amber-700 dark:text-amber-400">
                        {c.studentGPA.toFixed(1)} / 4.0
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span className="w-20 truncate">Class Average:</span>
                      <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-400 dark:bg-slate-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${avgPct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right">
                        {c.classAvgGPA.toFixed(1)} / 4.0
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CHART 3: STUDY HOURS & LMS ENGAGEMENT */}
      {activeChartTab === 'study_hours' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Weekly Study Time</span>
              <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">
                {student.lms.weeklyHours} Hours / Week
              </div>
              <span className="text-[11px] text-slate-500">
                Recommended target: 12-15 hours
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Quiz Practice Completion</span>
              <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {student.lms.quizAttemptsAvg * 10}% Complete
              </div>
              <span className="text-[11px] text-slate-500">
                Avg {student.lms.quizAttemptsAvg} practice attempts per unit
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">On-Time Submissions</span>
              <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {student.lms.assignmentSubmissionOnTimeRate}%
              </div>
              <span className="text-[11px] text-slate-500">
                Coursework submitted prior to deadlines
              </span>
            </div>
          </div>

          {/* Weekly Hours Bar Histogram */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isAcademic ? 'bg-slate-50/70 border-slate-200' : 'bg-[#090f1d] border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                8-Week Study Time Breakdown (Video Lessons & Practice Hours)
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Target: 12 hrs/week
              </span>
            </div>

            <div className="grid grid-cols-8 gap-2 pt-4 items-end h-40">
              {lmsHistory.map((hrs: number, idx: number) => {
                const heightPct = Math.min(100, Math.max(15, (hrs / 20) * 100));
                const isTargetMet = hrs >= 12;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      {hrs}h
                    </span>
                    <div className="w-full max-w-[36px] bg-slate-200 dark:bg-slate-800 rounded-t-lg overflow-hidden h-28 flex items-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isTargetMet
                            ? 'bg-emerald-600 group-hover:bg-emerald-500'
                            : 'bg-amber-600 group-hover:bg-amber-500'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 truncate">
                      W{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
