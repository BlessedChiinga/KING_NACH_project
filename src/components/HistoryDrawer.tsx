import React from 'react';
import { X, Trash2, Clock, Film, ExternalLink, ArrowRight } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between">
          
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white font-display">
                  Identified Scenes History ({history.length})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[calc(100vh-180px)] space-y-3 pr-1">
              {history.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Film className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-xs">No identified scenes yet.</p>
                  <p className="text-[11px] text-slate-600">
                    Upload a screenshot or video clip to see your matches here.
                  </p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer group transition-all flex gap-3.5 items-center"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.result.title}
                      className="w-16 h-12 rounded-lg object-cover bg-black flex-shrink-0 border border-slate-800 group-hover:scale-105 transition-transform"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 truncate transition-colors">
                        {item.result.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {item.result.year} • {item.result.type}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {item.result.sceneDescription}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer actions */}
          {history.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={onClear}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Search History</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
