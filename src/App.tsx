import { useState, useEffect, useCallback } from 'react';
import { FUNCTION_PRESETS } from './utils/mathPresets';
import { FunctionPreset, StudentProfile, StationaryPoint } from './types';
import { getStoredProfile, addActivityLog } from './utils/storage';
import { sound } from './utils/audio';

import { HeaderRibbon } from './components/HeaderRibbon';
import { PlotCanvas } from './components/PlotCanvas';
import { LimitConvergencePanel } from './components/LimitConvergencePanel';
import { OptimizationStationaryPanel } from './components/OptimizationStationaryPanel';
import { SocraticCoachBar } from './components/SocraticCoachBar';
import { DockedActionStrip } from './components/DockedActionStrip';
import { StudentGateModal } from './components/StudentGateModal';
import { SuperAdminModal } from './components/SuperAdminModal';
import { HelpGuideModal } from './components/HelpGuideModal';
import { MathView } from './components/MathView';
import { Activity, Target, Sliders, CheckCircle } from 'lucide-react';

export default function App() {
  // Student Profile State
  const [profile, setProfile] = useState<StudentProfile | null>(() => getStoredProfile());
  const [isGateOpen, setIsGateOpen] = useState(() => !getStoredProfile());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Active Calculus State
  const [activePreset, setActivePreset] = useState<FunctionPreset>(FUNCTION_PRESETS[0]);
  const [xVal, setXVal] = useState<number>(FUNCTION_PRESETS[0].defaultX);
  const [hVal, setHVal] = useState<number>(FUNCTION_PRESETS[0].defaultH);

  // UI / Display Toggles
  const [showSecant, setShowSecant] = useState(true);
  const [showTangent, setShowTangent] = useState(true);
  const [showTriangle, setShowTriangle] = useState(true);
  const [activeTab, setActiveTab] = useState<'limits' | 'optimization'>('limits');
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // When active preset changes, reset x and h defaults
  const handleSelectPreset = (preset: FunctionPreset) => {
    setActivePreset(preset);
    setXVal(preset.defaultX);
    setHVal(preset.defaultH);
    setVerificationFeedback(null);

    if (profile) {
      addActivityLog({
        studentId: profile.classId,
        studentName: profile.name,
        level: profile.level,
        functionId: preset.id,
        functionName: preset.name,
        x: preset.defaultX,
        h: preset.defaultH,
        secantSlope: (preset.f(preset.defaultX + preset.defaultH) - preset.f(preset.defaultX)) / preset.defaultH,
        exactSlope: preset.df(preset.defaultX),
        actionType: 'FUNCTION_SELECT',
        details: `Loaded preset ${preset.name} (${preset.formulaLatex}) at x = ${preset.defaultX}`,
        status: 'IN_PROGRESS',
      });
    }
  };

  // Handle Point P x change
  const handleXChange = useCallback(
    (newX: number) => {
      setXVal(newX);
    },
    []
  );

  // Handle Step h change
  const handleHChange = (newH: number) => {
    setHVal(newH);
  };

  // Handle h snap
  const handleSnapH = (newH: number) => {
    setHVal(newH);
    if (profile) {
      const secantSlope = (activePreset.f(xVal + newH) - activePreset.f(xVal)) / newH;
      const exactSlope = activePreset.df(xVal);
      addActivityLog({
        studentId: profile.classId,
        studentName: profile.name,
        level: profile.level,
        functionId: activePreset.id,
        functionName: activePreset.name,
        x: xVal,
        h: newH,
        secantSlope: isFinite(secantSlope) ? secantSlope : 0,
        exactSlope: isFinite(exactSlope) ? exactSlope : 0,
        actionType: newH <= 0.001 ? 'LIMIT_SNAP' : 'H_CONVERGENCE',
        details: `Snapped interval h to ${newH} at x = ${xVal.toFixed(2)}. Secant slope = ${secantSlope.toFixed(4)}, Exact = ${exactSlope.toFixed(4)}.`,
        status: newH <= 0.001 ? 'COMPLETED' : 'IN_PROGRESS',
      });
    }
  };

  // Reset View
  const handleResetView = () => {
    setXVal(activePreset.defaultX);
    setHVal(activePreset.defaultH);
    setVerificationFeedback(null);
  };

  // Find Stationary Points action
  const handleFindStationary = () => {
    setActiveTab('optimization');
    if (activePreset.stationaryPoints.length > 0) {
      const firstPt = activePreset.stationaryPoints[0];
      setXVal(firstPt.x);
      sound.playStationaryChime();
      if (profile) {
        addActivityLog({
          studentId: profile.classId,
          studentName: profile.name,
          level: profile.level,
          functionId: activePreset.id,
          functionName: activePreset.name,
          x: firstPt.x,
          h: hVal,
          secantSlope: 0,
          exactSlope: 0,
          actionType: 'STATIONARY_POINT_TEST',
          details: `Stationary point found at x = ${firstPt.x} (${firstPt.type}). f''(x) = ${firstPt.fDoublePrime}.`,
          status: 'COMPLETED',
        });
      }
    } else {
      sound.playAvatarClick();
    }
  };

  // Jump to specific stationary point from panel
  const handleJumpToStationary = (targetX: number, pt?: StationaryPoint) => {
    setXVal(targetX);
    if (profile && pt) {
      addActivityLog({
        studentId: profile.classId,
        studentName: profile.name,
        level: profile.level,
        functionId: activePreset.id,
        functionName: activePreset.name,
        x: targetX,
        h: hVal,
        secantSlope: 0,
        exactSlope: 0,
        actionType: 'STATIONARY_POINT_TEST',
        details: `Jumped to ${pt.type} at (${pt.x}, ${pt.y}). Reason: ${pt.reason}`,
        status: 'COMPLETED',
      });
    }
  };

  // Verify Derivative Action
  const handleVerifyDerivative = () => {
    const secantSlope = (activePreset.f(xVal + hVal) - activePreset.f(xVal)) / hVal;
    const exactSlope = activePreset.df(xVal);
    const err = Math.abs(secantSlope - exactSlope);

    sound.playLaunchChime();
    setVerificationFeedback(
      `Derivative Verified! At x = ${xVal.toFixed(3)}, exact f'(${xVal.toFixed(2)}) = ${exactSlope.toFixed(4)}. Current secant approximation error: ${err.toFixed(5)}.`
    );

    if (profile) {
      addActivityLog({
        studentId: profile.classId,
        studentName: profile.name,
        level: profile.level,
        functionId: activePreset.id,
        functionName: activePreset.name,
        x: xVal,
        h: hVal,
        secantSlope: isFinite(secantSlope) ? secantSlope : 0,
        exactSlope: isFinite(exactSlope) ? exactSlope : 0,
        actionType: 'DERIVATIVE_VERIFY',
        details: `Student verified derivative for ${activePreset.name} at x = ${xVal.toFixed(2)}. Instantaneous slope = ${exactSlope.toFixed(4)}.`,
        status: 'VERIFIED',
      });
    }

    setTimeout(() => {
      setVerificationFeedback(null);
    }, 6000);
  };

  // Save profile from gate
  const handleProfileSaved = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    setIsGateOpen(false);
  };

  const [xMin, xMax] = activePreset.xRange;

  return (
    <div
      id="calculus-studio-app"
      className="h-[100dvh] min-h-[100dvh] w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none pb-[max(12px,env(safe-area-inset-bottom))]"
    >
      {/* Top Swipeable Header Ribbon */}
      <HeaderRibbon
        activePreset={activePreset}
        xVal={xVal}
        hVal={hVal}
        studentProfile={profile}
        onOpenProfile={() => setIsGateOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Verification Feedback Banner */}
      {verificationFeedback && (
        <div
          id="verification-toast-banner"
          className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md shrink-0 animate-in slide-in-from-top duration-200 z-30"
        >
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{verificationFeedback}</span>
        </div>
      )}

      {/* Main Workspace (Plot Canvas + Analysis Sidebars) */}
      <main className="flex-1 w-full overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 p-2 sm:p-3 min-h-0">
        {/* Left / Center Column: Function Plotter Canvas & Controls (7 cols on desktop) */}
        <section className="lg:col-span-7 h-full flex flex-col space-y-2 min-h-0">
          {/* Main Visual Plot Canvas */}
          <div className="flex-1 min-h-0">
            <PlotCanvas
              preset={activePreset}
              xVal={xVal}
              hVal={hVal}
              onXChange={handleXChange}
              showSecant={showSecant}
              showTangent={showTangent}
              showTriangle={showTriangle}
              showStationaryMarkers={activeTab === 'optimization'}
              onSelectStationaryPoint={handleJumpToStationary}
            />
          </div>

          {/* Interactive Point P Slider Bar */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 p-2.5 sm:p-3 shrink-0 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 shrink-0">
              <Sliders className="w-3.5 h-3.5" />
              <span>Point P (x):</span>
              <span className="font-mono text-slate-100 text-sm font-black bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                {xVal.toFixed(2)}
              </span>
            </div>

            <input
              id="point-p-x-slider"
              type="range"
              min={xMin + 0.1}
              max={xMax - 0.1}
              step="0.01"
              value={xVal}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                handleXChange(val);
                sound.playSliderTick();
              }}
              className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />

            <div className="text-[11px] font-mono text-slate-400 shrink-0 hidden sm:inline">
              f({xVal.toFixed(2)}) = {activePreset.f(xVal).toFixed(2)}
            </div>
          </div>
        </section>

        {/* Right Column: Limit Convergence Engine & Optimization Tabs (5 cols on desktop) */}
        <aside className="lg:col-span-5 h-full flex flex-col space-y-2 min-h-0 overflow-hidden">
          {/* Sub-Tab Navigation Header */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              id="tab-limits-btn"
              type="button"
              onClick={() => {
                setActiveTab('limits');
                sound.playSliderTick();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'limits'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Limit Engine & Table</span>
            </button>

            <button
              id="tab-optimization-btn"
              type="button"
              onClick={() => {
                setActiveTab('optimization');
                sound.playSliderTick();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'optimization'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Stationary & 2nd Deriv</span>
            </button>
          </div>

          {/* Active Tab Panel Body */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {activeTab === 'limits' ? (
              <LimitConvergencePanel
                preset={activePreset}
                xVal={xVal}
                hVal={hVal}
                onHChange={handleHChange}
                onSnapH={handleSnapH}
              />
            ) : (
              <OptimizationStationaryPanel
                preset={activePreset}
                xVal={xVal}
                onJumpToX={handleJumpToStationary}
              />
            )}
          </div>
        </aside>
      </main>

      {/* Sir Eugene Socratic AI Coach Ribbon */}
      <SocraticCoachBar
        preset={activePreset}
        xVal={xVal}
        hVal={hVal}
        studentProfile={profile}
      />

      {/* Docked Action Strip */}
      <DockedActionStrip
        presets={FUNCTION_PRESETS}
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        onSnapH={handleSnapH}
        onResetView={handleResetView}
        onFindStationary={handleFindStationary}
        onVerifyDerivative={handleVerifyDerivative}
        showSecant={showSecant}
        setShowSecant={setShowSecant}
        showTangent={showTangent}
        setShowTangent={setShowTangent}
        showTriangle={showTriangle}
        setShowTriangle={setShowTriangle}
      />

      {/* Mandatory Student Entry Modal */}
      <StudentGateModal
        isOpen={isGateOpen}
        onProfileSaved={handleProfileSaved}
        initialProfile={profile}
        canClose={!!profile}
        onClose={() => setIsGateOpen(false)}
      />

      {/* Super Admin Dashboard Modal */}
      <SuperAdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Help & Pedagogy Guide Modal */}
      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
