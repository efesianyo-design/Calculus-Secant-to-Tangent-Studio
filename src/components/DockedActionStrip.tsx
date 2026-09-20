import React from 'react';
import {
  RotateCcw,
  Sparkles,
  CheckCircle,
  Eye,
  EyeOff,
  Compass,
  Triangle,
} from 'lucide-react';
import { FunctionPreset } from '../types';
import { sound } from '../utils/audio';

interface DockedActionStripProps {
  presets: FunctionPreset[];
  activePreset: FunctionPreset;
  onSelectPreset: (preset: FunctionPreset) => void;
  onSnapH: (h: number) => void;
  onResetView: () => void;
  onFindStationary: () => void;
  onVerifyDerivative: () => void;
  showSecant: boolean;
  setShowSecant: (show: boolean) => void;
  showTangent: boolean;
  setShowTangent: (show: boolean) => void;
  showTriangle: boolean;
  setShowTriangle: (show: boolean) => void;
}

export const DockedActionStrip: React.FC<DockedActionStripProps> = ({
  presets,
  activePreset,
  onSelectPreset,
  onSnapH,
  onResetView,
  onFindStationary,
  onVerifyDerivative,
  showSecant,
  setShowSecant,
  showTangent,
  setShowTangent,
  showTriangle,
  setShowTriangle,
}) => {
  return (
    <div
      id="docked-action-strip"
      className="w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-3 sm:px-4 py-2 shrink-0 flex flex-wrap items-center justify-between gap-2 text-xs select-none z-20 pb-[max(8px,env(safe-area-inset-bottom))]"
    >
      {/* Function Presets Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 shrink-0 hidden sm:inline">
          Function f(x):
        </span>
        {presets.map((p) => {
          const isSelected = p.id === activePreset.id;
          return (
            <button
              key={p.id}
              id={`preset-btn-${p.id}`}
              type="button"
              onClick={() => {
                onSelectPreset(p);
                sound.playSliderTick(500);
              }}
              className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400 scale-[1.03]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {p.formulaLatex.replace('f(x) = ', '')}
            </button>
          );
        })}
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Snap h to 0.001 */}
        <button
          id="action-snap-h-btn"
          type="button"
          onClick={() => {
            onSnapH(0.001);
            sound.playSnapChime();
          }}
          className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-2.5 py-1.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer text-xs"
          title="Snap h step to 0.001 to converge immediately into the tangent derivative"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Snap h→0.001</span>
        </button>

        {/* Find Stationary Points */}
        <button
          id="action-find-stationary-btn"
          type="button"
          onClick={onFindStationary}
          className="flex items-center gap-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs"
          title="Locate critical stationary points where f'(x) = 0"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Stationary Points</span>
          <span className="sm:hidden">Critical</span>
        </button>

        {/* Verify Derivative */}
        <button
          id="action-verify-derivative-btn"
          type="button"
          onClick={onVerifyDerivative}
          className="flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs"
          title="Verify difference quotient convergence and log derivative"
        >
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verify Derivative</span>
        </button>

        {/* Visibility Toggles */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-0.5 rounded-xl border border-slate-800">
          <button
            id="toggle-secant-btn"
            type="button"
            onClick={() => {
              setShowSecant(!showSecant);
              sound.playSliderTick();
            }}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              showSecant
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle Cyan Secant Chord"
          >
            {showSecant ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Secant</span>
          </button>

          <button
            id="toggle-tangent-btn"
            type="button"
            onClick={() => {
              setShowTangent(!showTangent);
              sound.playSliderTick();
            }}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              showTangent
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle Neon Red Tangent Line"
          >
            {showTangent ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Tangent</span>
          </button>

          <button
            id="toggle-triangle-btn"
            type="button"
            onClick={() => {
              setShowTriangle(!showTriangle);
              sound.playSliderTick();
            }}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
              showTriangle
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Toggle Delta X / Delta Y Difference Triangle"
          >
            <Triangle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Δ Triangle</span>
          </button>
        </div>

        {/* Reset View */}
        <button
          id="action-reset-view-btn"
          type="button"
          onClick={() => {
            onResetView();
            sound.playAvatarClick();
          }}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Reset to default coordinates"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
