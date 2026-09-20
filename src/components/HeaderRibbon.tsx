import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  ShieldAlert,
  HelpCircle,
  Wifi,
  WifiOff,
  User,
  Sparkles,
} from 'lucide-react';
import { FunctionPreset, StudentProfile } from '../types';
import { sound } from '../utils/audio';
import { setSoundPreference } from '../utils/storage';

interface HeaderRibbonProps {
  activePreset: FunctionPreset;
  xVal: number;
  hVal: number;
  studentProfile: StudentProfile | null;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
  onOpenHelp: () => void;
}

export const HeaderRibbon: React.FC<HeaderRibbonProps> = ({
  activePreset,
  xVal,
  hVal,
  studentProfile,
  onOpenProfile,
  onOpenAdmin,
  onOpenHelp,
}) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
    setSoundPreference(next);
    if (next) sound.playAvatarClick();
  };

  const currentFx = activePreset.f(xVal);
  const currentDf = activePreset.df(xVal);
  const currentDy = activePreset.f(xVal + hVal) - currentFx;
  const currentSecSlope = currentDy / hVal;

  return (
    <header
      id="top-header-ribbon"
      className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shrink-0 z-30 overflow-x-auto no-scrollbar whitespace-nowrap select-none"
    >
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 gap-3 min-w-max">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-base shadow-sm font-bold">
            ∫
          </div>
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 flex items-center gap-1">
              <span>SIR EUGENE TECHNOLOGIES</span>
              <Sparkles className="w-2.5 h-2.5 text-blue-300" />
            </div>
            <h1 className="text-xs sm:text-sm font-black text-slate-100 flex items-center gap-1.5">
              <span>Calculus Secant-to-Tangent Studio</span>
              <span className="text-[10px] text-slate-400 font-normal hidden md:inline">
                • Hands-on & Visual Mathematics
              </span>
            </h1>
          </div>
        </div>

        {/* Compact Live Calculus Stats Badge */}
        <div
          id="compact-calculus-stats-badge"
          className="flex items-center gap-2.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/80 text-xs font-mono"
        >
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-sans text-[10px] uppercase font-bold">f(x):</span>
            <span className="text-blue-300 font-semibold">{activePreset.formulaLatex.replace('f(x) = ', '')}</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-sans text-[10px] uppercase font-bold">P(x,y):</span>
            <span className="text-slate-200">({xVal.toFixed(2)}, {currentFx.toFixed(2)})</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-sans text-[10px] uppercase font-bold">h:</span>
            <span className="text-cyan-400 font-bold">{hVal.toFixed(4)}</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-sans text-[10px] uppercase font-bold">m_sec:</span>
            <span className="text-teal-300">{isFinite(currentSecSlope) ? currentSecSlope.toFixed(3) : '∞'}</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-sans text-[10px] uppercase font-bold">f'(x):</span>
            <span className="text-rose-400 font-bold">{isFinite(currentDf) ? currentDf.toFixed(3) : '∞'}</span>
          </div>
        </div>

        {/* Control Buttons Strip */}
        <div className="flex items-center gap-1.5">
          {/* PWA Offline status */}
          <div
            id="pwa-offline-badge"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
            title={isOnline ? 'Online (Cache-First PWA Active)' : '100% Offline Classroom Mode Active'}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isOnline ? 'PWA Ready' : 'Offline'}</span>
          </div>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            type="button"
            onClick={toggleSound}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-blue-400 hover:text-blue-300'
                : 'bg-slate-850 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Mute Web Audio Synthesizer' : 'Enable Web Audio Synthesizer'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Help Guide */}
          <button
            id="help-guide-btn"
            type="button"
            onClick={onOpenHelp}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Calculus Studio Help & Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Super Admin Portal */}
          <button
            id="open-super-admin-btn"
            type="button"
            onClick={onOpenAdmin}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
            title="Super Admin PIN Portal (PIN: 1234)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Super Admin</span>
          </button>

          {/* Student Profile Button */}
          <button
            id="open-student-profile-btn"
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            {studentProfile ? (
              <>
                <span className="text-sm">{studentProfile.avatar}</span>
                <span className="max-w-[100px] truncate">{studentProfile.name.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5" />
                <span>Student Gate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
