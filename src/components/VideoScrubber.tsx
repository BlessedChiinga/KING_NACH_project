import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Scissors, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2,
  Film
} from 'lucide-react';
import { 
  extractVideoKeyframes, 
  captureCurrentFrame, 
  ExtractedFrame, 
  formatTime 
} from '../utils/videoExtractor';

interface VideoScrubberProps {
  videoFile: File;
  onSelectFrames: (frames: Array<{ data: string; mimeType: string; timestampLabel?: string }>) => void;
  isAnalyzing: boolean;
}

export const VideoScrubber: React.FC<VideoScrubberProps> = ({
  videoFile,
  onSelectFrames,
  isAnalyzing,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExtracting, setIsExtracting] = useState(true);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  const [useAllFrames, setUseAllFrames] = useState<boolean>(true);
  const [customFrame, setCustomFrame] = useState<ExtractedFrame | null>(null);

  // Initialize video object URL and auto-extract keyframes
  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);

    let isMounted = true;
    setIsExtracting(true);

    extractVideoKeyframes(videoFile, 4)
      .then((res) => {
        if (!isMounted) return;
        setExtractedFrames(res.frames);
        setDuration(res.duration);
        setIsExtracting(false);
        // Default to all frames or first frame
        if (res.frames.length > 0) {
          setSelectedFrameIndex(0);
        }
      })
      .catch((err) => {
        console.error('Failed to extract keyframes:', err);
        if (isMounted) setIsExtracting(false);
      });

    return () => {
      isMounted = false;
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  // Update parent when selection changes
  useEffect(() => {
    if (customFrame && !useAllFrames) {
      onSelectFrames([
        {
          data: customFrame.dataUrl,
          mimeType: 'image/jpeg',
          timestampLabel: customFrame.timestampFormatted,
        },
      ]);
      return;
    }

    if (useAllFrames && extractedFrames.length > 0) {
      onSelectFrames(
        extractedFrames.map((f, i) => ({
          data: f.dataUrl,
          mimeType: 'image/jpeg',
          timestampLabel: `Frame ${i + 1} (${f.timestampFormatted})`,
        }))
      );
    } else if (selectedFrameIndex !== null && extractedFrames[selectedFrameIndex]) {
      const f = extractedFrames[selectedFrameIndex];
      onSelectFrames([
        {
          data: f.dataUrl,
          mimeType: 'image/jpeg',
          timestampLabel: f.timestampFormatted,
        },
      ]);
    }
  }, [useAllFrames, selectedFrameIndex, customFrame, extractedFrames, onSelectFrames]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleCaptureCurrent = async () => {
    if (!videoRef.current) return;
    try {
      const frame = await captureCurrentFrame(videoRef.current);
      setCustomFrame(frame);
      setUseAllFrames(false);
      setSelectedFrameIndex(null);
    } catch (e) {
      console.error('Failed to capture frame from video element:', e);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-6">
      
      {/* Video Player Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Video Clip Loaded</h3>
            <p className="text-xs text-slate-400">
              {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          </div>
        </div>

        {/* Multi-frame toggle badge */}
        <button
          type="button"
          onClick={() => {
            setUseAllFrames(!useAllFrames);
            setCustomFrame(null);
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            useAllFrames
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Analyze 4 Multi-Angle Keyframes (Recommended)</span>
          {useAllFrames && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 ml-1" />}
        </button>
      </div>

      {/* Main Video Viewport & Scrubber */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Video Player */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center group shadow-2xl">
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
              playsInline
            />

            {/* Play/Pause overlay */}
            <button
              onClick={togglePlay}
              className={`absolute w-14 h-14 rounded-full bg-slate-900/80 hover:bg-slate-900 text-amber-400 flex items-center justify-center backdrop-blur-md border border-slate-700 shadow-xl transition-all transform ${
                isPlaying ? 'opacity-0 group-hover:opacity-100 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
          </div>

          {/* Timeline Bar */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.05"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
            />
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={togglePlay}
                className="text-xs flex items-center gap-1.5 text-slate-300 hover:text-white"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                type="button"
                onClick={handleCaptureCurrent}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
              >
                <Scissors className="w-3 h-3" />
                <span>Freeze Frame at {formatTime(currentTime)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Extracted Keyframes Showcase */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Extracted Keyframes</span>
              {isExtracting && <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />}
            </h4>
            <span className="text-[11px] text-slate-500">
              {useAllFrames ? 'Sending all 4 to AI' : 'Single frame selected'}
            </span>
          </div>

          {isExtracting ? (
            <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800/60 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              <p className="text-xs text-slate-400">Sampling representative video frames...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {extractedFrames.map((frame, idx) => {
                const isSelected = (!useAllFrames && selectedFrameIndex === idx && !customFrame) || useAllFrames;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setUseAllFrames(false);
                      setCustomFrame(null);
                      setSelectedFrameIndex(idx);
                    }}
                    className={`relative rounded-xl overflow-hidden border cursor-pointer group transition-all ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={frame.dataUrl}
                      alt={`Keyframe ${idx + 1}`}
                      className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-amber-400" />
                        {frame.timestampFormatted}
                      </span>
                      {isSelected && (
                        <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[9px]">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom Captured Frame Notification */}
          {customFrame && (
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-xl flex items-center gap-3">
              <img
                src={customFrame.dataUrl}
                alt="Custom capture"
                className="w-16 h-10 object-cover rounded-md border border-indigo-500/50"
              />
              <div className="flex-1 min-w-0 text-xs">
                <p className="text-indigo-200 font-medium">Custom Frame Selected</p>
                <p className="text-[11px] text-indigo-400 font-mono">Timestamp: {customFrame.timestampFormatted}</p>
              </div>
              <button
                type="button"
                onClick={() => setUseAllFrames(true)}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Reset
              </button>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-400 text-xs space-y-1">
            <p className="flex items-center gap-1.5 text-amber-300 font-medium text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              Tip for accurate video matching:
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Videos with character faces, distinct lighting, or dialogue subtitles yield 99% identification confidence.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
