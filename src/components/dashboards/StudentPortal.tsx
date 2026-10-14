import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Send,
  X
} from 'lucide-react';
import { Student, ThemeMode } from '../../types';
import { StudentProgressCharts } from '../students/StudentProgressCharts';

interface StudentPortalProps {
  student: Student;
  onRequestHelp: (subject: string, message: string) => void;
  theme: ThemeMode;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ student, onRequestHelp, theme }) => {
  const isAcademic = theme === 'academic';
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpSubject, setHelpSubject] = useState('Academic Advising / Final Project Review');
  const [helpMessage, setHelpMessage] = useState('');
  const [submittedHelp, setSubmittedHelp] = useState(false);

  // Safe absence calculations
  const totalClasses = student.attendance.totalClasses || 48;
  const maxAllowedAbsences = Math.floor(totalClasses * 0.25);
  const remainingSafeAbsences = Math.max(0, maxAllowedAbsences - student.attendance.absentDays);

  const handleSubmitHelp = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestHelp(helpSubject, helpMessage);
    setSubmittedHelp(true);
    setTimeout(() => {
      setSubmittedHelp(false);
      setHelpModalOpen(false);
      setHelpMessage('');
    }, 1800);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Student Profile Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isAcademic
          ? 'bg-white border-slate-200 shadow-xs text-slate-900'
          : 'bg-[#0d1526] border-slate-800 shadow-xl text-slate-100'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-display-academic">{student.name}</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                  {student.studentId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {student.program} · Semester {student.semester} ({student.cohort})
              </p>
            </div>
          </div>

          <button
            onClick={() => setHelpModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Request Academic Advising</span>
          </button>
        </div>
      </div>

      {/* Visual Progress & Trajectory Charts */}
      <StudentProgressCharts student={student} theme={theme} />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Cumulative GPA</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-mono mt-1">{student.academic.cumulativeGPA.toFixed(2)}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Current Term GPA: {student.academic.currentGPA.toFixed(2)}
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Attendance Rate</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-mono mt-1">{student.attendance.overallRate}%</div>
          <div className="text-xs text-slate-400 mt-1">{remainingSafeAbsences} allowed absences remaining</div>
        </div>

        <div className={`p-5 rounded-2xl border ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>LMS Engagement</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold font-mono mt-1">{student.lms.weeklyHours}h/wk</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Video completion: {student.lms.videoCompletionRate}%
          </div>
        </div>
      </div>

      {/* Enrolled Courses Schedule */}
      <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
        isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
      }`}>
        <h2 className="text-base font-bold font-display-academic pb-3 border-b border-slate-100 dark:border-slate-800">
          Enrolled Course Performance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {student.currentCourses.map((c, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <div className="font-bold text-sm">{c.code}: {c.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">Attendance: {c.attendance}%</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400">
                  Grade {c.gradeCurrent}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advising Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 ${
            isAcademic ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base">Request Academic Advising</h3>
              <button onClick={() => setHelpModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submittedHelp ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <div className="font-bold text-sm">Advising Request Sent</div>
                <div className="text-xs text-slate-500">Your professor and academic advisor have been notified.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmitHelp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    value={helpSubject}
                    onChange={e => setHelpSubject(e.target.value)}
                    className="w-full p-2 rounded-xl text-xs border focus:outline-none dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Message for Advisor</label>
                  <textarea
                    rows={3}
                    value={helpMessage}
                    onChange={e => setHelpMessage(e.target.value)}
                    placeholder="Describe what you would like guidance on..."
                    className="w-full p-2 rounded-xl text-xs border focus:outline-none dark:bg-slate-950"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setHelpModalOpen(false)}
                    className="px-4 py-2 rounded-xl border text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
