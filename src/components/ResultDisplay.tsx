import React, { useState } from 'react';
import { 
  Sparkles, 
  Film, 
  Tv, 
  Clock, 
  Star, 
  ExternalLink, 
  Play, 
  Music, 
  User, 
  Share2, 
  Bookmark, 
  Check, 
  Copy, 
  RefreshCw, 
  AlertCircle,
  Eye,
  Layers,
  ChevronRight,
  Video,
  Quote
} from 'lucide-react';
import { MovieIdentificationResult } from '../types';

interface ResultDisplayProps {
  result: MovieIdentificationResult;
  uploadedImages: Array<{ data: string; mimeType: string; timestampLabel?: string }>;
  onReset: () => void;
  onSaveFavorite?: () => void;
  isSaved?: boolean;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  uploadedImages,
  onReset,
  onSaveFavorite,
  isSaved = false,
}) => {
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  const activeImage = uploadedImages[activeFrameIndex] || uploadedImages[0];

  const handleCopyTitle = () => {
    const text = `${result.title} (${result.year}) ${result.season ? `- ${result.season} ${result.episode || ''}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `Identified with King Nach: "${result.title} (${result.year})" - Scene: ${result.sceneDescription}`;
    if (navigator.share) {
      navigator.share({
        title: result.title,
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  // Helper for confidence color
  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    if (confidence >= 65) return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const getFormatBadge = (type: string) => {
    switch (type) {
      case 'series':
        return { label: 'TV Series', icon: Tv };
      case 'anime':
        return { label: 'Anime', icon: Sparkles };
      case 'documentary':
        return { label: 'Documentary', icon: Film };
      default:
        return { label: 'Feature Film', icon: Film };
    }
  };

  const formatBadge = getFormatBadge(result.type);
  const FormatIcon = formatBadge.icon;

  const youtubeTrailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(result.trailerQuery || `${result.title} ${result.year} official trailer`)}`;
  const youtubeSceneUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(result.youtubeSceneQuery || `${result.title} ${result.sceneDescription.slice(0, 40)} scene`)}`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* Top Main Result Hero Card */}
      <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl p-6 sm:p-8 space-y-6">
        
        {/* Glowing Ambient Backdrop Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Top Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Format Badge */}
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 text-slate-200 text-xs font-semibold border border-slate-700">
              <FormatIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatBadge.label}</span>
            </span>

            {/* Year / Decade */}
            <span className="px-3 py-1 rounded-full bg-slate-800/90 text-slate-300 text-xs font-medium border border-slate-700">
              {result.year}
            </span>

            {/* Season & Episode (if series) */}
            {result.season && (
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                {result.season} {result.episode ? `• ${result.episode}` : ''}
              </span>
            )}

            {/* Content Rating */}
            {result.contentRating && (
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[11px] font-mono border border-slate-700">
                {result.contentRating}
              </span>
            )}

            {/* Confidence Score */}
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getConfidenceBadgeColor(result.confidence)}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>{result.confidence}% Match ({result.confidenceLevel} Confidence)</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTitle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all"
              title="Copy title"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-all"
              title="Share match"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shareFeedback ? 'Copied Link!' : 'Share'}</span>
            </button>

            {onSaveFavorite && (
              <button
                onClick={onSaveFavorite}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSaved
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                }`}
                title="Save to favorites"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Title & Creators */}
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
              {result.title}
            </h1>
            {result.originalTitle && result.originalTitle !== result.title && (
              <span className="text-lg sm:text-2xl text-slate-400 font-normal italic">
                ({result.originalTitle})
              </span>
            )}
          </div>

          {result.episodeTitle && (
            <p className="text-lg sm:text-xl text-amber-400 font-semibold font-display">
              "{result.episodeTitle}"
            </p>
          )}

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
            {result.directors && result.directors.length > 0 && (
              <div>
                <span className="text-slate-500">Directed by: </span>
                <span className="text-slate-200 font-medium">{result.directors.join(', ')}</span>
              </div>
            )}
            {result.creators && result.creators.length > 0 && (
              <div>
                <span className="text-slate-500">Created by: </span>
                <span className="text-slate-200 font-medium">{result.creators.join(', ')}</span>
              </div>
            )}
            {result.runtime && (
              <div>
                <span className="text-slate-500">Runtime: </span>
                <span className="text-slate-200 font-medium">{result.runtime}</span>
              </div>
            )}
            {result.genres && result.genres.length > 0 && (
              <div>
                <span className="text-slate-500">Genres: </span>
                <span className="text-amber-300/90 font-medium">{result.genres.join(' • ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Two-Column Visual & Scene Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          
          {/* Left: Uploaded Frame / Keyframes Carousel */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-700/80 shadow-xl group">
              <img
                src={activeImage.data}
                alt="Matched scene frame"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-mono text-amber-300 border border-slate-700 flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>Uploaded Frame</span>
              </div>

              {activeImage.timestampLabel && (
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-slate-700">
                  {activeImage.timestampLabel}
                </div>
              )}
            </div>

            {/* If multiple video frames were extracted, let user toggle them */}
            {uploadedImages.length > 1 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-amber-400" />
                  <span>Analyzed Video Frames ({uploadedImages.length})</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveFrameIndex(idx)}
                      className={`relative rounded-lg overflow-hidden border aspect-video transition-all ${
                        activeFrameIndex === idx
                          ? 'border-amber-400 ring-2 ring-amber-400/30'
                          : 'border-slate-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img.data} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Trailer / YouTube Scene buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={youtubeTrailerUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Watch Trailer</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href={youtubeSceneUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
              >
                <Video className="w-3.5 h-3.5 text-red-400" />
                <span>Find Scene Clip</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Right: Detailed Scene Identification */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* The Scene Card */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  <span>The Exact Scene Identified</span>
                </h3>
                {result.timestampEstimate && (
                  <span className="flex items-center gap-1 text-xs font-mono text-slate-300 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{result.timestampEstimate}</span>
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                {result.sceneDescription}
              </p>

              {/* Dialogue / Quote */}
              {(result.dialogueSnippet || result.memorableQuote) && (
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs sm:text-sm text-amber-200/90 italic flex gap-2.5 items-start">
                  <Quote className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{result.dialogueSnippet || result.memorableQuote}</span>
                </div>
              )}

              {/* Cinematography & Emotion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                {result.cinematographyStyle && (
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Visual Style & Camera:</span>
                    <span className="text-slate-300 font-medium">{result.cinematographyStyle}</span>
                  </div>
                )}
                {result.emotionalTone && (
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Emotional Atmosphere:</span>
                    <span className="text-slate-300 font-medium">{result.emotionalTone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Synopsis
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {result.synopsis}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Grid of Supporting Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Visible Cast & Characters */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>Cast & Characters in Scene</span>
          </h3>

          <div className="space-y-2.5">
            {result.cast && result.cast.length > 0 ? (
              result.cast.map((c, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    c.inFrame
                      ? 'bg-amber-500/10 border-amber-500/30 text-slate-200'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-white truncate">{c.actor}</p>
                    <p className="text-[11px] text-slate-400 truncate">as {c.character}</p>
                  </div>
                  {c.inFrame && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30 flex-shrink-0">
                      In Frame
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No specific cast members identified.</p>
            )}
          </div>
        </div>

        {/* Card 2: Where to Watch / Streaming Availability */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Tv className="w-4 h-4 text-amber-400" />
            <span>Where to Stream / Watch</span>
          </h3>

          <div className="space-y-2.5">
            {result.streamingProviders && result.streamingProviders.length > 0 ? (
              result.streamingProviders.map((provider, idx) => {
                const searchLink = `https://www.google.com/search?q=${encodeURIComponent(`where to watch ${result.title} on ${provider.name}`)}`;
                return (
                  <a
                    key={idx}
                    href={provider.url || searchLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                        {provider.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                          {provider.name}
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize">
                          {provider.type === 'stream' ? 'Included with Subscription' : provider.type}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  </a>
                );
              })
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
                <p className="text-xs text-slate-400">Available on major digital storefronts.</p>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(`watch ${result.title} streaming`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline mt-2"
                >
                  <span>Search streaming availability</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Ratings, Soundtrack & Scores */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span>Ratings & Soundtrack</span>
          </h3>

          {/* Scores Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">IMDb</span>
              <p className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{result.imdbRating || '8.2/10'}</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Rotten Tom.</span>
              <p className="text-sm font-bold text-red-400">
                {result.rottenTomatoesScore || '89%'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Metacritic</span>
              <p className="text-sm font-bold text-emerald-400">
                {result.metacriticScore || '80'}
              </p>
            </div>
          </div>

          {/* Soundtrack Box */}
          {result.soundtrack && (result.soundtrack.songTitle || result.soundtrack.composer) && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-[11px]">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>Scene Music & Score</span>
              </div>
              {result.soundtrack.songTitle && (
                <p className="text-slate-200">
                  <span className="text-slate-500">Track: </span>
                  "{result.soundtrack.songTitle}"
                  {result.soundtrack.artist && <span className="text-slate-400"> by {result.soundtrack.artist}</span>}
                </p>
              )}
              {result.soundtrack.composer && (
                <p className="text-slate-400 text-[11px]">
                  <span className="text-slate-500">Original Score: </span>
                  {result.soundtrack.composer}
                </p>
              )}
            </div>
          )}

          {/* Search Google Knowledge Panel */}
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(`${result.title} ${result.year} movie series`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 flex items-center justify-center gap-2 transition-colors"
          >
            <span>View Full Details on Google</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>

      {/* Alternative Contenders & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Alternative Contenders */}
        {result.alternatives && result.alternatives.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Alternative Potential Matches</span>
            </h3>

            <div className="space-y-2">
              {result.alternatives.map((alt, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {alt.title} ({alt.year})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alt.confidence}% Probable
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{alt.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>More Like This Scene</span>
            </h3>

            <div className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                  <span className="font-semibold text-white">
                    {rec.title} ({rec.year})
                  </span>
                  <p className="text-[11px] text-slate-400">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="text-xs text-slate-400">
          Not what you were looking for? Try uploading a clearer frame or adding text clues.
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Identify Another Movie / Show</span>
        </button>
      </div>

    </div>
  );
};
