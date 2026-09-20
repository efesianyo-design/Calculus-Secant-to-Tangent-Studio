import React from 'react';
import { BookOpen, Sparkles, Target, Activity, CheckCircle2 } from 'lucide-react';
import { MathView } from './MathView';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="help-guide-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div
        id="help-guide-modal-card"
        className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-850 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                SIR EUGENE TECHNOLOGIES • PEDAGOGY GUIDE
              </div>
              <h2 className="text-lg font-black text-slate-100">
                Visual Calculus & First-Principles Guide
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-sm font-semibold transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1: The Difference Quotient */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-blue-400 flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4" />
              1. The Difference Quotient & Secant Lines
            </h3>
            <p>
              A secant line passes through two points on a curve: <strong className="text-blue-300">P(x, f(x))</strong> and <strong className="text-cyan-300">Q(x+h, f(x+h))</strong>. Its slope represents the <em>Average Rate of Change</em> over the interval <span className="font-mono text-cyan-400">h = Δx</span>:
            </p>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center font-mono">
              <MathView math="m_{\text{sec}} = \frac{\Delta y}{\Delta x} = \frac{f(x+h) - f(x)}{h}" displayMode />
            </div>
          </div>

          {/* Section 2: Secant-to-Tangent Limit Convergence */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-cyan-400 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" />
              2. Convergence to the Tangent Line
            </h3>
            <p>
              As <span className="font-mono text-cyan-400">h → 0</span>, point <strong>Q</strong> slides along the curve directly toward point <strong>P</strong>. The secant chord pivots until it perfectly grazes the curve at a single point, becoming the <strong>Tangent Line</strong>. The slope of this tangent line is the <strong>instantaneous rate of change</strong>, or the derivative <span className="font-mono text-rose-400">f'(x)</span>:
            </p>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center font-mono">
              <MathView math="f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}" displayMode />
            </div>
          </div>

          {/* Section 3: Stationary Points and Concavity */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              3. Stationary Points & 2nd Derivative Optimization
            </h3>
            <p>
              Stationary (critical) points occur where the tangent slope is completely flat (<span className="font-mono text-amber-300">f'(x) = 0</span>). We use the <strong>Second Derivative Test</strong> (<span className="font-mono text-purple-300">f''(x)</span>) to classify them:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong className="text-emerald-400">f''(x) &gt; 0</strong>: Concave Up (∪) ⇒ <strong>Local Minimum</strong> (valley bottom)</li>
              <li><strong className="text-amber-400">f''(x) &lt; 0</strong>: Concave Down (∩) ⇒ <strong>Local Maximum</strong> (peak top)</li>
              <li><strong className="text-purple-400">f''(x) = 0</strong>: Inconclusive / Possible <strong>Point of Inflection</strong> (change of curvature)</li>
            </ul>
          </div>

          {/* Section 4: Offline PWA & Classroom Tips */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              4. Offline Classroom Deployment
            </h3>
            <p>
              This app is 100% offline capable. All student investigations are persisted locally and can be exported as CSV for teacher grading in the Super Admin Portal (Master PIN: <strong className="text-blue-300 font-mono">1234</strong>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
