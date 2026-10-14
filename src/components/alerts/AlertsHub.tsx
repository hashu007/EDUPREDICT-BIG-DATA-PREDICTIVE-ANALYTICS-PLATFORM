import React, { useState } from 'react';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
  Sliders,
  Check
} from 'lucide-react';
import { Alert, ThemeMode } from '../../types';

interface AlertsHubProps {
  alerts: Alert[];
  onUpdateStatus: (alertId: string, status: Alert['status'], assignee?: string) => void;
  onDismissAlert: (alertId: string) => void;
  onSelectStudent: (studentId: string) => void;
  theme?: ThemeMode;
}

export const AlertsHub: React.FC<AlertsHubProps> = ({
  alerts,
  onUpdateStatus,
  onDismissAlert,
  onSelectStudent,
  theme = 'hadoop'
}) => {
  const isAcademic = theme === 'academic';
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'acknowledged' | 'resolved'>('all');
  const [showConfig, setShowConfig] = useState(false);

  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [riskThreshold, setRiskThreshold] = useState(65);
  const [absenceThreshold, setAbsenceThreshold] = useState(3);
  const [savedRules, setSavedRules] = useState(false);

  const filtered = alerts.filter(a => {
    const matchesSev = filterSeverity === 'all' || a.severity === filterSeverity;
    const matchesStat = filterStatus === 'all' || a.status === filterStatus;
    return matchesSev && matchesStat;
  });

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedRules(true);
    setTimeout(() => {
      setSavedRules(false);
      setShowConfig(false);
    }, 1200);
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
            <span>Automated Academic Early Warning System</span>
            <span className={isAcademic ? 'text-slate-300' : 'text-slate-600'}>·</span>
            <span>Real-Time Alert Dispatcher</span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-display-academic font-bold mt-1 ${
            isAcademic ? 'text-slate-900' : 'text-white'
          }`}>
            Early Warning Academic Alerts & Intervention Triggers
          </h1>
          <p className={`text-xs font-serif-academic italic mt-0.5 ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Automated notifications issued when student attendance drops below policy limits, sudden grade drops occur, or LMS activity halts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`px-3.5 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-colors ${
              isAcademic
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Sliders className={`w-3.5 h-3.5 ${isAcademic ? 'text-amber-700' : 'text-amber-400'}`} />
            <span>{showConfig ? 'Hide Trigger Rules' : 'Configure Alert Thresholds'}</span>
          </button>
        </div>
      </div>

      {/* Threshold Config */}
      {showConfig && (
        <form
          onSubmit={handleSaveRules}
          className={`p-5 rounded-xl border shadow-xs space-y-4 transition-colors ${
            isAcademic
              ? 'bg-white border-slate-200'
              : 'bg-[#0d1526] border-slate-800 shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold font-display-academic uppercase tracking-wider ${
              isAcademic ? 'text-slate-900' : 'text-white'
            }`}>
              Automated Alert Trigger Criteria
            </h3>
            {savedRules && (
              <span className={`text-xs flex items-center gap-1 font-semibold ${
                isAcademic ? 'text-emerald-700' : 'text-emerald-400'
              }`}>
                <Check className="w-3.5 h-3.5" />
                <span>Threshold rules updated successfully!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className={`p-3.5 rounded-lg border space-y-2 transition-colors ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <label className={`font-semibold block ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                Attendance Alert Threshold
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="90"
                  value={attendanceThreshold}
                  onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
                  className={`w-24 rounded-md p-2 font-mono font-bold border focus:outline-none ${
                    isAcademic
                      ? 'bg-white border-slate-300 text-amber-800 focus:border-amber-600'
                      : 'bg-[#090f1d] border-slate-700 text-amber-400 focus:border-amber-500'
                  }`}
                />
                <span className={isAcademic ? 'text-slate-600' : 'text-slate-400'}>% attendance</span>
              </div>
              <p className={`text-[10px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                Triggers when student presence drops below policy.
              </p>
            </div>

            <div className={`p-3.5 rounded-lg border space-y-2 transition-colors ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <label className={`font-semibold block ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                Dropout Risk Score Threshold
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  max="95"
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(Number(e.target.value))}
                  className={`w-24 rounded-md p-2 font-mono font-bold border focus:outline-none ${
                    isAcademic
                      ? 'bg-white border-slate-300 text-red-700 focus:border-red-600'
                      : 'bg-[#090f1d] border-slate-700 text-red-400 focus:border-red-500'
                  }`}
                />
                <span className={isAcademic ? 'text-slate-600' : 'text-slate-400'}>% predicted risk</span>
              </div>
              <p className={`text-[10px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                Escalates directly to Dean of Academic Affairs.
              </p>
            </div>

            <div className={`p-3.5 rounded-lg border space-y-2 transition-colors ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <label className={`font-semibold block ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                Consecutive Absence Trigger
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={absenceThreshold}
                  onChange={(e) => setAbsenceThreshold(Number(e.target.value))}
                  className={`w-24 rounded-md p-2 font-mono font-bold border focus:outline-none ${
                    isAcademic
                      ? 'bg-white border-slate-300 text-amber-800 focus:border-amber-600'
                      : 'bg-[#090f1d] border-slate-700 text-amber-400 focus:border-amber-500'
                  }`}
                />
                <span className={isAcademic ? 'text-slate-600' : 'text-slate-400'}>unexcused absences</span>
              </div>
              <p className={`text-[10px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                Flags potential unexcused dropouts in real-time.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs"
            >
              Save Alert Rules
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border shadow-xs text-xs transition-colors ${
        isAcademic
          ? 'bg-white border-slate-200'
          : 'bg-[#0d1526] border-slate-800 shadow-xl'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>Severity:</span>
          {(['all', 'critical', 'warning', 'info'] as const).map((sev) => {
            const isActive = filterSeverity === sev;
            return (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors font-medium text-xs border ${
                  isActive
                    ? isAcademic
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800 font-bold'
                    : isAcademic
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent'
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className={`font-medium ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>Status:</span>
          {(['all', 'unresolved', 'acknowledged', 'resolved'] as const).map((st) => {
            const isActive = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors font-medium text-xs border ${
                  isActive
                    ? isAcademic
                      ? 'bg-slate-800 text-white border-slate-800 font-bold'
                      : 'bg-slate-700 text-white border-slate-600 font-bold'
                    : isAcademic
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className={`p-12 text-center rounded-xl border shadow-xs space-y-2 transition-colors ${
            isAcademic
              ? 'bg-white border-slate-200'
              : 'bg-[#0d1526] border-slate-800 shadow-xl'
          }`}>
            <CheckCircle2 className={`w-8 h-8 mx-auto ${isAcademic ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <h4 className={`text-sm font-bold font-display-academic ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
              All Notices Addressed
            </h4>
            <p className={`text-xs font-serif-academic italic ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
              All student alerts in this category have been acknowledged or resolved.
            </p>
          </div>
        ) : (
          filtered.map((alert) => {
            const isCrit = alert.severity === 'critical';
            const isWarn = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCrit
                    ? isAcademic
                      ? 'bg-red-50/60 border-red-200 shadow-xs'
                      : 'bg-[#151224] border-red-900/60 hover:border-red-800 shadow-lg'
                    : isWarn
                    ? isAcademic
                      ? 'bg-amber-50/60 border-amber-200 shadow-xs'
                      : 'bg-[#18161f] border-amber-900/60 hover:border-amber-800 shadow-lg'
                    : isAcademic
                    ? 'bg-white border-slate-200 shadow-xs'
                    : 'bg-[#0d1526] border-slate-800 hover:border-slate-700 shadow-lg'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-lg mt-0.5 shrink-0 border ${
                        isCrit
                          ? isAcademic
                            ? 'bg-red-100 text-red-700 border-red-300'
                            : 'bg-red-950/90 text-red-400 border-red-800/90'
                          : isWarn
                          ? isAcademic
                            ? 'bg-amber-100 text-amber-700 border-amber-300'
                            : 'bg-amber-950/90 text-amber-400 border-amber-800/90'
                          : isAcademic
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {isCrit ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : isWarn ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-bold ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
                          {alert.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                            isCrit
                              ? isAcademic
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-red-950/90 text-red-300 border-red-800'
                              : isWarn
                              ? isAcademic
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-amber-950/90 text-amber-300 border-amber-800'
                              : isAcademic
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className={isAcademic ? 'text-slate-300' : 'text-slate-600'}>·</span>
                        <span className={`text-[11px] font-mono ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                          {alert.timestamp}
                        </span>
                      </div>

                      <p className={`text-xs leading-relaxed ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                        {alert.message}
                      </p>

                      <div className={`flex flex-wrap items-center gap-2.5 pt-1 text-[11px] ${
                        isAcademic ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <span>
                          Student:{' '}
                          <button
                            onClick={() => onSelectStudent(alert.studentId)}
                            className={`font-bold transition-colors ${
                              isAcademic
                                ? 'text-amber-800 hover:text-amber-950 hover:underline'
                                : 'text-amber-400 hover:text-amber-300 hover:underline'
                            }`}
                          >
                            {alert.studentName} ({alert.studentId})
                          </button>
                        </span>
                        <span className={isAcademic ? 'text-slate-300' : 'text-slate-600'}>·</span>
                        <span>Faculty: {alert.department}</span>
                        {alert.assignee && (
                          <>
                            <span className={isAcademic ? 'text-slate-300' : 'text-slate-600'}>·</span>
                            <span className={`font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-200'}`}>
                              Assigned: {alert.assignee}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-end gap-2.5 shrink-0 mt-2 sm:mt-0">
                    <div className="flex items-center gap-1.5">
                      {alert.status === 'unresolved' && (
                        <button
                          onClick={() => onUpdateStatus(alert.id, 'acknowledged', 'Prof. Marcus Vance')}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border ${
                            isAcademic
                              ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'
                              : 'bg-amber-950/70 hover:bg-amber-900/90 border-amber-700/80 text-amber-300'
                          }`}
                        >
                          Acknowledge
                        </button>
                      )}

                      {alert.status !== 'resolved' && (
                        <button
                          onClick={() => onUpdateStatus(alert.id, 'resolved')}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 border ${
                            isAcademic
                              ? 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-900'
                              : 'bg-emerald-950/70 hover:bg-emerald-900/90 border-emerald-700/80 text-emerald-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}

                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className={`p-1.5 rounded-md transition-colors border ${
                          isAcademic
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-red-700 border-slate-300'
                            : 'bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 border-slate-700 hover:border-red-800'
                        }`}
                        title="Dismiss Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase font-bold tracking-wider ${
                        alert.status === 'resolved'
                          ? isAcademic ? 'text-emerald-700' : 'text-emerald-400'
                          : alert.status === 'acknowledged'
                          ? isAcademic ? 'text-amber-700' : 'text-amber-400'
                          : isAcademic ? 'text-red-700' : 'text-red-400'
                      }`}
                    >
                      STATUS: {alert.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
