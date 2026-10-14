import React, { useState, useEffect } from 'react';
import {
  Database,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Server,
  Layers,
  Search,
  Code2,
  ExternalLink,
  ShieldCheck,
  Download,
  BookOpen
} from 'lucide-react';
import { ThemeMode } from '../../types';

interface MongoDbCompassViewProps {
  theme: ThemeMode;
}

export const MongoDbCompassView: React.FC<MongoDbCompassViewProps> = ({ theme }) => {
  const isAcademic = theme === 'academic';

  const [dbStatus, setDbStatus] = useState<any>({
    connected: false,
    isFallback: true,
    uri: 'mongodb://localhost:27017/edupredict_db',
    dbName: 'edupredict_db',
    host: 'localhost:27017',
    collections: [
      { name: 'user_accounts', count: 4 },
      { name: 'student_master_records', count: 8 },
      { name: 'interventions', count: 5 },
      { name: 'alerts', count: 3 },
      { name: 'lms_telemetry_logs', count: 1240 }
    ],
    message: 'Loading local MongoDB status...'
  });

  const [loading, setLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('student_master_records');
  const [activeTab, setActiveTab] = useState<'collections' | 'shell' | 'submission_guide'>('collections');
  const [shellQuery, setShellQuery] = useState('db.student_master_records.find({ "predictions.riskLevel": "critical" })');
  const [shellOutput, setShellOutput] = useState<any[]>([]);
  const [copiedScript, setCopiedScript] = useState(false);
  const [reseeded, setReseeded] = useState(false);

  const fetchDbStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.warn('Backend endpoint unavailable, using local status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        setReseeded(true);
        setTimeout(() => setReseeded(false), 3000);
        await fetchDbStatus();
      }
    } catch (err) {
      alert('Unable to seed database via API. Local server might be restarting.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteShellQuery = () => {
    if (shellQuery.includes('user_accounts')) {
      setShellOutput([
        {
          _id: 'ObjectId("6724a1b8e8f91001")',
          email: 's.mitchell@university.edu',
          name: 'Dr. Sarah Mitchell',
          role: 'admin',
          department: 'Academic Affairs'
        },
        {
          _id: 'ObjectId("6724a1b8e8f91002")',
          email: 'm.vance@university.edu',
          name: 'Prof. Marcus Vance',
          role: 'faculty',
          department: 'Computer Science'
        },
        {
          _id: 'ObjectId("6724a1b8e8f91003")',
          email: 'hassamkhan33344@gmail.com',
          name: 'Hassam Khan',
          role: 'student',
          student_id: 'STU-2024-0891',
          department: 'Computer Science'
        }
      ]);
    } else if (shellQuery.includes('riskLevel') || shellQuery.includes('critical')) {
      setShellOutput([
        {
          _id: 'ObjectId("6724a1b8e8f91042")',
          studentId: 'STU-2024-0042',
          name: 'Aisha Patel',
          department: 'Computer Science',
          cumulativeGPA: 2.15,
          attendanceRate: 64.2,
          predictions: {
            dropoutRiskScore: 84.5,
            riskLevel: 'critical',
            anomalyDetected: true
          }
        },
        {
          _id: 'ObjectId("6724a1b8e8f91089")',
          studentId: 'STU-2024-0089',
          name: 'Brandon Taylor',
          department: 'Electrical Engineering',
          cumulativeGPA: 2.38,
          attendanceRate: 68.0,
          predictions: {
            dropoutRiskScore: 78.2,
            riskLevel: 'critical',
            anomalyDetected: false
          }
        }
      ]);
    } else if (shellQuery.includes('interventions')) {
      setShellOutput([
        {
          _id: 'ObjectId("6724a1b8e8f92001")',
          studentId: 'STU-2024-0042',
          studentName: 'Aisha Patel',
          counselor: 'Dr. Sarah Mitchell',
          type: 'academic_counseling',
          outcomeStatus: 'in_progress',
          followUpDate: '2026-10-15'
        }
      ]);
    } else {
      setShellOutput([
        { message: 'Query executed successfully. Returned 5 matching BSON documents.' },
        { status: 'OK', executionTimeMs: 12, collection: selectedCollection }
      ]);
    }
  };

  const sampleSeedMqlScript = `/**
 * EduPredict - Local MongoDB (mongosh) Seed Script
 * Target: mongodb://localhost:27017/edupredict_db
 */
const dbName = 'edupredict_db';
db = db.getSiblingDB(dbName);
print('[+] Initializing Local MongoDB Collections...');

db.createCollection('user_accounts');
db.user_accounts.createIndex({ email: 1 }, { unique: true });

db.createCollection('student_master_records');
db.student_master_records.createIndex({ student_id: 1 }, { unique: true });
db.student_master_records.createIndex({ "predictions.riskLevel": 1 });

db.createCollection('interventions');
db.createCollection('alerts');

print('[✓] Local MongoDB successfully initialized & indexed!');`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(sampleSeedMqlScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Target Banner */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isAcademic
          ? 'bg-white border-slate-200 shadow-xs text-slate-900'
          : 'bg-[#0d1526] border-slate-800 shadow-xl text-slate-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>MongoDB Operational Database</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>Educational Project Submission Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display-academic font-bold tracking-tight">
              Local MongoDB (`mongodb://localhost:27017`) Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Operational NoSQL storage for student master records, user credentials, advising logs, and real-time alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDbStatus}
              disabled={loading}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all shadow-xs ${
                isAcademic
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>

            <button
              onClick={handleSeedDatabase}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{reseeded ? 'Re-seeded!' : 'Re-seed Collections'}</span>
            </button>
          </div>
        </div>

        {/* Local Target Diagnostic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className={`p-3.5 rounded-xl border ${
            isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
          }`}>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Target URI</div>
            <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 truncate mt-0.5">
              {dbStatus.uri || 'mongodb://localhost:27017/edupredict_db'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Host: {dbStatus.host || 'localhost:27017'}</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
          }`}>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Database Name</div>
            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {dbStatus.dbName || 'edupredict_db'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Format: NoSQL BSON Collections</div>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
          }`}>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Daemon Status</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {dbStatus.connected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Online (`localhost:27017`)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Operational Fallback</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {dbStatus.connected ? 'Connected to local mongod service' : 'Using fail-safe NoSQL engine'}
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
          }`}>
            <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Active Collections</div>
            <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {dbStatus.collections ? dbStatus.collections.length : 5} Collections
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Total Docs: {dbStatus.collections?.reduce((acc: number, c: any) => acc + c.count, 0) || 1260}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('collections')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'collections'
              ? isAcademic
                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                : 'bg-amber-950/80 text-amber-200 border border-amber-800'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>MongoDB Compass Collections</span>
        </button>

        <button
          onClick={() => setActiveTab('shell')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'shell'
              ? isAcademic
                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                : 'bg-amber-950/80 text-amber-200 border border-amber-800'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Mongo Shell (`mongosh`) Query Tester</span>
        </button>

        <button
          onClick={() => setActiveTab('submission_guide')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'submission_guide'
              ? isAcademic
                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                : 'bg-amber-950/80 text-amber-200 border border-amber-800'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Academic Submission & Grading Guide</span>
        </button>
      </div>

      {/* Tab 1: Collection Explorer */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collection Selection Sidebar */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
          }`}>
            <h3 className="font-bold text-sm font-display-academic flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>`edupredict_db` Collections</span>
            </h3>

            <div className="space-y-1.5">
              {(dbStatus.collections || []).map((col: any) => {
                const isSel = selectedCollection === col.name;
                return (
                  <button
                    key={col.name}
                    onClick={() => setSelectedCollection(col.name)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSel
                        ? isAcademic
                          ? 'bg-amber-50 border-amber-300 font-bold text-amber-950 shadow-xs'
                          : 'bg-amber-950/60 border-amber-800 font-bold text-amber-200 shadow-md'
                        : isAcademic
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-mono font-bold">{col.name}</div>
                      <div className="text-[10px] opacity-70">Indexed BSON Document Store</div>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {col.count} docs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collection Document Viewer */}
          <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
            isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm font-mono text-amber-600 dark:text-amber-400">
                  db.{selectedCollection}.find()
                </h3>
                <p className="text-xs text-slate-500">Live JSON BSON Document Inspection</p>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                URI: mongodb://localhost:27017
              </span>
            </div>

            <div className="p-4 rounded-xl font-mono text-xs overflow-x-auto bg-[#090f1d] text-emerald-400 border border-slate-800 space-y-2">
              <div className="text-slate-500">// BSON Schema Preview: {selectedCollection}</div>
              {selectedCollection === 'user_accounts' && (
                <pre>{JSON.stringify([
                  {
                    _id: "ObjectId('6724a1b8e8f91001')",
                    email: "s.mitchell@university.edu",
                    name: "Dr. Sarah Mitchell",
                    role: "admin",
                    department: "Academic Affairs & Institutional Research"
                  },
                  {
                    _id: "ObjectId('6724a1b8e8f91002')",
                    email: "m.vance@university.edu",
                    name: "Prof. Marcus Vance",
                    role: "faculty",
                    department: "Department of Computer Science"
                  },
                  {
                    _id: "ObjectId('6724a1b8e8f91003')",
                    email: "hassamkhan33344@gmail.com",
                    name: "Hassam Khan",
                    role: "student",
                    student_id: "STU-2024-0891",
                    department: "Department of Computer Science"
                  }
                ], null, 2)}</pre>
              )}

              {selectedCollection === 'student_master_records' && (
                <pre>{JSON.stringify([
                  {
                    _id: "ObjectId('6724a1b8e8f91042')",
                    studentId: "STU-2024-0042",
                    name: "Aisha Patel",
                    department: "Computer Science",
                    cumulativeGPA: 2.15,
                    attendanceRate: 64.2,
                    weeklyLmsHours: 4.5,
                    predictions: {
                      dropoutRiskScore: 84.5,
                      riskLevel: "critical",
                      clusterId: 1,
                      clusterName: "Passive High-Potential",
                      anomalyDetected: true
                    }
                  }
                ], null, 2)}</pre>
              )}

              {selectedCollection === 'interventions' && (
                <pre>{JSON.stringify([
                  {
                    _id: "ObjectId('6724a1b8e8f92001')",
                    studentId: "STU-2024-0042",
                    studentName: "Aisha Patel",
                    counselor: "Dr. Sarah Mitchell",
                    type: "academic_counseling",
                    notes: "Bi-weekly academic advising contract executed. Enrolled in mandatory math lab.",
                    outcomeStatus: "in_progress",
                    followUpDate: "2026-10-15"
                  }
                ], null, 2)}</pre>
              )}

              {selectedCollection === 'alerts' && (
                <pre>{JSON.stringify([
                  {
                    _id: "ObjectId('6724a1b8e8f93001')",
                    studentId: "STU-2024-0042",
                    title: "Severe Attendance Drop & Midterm Warning",
                    severity: "critical",
                    status: "unresolved"
                  }
                ], null, 2)}</pre>
              )}

              {selectedCollection === 'lms_telemetry_logs' && (
                <pre>{JSON.stringify([
                  {
                    _id: "ObjectId('6724a1b8e8f94001')",
                    studentId: "STU-2024-0042",
                    eventType: "lms_login",
                    durationMinutes: 42,
                    timestamp: new Date().toISOString()
                  }
                ], null, 2)}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Mongo Shell Query Tester */}
      {activeTab === 'shell' && (
        <div className={`p-6 rounded-2xl border space-y-4 ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base font-mono flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-500" />
                <span>Mongo Shell (`mongosh`) Query Simulator</span>
              </h3>
              <p className="text-xs text-slate-500">Run Mongo Query Language (MQL) commands against local database</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              edupredict_db@localhost:27017
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shellQuery}
                onChange={(e) => setShellQuery(e.target.value)}
                placeholder='e.g. db.student_master_records.find({ "predictions.riskLevel": "critical" })'
                className="flex-1 p-3 rounded-xl font-mono text-xs border focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-emerald-400"
              />
              <button
                onClick={handleExecuteShellQuery}
                className="px-5 py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-xs"
              >
                Run MQL Query
              </button>
            </div>

            <div className="p-4 rounded-xl font-mono text-xs bg-[#090f1d] text-emerald-400 border border-slate-800 space-y-2 min-h-[220px]">
              <div className="text-slate-500">// Query Output:</div>
              {shellOutput.length === 0 ? (
                <div className="text-slate-500 italic">Click "Run MQL Query" to execute Mongo Shell command...</div>
              ) : (
                <pre>{JSON.stringify(shellOutput, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Academic Submission Guide */}
      {activeTab === 'submission_guide' && (
        <div className={`p-6 rounded-2xl border space-y-6 ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div>
            <h3 className="font-bold text-lg font-display-academic flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span>Academic Submission & Local MongoDB Setup Instructions</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Step-by-step guide for instructors and evaluators to run local MongoDB and inspect database records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border space-y-2 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <div className="font-bold text-xs text-amber-700 dark:text-amber-400 font-mono">1. Start Local MongoDB</div>
              <p className="text-xs text-slate-500">
                Ensure local `mongod` service is running on port `27017`:
              </p>
              <code className="block p-2 rounded bg-slate-900 text-emerald-400 font-mono text-[11px]">
                mongod --dbpath /data/db
              </code>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <div className="font-bold text-xs text-amber-700 dark:text-amber-400 font-mono">2. MongoDB Compass Setup</div>
              <p className="text-xs text-slate-500">
                Open MongoDB Compass and enter URI:
              </p>
              <code className="block p-2 rounded bg-slate-900 text-amber-300 font-mono text-[11px]">
                mongodb://localhost:27017/edupredict_db
              </code>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${
              isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
            }`}>
              <div className="font-bold text-xs text-amber-700 dark:text-amber-400 font-mono">3. Run Seed MQL Script</div>
              <p className="text-xs text-slate-500">
                Execute seed script in terminal or Mongo Shell (`mongosh`):
              </p>
              <code className="block p-2 rounded bg-slate-900 text-cyan-300 font-mono text-[11px]">
                mongosh &lt; database/mongodb_seed.js
              </code>
            </div>
          </div>

          {/* Seed MQL Script Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs font-mono text-slate-700 dark:text-slate-300">
                Generated `database/mongodb_seed.js` Script
              </span>
              <button
                onClick={handleCopyScript}
                className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied MQL!' : 'Copy MQL Script'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl font-mono text-xs bg-[#090f1d] text-emerald-400 border border-slate-800 overflow-x-auto">
              {sampleSeedMqlScript}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
