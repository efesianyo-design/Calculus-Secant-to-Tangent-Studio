import React from 'react';
import { Target, Compass, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { FunctionPreset, StationaryPoint } from '../types';
import { MathView } from './MathView';
import { sound } from '../utils/audio';

interface OptimizationStationaryPanelProps {
  preset: FunctionPreset;
  xVal: number;
  onJumpToX: (x: number, pt?: StationaryPoint) => void;
}

export const OptimizationStationaryPanel: React.FC<OptimizationStationaryPanelProps> = ({
  preset,
  xVal,
  onJumpToX,
}) => {
  const currentFx = preset.f(xVal);
  const currentDf = preset.df(xVal);
  const currentD2f = preset.d2f(xVal);

  const isStationary = Math.abs(currentDf) < 0.005;
  const concavity =
    currentD2f > 0.001
      ? 'Concave Up (∪)'
      : currentD2f < -0.001
      ? 'Concave Down (∩)'
      : 'Flat / Inflection';

  let currentClassification = 'Standard Point (Non-critical)';
  if (isStationary) {
    if (currentD2f > 0.001) currentClassification = '🎯 Local Minimum (f\'(x)=0, f\'\'(x)>0)';
    else if (currentD2f < -0.001) currentClassification = '🎯 Local Maximum (f\'(x)=0, f\'\'(x)<0)';
    else currentClassification = '🎯 Possible Inflexion Point (f\'(x)=0, f\'\'(x)=0)';
  }

  return (
    <div
      id="optimization-stationary-panel"
      className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col space-y-4 shadow-xl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
            CALCULUS OPTIMIZATION ENGINE
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            Stationary Points & 2nd Derivative Test
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300 font-mono">
            <MathView math="f'(x)=0 \implies \text{Critical}" />
          </div>
        </div>
      </div>

      {/* Live Second-Derivative Analysis at current X */}
      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            Live State at Point P (x = {xVal.toFixed(3)})
          </span>
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              isStationary
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {isStationary ? 'CRITICAL POINT' : 'SLOPED REGION'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center font-mono">
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] uppercase font-bold text-slate-400">Position f(x)</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">{currentFx.toFixed(3)}</div>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] uppercase font-bold text-rose-400">1st Deriv f'(x)</div>
            <div
              className={`text-sm font-bold mt-0.5 ${
                Math.abs(currentDf) < 0.05 ? 'text-amber-400' : 'text-rose-300'
              }`}
            >
              {currentDf.toFixed(3)}
            </div>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <div className="text-[9px] uppercase font-bold text-purple-400">2nd Deriv f''(x)</div>
            <div className="text-sm font-bold text-purple-300 mt-0.5">{currentD2f.toFixed(3)}</div>
          </div>
        </div>

        {/* Diagnostic Status Card */}
        <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {currentD2f > 0.001 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : currentD2f < -0.001 ? (
              <ArrowDownRight className="w-4 h-4 text-amber-400" />
            ) : (
              <Minus className="w-4 h-4 text-purple-400" />
            )}
            <span className="text-slate-300 font-medium">Concavity:</span>
            <span className="font-bold text-slate-100">{concavity}</span>
          </div>

          <div className="text-[11px] font-semibold text-blue-400 font-mono">
            {currentClassification}
          </div>
        </div>
      </div>

      {/* Preset Critical Points Quick-Jump Strip */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            Known Stationary Points for {preset.name}
          </span>
          <span className="text-[10px] text-slate-400">
            {preset.stationaryPoints.length} detected
          </span>
        </div>

        {preset.stationaryPoints.length === 0 ? (
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 italic">
            This function preset has no stationary points (f'(x) ≠ 0 everywhere across its domain). The slope is strictly monotonic.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {preset.stationaryPoints.map((pt, idx) => {
              const isAtPoint = Math.abs(xVal - pt.x) < 0.01;
              return (
                <button
                  key={idx}
                  id={`jump-stationary-pt-${idx}`}
                  type="button"
                  onClick={() => {
                    onJumpToX(pt.x, pt);
                    sound.playStationaryChime();
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isAtPoint
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md scale-[1.02]'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        pt.type === 'Local Maximum'
                          ? 'text-amber-400'
                          : pt.type === 'Local Minimum'
                          ? 'text-emerald-400'
                          : 'text-purple-400'
                      }`}
                    >
                      {pt.type}
                    </span>
                    <span className="font-mono text-[11px] text-slate-300 font-semibold">
                      ({pt.x.toFixed(2)}, {pt.y.toFixed(2)})
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {pt.reason}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Second Derivative Test Rule Reference Card */}
      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="font-bold text-slate-300 text-xs">Second Derivative Test Rules:</div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-mono font-bold">f''(x) &gt; 0</span>
          <span>⇒ Concave Up (∪) ⇒ <strong>Local Minimum</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-mono font-bold">f''(x) &lt; 0</span>
          <span>⇒ Concave Down (∩) ⇒ <strong>Local Maximum</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-400 font-mono font-bold">f''(x) = 0</span>
          <span>⇒ Test inconclusive / Possible <strong>Point of Inflection</strong></span>
        </div>
      </div>
    </div>
  );
};
