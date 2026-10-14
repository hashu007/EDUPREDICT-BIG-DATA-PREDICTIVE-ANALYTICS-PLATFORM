import React, { useState } from 'react';
import {
  Cpu,
  Play,
  RotateCw,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  Terminal,
  Server
} from 'lucide-react';
import { MapReduceJob, ThemeMode } from '../../types';

interface MapReduceRunnerProps {
  jobs: MapReduceJob[];
  onTriggerJob: (jobName: string, engine: MapReduceJob['engine']) => void;
  theme?: ThemeMode;
}

export const MapReduceRunner: React.FC<MapReduceRunnerProps> = ({
  jobs,
  onTriggerJob,
  theme = 'hadoop'
}) => {
  const isAcademic = theme === 'academic';
  const [selectedEngine, setSelectedEngine] = useState<MapReduceJob['engine']>('Apache Spark 3.5');
  const [jobTemplate, setJobTemplate] = useState('Calculate Daily LMS Study Hours & Quiz Progress');

  const templates = [
    { name: 'Calculate Daily LMS Study Hours & Quiz Progress', engine: 'Apache Spark 3.5' as const, desc: 'Computes 30-day moving average of video watch hours and quiz attempts' },
    { name: 'Roll-Up Class Attendance & Identify Missing Days', engine: 'MapReduce v2' as const, desc: 'Aggregates daily attendance card check-ins and absences for all courses' },
    { name: 'Refresh Dropout Risk Forecasts & GPA Predictions', engine: 'Apache Spark 3.5' as const, desc: 'Calculates updated risk levels and GPA trajectories for all enrolled scholars' },
    { name: 'Group Students by Learning Styles & Study Habits', engine: 'Apache Spark 3.5' as const, desc: 'Organizes student cohort into intuitive learning and engagement archetypes' },
  ];

  const handleLaunch = () => {
    onTriggerJob(jobTemplate, selectedEngine);
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
            <span>High-Speed Data Processing Engine</span>
            <span className={isAcademic ? 'text-slate-300' : 'text-slate-600'}>·</span>
            <span>Automated Campus Analytics</span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-display-academic font-bold mt-1 ${
            isAcademic ? 'text-slate-900' : 'text-white'
          }`}>
            Automated Data Processing & Report Generator
          </h1>
          <p className={`text-xs font-serif-academic italic mt-0.5 ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Simulates fast multi-step processing (Reading, Grouping, and Summarizing) to update student GPA trends and calculate early academic guidance notices.
          </p>
        </div>

        <div className={`flex items-center gap-2 text-xs font-mono px-3.5 py-2 rounded-lg border ${
          isAcademic
            ? 'bg-slate-50 border-slate-200 text-slate-700'
            : 'bg-[#121c32] border-slate-800 text-slate-300'
        }`}>
          <span className={isAcademic ? 'text-slate-500' : 'text-slate-400'}>Processing Power:</span>
          <span className={`font-bold ${isAcademic ? 'text-emerald-700' : 'text-emerald-400'}`}>
            32 Processor Cores · 64 GB Memory Ready
          </span>
        </div>
      </div>

      {/* Submission Panel */}
      <div className={`p-5 rounded-xl border shadow-xs space-y-4 transition-colors ${
        isAcademic
          ? 'bg-white border-slate-200'
          : 'bg-[#0d1526] border-slate-800 shadow-xl'
      }`}>
        <h3 className={`text-xs font-bold font-display-academic uppercase tracking-wider ${
          isAcademic ? 'text-slate-900' : 'text-white'
        }`}>
          Start an Automated Student Data Analysis Job
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className={`font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
              Select Analysis Task
            </label>
            <select
              value={jobTemplate}
              onChange={(e) => setJobTemplate(e.target.value)}
              className={`w-full rounded-lg p-2 font-mono text-[11px] focus:outline-none border ${
                isAcademic
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
              }`}
            >
              {templates.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className={`font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
              Execution Speed & Mode
            </label>
            <select
              value={selectedEngine}
              onChange={(e) => setSelectedEngine(e.target.value as any)}
              className={`w-full rounded-lg p-2 font-mono text-[11px] focus:outline-none border ${
                isAcademic
                  ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                  : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
              }`}
            >
              <option value="Apache Spark 3.5">High-Speed Real-Time Mode (Live Updates)</option>
              <option value="MapReduce v2">Campus Scheduled Batch Mode (Nightly)</option>
              <option value="Apache Impala">Instant Search Mode (Immediate Lookup)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleLaunch}
              className="w-full py-2 px-4 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Analysis & Update Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracked Jobs */}
      <div className={`rounded-xl border shadow-xs p-5 space-y-4 transition-colors ${
        isAcademic
          ? 'bg-white border-slate-200'
          : 'bg-[#0d1526] border-slate-800 shadow-xl'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-bold font-display-academic ${
            isAcademic ? 'text-slate-900' : 'text-white'
          }`}>
            Active Analysis & Processing Queue
          </h3>
          <span className={`text-xs font-mono ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
            {jobs.length} Monitored Reports
          </span>
        </div>

        <div className="space-y-3.5">
          {jobs.map((job) => {
            const isRunning = job.status === 'running';

            return (
              <div
                key={job.id}
                className={`p-4 rounded-xl border space-y-3 transition-colors ${
                  isAcademic
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-[#121c32] border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg border ${
                        isRunning
                          ? isAcademic
                            ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                            : 'bg-amber-950/90 text-amber-400 border-amber-800 animate-pulse'
                          : isAcademic
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-emerald-950/90 text-emerald-400 border-emerald-800'
                      }`}
                    >
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`font-mono text-xs font-bold flex items-center gap-2 ${
                        isAcademic ? 'text-slate-900' : 'text-white'
                      }`}>
                        <span>{job.name}</span>
                        <span className={`text-[10px] font-mono ${
                          isAcademic ? 'text-amber-800' : 'text-amber-400'
                        }`}>
                          ({job.id})
                        </span>
                      </div>
                      <div className={`text-[11px] flex items-center gap-2 mt-0.5 ${
                        isAcademic ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        <span className={`font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                          {job.engine === 'Apache Spark 3.5'
                            ? 'High-Speed Engine'
                            : job.engine === 'MapReduce v2'
                            ? 'Standard Batch Engine'
                            : 'Search Engine'}
                        </span>
                        <span>·</span>
                        <span>Students Processed: {job.recordsProcessed.toLocaleString()}</span>
                        <span>·</span>
                        <span>Started: {job.startTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                        isRunning
                          ? isAcademic
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-amber-950/90 text-amber-300 border-amber-800'
                          : isAcademic
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {job.status === 'completed' ? 'Finished' : job.status === 'running' ? 'Processing' : job.status}
                    </span>
                    <span className={`text-xs font-mono ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                      {job.durationSeconds}s elapsed
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className={`flex justify-between text-[11px] font-mono ${
                    isAcademic ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    <span>
                      Step 1 (Read & Group): <span className={`font-bold ${isAcademic ? 'text-amber-800' : 'text-amber-400'}`}>{job.progressMap}%</span> · Step 2 (Calculate & Summarize): <span className={`font-bold ${isAcademic ? 'text-slate-900' : 'text-white'}`}>{job.progressReduce}%</span>
                    </span>
                    <span>System Load: {job.clusterCpuUsage}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden flex ${
                    isAcademic ? 'bg-slate-200' : 'bg-slate-800'
                  }`}>
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${job.progressMap / 2}%` }}
                    />
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${job.progressReduce / 2}%` }}
                    />
                  </div>
                </div>

                {/* Stages */}
                <div className={`flex flex-wrap gap-2 pt-1 border-t text-[10px] font-mono ${
                  isAcademic ? 'border-slate-200' : 'border-slate-800'
                }`}>
                  {job.stages.map((stage, sIdx) => (
                    <div
                      key={sIdx}
                      className={`px-2 py-0.5 rounded flex items-center gap-1.5 border ${
                        stage.status === 'done'
                          ? isAcademic
                            ? 'bg-white text-slate-700 border-slate-200'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700'
                          : stage.status === 'active'
                          ? isAcademic
                            ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                            : 'bg-amber-950/80 text-amber-300 border-amber-800 font-bold'
                          : isAcademic
                          ? 'bg-slate-100 text-slate-400 border-slate-200'
                          : 'bg-slate-900 text-slate-600 border-slate-800'
                      }`}
                    >
                      {stage.status === 'done' ? (
                        <CheckCircle2 className={`w-3 h-3 ${isAcademic ? 'text-emerald-600' : 'text-emerald-400'}`} />
                      ) : stage.status === 'active' ? (
                        <RotateCw className="w-3 h-3 text-amber-500 animate-spin" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-500" />
                      )}
                      <span>{stage.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
