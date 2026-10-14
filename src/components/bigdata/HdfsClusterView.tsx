import React, { useState } from 'react';
import {
  HardDrive,
  Server,
  Folder,
  FileCode,
  CheckCircle2,
  UploadCloud,
  FileText,
  Activity,
  Layers,
  ShieldCheck,
  PlusCircle,
  Database,
  Upload,
  Check
} from 'lucide-react';
import { HdfsNode, HdfsFile, ThemeMode } from '../../types';
import { dataService } from '../../services/dataService';

interface HdfsClusterViewProps {
  nodes: HdfsNode[];
  files: HdfsFile[];
  onIngestDataset: (name: string, recordsCount: number, format: HdfsFile['format']) => void;
  theme?: ThemeMode;
}

export const HdfsClusterView: React.FC<HdfsClusterViewProps> = ({
  nodes,
  files,
  onIngestDataset,
  theme = 'hadoop'
}) => {
  const isAcademic = theme === 'academic';
  const [selectedFile, setSelectedFile] = useState<HdfsFile | null>(files[0] || null);
  const [ingestModalOpen, setIngestModalOpen] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('lms_quiz_attempts_q3_2026');
  const [newRecordsCount, setNewRecordsCount] = useState(65000);
  const [newFormat, setNewFormat] = useState<HdfsFile['format']>('parquet');
  const [imputationMethod, setImputationMethod] = useState('median');

  // CSV File Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [rawCsvText, setRawCsvText] = useState<string>('');
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [csvRowsPreview, setCsvRowsPreview] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const totalCapacityGB = nodes.reduce((acc, n) => acc + (n.type === 'datanode' ? n.capacityGB : 0), 0);
  const totalUsedGB = nodes.reduce((acc, n) => acc + (n.type === 'datanode' ? n.usedGB : 0), 0);
  const usedPercent = Math.round((totalUsedGB / totalCapacityGB) * 100);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setNewDatasetName(file.name.replace(/\.[^/.]+$/, ''));
    setNewFormat(file.name.endsWith('.csv') ? 'csv' : file.name.endsWith('.parquet') ? 'parquet' : 'csv');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawCsvText(text);
      const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const cols = lines[0].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        setCsvColumns(cols);
        setNewRecordsCount(Math.max(1, lines.length - 1));
        const previewRows = lines.slice(1, 4).map(line => {
          const vals = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          const rowObj: Record<string, string> = {};
          cols.forEach((col, idx) => {
            rowObj[col] = vals[idx] || '';
          });
          return rowObj;
        });
        setCsvRowsPreview(previewRows);
      }
    };
    reader.readAsText(file);
  };

  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadFeedback(null);

    const result = await dataService.uploadCsvDataset({
      fileName: csvFile ? csvFile.name : `${newDatasetName}.${newFormat}`,
      rawCsv: rawCsvText,
      rows: csvRowsPreview,
      columns: csvColumns,
      datasetName: newDatasetName,
      format: newFormat
    });

    setIsUploading(false);
    setUploadFeedback(result.message || 'Dataset saved to MongoDB collection: uploaded_datasets');
    setTimeout(() => {
      setIngestModalOpen(false);
      setUploadFeedback(null);
      setCsvFile(null);
      setRawCsvText('');
      setCsvColumns([]);
      setCsvRowsPreview([]);
    }, 1600);
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
            <span>Campus Cloud Storage System</span>
            <span className={isAcademic ? 'text-slate-300' : 'text-slate-600'}>·</span>
            <span>Secure Multi-Drive Backup Vault</span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-display-academic font-bold mt-1 ${
            isAcademic ? 'text-slate-900' : 'text-white'
          }`}>
            Campus Storage Drive & Automated Backup Ledger
          </h1>
          <p className={`text-xs font-serif-academic italic mt-0.5 ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Central student record repository organizing course enrollments, attendance logs, and GPA history with automatic 3-copy backup protection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIngestModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Student Dataset</span>
          </button>
        </div>
      </div>

      {/* Cluster Storage Health Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border shadow-xs space-y-2 transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className={`flex items-center justify-between text-xs ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Storage Capacity</span>
            <HardDrive className={`w-4 h-4 ${isAcademic ? 'text-slate-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
            {(totalCapacityGB / 1024).toFixed(1)} TB
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
            isAcademic ? 'bg-slate-100' : 'bg-slate-800'
          }`}>
            <div className="bg-amber-600 h-full rounded-full" style={{ width: `${usedPercent}%` }} />
          </div>
          <div className={`text-[10px] flex justify-between ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span>Used: {(totalUsedGB / 1024).toFixed(1)} TB ({usedPercent}%)</span>
            <span>Free: {((totalCapacityGB - totalUsedGB) / 1024).toFixed(1)} TB</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs space-y-2 transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className={`flex items-center justify-between text-xs ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Storage Drives</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-bold font-mono ${isAcademic ? 'text-emerald-700' : 'text-emerald-400'}`}>
            4 / 4 Drives Online
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
            isAcademic ? 'bg-slate-100' : 'bg-slate-800'
          }`}>
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }} />
          </div>
          <div className={`text-[10px] flex justify-between ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span>All Drives Healthy</span>
            <span>Check-in: &lt; 3s ago</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs space-y-2 transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className={`flex items-center justify-between text-xs ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span className="font-semibold uppercase tracking-wider text-[10px]">Backup Protection Level</span>
            <ShieldCheck className={`w-4 h-4 ${isAcademic ? 'text-slate-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
            3 Copies Saved
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
            isAcademic ? 'bg-slate-100' : 'bg-slate-800'
          }`}>
            <div className="bg-slate-600 h-full rounded-full" style={{ width: '100%' }} />
          </div>
          <div className={`text-[10px] flex justify-between ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span>Missing Backups: 0</span>
            <span>Damaged Files: 0</span>
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs space-y-2 transition-colors ${
          isAcademic ? 'bg-white border-slate-200' : 'bg-[#0d1526] border-slate-800'
        }`}>
          <div className={`flex items-center justify-between text-xs ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span className="font-semibold uppercase tracking-wider text-[10px]">Standard File Chunk Size</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className={`text-2xl font-bold font-mono ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
            128 MB
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${
            isAcademic ? 'bg-slate-100' : 'bg-slate-800'
          }`}>
            <div className="bg-amber-600 h-full rounded-full" style={{ width: '65%' }} />
          </div>
          <div className={`text-[10px] flex justify-between ${
            isAcademic ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <span>Organized: By Term & Major</span>
            <span>High-Speed Tables</span>
          </div>
        </div>
      </div>

      {/* Node Topology */}
      <div className={`rounded-xl border shadow-xs p-5 space-y-3.5 transition-colors ${
        isAcademic
          ? 'bg-white border-slate-200'
          : 'bg-[#0d1526] border-slate-800 shadow-xl'
      }`}>
        <h3 className={`text-xs font-bold font-display-academic uppercase tracking-wider ${
          isAcademic ? 'text-slate-900' : 'text-white'
        }`}>
          Campus Storage Drives & Central Controller Layout
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {nodes.map((node) => {
            const isNN = node.type === 'namenode';
            const nodePct = Math.round((node.usedGB / node.capacityGB) * 100);

            return (
              <div
                key={node.id}
                className={`p-3.5 rounded-lg border space-y-2 transition-colors ${
                  isNN
                    ? isAcademic
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-[#18161f] border-amber-800/80 shadow-md'
                    : isAcademic
                    ? 'bg-slate-50/70 border-slate-200'
                    : 'bg-[#121c32] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                      isNN
                        ? 'bg-amber-700 text-white border-amber-600'
                        : isAcademic
                        ? 'bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {isNN ? 'Main File Controller' : 'Campus Storage Drive'}
                  </span>
                  <span className={`flex items-center gap-1 text-[10px] font-mono font-bold ${
                    isAcademic ? 'text-emerald-700' : 'text-emerald-400'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{node.heartbeatAgoSec}s</span>
                  </span>
                </div>

                <div>
                  <div className={`font-mono text-xs font-bold truncate ${
                    isAcademic ? 'text-slate-900' : 'text-white'
                  }`}>
                    {isNN
                      ? 'Central Controller Hub'
                      : node.name.includes('dn01')
                      ? 'Storage Drive 1 (Science)'
                      : node.name.includes('dn02')
                      ? 'Storage Drive 2 (Admin)'
                      : node.name.includes('dn03')
                      ? 'Storage Drive 3 (Library)'
                      : 'Storage Drive 4 (Engineering)'}
                  </div>
                  <div className={`font-mono text-[10px] ${
                    isAcademic ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {node.ipAddress} · {node.rack.includes('rack-b') || node.rack === 'Rack B' ? 'Server Room B' : 'Server Room A'}
                  </div>
                </div>

                <div className={`space-y-1 pt-1 border-t text-[10px] ${
                  isAcademic ? 'border-slate-200' : 'border-slate-800'
                }`}>
                  <div className={`flex justify-between ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>Used / Total:</span>
                    <span className={`font-mono ${isAcademic ? 'text-slate-700' : 'text-slate-200'}`}>
                      {(node.usedGB / 1024).toFixed(1)} / {(node.capacityGB / 1024).toFixed(1)} TB
                    </span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                    isAcademic ? 'bg-slate-200' : 'bg-slate-800'
                  }`}>
                    <div
                      className={`h-full rounded-full ${isNN ? 'bg-amber-600' : 'bg-emerald-600'}`}
                      style={{ width: `${nodePct}%` }}
                    />
                  </div>
                  <div className={`font-mono text-[9px] ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                    Stored Files: {node.blocksCount.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Directory & Block Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-xl border shadow-xs p-5 space-y-4 transition-colors ${
          isAcademic
            ? 'bg-white border-slate-200'
            : 'bg-[#0d1526] border-slate-800 shadow-xl'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-bold font-display-academic ${
                isAcademic ? 'text-slate-900' : 'text-white'
              }`}>
                Campus Student Records & File Directory
              </h3>
              <p className={`text-xs font-mono ${
                isAcademic ? 'text-slate-500' : 'text-slate-400'
              }`}>
                Location: /campus_data/student_records/
              </p>
            </div>
            <span className={`text-xs font-mono ${
              isAcademic ? 'text-slate-500' : 'text-slate-400'
            }`}>
              {files.length} Saved Datasets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b text-[10px] uppercase ${
                  isAcademic ? 'border-slate-200 text-slate-600' : 'border-slate-800 text-slate-400'
                }`}>
                  <th className="pb-2.5">Dataset Name</th>
                  <th className="pb-2.5 text-center">Format</th>
                  <th className="pb-2.5 text-center">Size</th>
                  <th className="pb-2.5 text-center">Chunks</th>
                  <th className="pb-2.5 text-center">Records</th>
                  <th className="pb-2.5 text-right">Last Updated</th>
                </tr>
              </thead>
              <tbody className={`divide-y text-[11px] ${
                isAcademic ? 'divide-slate-100' : 'divide-slate-800'
              }`}>
                {files.map((file) => {
                  const isSel = selectedFile?.path === file.path;
                  return (
                    <tr
                      key={file.path}
                      onClick={() => setSelectedFile(file)}
                      className={`cursor-pointer transition-colors ${
                        isSel
                          ? isAcademic
                            ? 'bg-amber-50/70 text-amber-950 font-bold'
                            : 'bg-[#18263f] text-white font-bold border-l-2 border-amber-500'
                          : isAcademic
                          ? 'hover:bg-slate-50 text-slate-700'
                          : 'hover:bg-[#131e33] text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 font-medium flex items-center gap-2">
                        <FileCode className={`w-3.5 h-3.5 shrink-0 ${
                          isAcademic ? 'text-amber-700' : 'text-amber-400'
                        }`} />
                        <span className={`truncate max-w-[240px] ${
                          isAcademic ? 'text-slate-900' : 'text-white'
                        }`}>
                          {file.name}
                        </span>
                      </td>
                      <td className={`py-2.5 text-center uppercase text-[10px] font-bold ${
                        isAcademic ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {file.format}
                      </td>
                      <td className={`py-2.5 text-center ${
                        isAcademic ? 'text-slate-700' : 'text-slate-200'
                      }`}>
                        {file.sizeMB} MB
                      </td>
                      <td className={`py-2.5 text-center ${
                        isAcademic ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {file.blockCount}
                      </td>
                      <td className={`py-2.5 text-center font-bold ${
                        isAcademic ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        {file.recordsEstimate.toLocaleString()}
                      </td>
                      <td className={`py-2.5 text-right text-[10px] ${
                        isAcademic ? 'text-slate-400' : 'text-slate-400'
                      }`}>
                        {file.modificationDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected File Details */}
        {selectedFile && (
          <div className={`rounded-xl border shadow-xs p-5 space-y-4 transition-colors ${
            isAcademic
              ? 'bg-white border-slate-200'
              : 'bg-[#0d1526] border-slate-800 shadow-xl'
          }`}>
            <div>
              <h3 className={`text-sm font-bold font-display-academic ${
                isAcademic ? 'text-slate-900' : 'text-white'
              }`}>
                Storage Placement & Backup Verification
              </h3>
              <p className={`text-xs font-mono truncate ${
                isAcademic ? 'text-amber-800' : 'text-amber-400'
              }`}>
                {selectedFile.name}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-lg border space-y-1 font-mono text-[11px] ${
                isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
              }`}>
                <div className={`flex justify-between ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>Department Owner:</span>
                  <span className={`font-bold ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                    {selectedFile.owner} : {selectedFile.group}
                  </span>
                </div>
                <div className={`flex justify-between ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>Access Permissions:</span>
                  <span className={`font-bold ${isAcademic ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    {selectedFile.permissions}
                  </span>
                </div>
                <div className={`flex justify-between ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>Backup Copies:</span>
                  <span className={`font-bold ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                    {selectedFile.replication} Copies Protected
                  </span>
                </div>
                <div className={`flex justify-between ${isAcademic ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span>Total Disk Footprint:</span>
                  <span className={`font-bold ${isAcademic ? 'text-amber-800' : 'text-amber-400'}`}>
                    {(selectedFile.sizeMB * selectedFile.replication).toFixed(1)} MB
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                  isAcademic ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  128MB File Partitions Stored on Campus Drives
                </span>
                {Array.from({ length: Math.min(3, selectedFile.blockCount) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border space-y-1 ${
                      isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-[#121c32] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className={`font-bold ${isAcademic ? 'text-slate-900' : 'text-white'}`}>
                        FILE_CHUNK_{4192 + idx}
                      </span>
                      <span className={`font-bold ${isAcademic ? 'text-emerald-700' : 'text-emerald-400'}`}>
                        Verified Safe (CRC32)
                      </span>
                    </div>
                    <div className={`text-[10px] ${isAcademic ? 'text-slate-600' : 'text-slate-400'}`}>
                      Stored across:{' '}
                      <span className={`font-mono font-medium ${isAcademic ? 'text-slate-800' : 'text-slate-200'}`}>
                        Drive 1, Drive 2, Drive 3
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ingest Modal */}
      {ingestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-xl border shadow-2xl p-6 space-y-4 ${
            isAcademic
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-[#0d1526] border-slate-800 text-slate-100'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${
              isAcademic ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <div>
                <h3 className={`text-base font-bold font-display-academic ${
                  isAcademic ? 'text-slate-900' : 'text-white'
                }`}>
                  Upload New Student Dataset into Campus Storage
                </h3>
                <p className={`text-xs font-serif-academic italic ${
                  isAcademic ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Automatic upload and verification to /campus_data/raw/
                </p>
              </div>
              <button
                onClick={() => setIngestModalOpen(false)}
                className={`font-bold ${isAcademic ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIngestSubmit} className="space-y-4 text-xs">
              {/* File Dropzone */}
              <div className={`p-4 rounded-xl border-2 border-dashed transition-all text-center ${
                isAcademic
                  ? 'border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-slate-800'
                  : 'border-amber-700/60 bg-amber-950/20 hover:bg-amber-950/40 text-slate-100'
              }`}>
                <input
                  type="file"
                  id="csv-file-upload"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="csv-file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <UploadCloud className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                  <div className="font-bold text-sm">
                    {csvFile ? `Selected: ${csvFile.name}` : 'Click to Browse or Drag & Drop .CSV Dataset'}
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-sm">
                    Uploads any educational CSV (attendance records, student demographics, midterm scores). Data is automatically parsed and saved directly into MongoDB.
                  </p>
                </label>
              </div>

              {csvColumns.length > 0 && (
                <div className={`p-3 rounded-lg border text-[11px] font-mono space-y-1.5 ${
                  isAcademic ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <div className="text-amber-700 dark:text-amber-400 font-bold flex items-center justify-between">
                    <span>Detected {csvColumns.length} Headers & {newRecordsCount} Rows</span>
                    <span className="text-emerald-600 font-bold">✓ Ready for MongoDB</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {csvColumns.slice(0, 8).map((col, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {col}
                      </span>
                    ))}
                    {csvColumns.length > 8 && <span className="text-slate-400">+{csvColumns.length - 8} more</span>}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className={`font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                  Dataset Name / Category
                </label>
                <input
                  type="text"
                  value={newDatasetName}
                  onChange={(e) => setNewDatasetName(e.target.value)}
                  className={`w-full rounded-lg p-2 font-mono focus:outline-none border ${
                    isAcademic
                      ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                      : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                    Total Student Records
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000000"
                    value={newRecordsCount}
                    onChange={(e) => setNewRecordsCount(Number(e.target.value))}
                    className={`w-full rounded-lg p-2 font-mono focus:outline-none border ${
                      isAcademic
                        ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                        : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
                    }`}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className={`font-semibold ${isAcademic ? 'text-slate-700' : 'text-slate-300'}`}>
                    Storage Table Format
                  </label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as any)}
                    className={`w-full rounded-lg p-2 font-mono focus:outline-none border ${
                      isAcademic
                        ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-amber-600'
                        : 'bg-[#090f1d] border-slate-700 text-slate-100 focus:border-amber-500'
                    }`}
                  >
                    <option value="csv">Standard Spreadsheet (.csv)</option>
                    <option value="parquet">High-Speed Campus Table (.parquet)</option>
                    <option value="orc">Optimized Archive Table (.orc)</option>
                  </select>
                </div>
              </div>

              {uploadFeedback && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadFeedback}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIngestModalOpen(false)}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    isAcademic
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Saving to MongoDB...' : 'Upload & Save to MongoDB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
