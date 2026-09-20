import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Download,
  Trash2,
  Search,
  CheckCircle,
  Clock,
  User,
  Activity,
  KeyRound,
  Filter,
} from 'lucide-react';
import { ActivityLog } from '../types';
import { getStoredLogs, exportLogsToCSV, clearActivityLogs } from '../utils/storage';
import { sound } from '../utils/audio';

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_PIN = '1234';

export const SuperAdminModal: React.FC<SuperAdminModalProps> = ({ isOpen, onClose }) => {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterAction, setFilterAction] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      setLogs(getStoredLogs());
    } else {
      setPinInput('');
      setPinError('');
      // Don't auto de-auth while testing, but keep security clean
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === DEFAULT_PIN) {
      setIsAuthenticated(true);
      setPinError('');
      sound.playSnapChime();
    } else {
      setPinError('Invalid Super Admin PIN. (Default is 1234)');
    }
  };

  const handleExportCSV = () => {
    sound.playSnapChime();
    exportLogsToCSV(logs);
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all student activity logs?')) {
      clearActivityLogs();
      setLogs([]);
      sound.playAvatarClick();
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.functionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel = filterLevel === 'ALL' || log.level.includes(filterLevel);
    const matchesAction = filterAction === 'ALL' || log.actionType === filterAction;

    return matchesSearch && matchesLevel && matchesAction;
  });

  const uniqueStudents = new Set(logs.map((l) => l.studentId || l.studentName)).size;
  const limitCount = logs.filter((l) => l.actionType === 'LIMIT_SNAP' || l.actionType === 'H_CONVERGENCE').length;
  const optCount = logs.filter((l) => l.actionType === 'STATIONARY_POINT_TEST').length;

  return (
    <div
      id="super-admin-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="super-admin-modal-card"
        className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-700/80 shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-850 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                SIR EUGENE TECHNOLOGIES • FACULTY ACCESS
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-100 flex items-center gap-2">
                Super Admin Student Logs & Grading Portal
              </h2>
            </div>
          </div>
          <button
            id="close-admin-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-sm font-semibold transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {!isAuthenticated ? (
          /* PIN Entry Screen */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-xl">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1">Enter Faculty PIN</h3>
              <p className="text-xs text-slate-400 mb-6">
                Default Master PIN: <span className="font-mono text-blue-400 font-bold">1234</span>
              </p>

              {pinError && (
                <div className="mb-4 text-xs font-semibold text-red-400 bg-red-950/50 border border-red-800/60 rounded-xl p-2.5">
                  {pinError}
                </div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <input
                  id="admin-pin-input"
                  type="password"
                  maxLength={6}
                  autoFocus
                  placeholder="• • • •"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  id="submit-admin-pin-btn"
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-md transition-all uppercase tracking-wider text-xs"
                >
                  Authorize Admin Access
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 space-y-4">
            {/* Top Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Logs</div>
                  <div className="text-lg font-black text-slate-100">{logs.length}</div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Students</div>
                  <div className="text-lg font-black text-emerald-400">{uniqueStudents}</div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Limit Calculations</div>
                  <div className="text-lg font-black text-cyan-400">{limitCount}</div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Stationary Tests</div>
                  <div className="text-lg font-black text-amber-400">{optCount}</div>
                </div>
              </div>
            </div>

            {/* Filter and Action Bar */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between shrink-0">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-search-logs-input"
                    type="text"
                    placeholder="Search by student name, class ID, function or details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    id="admin-filter-level-select"
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="Form 1">Form 1 (Year 1)</option>
                    <option value="Form 2">Form 2 (Year 2)</option>
                    <option value="Form 3">Form 3 (Year 3)</option>
                  </select>

                  <select
                    id="admin-filter-action-select"
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 hidden md:block"
                  >
                    <option value="ALL">All Actions</option>
                    <option value="STUDENT_LOGIN">Logins</option>
                    <option value="H_CONVERGENCE">Interval Adjustments</option>
                    <option value="LIMIT_SNAP">Limit Snaps</option>
                    <option value="STATIONARY_POINT_TEST">Stationary Tests</option>
                    <option value="SOCRATIC_QUERY">Socratic Queries</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="export-csv-btn"
                  onClick={handleExportCSV}
                  disabled={logs.length === 0}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Logs to CSV</span>
                </button>

                <button
                  id="clear-logs-btn"
                  onClick={handleClearLogs}
                  disabled={logs.length === 0}
                  className="flex items-center gap-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  title="Clear all logs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/50">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead className="sticky top-0 bg-slate-850 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 z-10">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Student & Class</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Topic / Function</th>
                    <th className="py-2.5 px-3 text-right">x</th>
                    <th className="py-2.5 px-3 text-right">h</th>
                    <th className="py-2.5 px-3 text-right">Secant Slope</th>
                    <th className="py-2.5 px-3 text-right">Exact f'(x)</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                        No activity logs match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <div className="font-bold text-slate-200 text-xs">{log.studentName}</div>
                          <div className="text-[10px] text-slate-400">{log.studentId} • {log.level.split(' ')[0]}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider ${
                              log.actionType === 'LIMIT_SNAP'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : log.actionType === 'STATIONARY_POINT_TEST'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : log.actionType === 'STUDENT_LOGIN'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : log.actionType === 'SOCRATIC_QUERY'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-700/50 text-slate-300'
                            }`}
                          >
                            {log.actionType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans text-xs text-slate-200">
                          {log.functionName}
                        </td>
                        <td className="py-2.5 px-3 text-right text-blue-300">{log.x.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right text-cyan-300">{log.h.toFixed(4)}</td>
                        <td className="py-2.5 px-3 text-right text-teal-300">{log.secantSlope.toFixed(4)}</td>
                        <td className="py-2.5 px-3 text-right text-rose-300 font-bold">{log.exactSlope.toFixed(4)}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="text-[10px] font-sans text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle className="w-3 h-3" />
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
