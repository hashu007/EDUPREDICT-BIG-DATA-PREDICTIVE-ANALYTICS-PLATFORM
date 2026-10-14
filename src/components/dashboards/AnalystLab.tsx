import React, { useState } from 'react';
import {
  BrainCircuit,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle,
  TrendingDown,
  Info,
  Maximize2,
  Sparkles,
  RefreshCw,
  Compass
} from 'lucide-react';
import { Student, ThemeMode } from '../../types';
import { MODEL_EVALUATION_REPORT, ROC_POINTS, simulateWhatIf } from '../../services/mlEngine';

interface AnalystLabProps {
  students: Student[];
  onTriggerRetrain: (jobName: string) => void;
  onSelectStudent: (studentId: string) => void;
  theme: ThemeMode;
}

export const AnalystLab: React.FC<AnalystLabProps> = ({
  students,
  onTriggerRetrain,
  onSelectStudent,
  theme
}) => {
  const isAcademic = theme === 'academic';
  const atRiskStudents = students.filter(s => s.predictions.dropoutRiskScore >= 50);
  const [selectedSimStudentId, setSelectedSimStudentId] = useState<string>(
    atRiskStudents[0]?.id || students[0]?.id || ''
  );
  const [attendanceDelta, setAttendanceDelta] = useState<number>(15);
  const [lmsHoursDelta, setLmsHoursDelta] = useState<number>(4);
  const [assignmentDelta, setAssignmentDelta] = useState<number>(20);

  const [activeTab, setActiveTab] = useState<'metrics' | 'clusters' | 'whatif'>('metrics');
  const [retrainingState, setRetrainingState] = useState(false);

  const currentSimStudent = students.find(s => s.id === selectedSimStudentId) || students[0];

  const whatIfResult = currentSimStudent
    ? simulateWhatIf(currentSimStudent, attendanceDelta, lmsHoursDelta, assignmentDelta)
    : null;

  const handleRetrainClick = () => {
    setRetrainingState(true);
    onTriggerRetrain('EduPredict-Spark-MLlib-Ensemble-Retrain');
    setTimeout(() => {
      setRetrainingState(false);
    }, 2500);
  };

  const clusterCounts = {
    0: students.filter(s => s.predictions.clusterId === 0).length,
    1: students.filter(s => s.predictions.clusterId === 1).length,
    2: students.filter(s => s.predictions.clusterId === 2).length,
    3: students.filter(s => s.predictions.clusterId === 3).length,
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
            <span>Student Success & Predictive Intelligence Lab</span>
            <span className={isAcademic ? 'text-slate-300' : 'text-slate-600'}>·</span>
            <span>Predictive Machine Learning Simulator</span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-display-academic font-bold mt-1 ${
            isAcademic ? 'text-slate-900' : 'text-white'
          }`}>
            Grade & Retention Predictor Simulator
          </h1>
          <p className={`text-xs font-serif-academic italic mt-0.5 ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Predictive accuracy evaluation (96.3%), key factors influencing student performance, student learning archetypes, and policy simulation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRetrainClick}
            disabled={retrainingState}
            className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrainingState ? 'animate-spin' : ''}`} />
            <span>{retrainingState ? 'Updating Prediction Model...' : 'Update Prediction Model'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-1.5 p-1 rounded-lg border w-fit text-xs font-semibold ${
        isAcademic
          ? 'bg-slate-100 border-slate-200'
          : 'bg-[#0d1526] border-slate-800'
      }`}>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-3.5 py-1.5 rounded-md transition-colors ${
            activeTab === 'metrics'
              ? isAcademic
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'bg-slate-800 text-white font-bold'
              : isAcademic
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Prediction Accuracy & Key Factors
        </button>
        <button
          onClick={() => setActiveTab('clusters')}
          className={`px-3.5 py-1.5 rounded-md transition-colors ${
            activeTab === 'clusters'
              ? isAcademic
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'bg-slate-800 text-white font-bold'
              : isAcademic
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Student Learning Groups ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('whatif')}
          className={`px-3.5 py-1.5 rounded-md transition-colors ${
            activeTab === 'whatif'
              ? isAcademic
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'bg-slate-800 text-white font-bold'
              : isAcademic
              ? 'text-slate-600 hover:text-slate-900'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          What-If Sensitivity Simulator
        </button>
      </div>

      {/* TAB 1: METRICS & ROC-AUC */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className={`p-3.5 rounded-xl border shadow-xs transition-colors ${
              isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-slate-500' : 'text-slate-400'
              }`}>Accuracy</span>
              <div className={`text-2xl font-bold font-mono mt-0.5 ${
                isAcademic ? 'text-emerald-700' : 'text-emerald-400'
              }`}>
                {MODEL_EVALUATION_REPORT.accuracy}%
              </div>
              <span className={`text-[10px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>1,120 Test Samples</span>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-xs transition-colors ${
              isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-slate-500' : 'text-slate-400'
              }`}>Precision</span>
              <div className={`text-2xl font-bold font-mono mt-0.5 ${
                isAcademic ? 'text-slate-900' : 'text-white'
              }`}>
                {MODEL_EVALUATION_REPORT.precision}%
              </div>
              <span className={`text-[10px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>Low False Alarms</span>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-xs transition-colors ${
              isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-slate-500' : 'text-slate-400'
              }`}>Recall (Sensitivity)</span>
              <div className={`text-2xl font-bold font-mono mt-0.5 ${
                isAcademic ? 'text-amber-800' : 'text-amber-400'
              }`}>
                {MODEL_EVALUATION_REPORT.recall}%
              </div>
              <span className={`text-[10px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>Flags 93.8% Dropouts</span>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-xs transition-colors ${
              isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-slate-500' : 'text-slate-400'
              }`}>F1 Harmonic Score</span>
              <div className={`text-2xl font-bold font-mono mt-0.5 ${
                isAcademic ? 'text-slate-900' : 'text-white'
              }`}>
                {MODEL_EVALUATION_REPORT.f1Score}%
              </div>
              <span className={`text-[10px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>Balanced Benchmark</span>
            </div>

            <div className={`p-3.5 rounded-xl border shadow-xs transition-colors ${
              isAcademic
                ? 'bg-amber-50/20 border-amber-300'
                : 'bg-amber-950/30 border-amber-800/80'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-amber-800' : 'text-amber-400'
              }`}>ROC-AUC Area</span>
              <div className={`text-2xl font-bold font-mono mt-0.5 ${
                isAcademic ? 'text-amber-700' : 'text-amber-400'
              }`}>
                {MODEL_EVALUATION_REPORT.rocauc}
              </div>
              <span className={`text-[10px] ${isAcademic ? 'text-amber-900' : 'text-amber-300'}`}>Near-Optimal</span>
            </div>
          </div>

          {/* ROC Curve & Confusion Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-5 rounded-xl border shadow-xs space-y-3 transition-colors ${
              isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800 shadow-xl'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xs font-bold font-display-academic uppercase tracking-wider ${
                    isAcademic ? 'text-slate-900' : 'text-white'
                  }`}>
                    Receiver Operating Characteristic (ROC)
                  </h3>
                  <p className={`text-[11px] font-serif-academic italic ${
                    isAcademic ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    True Positive Rate vs False Positive Rate (AUC = 0.963)
                  </p>
                </div>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold border ${
                  isAcademic
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800'
                }`}>
                  AUC: 0.963
                </span>
              </div>

              <div className={`h-64 w-full flex items-center justify-center p-2 rounded-lg border ${
                isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
              }`}>
                <svg className="w-full h-full" viewBox="0 0 300 200">
                  <line x1="40" y1="20" x2="280" y2="20" stroke={isAcademic ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
                  <line x1="40" y1="60" x2="280" y2="60" stroke={isAcademic ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
                  <line x1="40" y1="100" x2="280" y2="100" stroke={isAcademic ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
                  <line x1="40" y1="140" x2="280" y2="140" stroke={isAcademic ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
                  <line x1="40" y1="170" x2="280" y2="170" stroke={isAcademic ? "#cbd5e1" : "#334155"} strokeWidth="1.5" />
                  <line x1="40" y1="20" x2="40" y2="170" stroke={isAcademic ? "#cbd5e1" : "#334155"} strokeWidth="1.5" />
                  <line x1="40" y1="170" x2="280" y2="20" stroke={isAcademic ? "#94a3b8" : "#475569"} strokeDasharray="4 4" />

                  {/* ROC Curve Path */}
                  <path
                    d={`M 40 170 ${ROC_POINTS.map(p => `L ${40 + (p.fpr * 240)} ${170 - (p.tpr * 150)}`).join(' ')}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                  />
                  <polygon
                    points={`40,170 ${ROC_POINTS.map(p => `${40 + (p.fpr * 240)},${170 - (p.tpr * 150)}`).join(' ')} 280,170`}
                    fill="#f59e0b"
                    fillOpacity={isAcademic ? "0.1" : "0.15"}
                  />

                  <text x="160" y="195" fill={isAcademic ? "#64748b" : "#94a3b8"} fontSize="9" textAnchor="middle" fontWeight="bold">
                    False Positive Rate (1 - Specificity)
                  </text>
                  <text x="12" y="95" fill={isAcademic ? "#64748b" : "#94a3b8"} fontSize="9" textAnchor="middle" fontWeight="bold" transform="rotate(-90 12,95)">
                    True Positive Rate
                  </text>
                </svg>
              </div>
            </div>

            {/* Feature Weights */}
            <div className={`p-5 rounded-xl border shadow-xs space-y-3 transition-colors ${
              isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800 shadow-xl'
            }`}>
              <h3 className={`text-xs font-bold font-display-academic uppercase tracking-wider ${
                isAcademic ? 'text-slate-900' : 'text-white'
              }`}>
                Random Forest Feature Importance Weights
              </h3>

              <div className="space-y-3 pt-1">
                {MODEL_EVALUATION_REPORT.features.map((f, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={`font-medium ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                        {f.name}
                      </span>
                      <span className={`font-mono font-bold ${isAcademic ? 'text-amber-800' : 'text-amber-400'}`}>
                        {(f.weight * 100).toFixed(0)}% Weight (Pearson r = {f.correlation})
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      isAcademic ? 'bg-slate-100' : 'bg-slate-800'
                    }`}>
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${f.weight * 100 * 2.8}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: K-MEANS COHORTS */}
      {activeTab === 'clusters' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className={`p-4 rounded-xl border space-y-1 transition-all ${
              isAcademic
                ? 'bg-red-50/60 border-red-200'
                : 'bg-[#151224] border-red-900/60 hover:border-red-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-red-800' : 'text-red-400'
              }`}>Cluster 0</span>
              <div className={`text-sm font-bold ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
                Struggling & Disengaged
              </div>
              <div className={`text-2xl font-bold font-mono mt-1 ${
                isAcademic ? 'text-red-700' : 'text-red-400'
              }`}>
                {clusterCounts[0]} Students
              </div>
              <p className={`text-[10px] ${isAcademic ? 'text-slate-600' : 'text-slate-400'}`}>
                Low engagement & failing exam marks
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-1 transition-all ${
              isAcademic
                ? 'bg-amber-50/60 border-amber-200'
                : 'bg-[#18161f] border-amber-900/60 hover:border-amber-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-amber-800' : 'text-amber-400'
              }`}>Cluster 1</span>
              <div className={`text-sm font-bold ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
                Diligent but Struggling
              </div>
              <div className={`text-2xl font-bold font-mono mt-1 ${
                isAcademic ? 'text-amber-700' : 'text-amber-400'
              }`}>
                {clusterCounts[1]} Students
              </div>
              <p className={`text-[10px] ${isAcademic ? 'text-slate-600' : 'text-slate-400'}`}>
                High effort, conceptual hurdles
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-1 transition-all ${
              isAcademic
                ? 'bg-blue-50/60 border-blue-200'
                : 'bg-[#10192e] border-blue-900/60 hover:border-blue-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-blue-800' : 'text-blue-400'
              }`}>Cluster 2</span>
              <div className={`text-sm font-bold ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
                Passive High-Potential
              </div>
              <div className={`text-2xl font-bold font-mono mt-1 ${
                isAcademic ? 'text-blue-700' : 'text-blue-400'
              }`}>
                {clusterCounts[2]} Students
              </div>
              <p className={`text-[10px] ${isAcademic ? 'text-slate-600' : 'text-slate-400'}`}>
                Low attendance, high exam mastery
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-1 transition-all ${
              isAcademic
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-[#0f1f1d] border-emerald-900/60 hover:border-emerald-800'
            }`}>
              <span className={`text-[10px] font-mono uppercase font-bold ${
                isAcademic ? 'text-emerald-800' : 'text-emerald-400'
              }`}>Cluster 3</span>
              <div className={`text-sm font-bold ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
                Consistent High Achiever
              </div>
              <div className={`text-2xl font-bold font-mono mt-1 ${
                isAcademic ? 'text-emerald-700' : 'text-emerald-400'
              }`}>
                {clusterCounts[3]} Students
              </div>
              <p className={`text-[10px] ${isAcademic ? 'text-slate-600' : 'text-slate-400'}`}>
                Exemplary attendance, hours & GPA
              </p>
            </div>
          </div>

          {/* 2D Manifold Chart */}
          <div className={`p-5 rounded-xl border shadow-xs space-y-3 transition-colors ${
            isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800 shadow-xl'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-xs font-bold font-display-academic uppercase tracking-wider ${
                  isAcademic ? 'text-slate-900' : 'text-white'
                }`}>
                  2D Cohort Scatter Manifold (K-Means k=4)
                </h3>
                <p className={`text-[11px] font-serif-academic italic ${
                  isAcademic ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  X-Axis: Examination Performance · Y-Axis: Attendance & LMS Engagement
                </p>
              </div>
              <span className={`text-xs font-mono font-medium ${
                isAcademic ? 'text-amber-800' : 'text-amber-400'
              }`}>
                Click node to inspect student
              </span>
            </div>

            <div className={`h-80 w-full rounded-lg border p-3 relative flex items-center justify-center ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <svg className="w-full h-full" viewBox="0 0 500 280">
                <line x1="50" y1="20" x2="50" y2="240" stroke={isAcademic ? "#cbd5e1" : "#334155"} strokeWidth="1.5" />
                <line x1="50" y1="240" x2="480" y2="240" stroke={isAcademic ? "#cbd5e1" : "#334155"} strokeWidth="1.5" />

                <line x1="50" y1="130" x2="480" y2="130" stroke={isAcademic ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />
                <line x1="265" y1="20" x2="265" y2="240" stroke={isAcademic ? "#e2e8f0" : "#1e293b"} strokeDasharray="3 3" />

                <text x="140" y="225" fill="#f87171" fontSize="9" opacity="0.9">Cluster 0: Struggling</text>
                <text x="140" y="55" fill="#fbbf24" fontSize="9" opacity="0.9">Cluster 1: Diligent</text>
                <text x="370" y="225" fill="#60a5fa" fontSize="9" opacity="0.9">Cluster 2: Passive Genius</text>
                <text x="370" y="55" fill="#34d399" fontSize="9" opacity="0.9">Cluster 3: High Achievers</text>

                {students.map((s) => {
                  const acad = s.academic.midtermsAverage;
                  const eng = s.attendance.overallRate * 0.5 + (s.lms.weeklyHours / 14 * 100) * 0.5;

                  const cx = 50 + (acad / 100) * 420;
                  const cy = 240 - (Math.min(100, eng) / 100) * 210;

                  const color =
                    s.predictions.clusterId === 0
                      ? '#ef4444'
                      : s.predictions.clusterId === 1
                      ? '#f59e0b'
                      : s.predictions.clusterId === 2
                      ? '#3b82f6'
                      : '#10b981';

                  return (
                    <g key={s.id} className="cursor-pointer" onClick={() => onSelectStudent(s.id)}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={s.id === 'stu-hassam-khan' ? 7 : 4.5}
                        fill={color}
                        stroke={isAcademic ? "#ffffff" : "#0f172a"}
                        strokeWidth={s.id === 'stu-hassam-khan' ? 2.5 : 1}
                        opacity="0.95"
                      />
                      {s.id === 'stu-hassam-khan' && (
                        <text x={cx + 9} y={cy + 3} fill={isAcademic ? "#b45309" : "#fbbf24"} fontSize="9" fontWeight="bold">
                          Hassam Khan (STU-2024-0891)
                        </text>
                      )}
                    </g>
                  );
                })}

                <polygon points="210,172 214,180 206,180" fill="#ef4444" stroke="#fff" />
                <polygon points="268,63 272,71 264,71" fill="#f59e0b" stroke="#fff" />
                <polygon points="411,147 415,155 407,155" fill="#3b82f6" stroke="#fff" />
                <polygon points="423,55 427,63 419,63" fill="#10b981" stroke="#fff" />

                <text x="265" y="265" fill={isAcademic ? "#64748b" : "#94a3b8"} fontSize="10" textAnchor="middle" fontWeight="bold">
                  Examination & Academic Performance (0 - 100)
                </text>
                <text x="18" y="130" fill={isAcademic ? "#64748b" : "#94a3b8"} fontSize="10" textAnchor="middle" fontWeight="bold" transform="rotate(-90 18,130)">
                  Engagement & Attendance (0 - 100)
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHAT-IF SENSITIVITY SIMULATOR */}
      {activeTab === 'whatif' && whatIfResult && currentSimStudent && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`p-5 rounded-xl border shadow-xs space-y-5 transition-colors ${
              isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800 shadow-xl'
            }`}>
              <div>
                <h3 className={`text-sm font-bold font-display-academic ${
                  isAcademic ? 'text-slate-900' : 'text-white'
                }`}>
                  Hypothetical Intervention Controls
                </h3>
                <p className={`text-xs font-serif-academic italic ${
                  isAcademic ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Simulate the impact of academic intervention on student progression
                </p>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                  Target Student for Simulation
                </label>
                <select
                  value={selectedSimStudentId}
                  onChange={(e) => setSelectedSimStudentId(e.target.value)}
                  className={`w-full rounded-lg p-2 text-xs font-medium focus:outline-none border ${
                    isAcademic
                      ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                      : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
                  }`}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentId}) - Risk: {s.predictions.dropoutRiskScore}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Sliders */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={`font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                    Attendance Boost
                  </span>
                  <span className={`font-mono font-bold ${isAcademic ? 'text-amber-800' : 'text-amber-400'}`}>
                    +{attendanceDelta}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="5"
                  value={attendanceDelta}
                  onChange={(e) => setAttendanceDelta(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={`font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                    LMS Study Hours Boost
                  </span>
                  <span className={`font-mono font-bold ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                    +{lmsHoursDelta} Hours/wk
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={lmsHoursDelta}
                  onChange={(e) => setLmsHoursDelta(Number(e.target.value))}
                  className="w-full accent-slate-400 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={`font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                    Assignment Performance Boost
                  </span>
                  <span className={`font-mono font-bold ${isAcademic ? 'text-emerald-800' : 'text-emerald-400'}`}>
                    +{assignmentDelta}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={assignmentDelta}
                  onChange={(e) => setAssignmentDelta(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <button
                onClick={() => {
                  setAttendanceDelta(15);
                  setLmsHoursDelta(4);
                  setAssignmentDelta(20);
                }}
                className={`w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                  isAcademic
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Standard Intervention</span>
              </button>
            </div>

            {/* Results */}
            <div className={`lg:col-span-2 p-6 rounded-xl border shadow-xs space-y-6 transition-colors ${
              isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800 shadow-xl'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-base font-bold font-display-academic ${
                    isAcademic ? 'text-slate-900' : 'text-white'
                  }`}>
                    Simulated Intervention Outcome
                  </h3>
                  <p className={`text-xs font-serif-academic italic ${
                    isAcademic ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    Candidate: <span className={`font-bold ${isAcademic ? 'text-amber-800' : 'text-amber-400'}`}>{currentSimStudent.name}</span> ({currentSimStudent.studentId})
                  </p>
                </div>
                <span className={`text-xs font-mono px-2 py-0.5 rounded font-medium border ${
                  isAcademic
                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  Trajectory Model
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border space-y-2 transition-colors ${
                  isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
                }`}>
                  <span className={`text-xs font-medium ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                    Projected Dropout Probability
                  </span>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className={`text-sm line-through mr-2 ${isAcademic ? 'text-slate-400' : 'text-slate-500'}`}>
                        {whatIfResult.originalRisk}%
                      </span>
                      <span className={`text-3xl font-bold font-mono ${
                        isAcademic ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        {whatIfResult.simulatedRisk}%
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      isAcademic
                        ? 'text-emerald-800 bg-emerald-100 border-emerald-200'
                        : 'text-emerald-300 bg-emerald-950/80 border-emerald-800'
                    }`}>
                      -{whatIfResult.riskReduction}% Lift
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${
                    isAcademic ? 'bg-slate-200' : 'bg-slate-800'
                  }`}>
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${whatIfResult.simulatedRisk}%` }}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-xl border space-y-2 transition-colors ${
                  isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
                }`}>
                  <span className={`text-xs font-medium ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                    Simulated Semester GPA
                  </span>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className={`text-sm line-through mr-2 ${isAcademic ? 'text-slate-400' : 'text-slate-500'}`}>
                        {whatIfResult.originalGPA}
                      </span>
                      <span className={`text-3xl font-bold font-mono ${
                        isAcademic ? 'text-amber-800' : 'text-amber-400'
                      }`}>
                        {whatIfResult.simulatedGPA}
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                      isAcademic
                        ? 'text-amber-800 bg-amber-100 border-amber-200'
                        : 'text-amber-300 bg-amber-950/80 border-amber-800'
                    }`}>
                      +{(whatIfResult.simulatedGPA - whatIfResult.originalGPA).toFixed(2)} GPA
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${
                    isAcademic ? 'bg-slate-200' : 'bg-slate-800'
                  }`}>
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(whatIfResult.simulatedGPA / 4.0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border text-xs space-y-1.5 ${
                isAcademic
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-amber-950/30 border-amber-900/60'
              }`}>
                <div className={`flex items-center gap-1.5 font-bold font-display-academic ${
                  isAcademic ? 'text-amber-950' : 'text-amber-300'
                }`}>
                  <Sparkles className={`w-4 h-4 ${isAcademic ? 'text-amber-700' : 'text-amber-400'}`} />
                  <span>Empirical Recommendation for Faculty Dean</span>
                </div>
                <p className={`text-[11px] leading-relaxed ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                  By ensuring <strong>{currentSimStudent.name}</strong> attends 3 extra lectures and joins the tutoring lab for 4 hours weekly, the model projects a <strong>{whatIfResult.riskReduction}% risk reduction</strong>, moving them decisively out of the academic warning zone.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
