import React, { useState, useMemo } from 'react';
import {
  Filter,
  Users,
  Award,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Download,
  Search,
  RotateCcw,
  BookOpen,
  ArrowUpDown,
  CheckCircle2,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';
import { Student, ThemeMode, UserRole } from '../../types';

interface ManagementAnalyticsHubProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
  theme?: ThemeMode;
  userRole?: UserRole;
}

export const ManagementAnalyticsHub: React.FC<ManagementAnalyticsHubProps> = ({
  students,
  onSelectStudent,
  theme = 'hadoop',
  userRole = 'admin'
}) => {
  const isAcademic = theme === 'academic';

  // Filter States
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedAttendanceTier, setSelectedAttendanceTier] = useState<string>('all');
  const [selectedRiskTier, setSelectedRiskTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Table Sort State
  const [sortField, setSortField] = useState<'name' | 'gpa' | 'attendance' | 'risk'>('risk');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Scatter Hover State
  const [hoveredScatterStudent, setHoveredScatterStudent] = useState<Student | null>(null);

  // List of departments
  const departments = [
    'Computer Science',
    'Data Science',
    'Software Engineering',
    'Business Analytics',
    'Artificial Intelligence'
  ];

  // List of unique course codes
  const allCourses = useMemo(() => {
    const set = new Map<string, string>();
    students.forEach(s => {
      (s.currentCourses || []).forEach(c => {
        if (!set.has(c.code)) set.set(c.code, c.name);
      });
    });
    return Array.from(set.entries()).map(([code, name]) => ({ code, name }));
  }, [students]);

  // Filtering Logic
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Department filter
      if (selectedDept !== 'all' && s.department !== selectedDept) return false;

      // Semester filter
      if (selectedSemester !== 'all' && s.semester !== Number(selectedSemester)) return false;

      // Subject / Course filter
      if (selectedCourse !== 'all') {
        const hasCourse = (s.currentCourses || []).some(c => c.code === selectedCourse);
        if (!hasCourse) return false;
      }

      // Attendance Range filter
      if (selectedAttendanceTier !== 'all') {
        const rate = s.attendance.overallRate;
        if (selectedAttendanceTier === 'critical' && rate >= 60) return false;
        if (selectedAttendanceTier === 'warning' && (rate < 60 || rate >= 75)) return false;
        if (selectedAttendanceTier === 'good' && (rate < 75 || rate >= 85)) return false;
        if (selectedAttendanceTier === 'excellent' && rate < 85) return false;
      }

      // Risk / Performance Tier filter
      if (selectedRiskTier !== 'all') {
        const risk = s.predictions.dropoutRiskScore;
        const gpa = s.academic.currentGPA;
        const att = s.attendance.overallRate;

        if (selectedRiskTier === 'performing_well') {
          // Dean's list / Top performers: GPA >= 3.5 & Attendance >= 85% & Risk < 25%
          if (gpa < 3.5 || att < 85 || risk > 25) return false;
        } else if (selectedRiskTier === 'moderate') {
          // Moderate: Risk between 20% and 50%
          if (risk < 20 || risk >= 50) return false;
        } else if (selectedRiskTier === 'high_risk') {
          // High Risk: Risk between 50% and 75%
          if (risk < 50 || risk >= 75) return false;
        } else if (selectedRiskTier === 'critical_risk') {
          // Critical: Risk >= 75% or GPA < 2.0
          if (risk < 75 && gpa >= 2.0) return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesId = s.studentId.toLowerCase().includes(q);
        const matchesDept = s.department.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDept) return false;
      }

      return true;
    });
  }, [students, selectedDept, selectedSemester, selectedCourse, selectedAttendanceTier, selectedRiskTier, searchQuery]);

  // Sorting
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === 'name') {
        return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sortField === 'gpa') {
        valA = a.academic.currentGPA;
        valB = b.academic.currentGPA;
      } else if (sortField === 'attendance') {
        valA = a.attendance.overallRate;
        valB = b.attendance.overallRate;
      } else if (sortField === 'risk') {
        valA = a.predictions.dropoutRiskScore;
        valB = b.predictions.dropoutRiskScore;
      }

      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredStudents, sortField, sortAsc]);

  // Aggregate Metrics for Filtered Cohort
  const totalCount = filteredStudents.length;
  const avgGPA = totalCount > 0
    ? (filteredStudents.reduce((sum, s) => sum + s.academic.currentGPA, 0) / totalCount).toFixed(2)
    : '0.00';
  const avgAttendance = totalCount > 0
    ? Math.round(filteredStudents.reduce((sum, s) => sum + s.attendance.overallRate, 0) / totalCount)
    : 0;
  
  const performingWellCount = filteredStudents.filter(
    s => s.academic.currentGPA >= 3.5 && s.attendance.overallRate >= 85 && s.predictions.dropoutRiskScore < 25
  ).length;

  const criticalSupportCount = filteredStudents.filter(
    s => s.predictions.riskLevel === 'critical' || s.predictions.dropoutRiskScore >= 70 || s.attendance.overallRate < 60
  ).length;

  // Histogram Data for GPA Distribution
  const gpaBuckets = useMemo(() => {
    const buckets = [
      { label: '< 2.0 (Warning)', count: 0, color: '#ef4444' },
      { label: '2.0 - 2.49 (Passing)', count: 0, color: '#f97316' },
      { label: '2.5 - 2.99 (Average)', count: 0, color: '#eab308' },
      { label: '3.0 - 3.49 (Good)', count: 0, color: '#3b82f6' },
      { label: '3.5 - 4.0 (Dean\'s List)', count: 0, color: '#10b981' },
    ];

    filteredStudents.forEach(s => {
      const g = s.academic.currentGPA;
      if (g < 2.0) buckets[0].count++;
      else if (g < 2.5) buckets[1].count++;
      else if (g < 3.0) buckets[2].count++;
      else if (g < 3.5) buckets[3].count++;
      else buckets[4].count++;
    });

    const maxCount = Math.max(1, ...buckets.map(b => b.count));
    return buckets.map(b => ({
      ...b,
      percentage: totalCount > 0 ? Math.round((b.count / totalCount) * 100) : 0,
      relativeHeight: Math.max(10, Math.round((b.count / maxCount) * 100))
    }));
  }, [filteredStudents, totalCount]);

  // Risk Breakdown Segments
  const riskBreakdown = useMemo(() => {
    let critical = 0;
    let high = 0;
    let moderate = 0;
    let low = 0;

    filteredStudents.forEach(s => {
      const r = s.predictions.riskLevel;
      if (r === 'critical') critical++;
      else if (r === 'high') high++;
      else if (r === 'moderate') moderate++;
      else low++;
    });

    return [
      { label: 'Performing Well / Low Risk', count: low, color: '#10b981', textColor: 'text-emerald-700 dark:text-emerald-400' },
      { label: 'Moderate Engagement', count: moderate, color: '#3b82f6', textColor: 'text-blue-700 dark:text-blue-400' },
      { label: 'High Risk Notice', count: high, color: '#f59e0b', textColor: 'text-amber-700 dark:text-amber-400' },
      { label: 'Critical Support Needed', count: critical, color: '#ef4444', textColor: 'text-red-700 dark:text-red-400' },
    ].map(item => ({
      ...item,
      pct: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0
    }));
  }, [filteredStudents, totalCount]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedDept('all');
    setSelectedSemester('all');
    setSelectedCourse('all');
    setSelectedAttendanceTier('all');
    setSelectedRiskTier('all');
    setSearchQuery('');
  };

  // CSV Export
  const handleExportCohortCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = ['StudentID', 'Name', 'Department', 'Semester', 'AttendanceRate', 'CurrentGPA', 'CumulativeGPA', 'WeeklyStudyHours', 'DropoutRiskScore', 'RiskLevel'];
    const rows = filteredStudents.map(s => [
      `"${s.studentId}"`,
      `"${s.name}"`,
      `"${s.department}"`,
      s.semester,
      s.attendance.overallRate,
      s.academic.currentGPA,
      s.academic.cumulativeGPA,
      s.lms.weeklyHours,
      s.predictions.dropoutRiskScore,
      `"${s.predictions.riskLevel}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Filtered_Student_Cohort_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`p-6 sm:p-7 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isAcademic
          ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
          : 'bg-[#0d1526] border-slate-800 text-slate-100 shadow-xl'
      }`}>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-amber-700 dark:text-amber-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Management Analytics & Multi-Filter Suite</span>
            <span>·</span>
            <span>Live Institutional Explorer</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display-academic mt-1">
            Student Performance & Retention Filter Studio
          </h1>
          <p className="text-xs text-slate-500 font-serif-academic italic mt-0.5">
            Cross-filter the student body by subjects, semesters, attendance brackets, and performance tiers with real-time synchronized charts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCohortCSV}
            disabled={totalCount === 0}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-2 border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Export Filtered Cohort ({totalCount})</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className={`p-5 rounded-2xl border space-y-4 shadow-xs transition-colors ${
        isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
      }`}>
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold font-display-academic uppercase tracking-wider text-slate-900 dark:text-white">
            <Filter className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Interactive Filter Controls</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-amber-700 dark:hover:text-amber-400 flex items-center gap-1 transition-colors font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 text-xs">
          {/* 1. Department */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Department / Major
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={`w-full rounded-lg p-2 font-mono text-xs focus:outline-none border ${
                isAcademic
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
              }`}
            >
              <option value="all">All Departments ({students.length})</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 2. Semester */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className={`w-full rounded-lg p-2 font-mono text-xs focus:outline-none border ${
                isAcademic
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
              }`}
            >
              <option value="all">All Semesters (1-8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={String(s)}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* 3. Subject / Course */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Subject / Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className={`w-full rounded-lg p-2 font-mono text-xs focus:outline-none border ${
                isAcademic
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
              }`}
            >
              <option value="all">All Enrolled Subjects</option>
              {allCourses.map(c => (
                <option key={c.code} value={c.code}>{c.code} - {c.name.slice(0, 20)}...</option>
              ))}
            </select>
          </div>

          {/* 4. Attendance Range */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Attendance Level
            </label>
            <select
              value={selectedAttendanceTier}
              onChange={(e) => setSelectedAttendanceTier(e.target.value)}
              className={`w-full rounded-lg p-2 font-mono text-xs focus:outline-none border ${
                isAcademic
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
              }`}
            >
              <option value="all">All Attendance Rates</option>
              <option value="critical">Critical (&lt; 60% Absenteeism)</option>
              <option value="warning">Warning (60% - 74% Policy Limit)</option>
              <option value="good">Good (75% - 84%)</option>
              <option value="excellent">Excellent (&ge; 85% Attendance)</option>
            </select>
          </div>

          {/* 5. Performance & Risk Tier */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Standing / Risk Tier
            </label>
            <select
              value={selectedRiskTier}
              onChange={(e) => setSelectedRiskTier(e.target.value)}
              className={`w-full rounded-lg p-2 font-mono text-xs focus:outline-none border ${
                isAcademic
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
              }`}
            >
              <option value="all">All Academic Standings</option>
              <option value="performing_well">Performing Well / Dean's List (GPA &ge; 3.5)</option>
              <option value="moderate">Moderate Standing (GPA 2.5 - 3.4)</option>
              <option value="high_risk">High Risk Notice (GPA 2.0 - 2.4)</option>
              <option value="critical_risk">Critical Risk / Intervention Needed</option>
            </select>
          </div>

          {/* 6. Search Input */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Student Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-lg py-2 pl-8 pr-2 font-mono text-xs focus:outline-none border ${
                  isAcademic
                    ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                    : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
                }`}
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className={`p-4 rounded-xl border space-y-1 ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase text-[10px]">Filtered Cohort</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {totalCount} <span className="text-xs text-slate-400 font-normal">/ {students.length}</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {totalCount > 0 ? `${Math.round((totalCount / students.length) * 100)}% of total students` : 'No matches'}
          </span>
        </div>

        <div className={`p-4 rounded-xl border space-y-1 ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase text-[10px]">Cohort Mean GPA</span>
            <Award className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400">
            {avgGPA} <span className="text-xs text-slate-400 font-normal">/ 4.0</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Current term average
          </span>
        </div>

        <div className={`p-4 rounded-xl border space-y-1 ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase text-[10px]">Average Attendance</span>
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className={`text-2xl font-bold font-mono ${
            avgAttendance >= 75
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
            {avgAttendance}%
          </div>
          <span className="text-[11px] text-slate-500">
            {avgAttendance >= 75 ? 'Above 75% policy limit' : 'Below 75% requirement'}
          </span>
        </div>

        <div className={`p-4 rounded-xl border space-y-1 ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase text-[10px]">Performing Well</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
            {performingWellCount}
          </div>
          <span className="text-[11px] text-slate-500">
            Dean's list / Top achievers
          </span>
        </div>

        <div className={`p-4 rounded-xl border space-y-1 col-span-2 lg:col-span-1 ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold uppercase text-[10px]">Action Needed</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
            {criticalSupportCount}
          </div>
          <span className="text-[11px] text-slate-500">
            Critical risk or attendance
          </span>
        </div>
      </div>

      {/* 3 PRIMARY VISUAL CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: GRADE & GPA DISTRIBUTION HISTOGRAM */}
        <div className={`p-5 rounded-2xl border space-y-4 shadow-xs transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-display-academic text-slate-900 dark:text-white">
                Grade & GPA Distribution
              </h3>
              <p className="text-[11px] text-slate-500">
                Number of scholars across GPA tiers
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-amber-600" />
          </div>

          <div className="space-y-3 pt-2">
            {gpaBuckets.map((bucket, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                    {bucket.label}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">
                    {bucket.count} <span className="text-slate-400 font-normal">({bucket.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${bucket.percentage}%`,
                      backgroundColor: bucket.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: ATTENDANCE VS GPA SCATTER PLOT MATRIX */}
        <div className={`p-5 rounded-2xl border space-y-4 shadow-xs transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-display-academic text-slate-900 dark:text-white">
                Attendance vs GPA Correlation
              </h3>
              <p className="text-[11px] text-slate-500">
                Interactive 2D quadrant scatter view
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="relative pt-2">
            {/* SVG 2D Scatter Plot */}
            <div className="w-full bg-slate-50 dark:bg-[#090f1d] rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              <svg viewBox="0 0 300 200" className="w-full h-44 select-none">
                {/* Quadrant Lines (75% Attendance, 2.5 GPA) */}
                <line x1="175" y1="15" x2="175" y2="175" stroke={isAcademic ? '#cbd5e1' : '#334155'} strokeWidth="1" strokeDasharray="3 3" />
                <line x1="30" y1="75" x2="285" y2="75" stroke={isAcademic ? '#cbd5e1' : '#334155'} strokeWidth="1" strokeDasharray="3 3" />

                {/* Quadrant Text Labels */}
                <text x="280" y="25" fill={isAcademic ? '#059669' : '#34d399'} fontSize="7" fontWeight="bold" textAnchor="end">HONORS / DEAN'S LIST</text>
                <text x="35" y="170" fill={isAcademic ? '#dc2626' : '#f87171'} fontSize="7" fontWeight="bold">AT-RISK / CRITICAL</text>
                <text x="280" y="170" fill={isAcademic ? '#d97706' : '#fbbf24'} fontSize="7" textAnchor="end">EXAM DISCREPANCY</text>
                <text x="35" y="25" fill={isAcademic ? '#64748b' : '#94a3b8'} fontSize="7">PASSIVE HIGH POTENTIAL</text>

                {/* Axes */}
                <line x1="30" y1="175" x2="285" y2="175" stroke={isAcademic ? '#94a3b8' : '#475569'} strokeWidth="1.5" />
                <line x1="30" y1="15" x2="30" y2="175" stroke={isAcademic ? '#94a3b8' : '#475569'} strokeWidth="1.5" />

                {/* X Axis Labels (Attendance 40% to 100%) */}
                <text x="30" y="188" fill={isAcademic ? '#64748b' : '#94a3b8'} fontSize="8" textAnchor="middle">40%</text>
                <text x="175" y="188" fill={isAcademic ? '#64748b' : '#94a3b8'} fontSize="8" textAnchor="middle">75% (Req)</text>
                <text x="285" y="188" fill={isAcademic ? '#64748b' : '#94a3b8'} fontSize="8" textAnchor="middle">100%</text>

                {/* Y Axis Labels (GPA 0.0 to 4.0) */}
                <text x="24" y="177" fill={isAcademic ? '#64748b' : '#94a3b8'} fontSize="8" textAnchor="end">0.0</text>
                <text x="24" y="78" fill={isAcademic ? '#64748b' : '#94a3b8'} fontSize="8" textAnchor="end">2.5</text>
                <text x="24" y="20" fill={isAcademic ? '#64748b' : '#94a3b8'} fontSize="8" textAnchor="end">4.0</text>

                {/* Student Scatter Dots */}
                {filteredStudents.map((s) => {
                  // Map Attendance 40% -> 100% to X (30 -> 285)
                  const clampedAtt = Math.max(40, Math.min(100, s.attendance.overallRate));
                  const cx = 30 + ((clampedAtt - 40) / 60) * 255;

                  // Map GPA 0.0 -> 4.0 to Y (175 -> 15)
                  const clampedGPA = Math.max(0, Math.min(4.0, s.academic.currentGPA));
                  const cy = 175 - (clampedGPA / 4.0) * 160;

                  const isCritical = s.predictions.riskLevel === 'critical' || clampedGPA < 2.0;
                  const isDeanList = clampedGPA >= 3.5 && clampedAtt >= 85;
                  const isHovered = hoveredScatterStudent?.id === s.id;

                  const dotColor = isCritical ? '#ef4444' : isDeanList ? '#10b981' : '#f59e0b';

                  return (
                    <circle
                      key={s.id}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : 4}
                      fill={dotColor}
                      stroke={isAcademic ? '#ffffff' : '#0d1526'}
                      strokeWidth={1.5}
                      className="cursor-pointer transition-all duration-150 hover:opacity-100 opacity-85"
                      onMouseEnter={() => setHoveredScatterStudent(s)}
                      onMouseLeave={() => setHoveredScatterStudent(null)}
                      onClick={() => onSelectStudent(s.id)}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Hover Tooltip Card */}
            {hoveredScatterStudent && (
              <div className={`mt-2 p-2.5 rounded-lg border text-xs flex items-center justify-between animate-fadeIn ${
                isAcademic ? 'bg-amber-50 border-amber-200 text-slate-900' : 'bg-slate-900 border-amber-800 text-white'
              }`}>
                <div>
                  <span className="font-bold">{hoveredScatterStudent.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 ml-2">({hoveredScatterStudent.department})</span>
                  <div className="text-[11px] font-mono text-amber-800 dark:text-amber-400">
                    GPA: {hoveredScatterStudent.academic.currentGPA.toFixed(2)} · Attendance: {hoveredScatterStudent.attendance.overallRate}%
                  </div>
                </div>
                <button
                  onClick={() => onSelectStudent(hoveredScatterStudent.id)}
                  className="px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white font-bold text-[10px] transition-colors"
                >
                  View
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CHART 3: RISK & RETENTION BREAKDOWN */}
        <div className={`p-5 rounded-2xl border space-y-4 shadow-xs transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold font-display-academic text-slate-900 dark:text-white">
                Cohort Risk Standing
              </h3>
              <p className="text-[11px] text-slate-500">
                Retention and early warning tier breakdown
              </p>
            </div>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>

          <div className="space-y-3.5 pt-2">
            {riskBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
                  </div>
                  <span className={`font-mono font-bold ${item.textColor}`}>
                    {item.count} <span className="text-slate-400 font-normal">({item.pct}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FILTERED STUDENT RESULTS ROSTER */}
      <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 shadow-xs transition-colors ${
        isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold font-display-academic text-slate-900 dark:text-white">
              Filtered Student Directory ({sortedStudents.length} Scholars)
            </h2>
            <p className="text-xs text-slate-500">
              Click any student row to open comprehensive academic dossier and intervention log
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <button
              onClick={() => {
                if (sortField === 'gpa') setSortAsc(!sortAsc);
                else { setSortField('gpa'); setSortAsc(false); }
              }}
              className={`px-2.5 py-1 rounded-lg border font-mono flex items-center gap-1 transition-colors ${
                sortField === 'gpa'
                  ? 'bg-amber-700 text-white border-amber-600 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>GPA</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>

            <button
              onClick={() => {
                if (sortField === 'attendance') setSortAsc(!sortAsc);
                else { setSortField('attendance'); setSortAsc(false); }
              }}
              className={`px-2.5 py-1 rounded-lg border font-mono flex items-center gap-1 transition-colors ${
                sortField === 'attendance'
                  ? 'bg-amber-700 text-white border-amber-600 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Attendance</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>

            <button
              onClick={() => {
                if (sortField === 'risk') setSortAsc(!sortAsc);
                else { setSortField('risk'); setSortAsc(false); }
              }}
              className={`px-2.5 py-1 rounded-lg border font-mono flex items-center gap-1 transition-colors ${
                sortField === 'risk'
                  ? 'bg-amber-700 text-white border-amber-600 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span>Risk Score</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          {sortedStudents.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="font-bold text-sm text-slate-700 dark:text-slate-300">
                No students match your filter criteria
              </div>
              <p className="text-xs text-slate-500">
                Try loosening your attendance or risk tier filters to view students.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-3.5 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b text-[10px] uppercase ${
                  isAcademic ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
                }`}>
                  <th className="pb-2.5 font-bold">Student Name & ID</th>
                  <th className="pb-2.5 font-bold">Department</th>
                  <th className="pb-2.5 text-center font-bold">Semester</th>
                  <th className="pb-2.5 text-center font-bold">Attendance %</th>
                  <th className="pb-2.5 text-center font-bold">Current GPA</th>
                  <th className="pb-2.5 text-center font-bold">Risk Status</th>
                  <th className="pb-2.5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-[11px] ${
                isAcademic ? 'divide-slate-100' : 'divide-slate-800'
              }`}>
                {sortedStudents.map((s) => {
                  const isCritical = s.predictions.riskLevel === 'critical' || s.academic.currentGPA < 2.0;
                  const isDeanList = s.academic.currentGPA >= 3.5 && s.attendance.overallRate >= 85;

                  return (
                    <tr
                      key={s.id}
                      onClick={() => onSelectStudent(s.id)}
                      className={`cursor-pointer transition-colors ${
                        isAcademic ? 'hover:bg-slate-50' : 'hover:bg-[#131e33]'
                      }`}
                    >
                      <td className="py-3 flex items-center gap-3">
                        <div>
                          <div className={`font-bold font-sans ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
                            {s.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {s.studentId}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-slate-700 dark:text-slate-300">
                        {s.department}
                      </td>

                      <td className="py-3 text-center text-slate-600 dark:text-slate-400">
                        Sem {s.semester}
                      </td>

                      <td className={`py-3 text-center font-bold ${
                        s.attendance.overallRate < 75
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {s.attendance.overallRate}%
                      </td>

                      <td className={`py-3 text-center font-bold ${
                        s.academic.currentGPA >= 3.5
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : s.academic.currentGPA < 2.0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}>
                        {s.academic.currentGPA.toFixed(2)}
                      </td>

                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          isCritical
                            ? isAcademic ? 'bg-red-50 text-red-800 border-red-200' : 'bg-red-950/80 text-red-300 border-red-800'
                            : isDeanList
                            ? isAcademic ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : isAcademic ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-950/80 text-amber-300 border-amber-800'
                        }`}>
                          {isDeanList ? 'Dean\'s List' : s.predictions.riskLevel}
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStudent(s.id);
                          }}
                          className="px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white font-bold text-[10px] inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
