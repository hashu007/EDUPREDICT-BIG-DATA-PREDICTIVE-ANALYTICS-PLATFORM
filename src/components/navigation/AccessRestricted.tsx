import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, FileWarning } from 'lucide-react';
import { UserRole, ThemeMode } from '../../types';
import { NavTab } from './Sidebar';

interface AccessRestrictedProps {
  userRole: UserRole;
  attemptedTab: NavTab;
  onReturn: () => void;
  theme: ThemeMode;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({
  userRole,
  attemptedTab,
  onReturn,
  theme
}) => {
  const isAcademic = theme === 'academic';

  const tabLabels: Record<NavTab, string> = {
    overview: 'Portal Dashboard',
    students: 'Student Cohort Directory',
    management_analytics: 'Multi-Filter Analytics Studio',
    hdfs: 'Campus Cloud Storage Vaults',
    mapreduce: 'Data Processing Engine & Report Generator',
    analytics: 'Grade & Retention Predictor Lab',
    impala: 'Student Record Search & Query Tool',
    alerts: 'Institutional Early Warning Alerts Hub',
    documentation: 'System Guide & Explanations',
    support: 'Support & Advising Desk'
  };

  const roleNames: Record<UserRole, string> = {
    student: 'Student',
    faculty: 'Academic Faculty & Course Instructor',
    admin: 'Institutional Administrator & Dean',
    analyst: 'Data & Academic Analyst'
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 sm:p-8">
      <div
        className={`max-w-lg w-full rounded-2xl border p-8 text-center space-y-5 shadow-xl transition-all ${
          isAcademic
            ? 'bg-white border-red-200'
            : 'bg-slate-900 border-red-900/60'
        }`}
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 font-mono text-[10px] uppercase font-bold border border-red-300 dark:border-red-800">
            <Lock className="w-3 h-3" />
            <span>403 Access Notice · Privacy Protection</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display-academic font-bold text-slate-900 dark:text-white">
            Access Restricted for {roleNames[userRole]}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-serif-academic italic leading-relaxed">
            You do not possess the required permissions to access{' '}
            <strong className="text-slate-900 dark:text-slate-200 font-sans font-semibold">
              {tabLabels[attemptedTab] || attemptedTab}
            </strong>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 font-mono">
          <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
            <FileWarning className="w-3.5 h-3.5 text-amber-500" />
            <span>Student Privacy & Governance Policy</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
            {userRole === 'student' &&
              'Students are strictly restricted from accessing peer records, other students’ grades, and central system drives in compliance with student privacy statutes.'}
            {userRole === 'faculty' &&
              'Course instructors are granted access to enrolled cohort rosters and grading curves; central storage administration and data processing tools are reserved for System Administrators.'}
            {userRole === 'admin' &&
              'Administrative personnel possess institutional governance clearance; technical low-level SQL and model retraining are scoped to Data Science Analysts.'}
            {userRole === 'analyst' &&
              'Data Analysts are granted analytical and prediction simulator access.'}
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={onReturn}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-xs flex items-center justify-center gap-2 mx-auto transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to My Authorized Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
