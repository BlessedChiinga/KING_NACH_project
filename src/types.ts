export type MediaType = 'movie' | 'series' | 'anime' | 'documentary' | 'short_film';

export interface CastMember {
  actor: string;
  character: string;
  inFrame: boolean;
}

export interface StreamingProvider {
  name: string;
  type: 'stream' | 'rent' | 'buy' | 'free';
  url?: string;
  icon?: string;
}

export interface AlternativeMatch {
  title: string;
  year: string;
  type: MediaType;
  reason: string;
  confidence: number;
}

export interface Recommendation {
  title: string;
  year: string;
  type: MediaType;
  reason: string;
}

export interface MovieIdentificationResult {
  title: string;
  originalTitle?: string;
  type: MediaType;
  year: string;
  season?: string;
  episode?: string;
  episodeTitle?: string;
  confidence: number; // 0 to 100
  confidenceLevel: 'High' | 'Medium' | 'Low';
  
  // Scene Analysis
  sceneDescription: string;
  timestampEstimate?: string;
  cinematographyStyle?: string;
  emotionalTone?: string;
  dialogueSnippet?: string;
  memorableQuote?: string;
  
  // Film Metadata
  directors: string[];
  creators?: string[];
  cast: CastMember[];
  genres: string[];
  runtime?: string;
  synopsis: string;
  contentRating?: string; // PG-13, R, TV-MA, etc.
  
  // Scores
  imdbRating?: string;
  rottenTomatoesScore?: string;
  metacriticScore?: string;
  
  // Music & Soundtrack
  soundtrack?: {
    songTitle?: string;
    artist?: string;
    composer?: string;
  };
  
  // Streaming & Availability
  streamingProviders: StreamingProvider[];
  
  // Alternatives & Similar
  alternatives: AlternativeMatch[];
  recommendations: Recommendation[];
  
  // Search Queries
  trailerQuery: string;
  youtubeSceneQuery: string;
}

export interface IdentifyRequestPayload {
  images: Array<{
    data: string; // base64 string
    mimeType: string;
    timestampLabel?: string;
  }>;
  mediaTypeHint?: 'auto' | 'movie' | 'series' | 'anime';
  additionalClues?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  previewUrl: string;
  result: MovieIdentificationResult;
}
