import React, { useState } from 'react';
import { User, GraduationCap, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { SHSLevel, StudentProfile } from '../types';
import { sound } from '../utils/audio';
import { saveStoredProfile, addActivityLog } from '../utils/storage';

interface StudentGateModalProps {
  isOpen: boolean;
  onProfileSaved: (profile: StudentProfile) => void;
  initialProfile?: StudentProfile | null;
  canClose?: boolean;
  onClose?: () => void;
}

const AVATARS = ['🌟', '🦉', '🚀', '📐', '🧠', '🔬', '💡', '⚡'];
const LEVELS: SHSLevel[] = [
  'Form 1 (Year 1 SHS)',
  'Form 2 (Year 2 SHS)',
  'Form 3 (Year 3 SHS)',
];

export const StudentGateModal: React.FC<StudentGateModalProps> = ({
  isOpen,
  onProfileSaved,
  initialProfile,
  canClose = false,
  onClose,
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [level, setLevel] = useState<SHSLevel>(initialProfile?.level || 'Form 2 (Year 2 SHS)');
  const [classId, setClassId] = useState(initialProfile?.classId || '');
  const [selectedAvatar, setSelectedAvatar] = useState(initialProfile?.avatar || '🌟');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    sound.playAvatarClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full student name.');
      return;
    }
    if (!classId.trim()) {
      setError('Please enter your Class / House / Student ID.');
      return;
    }

    const profile: StudentProfile = {
      name: name.trim(),
      level,
      classId: classId.trim(),
      avatar: selectedAvatar,
      registeredAt: initialProfile?.registeredAt || new Date().toISOString(),
    };

    saveStoredProfile(profile);
    sound.playLaunchChime();

    addActivityLog({
      studentId: profile.classId,
      studentName: profile.name,
      level: profile.level,
      functionId: 'workspace_auth',
      functionName: 'Workspace Session Auth',
      x: 0,
      h: 0,
      secantSlope: 0,
      exactSlope: 0,
      actionType: 'STUDENT_LOGIN',
      details: `Student ${profile.name} (${profile.level}, ${profile.classId}) initialized calculus workspace session.`,
      status: 'COMPLETED',
    });

    onProfileSaved(profile);
    if (onClose) onClose();
  };

  return (
    <div
      id="student-gate-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="student-gate-card"
        className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-w-lg w-full relative my-auto"
      >
        {canClose && onClose && (
          <button
            id="close-gate-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm font-semibold p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        )}

        {/* Header Badge & Brand */}
        <div className="flex items-center gap-4 mb-4">
          <div
            id="selected-avatar-preview"
            className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shadow-sm shrink-0"
          >
            {selectedAvatar}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <span>SIR EUGENE TECHNOLOGIES</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              Student Studio Gate ✨
            </h2>
          </div>
        </div>

        {/* Subtitle / Context */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          Welcome to <span className="font-semibold text-blue-700">Calculus Secant-to-Tangent Studio</span>. Enter your student credentials to log progress, observe difference quotient limits converge into tangents, and test stationary points.
        </p>

        {error && (
          <div className="mb-4 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl p-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              FULL NAME
            </label>
            <input
              id="student-name-input"
              type="text"
              required
              placeholder="e.g. Kwame Mensah / Amina Osei"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm font-medium transition-all"
            />
          </div>

          {/* 2-Column Grid for Level & Class/ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                LEVEL
              </label>
              <select
                id="student-level-select"
                value={level}
                onChange={(e) => setLevel(e.target.value as SHSLevel)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs font-semibold"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                CLASS / HOUSE / ID
              </label>
              <input
                id="student-class-input"
                type="text"
                required
                placeholder="e.g. Form 1 Science B / House 4 / ID-102"
                value={classId}
                onChange={(e) => {
                  setClassId(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs font-medium"
              />
            </div>
          </div>

          {/* Avatar Picker Tray */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              CHOOSE AVATAR BADGE
            </label>
            <div
              id="avatar-picker-tray"
              className="flex items-center justify-between gap-1.5 p-2 bg-slate-100 rounded-2xl border border-slate-200 overflow-x-auto"
            >
              {AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar;
                return (
                  <button
                    key={avatar}
                    id={`avatar-option-${avatar}`}
                    type="button"
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md scale-110 ring-2 ring-blue-400 ring-offset-2 ring-offset-white'
                        : 'bg-white hover:bg-slate-200 text-slate-700 hover:scale-105'
                    }`}
                  >
                    {avatar}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="launch-workspace-btn"
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl shadow-md uppercase tracking-wider flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>🛡️ LAUNCH CALCULUS WORKSPACE</span>
          </button>
        </form>
      </div>
    </div>
  );
};
