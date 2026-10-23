import React, { useEffect, useState } from 'react';
import { Sparkles, Film, Eye, Database, Tv, CheckCircle2 } from 'lucide-react';

interface ScanningOverlayProps {
  previewUrl?: string | null;
}

const SCAN_STEPS = [
  { icon: Eye, text: 'Extracting cinematography, lighting & color grading...' },
  { icon: Film, text: 'Analyzing facial features, costumes, and actor identities...' },
  { icon: Database, text: 'Cross-referencing 500,000+ films, TV series & anime...' },
  { icon: Tv, text: 'Pinpointing exact season, episode and scene timestamp...' },
  { icon: Sparkles, text: 'Fetching streaming availability, ratings & soundtrack...' },
];

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ previewUrl }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-amber-500/30 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
      
      {/* Laser Scanning Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] animate-bounce" />
      </div>

      <div className="flex flex-col items-center justify-center text-center space-y-4">
        
        {/* Animated Radar/Reel Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin flex items-center justify-center" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            Deep Scene Analysis in Progress
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Gemini Multimodal AI is inspecting your uploaded visual frames
          </p>
        </div>

        {/* Progress Steps List */}
        <div className="w-full max-w-md bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-left">
          {SCAN_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs transition-all duration-300 ${
                  isCurrent
                    ? 'text-amber-300 font-semibold'
                    : isDone
                    ? 'text-slate-400 line-through opacity-70'
                    : 'text-slate-600'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] ${
                    isCurrent
                      ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-400/50'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="flex-1 truncate">{step.text}</span>
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
