import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Clock,
  Send,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  Search,
  Filter,
  ArrowRight,
  ChevronDown,
  X
} from 'lucide-react';
import { Student, Course, Intervention, ThemeMode } from '../../types';

interface FacultyDashboardProps {
  students: Student[];
  courses: Course[];
  onSelectStudent: (studentId: string) => void;
  onAddIntervention: (studentId: string, intervention: Omit<Intervention, 'id' | 'timestamp'>) => void;
  theme: ThemeMode;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  students,
  courses,
  onSelectStudent,
  onAddIntervention,
  theme
}) => {
  const isAcademic = theme === 'academic';
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('CS-401');
  const [riskFilter, setRiskFilter] = useState<'all' | 'critical' | 'high' | 'moderate' | 'low'>('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [interventionModalStudent, setInterventionModalStudent] = useState<Student | null>(null);

  // Intervention modal form state
  const [interventionType, setInterventionType] = useState<Intervention['type']>('academic_counseling');
  const [interventionNotes, setInterventionNotes] = useState('');
  const [interventionCounselor, setInterventionCounselor] = useState('Prof. Marcus Vance');

  const activeCourse = courses.find(c => c.code === selectedCourseCode) || courses[0];

  const enrolledStudents = students.filter(s =>
    s.currentCourses.some(c => c.code === activeCourse.code)
  );

  const filteredStudents = enrolledStudents.filter(s => {
    const matchesRisk = riskFilter === 'all' || s.predictions.riskLevel === riskFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      s.studentId.toLowerCase().includes(filterSearch.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const criticalCount = enrolledStudents.filter(
    s => s.predictions.riskLevel === 'critical' || s.predictions.riskLevel === 'high'
  ).length;

  const avgAttendance = enrolledStudents.length > 0
    ? Math.round(enrolledStudents.reduce((acc, s) => acc + s.attendance.overallRate, 0) / enrolledStudents.length)
    : 0;

  const avgMidterm = enrolledStudents.length > 0
    ? Math.round(enrolledStudents.reduce((acc, s) => acc + s.academic.midtermsAverage, 0) / enrolledStudents.length)
    : 0;

  const handleCreateIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interventionModalStudent) return;

    onAddIntervention(interventionModalStudent.id, {
      studentId: interventionModalStudent.studentId,
      studentName: interventionModalStudent.name,
      counselor: interventionCounselor,
      type: interventionType,
      notes: interventionNotes || 'Faculty academic advising session conducted.',
      outcomeStatus: 'in_progress',
      followUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    });

    setInterventionModalStudent(null);
    setInterventionNotes('');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Course Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isAcademic
          ? 'bg-white border-slate-200 shadow-xs text-slate-900'
          : 'bg-[#0d1526] border-slate-800 shadow-xl text-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <span>Faculty Course Workspace</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>Prof. Marcus Vance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display-academic font-bold tracking-tight mt-1">
              {activeCourse.code}: {activeCourse.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {activeCourse.department} Department · Fall Semester 2026 · {enrolledStudents.length} Students Enrolled
            </p>
          </div>

          {/* Course Selector Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
            <label htmlFor="course-select" className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Active Course:</span>
            </label>
            <div className="relative min-w-[280px] sm:min-w-[340px]">
              <select
                id="course-select"
                value={selectedCourseCode}
                onChange={(e) => setSelectedCourseCode(e.target.value)}
                className={`w-full rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-bold transition-all border appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer ${
                  isAcademic
                    ? 'bg-amber-50/80 hover:bg-amber-100/80 text-amber-950 border-amber-300'
                    : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-200 border-amber-800'
                }`}
              >
                {courses.map(c => (
                  <option
                    key={c.code}
                    value={c.code}
                    className={isAcademic ? 'bg-white text-slate-900 font-medium' : 'bg-slate-900 text-slate-100 font-medium'}
                  >
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-amber-700 dark:text-amber-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="text-xs text-slate-500 font-medium">Enrolled Roster</div>
          <div className="text-3xl font-bold font-mono mt-1">{enrolledStudents.length} Scholars</div>
          <div className="text-xs text-slate-400 mt-1">Capacity: {activeCourse.capacity} seats</div>
        </div>

        <div className={`p-5 rounded-2xl border ${
          criticalCount > 0
            ? isAcademic ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-950/20 border-amber-900/60'
            : isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="text-xs font-semibold text-amber-800 dark:text-amber-400">At-Risk Scholars</div>
          <div className="text-3xl font-bold font-mono text-amber-900 dark:text-amber-300 mt-1">
            {criticalCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Requires advising outreach</div>
        </div>

        <div className={`p-5 rounded-2xl border ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="text-xs text-slate-500 font-medium">Average Attendance Rate</div>
          <div className="text-3xl font-bold font-mono mt-1">{avgAttendance}%</div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Class Average Midterm: {avgMidterm}%</div>
        </div>
      </div>

      {/* Course Roster & Interventions Table */}
      <div className={`p-5 sm:p-6 rounded-2xl border space-y-4 ${
        isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold font-display-academic">Course Student Roster</h2>
            <p className="text-xs text-slate-500">Monitor attendance, midterm grades, and schedule guidance</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                placeholder="Search scholar name..."
                className={`pl-9 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none ${
                  isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b text-[10px] font-mono uppercase text-slate-500 ${
                isAcademic ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/60'
              }`}>
                <th className="p-3">Scholar</th>
                <th className="p-3">Midterm Grade</th>
                <th className="p-3">Attendance</th>
                <th className="p-3">LMS Weekly Hours</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-xs">{s.name}</div>
                    <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400">{s.studentId}</div>
                  </td>
                  <td className="p-3 font-mono font-bold">{s.academic.midtermsAverage}%</td>
                  <td className="p-3 font-mono font-bold">{s.attendance.overallRate}%</td>
                  <td className="p-3 font-mono">{s.lms.weeklyHours}h/wk</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      s.predictions.riskLevel === 'critical'
                        ? isAcademic ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-950/80 text-red-300 border-red-800'
                        : s.predictions.riskLevel === 'high'
                        ? isAcademic ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-950/80 text-amber-300 border-amber-800'
                        : isAcademic ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    }`}>
                      {s.predictions.riskLevel}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setInterventionModalStudent(s)}
                      className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold transition-colors"
                    >
                      Log Advising
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intervention Advising Modal */}
      {interventionModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-4 ${
            isAcademic ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-base">Log Advising Session</h3>
              <button onClick={() => setInterventionModalStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Student: <span className="font-bold text-slate-800 dark:text-slate-200">{interventionModalStudent.name}</span> ({interventionModalStudent.studentId})
            </div>

            <form onSubmit={handleCreateIntervention} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Intervention Type</label>
                <select
                  value={interventionType}
                  onChange={e => setInterventionType(e.target.value as any)}
                  className="w-full p-2 rounded-xl text-xs border focus:outline-none dark:bg-slate-950"
                >
                  <option value="academic_counseling">Academic Counseling</option>
                  <option value="peer_tutoring">Peer Tutoring Assignment</option>
                  <option value="attendance_warning">Attendance Notice</option>
                  <option value="faculty_mentoring">Faculty Mentoring</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Session Notes</label>
                <textarea
                  rows={3}
                  value={interventionNotes}
                  onChange={e => setInterventionNotes(e.target.value)}
                  placeholder="Record key advising notes and recommendations..."
                  className="w-full p-2 rounded-xl text-xs border focus:outline-none dark:bg-slate-950"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInterventionModalStudent(null)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold"
                >
                  Save Advising Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
