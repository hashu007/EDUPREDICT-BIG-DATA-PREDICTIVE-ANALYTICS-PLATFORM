import React, { useState } from 'react';
import {
  Student,
  Intervention,
  ThemeMode
} from '../../types';
import {
  X,
  AlertTriangle,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Send,
  BookOpen,
  FileCode,
  Copy,
  Download,
  SlidersHorizontal,
  Save,
  Edit3
} from 'lucide-react';
import { dataService } from '../../services/dataService';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
  onAddIntervention: (studentId: string, intervention: Omit<Intervention, 'id' | 'timestamp'>) => void;
  theme?: ThemeMode;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onAddIntervention,
  theme = 'hadoop'
}) => {
  const isAcademic = theme === 'academic';
  const [showInterventionForm, setShowInterventionForm] = useState(false);
  const [interventionType, setInterventionType] = useState<Intervention['type']>('academic_counseling');
  const [notes, setNotes] = useState('');
  const [counselor, setCounselor] = useState('Dr. Sarah Mitchell');
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Management Metric Editing State
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [editAttendanceRate, setEditAttendanceRate] = useState(student.attendance.overallRate);
  const [editAbsentDays, setEditAbsentDays] = useState(student.attendance.absentDays);
  const [editGPA, setEditGPA] = useState(student.academic.currentGPA);
  const [editMidtermsAverage, setEditMidtermsAverage] = useState(student.academic.midtermsAverage);
  const [editWeeklyHours, setEditWeeklyHours] = useState(student.lms.weeklyHours);
  const [editOnTimeRate, setEditOnTimeRate] = useState(student.lms.assignmentSubmissionOnTimeRate);
  const [editSavedSuccess, setEditSavedSuccess] = useState(false);

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.updateStudentMetrics(student.id, {
      attendanceRate: Number(editAttendanceRate),
      absentDays: Number(editAbsentDays),
      currentGPA: Number(editGPA),
      midtermsAverage: Number(editMidtermsAverage),
      weeklyHours: Number(editWeeklyHours),
      assignmentSubmissionOnTimeRate: Number(editOnTimeRate)
    });
    setEditSavedSuccess(true);
    setTimeout(() => {
      setEditSavedSuccess(false);
      setIsEditingMetrics(false);
    }, 1200);
  };

  // Strictly adhere to mandated JSON schema:
  // "High" | "Medium" | "Low"
  const mappedRiskLevel =
    student.predictions.riskLevel === 'critical' || student.predictions.riskLevel === 'high'
      ? 'High'
      : student.predictions.riskLevel === 'moderate'
      ? 'Medium'
      : 'Low';

  const structuredAnalyticsJson = {
    student_id: student.studentId,
    risk_level: mappedRiskLevel,
    predicted_performance: `Projected GPA ${student.predictions.predictedGPA.toFixed(2)} (${student.predictions.clusterName})`,
    dropout_probability_percentage: Number(student.predictions.dropoutRiskScore.toFixed(2)),
    detected_anomalies: student.predictions.anomalyDetected && student.predictions.anomalyReason
      ? [student.predictions.anomalyReason]
      : [],
    recommended_interventions: student.predictions.riskKeyFactors
      .filter(f => f.impact === 'negative')
      .map(f => `Address ${f.factor.toLowerCase()}: ${f.description}`)
      .concat(
        mappedRiskLevel === 'High'
          ? ['Mandatory bi-weekly academic counseling check-in', 'Attendance recovery contract']
          : mappedRiskLevel === 'Medium'
          ? ['Attend faculty office hours and weekly study groups']
          : ['Nominated for Honors Research & Departmental Fellowship']
      )
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(structuredAnalyticsJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(structuredAnalyticsJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edupredict_${student.studentId}_analytics.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    onAddIntervention(student.id, {
      studentId: student.studentId,
      studentName: student.name,
      counselor,
      type: interventionType,
      notes,
      outcomeStatus: 'in_progress',
      followUpDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    });
    setNotes('');
    setShowInterventionForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className={`w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden my-4 sm:my-8 transition-colors ${
        isAcademic
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0d1526] border-slate-800 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
        }`}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className={`text-base sm:text-xl font-bold font-display-academic truncate ${
                  isAcademic ? 'text-slate-900' : 'text-white'
                }`}>
                  {student.name}
                </h2>
                <span className={`text-[10px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 rounded font-bold border ${
                  isAcademic
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  {student.studentId}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className={`text-[11px] sm:text-xs font-mono ${isAcademic ? 'text-slate-600' : 'text-slate-300'}`}>
                  Sem {student.semester}
                </span>
              </div>
              <div className={`text-xs mt-0.5 font-serif-academic italic truncate ${
                isAcademic ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {student.program} · {student.department}
              </div>
              <div className={`text-[10px] sm:text-[11px] mt-1 flex flex-wrap items-center gap-2 ${
                isAcademic ? 'text-slate-500' : 'text-slate-400'
              }`}>
                <span>Cohort: {student.cohort}</span>
                <span>·</span>
                <span>Financial Aid: {student.demographics.financialAidStatus}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`self-end sm:self-auto p-1.5 sm:p-2 rounded-lg border transition-colors ${
              isAcademic
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto text-xs">
          {/* Management Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">
              Academic Dossier & Diagnostic Hub
            </span>

            <button
              onClick={() => setIsEditingMetrics(!isEditingMetrics)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isEditingMetrics
                  ? 'bg-amber-700 text-white border-amber-600 shadow-2xs'
                  : isAcademic
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isEditingMetrics ? 'Close Record Editor' : 'Update Attendance & Marks'}</span>
            </button>
          </div>

          {/* Interactive Metric Editor Panel (When Activated) */}
          {isEditingMetrics && (
            <form
              onSubmit={handleSaveMetrics}
              className={`p-4 rounded-xl border space-y-4 animate-fadeIn ${
                isAcademic
                  ? 'bg-amber-50/70 border-amber-300 text-slate-900'
                  : 'bg-[#101b33] border-amber-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-amber-200 dark:border-amber-800/80">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span className="font-bold font-display-academic text-sm">
                    Faculty & Administration Record Update
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Updates immediately re-train ML dropout forecast
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* 1. Attendance Rate */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span>Attendance Rate (%)</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{editAttendanceRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={editAttendanceRate}
                    onChange={e => setEditAttendanceRate(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>

                {/* 2. Absent Days */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold block">Total Absences (Days)</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={editAbsentDays}
                    onChange={e => setEditAbsentDays(Number(e.target.value))}
                    className={`w-full p-2 rounded-lg font-mono text-xs border focus:outline-none ${
                      isAcademic ? 'bg-white border-slate-300' : 'bg-[#090f1d] border-slate-700'
                    }`}
                  />
                </div>

                {/* 3. Current GPA */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold block">Current Term GPA (0.0 - 4.0)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.0"
                    max="4.0"
                    value={editGPA}
                    onChange={e => setEditGPA(Number(e.target.value))}
                    className={`w-full p-2 rounded-lg font-mono text-xs border focus:outline-none ${
                      isAcademic ? 'bg-white border-slate-300' : 'bg-[#090f1d] border-slate-700'
                    }`}
                  />
                </div>

                {/* 4. Midterms Average */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold block">Midterms Average (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editMidtermsAverage}
                    onChange={e => setEditMidtermsAverage(Number(e.target.value))}
                    className={`w-full p-2 rounded-lg font-mono text-xs border focus:outline-none ${
                      isAcademic ? 'bg-white border-slate-300' : 'bg-[#090f1d] border-slate-700'
                    }`}
                  />
                </div>

                {/* 5. LMS Weekly Hours */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold block">LMS Study Hours / Week</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={editWeeklyHours}
                    onChange={e => setEditWeeklyHours(Number(e.target.value))}
                    className={`w-full p-2 rounded-lg font-mono text-xs border focus:outline-none ${
                      isAcademic ? 'bg-white border-slate-300' : 'bg-[#090f1d] border-slate-700'
                    }`}
                  />
                </div>

                {/* 6. On-time submission */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold block">Assignment On-Time Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editOnTimeRate}
                    onChange={e => setEditOnTimeRate(Number(e.target.value))}
                    className={`w-full p-2 rounded-lg font-mono text-xs border focus:outline-none ${
                      isAcademic ? 'bg-white border-slate-300' : 'bg-[#090f1d] border-slate-700'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-amber-200 dark:border-amber-800/80">
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  {editSavedSuccess ? '✓ Records Saved & Forecast Updated!' : ''}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingMetrics(false)}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Recalculate ML Risk</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {student.predictions.anomalyDetected && (
            <div className={`p-3.5 rounded-lg border flex items-start gap-3 ${
              isAcademic
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-amber-950/40 border-amber-900 text-amber-300'
            }`}>
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs">Statistical Anomaly Flagged</div>
                <div className="text-[11px] mt-0.5 opacity-90">
                  {student.predictions.anomalyReason}
                </div>
              </div>
            </div>
          )}

          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-slate-500' : 'text-slate-400'
              }`}>Dropout Risk Score</span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-xl sm:text-2xl font-bold font-mono ${
                    student.predictions.dropoutRiskScore >= 70
                      ? isAcademic ? 'text-red-700' : 'text-red-400'
                      : student.predictions.dropoutRiskScore >= 40
                      ? isAcademic ? 'text-amber-700' : 'text-amber-400'
                      : isAcademic ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                >
                  {student.predictions.dropoutRiskScore}%
                </span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-bold border ${
                  student.predictions.riskLevel === 'critical'
                    ? isAcademic ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/80 text-red-300 border-red-800'
                    : student.predictions.riskLevel === 'high'
                    ? isAcademic ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/80 text-amber-300 border-amber-800'
                    : isAcademic ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                }`}>
                  {student.predictions.riskLevel}
                </span>
              </div>
              <div className={`text-[10px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                Graduation: {student.predictions.predictedGraduationRate}%
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-slate-500' : 'text-slate-400'
              }`}>Attendance Rate</span>
              <div className={`text-xl sm:text-2xl font-bold font-mono ${
                student.attendance.overallRate < 75
                  ? isAcademic ? 'text-red-700' : 'text-red-400'
                  : isAcademic ? 'text-slate-900' : 'text-white'
              }`}>
                {student.attendance.overallRate}%
              </div>
              <div className={`text-[10px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                {student.attendance.absentDays} unexcused absences
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-slate-500' : 'text-slate-400'
              }`}>Projected GPA</span>
              <div className={`text-xl sm:text-2xl font-bold font-mono ${
                isAcademic ? 'text-slate-900' : 'text-white'
              }`}>
                {student.predictions.predictedGPA}
              </div>
              <div className={`text-[10px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                Current: {student.academic.currentGPA} / 4.0
              </div>
            </div>

            <div className={`p-3.5 rounded-xl border space-y-1 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-slate-500' : 'text-slate-400'
              }`}>K-Means Cluster</span>
              <div className={`text-xs font-bold font-serif-academic italic mt-1 truncate ${
                isAcademic ? 'text-slate-800' : 'text-amber-300'
              }`}>
                {student.predictions.clusterName}
              </div>
              <div className={`text-[10px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                Distance: {student.predictions.clusterDistance}
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
          }`}>
            <h4 className={`text-xs font-bold font-display-academic uppercase tracking-wider ${
              isAcademic ? 'text-slate-900' : 'text-white'
            }`}>
              Model Factor Decomposition (Risk Influences)
            </h4>
            <div className="space-y-2">
              {student.predictions.riskKeyFactors.map((f, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-lg border flex items-start justify-between gap-3 ${
                    f.impact === 'negative'
                      ? isAcademic
                        ? 'bg-red-50/60 border-red-200 text-red-900'
                        : 'bg-red-950/40 border-red-900 text-red-300'
                      : isAcademic
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-emerald-950/40 border-emerald-900 text-emerald-300'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      {f.impact === 'negative' ? (
                        <TrendingDown className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                      <span className="truncate">{f.factor}</span>
                    </div>
                    <p className={`text-[11px] ${isAcademic ? 'text-slate-600' : 'text-slate-400'}`}>
                      {f.description}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold shrink-0 ${
                      f.impact === 'negative'
                        ? isAcademic ? 'text-red-700' : 'text-red-400'
                        : isAcademic ? 'text-emerald-700' : 'text-emerald-400'
                    }`}
                  >
                    {f.impact === 'negative' ? `+${f.weight}% Risk` : `-${f.weight}% Risk`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 8-Week Trend */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`font-semibold text-xs ${isAcademic ? 'text-slate-800' : 'text-white'}`}>
                8-Week Lecture Attendance History
              </span>
              <span className={`font-mono text-[11px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                Trend: {student.attendance.trend.toUpperCase()}
              </span>
            </div>
            <div className="flex items-end gap-2 h-16 pt-2">
              {student.attendance.weeklyAttendanceHistory.map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t ${
                      val >= 75 ? 'bg-amber-600' : 'bg-red-600'
                    }`}
                    style={{ height: `${(val / 100) * 48}px` }}
                  />
                  <span className={`text-[9px] font-mono ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                    W{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interventions */}
          <div className={`p-4 rounded-xl border space-y-3 ${
            isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className={`text-xs font-bold font-display-academic uppercase tracking-wider ${
                isAcademic ? 'text-slate-900' : 'text-white'
              }`}>
                Logged Interventions ({student.interventions.length})
              </h4>
              <button
                onClick={() => setShowInterventionForm(!showInterventionForm)}
                className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{showInterventionForm ? 'Close Form' : 'Log New Intervention'}</span>
              </button>
            </div>

            {showInterventionForm && (
              <form
                onSubmit={handleSaveIntervention}
                className={`p-4 rounded-xl border space-y-3 shadow-xs ${
                  isAcademic ? 'bg-white border-slate-300' : 'bg-[#090f1d] border-slate-700'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className={`text-[11px] font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                      Intervention Type
                    </label>
                    <select
                      value={interventionType}
                      onChange={(e) => setInterventionType(e.target.value as any)}
                      className={`w-full rounded-lg p-2 text-xs font-medium border ${
                        isAcademic
                          ? 'bg-slate-50 border-slate-300 text-slate-800'
                          : 'bg-[#121c32] border-slate-700 text-slate-100'
                      }`}
                    >
                      <option value="academic_counseling">Academic Counseling</option>
                      <option value="peer_tutoring">Peer Tutoring Lab</option>
                      <option value="attendance_warning">Formal Attendance Warning</option>
                      <option value="faculty_mentoring">Faculty Mentoring</option>
                      <option value="financial_support">Financial Hardship Aid</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className={`text-[11px] font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                      Counselor / Faculty Lead
                    </label>
                    <input
                      type="text"
                      value={counselor}
                      onChange={(e) => setCounselor(e.target.value)}
                      className={`w-full rounded-lg p-2 text-xs font-medium border ${
                        isAcademic
                          ? 'bg-slate-50 border-slate-300 text-slate-800'
                          : 'bg-[#121c32] border-slate-700 text-slate-100'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-[11px] font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                    Remedial Action Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Agreed corrective plan..."
                    className={`w-full rounded-lg p-2 text-xs border ${
                      isAcademic
                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                        : 'bg-[#121c32] border-slate-700 text-slate-100'
                    }`}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save & Update Risk Trajectory</span>
                  </button>
                </div>
              </form>
            )}

            {student.interventions.length === 0 ? (
              <div className={`text-center py-4 text-xs ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                No formal interventions recorded for this candidate.
              </div>
            ) : (
              <div className="space-y-2">
                {student.interventions.map((inv) => (
                  <div
                    key={inv.id}
                    className={`p-3 rounded-xl border space-y-1 shadow-2xs ${
                      isAcademic ? 'bg-white border-slate-200' : 'bg-[#090f1d] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-bold uppercase font-mono text-[10px] ${
                        isAcademic ? 'text-slate-800' : 'text-slate-200'
                      }`}>
                        {inv.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">{inv.timestamp}</span>
                    </div>
                    <p className={`text-[11px] ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                      {inv.notes}
                    </p>
                    <div className={`flex items-center justify-between text-[10px] pt-1 ${
                      isAcademic ? 'text-slate-500' : 'text-slate-400'
                    }`}>
                      <span>Recorded by: {inv.counselor}</span>
                      <span className="text-emerald-500 font-bold uppercase">{inv.outcomeStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
        }`}>
          <button
            onClick={() => setShowJsonModal(true)}
            className={`w-full sm:w-auto px-3.5 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors border shadow-2xs ${
              isAcademic
                ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-amber-950/80 hover:bg-amber-900 border-amber-800 text-amber-300'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Export Structured JSON (API Schema)</span>
          </button>

          <button
            onClick={onClose}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-xs border transition-colors ${
              isAcademic
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            Close Dossier
          </button>
        </div>
      </div>

      {/* Structured Schema JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-4 sm:p-5 space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs uppercase font-bold text-amber-300">
                  Mandated JSON Predictive Output Schema
                </span>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Strictly adheres to the production inference payload specifications:
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-200 overflow-x-auto max-h-72">
              <pre>{JSON.stringify(structuredAnalyticsJson, null, 2)}</pre>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] font-mono text-slate-400">
                {copied ? '✓ Copied to clipboard!' : 'Valid RFC-8259 JSON'}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyJson}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
