import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, Sparkles, BookOpen } from 'lucide-react';
import { FunctionPreset } from '../types';
import { MathView } from './MathView';
import { sound } from '../utils/audio';

interface LimitConvergencePanelProps {
  preset: FunctionPreset;
  xVal: number;
  hVal: number;
  onHChange: (h: number) => void;
  onSnapH: (h: number) => void;
}

const H_PRESETS = [1.0, 0.5, 0.1, 0.01, 0.001, 0.0001];

export const LimitConvergencePanel: React.FC<LimitConvergencePanelProps> = ({
  preset,
  xVal,
  hVal,
  onHChange,
  onSnapH,
}) => {
  const [showProof, setShowProof] = useState(true);

  const fx = preset.f(xVal);
  const fxh = preset.f(xVal + hVal);
  const deltaY = fxh - fx;
  const secantSlope = deltaY / hVal;
  const exactSlope = preset.df(xVal);
  const absError = Math.abs(secantSlope - exactSlope);

  // Determine convergence rating
  const isSnapped = absError < 0.001;

  const algebraicSteps = preset.algebraicSteps(xVal, hVal);

  return (
    <div
      id="limit-convergence-panel"
      className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col space-y-4 shadow-xl"
    >
      {/* Header & Core Difference Quotient Definition */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            FIRST-PRINCIPLES LIMIT ENGINE
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
            Difference Quotient Limit
          </h3>
        </div>

        <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 text-xs">
          <MathView
            math="f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}"
            className="text-cyan-300 font-semibold"
          />
        </div>
      </div>

      {/* Interval h Slider & Snap Buttons */}
      <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-300 flex items-center gap-1.5">
            <span>Interval Step (h):</span>
            <span className="font-mono text-cyan-400 text-sm font-black">{hVal.toFixed(4)}</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            Δx = {hVal > 0 ? '+' : ''}{hVal.toFixed(4)}
          </span>
        </div>

        {/* Custom Range Slider with logarithmic scale feel */}
        <input
          id="h-interval-slider"
          type="range"
          min="0.0001"
          max="2.0"
          step="0.0001"
          value={hVal}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onHChange(val);
            sound.playSliderTick();
          }}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />

        {/* Preset Snap Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">Snap h:</span>
          {H_PRESETS.map((presetH) => {
            const isActive = Math.abs(hVal - presetH) < 0.00005;
            return (
              <button
                key={presetH}
                id={`snap-h-${presetH}`}
                type="button"
                onClick={() => {
                  onSnapH(presetH);
                  sound.playSnapChime();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                h={presetH}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Numerical Comparison Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Average Rate of Change / Secant */}
        <div className="bg-slate-950/80 border border-cyan-900/40 rounded-xl p-3">
          <div className="text-[10px] uppercase font-bold text-cyan-400 flex items-center justify-between">
            <span>Average Rate (Secant)</span>
            <span className="font-mono text-[9px] text-cyan-300/80">Δy/Δx</span>
          </div>
          <div className="text-base sm:text-lg font-black text-cyan-300 font-mono mt-1">
            {isFinite(secantSlope) ? secantSlope.toFixed(4) : 'Undefined'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Δy = {deltaY.toFixed(4)}
          </div>
        </div>

        {/* Instantaneous Rate / Tangent */}
        <div className="bg-slate-950/80 border border-rose-900/40 rounded-xl p-3">
          <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center justify-between">
            <span>Instantaneous (Tangent)</span>
            <span className="font-mono text-[9px] text-rose-300/80">f'({xVal.toFixed(2)})</span>
          </div>
          <div className="text-base sm:text-lg font-black text-rose-400 font-mono mt-1">
            {isFinite(exactSlope) ? exactSlope.toFixed(4) : 'Undefined'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Analytical Derivative Limit
          </div>
        </div>

        {/* Convergence Absolute Error */}
        <div className="col-span-2 sm:col-span-1 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center justify-between">
            <span>Error |m_sec - f'|</span>
            {isSnapped && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <div
            className={`text-base sm:text-lg font-black font-mono mt-1 ${
              isSnapped ? 'text-emerald-400' : 'text-amber-300'
            }`}
          >
            {absError < 0.000001 ? '0.0000' : absError.toFixed(5)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {isSnapped ? '✓ Tangent converged' : 'Approaching limit...'}
          </div>
        </div>
      </div>

      {/* Numerical Convergence Table */}
      <div className="space-y-1.5">
        <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            Convergence Step Table
          </span>
          <span className="text-[10px] text-slate-400 font-normal">at x = {xVal.toFixed(2)}</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-[11px] font-mono">
            <thead className="bg-slate-850 text-slate-400 uppercase text-[9px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-1.5 px-2.5">h (Δx)</th>
                <th className="py-1.5 px-2.5">f(x+h)</th>
                <th className="py-1.5 px-2.5">Δy</th>
                <th className="py-1.5 px-2.5">Secant m_sec</th>
                <th className="py-1.5 px-2.5">Exact f'(x)</th>
                <th className="py-1.5 px-2.5 text-right">|Error|</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {H_PRESETS.map((testH) => {
                const testFxh = preset.f(xVal + testH);
                const testDy = testFxh - fx;
                const testSlope = testDy / testH;
                const testErr = Math.abs(testSlope - exactSlope);
                const isCurrent = Math.abs(hVal - testH) < 0.00005;

                return (
                  <tr
                    key={testH}
                    onClick={() => {
                      onSnapH(testH);
                      sound.playSnapChime();
                    }}
                    className={`cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-cyan-950/50 text-cyan-200 font-bold border-l-2 border-cyan-400'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <td className="py-1.5 px-2.5 text-cyan-400">{testH}</td>
                    <td className="py-1.5 px-2.5">{testFxh.toFixed(4)}</td>
                    <td className="py-1.5 px-2.5">{testDy.toFixed(4)}</td>
                    <td className="py-1.5 px-2.5 text-teal-300">{testSlope.toFixed(4)}</td>
                    <td className="py-1.5 px-2.5 text-rose-300">{exactSlope.toFixed(4)}</td>
                    <td className="py-1.5 px-2.5 text-right text-amber-300 font-semibold">
                      {testErr < 0.00001 ? '0.0000' : testErr.toFixed(5)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* First-Principles Algebraic Proof Accordion */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
        <button
          id="toggle-algebraic-proof-btn"
          type="button"
          onClick={() => {
            setShowProof(!showProof);
            sound.playSliderTick();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-850 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 text-blue-400">
            <BookOpen className="w-4 h-4" />
            <span>First-Principles Algebraic Expansion ({preset.name})</span>
          </div>
          {showProof ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showProof && (
          <div className="p-3.5 pt-1 space-y-2.5 text-xs border-t border-slate-800/80">
            {algebraicSteps.map((step, idx) => (
              <div key={idx} className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {step.label}
                </div>
                <div className="overflow-x-auto py-1 text-slate-100">
                  <MathView math={step.math} displayMode />
                </div>
                {step.note && <div className="text-[10px] text-slate-400 mt-1 italic">{step.note}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
