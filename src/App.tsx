/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { ScanningOverlay } from './components/ScanningOverlay';
import { ResultDisplay } from './components/ResultDisplay';
import { HistoryDrawer } from './components/HistoryDrawer';
import { 
  HistoryItem, 
  IdentifyRequestPayload, 
  MovieIdentificationResult 
} from './types';
import { 
  Sparkles, 
  Film, 
  Tv, 
  Search, 
  Layers, 
  ShieldCheck, 
  AlertTriangle,
  PlaySquare,
  HelpCircle
} from 'lucide-react';

const STORAGE_KEY = 'kingnach_history_v1';
const FAVORITES_KEY = 'kingnach_favorites_v1';

export default function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MovieIdentificationResult | null>(null);
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ data: string; mimeType: string; timestampLabel?: string }>
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load history & favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
      const storedFavs = localStorage.getItem(FAVORITES_KEY);
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage:', e);
    }
  }, []);

  const saveToHistory = (res: MovieIdentificationResult, previewUrl: string) => {
    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      previewUrl,
      result: res,
    };
    const updated = [newItem, ...history.filter((h) => h.result.title !== res.title)].slice(0, 20);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to write history to localStorage:', e);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  const handleIdentify = async (payload: IdentifyRequestPayload) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setUploadedImages(payload.images);

    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with HTTP ${res.status}`);
      }

      const data: MovieIdentificationResult = await res.json();
      setResult(data);
      if (payload.images.length > 0) {
        saveToHistory(data, payload.images[0].data);
      }
    } catch (err: any) {
      console.error('Identification failed:', err);
      setErrorMessage(
        err.message || 'Unable to identify the media. Please try with a clearer screenshot or video frame.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setUploadedImages([]);
    setErrorMessage(null);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setResult(item.result);
    setUploadedImages([{ data: item.previewUrl, mimeType: 'image/jpeg' }]);
    setErrorMessage(null);
  };

  const toggleFavorite = () => {
    if (!result) return;
    const title = result.title;
    let next: string[];
    if (favorites.includes(title)) {
      next = favorites.filter((t) => t !== title);
    } else {
      next = [...favorites, title];
    }
    setFavorites(next);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    } catch (e) {}
  };

  const isCurrentFavorite = result ? favorites.includes(result.title) : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col film-grain selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header */}
      <Header
        onReset={handleReset}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="w-full max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-start gap-3.5 shadow-xl animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-semibold text-red-300">Identification Error</p>
              <p className="text-red-300/80 mt-0.5 leading-relaxed">{errorMessage}</p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 underline"
              >
                Try uploading another frame
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        {isAnalyzing ? (
          <ScanningOverlay previewUrl={uploadedImages[0]?.data} />
        ) : result ? (
          <ResultDisplay
            result={result}
            uploadedImages={uploadedImages}
            onReset={handleReset}
            onSaveFavorite={toggleFavorite}
            isSaved={isCurrentFavorite}
          />
        ) : (
          <div className="space-y-16">
            <UploadSection onIdentify={handleIdentify} isAnalyzing={isAnalyzing} />

            {/* Feature Highlights & Technology Badges */}
            <div className="w-full max-w-5xl mx-auto pt-6 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <PlaySquare className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Video Clip & Trailer Scrubbing</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload up to 60-second video clips. King Nach automatically extracts 4 representative keyframes across the timeline or lets you freeze-frame the exact second.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Film className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Exact Scene & Episode Pinpointing</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Goes beyond just title matching. Tells you the exact season, episode title, runtime position, cinematography palette, and what happens in that specific scene.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Tv className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Instant Streaming Availability</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Find out where to stream, rent, or buy immediately across Netflix, Prime Video, Disney+, Max, Apple TV+, and more with direct 1-click links.
                </p>
              </div>

            </div>

            {/* How It Works Explainer */}
            <div className="w-full max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/30 border border-slate-800/60 text-xs text-slate-400 space-y-3">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Tips for Best Recognition Accuracy</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Include characters or faces:</strong> Facial recognition and wardrobe are key indicators for film identification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Avoid extreme dark blurs:</strong> High contrast, lit scenes or unique set designs match with 98%+ confidence.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Video clips work wonders:</strong> Multi-frame analysis samples 4 angles across the clip to eliminate ambiguity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span><strong>Subtitles are a bonus:</strong> Dialogue quotes in subtitles allow instant matching down to the exact second.</span>
                </li>
              </ul>
            </div>
          </div>
        )}

      </main>

      {/* History Slide-out Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onClear={clearHistory}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} King Nach • Sovereign Movie & TV Series Visual Finder</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Powered by Gemini Multimodal Vision AI</span>
          </p>
        </div>
      </footer>

    </div>
  );
}
