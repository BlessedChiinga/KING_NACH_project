import React from 'react';
import { Crown, Clapperboard, Sparkles, History, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onReset, onOpenHistory, historyCount }) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-amber-500/20 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand */}
        <button
          onClick={onReset}
          className="flex items-center gap-3.5 group text-left focus:outline-none"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-all duration-300 group-hover:scale-105 border border-amber-300/40">
              <Crown className="w-6 h-6 text-slate-950 fill-slate-950 stroke-[2.4]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-amber-400/60 flex items-center justify-center">
              <Clapperboard className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-white font-display">
                King <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">Nach</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                Scene King
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block font-medium">
              The Sovereign AI Finder for Movies, Anime & Series
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white text-xs sm:text-sm font-medium transition-all"
            title="View search history"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 hover:shadow-amber-500/40 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Search</span>
          </button>
        </div>

      </div>
    </header>
  );
};
