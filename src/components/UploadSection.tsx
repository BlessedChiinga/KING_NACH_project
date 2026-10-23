import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Film, 
  Image as ImageIcon, 
  Camera, 
  Sparkles, 
  Clipboard, 
  X, 
  Search, 
  HelpCircle,
  Clapperboard,
  Tv,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { VideoScrubber } from './VideoScrubber';
import { SAMPLE_SCENES, SampleScene } from '../data/sampleScenes';
import { fileToBase64, compressImageBase64, getImageFromClipboard } from '../utils/imageHelpers';
import { IdentifyRequestPayload } from '../types';

interface UploadSectionProps {
  onIdentify: (payload: IdentifyRequestPayload) => void;
  isAnalyzing: boolean;
}

type TabType = 'image' | 'video' | 'camera' | 'samples';

export const UploadSection: React.FC<UploadSectionProps> = ({ onIdentify, isAnalyzing }) => {
  const [activeTab, setActiveTab] = useState<TabType>('image');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedVideoFrames, setSelectedVideoFrames] = useState<Array<{ data: string; mimeType: string; timestampLabel?: string }>>([]);
  
  const [mediaTypeHint, setMediaTypeHint] = useState<'auto' | 'movie' | 'series' | 'anime'>('auto');
  const [additionalClues, setAdditionalClues] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoStreamRef = useRef<HTMLVideoElement>(null);
  const streamTrackRef = useRef<MediaStream | null>(null);

  // Global paste handler to allow Ctrl+V anywhere
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const file = getImageFromClipboard(e);
      if (file) {
        setActiveTab('image');
        const b64 = await fileToBase64(file);
        const compressed = await compressImageBase64(b64);
        setImagePreview(compressed);
        setVideoFile(null);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamTrackRef.current) {
        streamTrackRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }
    const b64 = await fileToBase64(file);
    const compressed = await compressImageBase64(b64);
    setImagePreview(compressed);
    setVideoFile(null);
  };

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file (MP4, WebM, MOV).');
      return;
    }
    setVideoFile(file);
    setImagePreview(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setActiveTab('video');
        handleVideoFile(file);
      } else if (file.type.startsWith('image/')) {
        setActiveTab('image');
        await handleImageFile(file);
      }
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamTrackRef.current = stream;
      if (videoStreamRef.current) {
        videoStreamRef.current.srcObject = stream;
        videoStreamRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions or upload a screenshot.');
    }
  };

  const stopCamera = () => {
    if (streamTrackRef.current) {
      streamTrackRef.current.getTracks().forEach((t) => t.stop());
      streamTrackRef.current = null;
    }
    setCameraActive(false);
  };

  const captureCameraSnapshot = () => {
    if (!videoStreamRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoStreamRef.current.videoWidth || 1280;
    canvas.height = videoStreamRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoStreamRef.current, 0, 0, canvas.width, canvas.height);
      const b64 = canvas.toDataURL('image/jpeg', 0.9);
      setImagePreview(b64);
      setVideoFile(null);
      stopCamera();
      setActiveTab('image');
    }
  };

  const handleSelectSample = (sample: SampleScene) => {
    setImagePreview(sample.imageUrl);
    setVideoFile(null);
    setAdditionalClues(sample.clues || '');
    if (sample.category === 'Movie') setMediaTypeHint('movie');
    else if (sample.category === 'Series') setMediaTypeHint('series');
    else if (sample.category === 'Anime') setMediaTypeHint('anime');
    setActiveTab('image');
  };

  const handleSubmit = async () => {
    if (isAnalyzing) return;

    if (activeTab === 'video' && videoFile) {
      if (selectedVideoFrames.length === 0) {
        alert('Please wait for the video keyframes to finish extracting, or pause and freeze a frame.');
        return;
      }
      onIdentify({
        images: selectedVideoFrames,
        mediaTypeHint,
        additionalClues,
      });
      return;
    }

    if (!imagePreview) {
      alert('Please upload an image, select a video clip, or choose a sample scene first.');
      return;
    }

    // Convert preview (which could be an external URL for sample scenes) to base64
    let finalBase64 = imagePreview;
    if (imagePreview.startsWith('http')) {
      try {
        const { imageUrlToBase64 } = await import('../utils/imageHelpers');
        finalBase64 = await imageUrlToBase64(imagePreview);
      } catch (e) {
        console.warn('Direct image URL conversion failed, proceeding with fallback', e);
      }
    }

    onIdentify({
      images: [
        {
          data: finalBase64,
          mimeType: 'image/jpeg',
        },
      ],
      mediaTypeHint,
      additionalClues,
    });
  };

  const clearSelection = () => {
    setImagePreview(null);
    setVideoFile(null);
    setSelectedVideoFrames([]);
    setAdditionalClues('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Hero Title Section */}
      <div className="text-center space-y-3 pt-4 sm:pt-8 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>King Nach Visual Film Intelligence</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-display">
          Identify Any Movie or TV Series with <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">King Nach</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload any scene screenshot, trailer clip, phone recording, or meme frame. King Nach pinpoints the exact title, episode, runtime timestamp, cast, and where to stream.
        </p>
      </div>

      {/* Upload Box Container */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-800 p-4 sm:p-7 shadow-2xl space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 border-b border-slate-800/80 pb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('image');
              stopCamera();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'image'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Screenshot / Image</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('video');
              stopCamera();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'video'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Short Video Clip</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              startCamera();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'camera'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera (Snap TV)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('samples');
              stopCamera();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'samples'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            <span>Try Sample Scenes</span>
          </button>
        </div>

        {/* Tab 1: Image / Screenshot */}
        {activeTab === 'image' && (
          <div>
            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                  isDragging
                    ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                    : 'border-slate-700/80 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-950/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/avif"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <p className="text-base font-semibold text-white">
                    Drop your movie screenshot here, or <span className="text-amber-400 underline decoration-amber-400/50 underline-offset-4">browse files</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports PNG, JPG, WEBP, or paste directly with <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">Ctrl + V</kbd>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Film & TV Shows
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Anime & Animation
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Social Media Video Stills
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black group max-h-[460px] flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Selected screenshot"
                  className="max-h-[460px] w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={clearSelection}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white backdrop-blur-md border border-slate-700 transition-all shadow-lg"
                  title="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Short Video Clip */}
        {activeTab === 'video' && (
          <div>
            {!videoFile ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => videoInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                  isDragging
                    ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                    : 'border-slate-700/80 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-950/70'
                }`}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4, video/webm, video/quicktime, video/x-matroska"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleVideoFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                  <Film className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 max-w-md">
                  <p className="text-base font-semibold text-white">
                    Upload a short video clip, screen capture, or trailer snippet
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports MP4, WebM, MOV up to 60 seconds. Our automated keyframe analyzer will extract crystal clear frames.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <VideoScrubber
                  videoFile={videoFile}
                  onSelectFrames={setSelectedVideoFrames}
                  isAnalyzing={isAnalyzing}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-xs text-slate-400 hover:text-slate-200 underline"
                  >
                    Upload a different video
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Camera Capture */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            {cameraError ? (
              <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
                <p className="text-sm text-red-200">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white"
                >
                  Retry Camera
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-700 flex items-center justify-center shadow-xl">
                  <video
                    ref={videoStreamRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-amber-500/30 pointer-events-none rounded-2xl" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[11px] text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Point at your TV or monitor screen
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={captureCameraSnapshot}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Take Freeze Frame</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setActiveTab('image');
                    }}
                    className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Sample Scenes Gallery */}
        {activeTab === 'samples' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select an iconic scene to test instant recognition:
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SAMPLE_SCENES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-amber-500/60 cursor-pointer bg-slate-950/80 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={sample.imageUrl}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-semibold text-amber-300 border border-slate-700">
                      {sample.category}
                    </span>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {sample.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                        {sample.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="italic truncate">{sample.quote}</span>
                      <span className="text-amber-400 font-medium ml-2 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
                        Select →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Filter Controls & Additional Clues */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4 border-t border-slate-800/80">
          
          {/* Media Hint Filter */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>Format Hint (Optional)</span>
            </label>
            <select
              value={mediaTypeHint}
              onChange={(e) => setMediaTypeHint(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
            >
              <option value="auto">Auto Detect (Movie or Series)</option>
              <option value="movie">Movie</option>
              <option value="series">TV Show / Web Series</option>
              <option value="anime">Anime / Japanese Animation</option>
            </select>
          </div>

          {/* Clues / Context */}
          <div className="sm:col-span-8 space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Any extra clues? (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Watched in 2023 on Netflix, quotes: 'we have to go back', sci-fi space movie..."
              value={additionalClues}
              onChange={(e) => setAdditionalClues(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isAnalyzing || (!imagePreview && !videoFile)}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
              isAnalyzing || (!imagePreview && !videoFile)
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <Search className="w-5 h-5 stroke-[2.4]" />
            <span>
              {isAnalyzing
                ? 'Analyzing Cinematic DNA with King Nach AI...'
                : 'Identify with King Nach Now'}
            </span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
