import React, { useState } from 'react';
import { Bot, Sparkles, Send, Loader2, HelpCircle, ChevronRight } from 'lucide-react';
import { FunctionPreset, StudentProfile } from '../types';
import { addActivityLog } from '../utils/storage';
import { sound } from '../utils/audio';

interface SocraticCoachBarProps {
  preset: FunctionPreset;
  xVal: number;
  hVal: number;
  studentProfile: StudentProfile | null;
}

const QUICK_SOCRATIC_PROMPTS = [
  'How does the secant line turn into a tangent line as h shrinks?',
  'Why must we cancel h algebraically before taking the limit?',
  'What does a stationary point f\'(x)=0 represent physically?',
  'How does the second derivative test determine max vs min?',
];

export const SocraticCoachBar: React.FC<SocraticCoachBarProps> = ({
  preset,
  xVal,
  hVal,
  studentProfile,
}) => {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [activeHint, setActiveHint] = useState<string>(
    `Welcome, ${studentProfile?.name || 'Scholar'}! Notice how when h is large, the cyan chord gives an average rate. Drag h towards 0 to see it converge into the red tangent line.`
  );
  const [loading, setLoading] = useState(false);
  const [hintSource, setHintSource] = useState<'gemini' | 'heuristic' | 'fallback'>('heuristic');

  const secantSlope = (preset.f(xVal + hVal) - preset.f(xVal)) / hVal;
  const exactSlope = preset.df(xVal);

  const fetchHint = async (queryText?: string) => {
    setLoading(true);
    sound.playSliderTick(800);
    try {
      const response = await fetch('/api/socratic-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionName: preset.name,
          expression: preset.formulaLatex,
          xVal,
          hVal,
          secantSlope: isFinite(secantSlope) ? Number(secantSlope.toFixed(4)) : null,
          exactSlope: isFinite(exactSlope) ? Number(exactSlope.toFixed(4)) : null,
          level: studentProfile?.level || 'Form 2 (Year 2 SHS)',
          studentName: studentProfile?.name || 'Scholar',
          query: queryText || customQuestion || 'Guide my calculus intuition on this state.',
        }),
      });

      if (!response.ok) throw new Error('API query failed');
      const data = await response.json();
      if (data.hint) {
        setActiveHint(data.hint);
        setHintSource(data.source || 'gemini');
        sound.playSnapChime();

        if (studentProfile) {
          addActivityLog({
            studentId: studentProfile.classId,
            studentName: studentProfile.name,
            level: studentProfile.level,
            functionId: preset.id,
            functionName: preset.name,
            x: xVal,
            h: hVal,
            secantSlope: isFinite(secantSlope) ? secantSlope : 0,
            exactSlope: isFinite(exactSlope) ? exactSlope : 0,
            actionType: 'SOCRATIC_QUERY',
            details: `Socratic question: "${queryText || customQuestion || 'General guide'}".`,
            status: 'COMPLETED',
          });
        }
      }
    } catch {
      // Offline fallback heuristic
      const hNum = hVal;
      let offlineText = '';
      if (hNum > 0.4) {
        offlineText = `Notice that when h = ${hNum.toFixed(3)}, point Q is far from P, so the secant slope (${secantSlope.toFixed(3)}) averages over a wide interval. As you slide h closer to 0.001, how does the slope change?`;
      } else if (hNum > 0.005) {
        offlineText = `Points P and Q are now extremely close (h = ${hNum.toFixed(4)}). Notice that the difference quotient (${secantSlope.toFixed(4)}) is practically identical to the tangent derivative (${exactSlope.toFixed(4)})!`;
      } else {
        offlineText = `Limit convergence achieved! At h = ${hNum.toFixed(4)}, the secant line has collapsed onto the tangent line. The difference quotient limit lim_{h→0} equals exact f'(${xVal.toFixed(2)}) = ${exactSlope.toFixed(4)}.`;
      }
      setActiveHint(offlineText);
      setHintSource('heuristic');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    fetchHint(prompt);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    fetchHint(customQuestion);
    setIsOpenDialog(false);
    setCustomQuestion('');
  };

  return (
    <>
      {/* Slim Docked Socratic Ribbon */}
      <div
        id="socratic-coach-ribbon"
        className="w-full bg-slate-900/95 border-t border-slate-800 px-3 sm:px-4 py-2 shrink-0 flex items-center justify-between gap-3 text-xs z-20"
      >
        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 overflow-hidden flex-1">
            <span className="font-bold text-blue-400 shrink-0 hidden sm:inline">
              Sir Eugene Socratic Coach:
            </span>
            <p className="text-slate-200 truncate italic text-[11px] sm:text-xs">
              "{activeHint}"
            </p>
          </div>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-bold shrink-0 hidden md:inline ${
              hintSource === 'gemini'
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {hintSource === 'gemini' ? 'AI Coach' : 'Heuristic'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="ask-socratic-coach-btn"
            type="button"
            onClick={() => setIsOpenDialog(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-3 py-1.5 rounded-xl font-bold shadow transition-all cursor-pointer text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Coach</span>
          </button>
        </div>
      </div>

      {/* Socratic Coach Interactive Modal */}
      {isOpenDialog && (
        <div
          id="socratic-dialog-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            id="socratic-dialog-card"
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Sir Eugene Socratic Calculus Coach
                  </h3>
                  <div className="text-[10px] text-slate-400">
                    Guiding your first-principles calculus intuition
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpenDialog(false)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Current Socratic Hint Box */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Sir Eugene's Guidance
                </span>
                <span className="font-mono text-slate-500">
                  f({xVal.toFixed(2)}), h={hVal.toFixed(4)}
                </span>
              </div>
              <p className="italic text-blue-100">{activeHint}</p>
            </div>

            {/* Quick Socratic Questions */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Suggested Calculus Inquiries:
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {QUICK_SOCRATIC_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleQuickPrompt(prompt);
                      setIsOpenDialog(false);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Question Form */}
            <form onSubmit={handleCustomSubmit} className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a calculus question or observation..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading || !customQuestion.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Ask</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
