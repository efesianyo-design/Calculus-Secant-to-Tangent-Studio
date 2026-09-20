import { ActivityLog, StudentProfile } from '../types';

const PROFILE_KEY = 'sir_eugene_calc_student_profile';
const LOGS_KEY = 'sir_eugene_calc_activity_logs';
const SOUND_KEY = 'sir_eugene_calc_sound_enabled';

export function getStoredProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load student profile:', e);
    return null;
  }
}

export function saveStoredProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save student profile:', e);
  }
}

export function clearStoredProfile(): void {
  try {
    localStorage.removeItem(PROFILE_KEY);
  } catch (e) {}
}

export function getStoredLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load activity logs:', e);
    return [];
  }
}

export function addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
  const newLog: ActivityLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const current = getStoredLogs();
    const updated = [newLog, ...current].slice(0, 500); // keep last 500 entries
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to write log:', e);
  }

  return newLog;
}

export function clearActivityLogs(): void {
  try {
    localStorage.removeItem(LOGS_KEY);
  } catch (e) {}
}

export function exportLogsToCSV(logs: ActivityLog[]): void {
  if (!logs || logs.length === 0) return;

  const headers = [
    'Timestamp',
    'Student Name',
    'Level',
    'Class / ID',
    'Action Type',
    'Function',
    'x',
    'h',
    'Secant Slope [f(x+h)-f(x)]/h',
    'Instantaneous f\'(x)',
    'Status',
    'Details',
  ];

  const escapeCSV = (str: string | number | undefined | null) => {
    if (str === null || str === undefined) return '""';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  };

  const rows = logs.map((log) => [
    escapeCSV(new Date(log.timestamp).toLocaleString()),
    escapeCSV(log.studentName),
    escapeCSV(log.level),
    escapeCSV(log.studentId),
    escapeCSV(log.actionType),
    escapeCSV(log.functionName),
    escapeCSV(log.x),
    escapeCSV(log.h),
    escapeCSV(log.secantSlope),
    escapeCSV(log.exactSlope),
    escapeCSV(log.status),
    escapeCSV(log.details),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Sir_Eugene_Calculus_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getSoundPreference(): boolean {
  try {
    const raw = localStorage.getItem(SOUND_KEY);
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export function setSoundPreference(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, enabled ? 'true' : 'false');
  } catch {}
}
