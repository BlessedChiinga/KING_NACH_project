import { GoogleGenAI, Type } from '@google/genai';
import { IdentifyRequestPayload, MovieIdentificationResult } from '../src/types';

// Shared server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export async function identifyMovieOrSeries(payload: IdentifyRequestPayload): Promise<MovieIdentificationResult> {
  const ai = getGeminiClient();

  if (!payload.images || payload.images.length === 0) {
    throw new Error('No image frames were provided for identification.');
  }

  // Construct parts: multiple image frames + text prompt
  const parts: Array<any> = [];

  payload.images.forEach((img, idx) => {
    // Strip data URL header if present
    const base64Clean = img.data.replace(/^data:[^;]+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: img.mimeType || 'image/jpeg',
        data: base64Clean,
      },
    });
    if (img.timestampLabel) {
      parts.push({
        text: `[Frame #${idx + 1} captured at timestamp: ${img.timestampLabel}]`,
      });
    }
  });

  const promptText = `
You are the world's leading film and television scholar, cinematographer, and visual recognition AI.
Your job is to identify the EXACT movie, television series, or anime shown in the uploaded screenshot(s) or video frame(s).

Analyze the visual evidence thoroughly:
- Actors, faces, costumes, hairstyles, age
- Cinematography, lighting, color grading, aspect ratio, camera angles
- Sets, architecture, props, vehicles, CGI style, atmosphere
- Props, text on screen, subtitles, uniforms, logos
- Specific scene context: what exact event, confrontation, joke, or revelation is happening right here?

${payload.mediaTypeHint && payload.mediaTypeHint !== 'auto' ? `User hint: The user believes this is a ${payload.mediaTypeHint}.` : ''}
${payload.additionalClues ? `Additional clues provided by user: "${payload.additionalClues}"` : ''}

Provide your identification in strict JSON matching the requested structure.
If you are confident, provide the exact title, year, season, episode, and timestamp estimate.
If there are other plausible contenders (e.g. sequels, spin-offs, or films with similar aesthetics), list them under 'alternatives'.
Also suggest 3-4 recommended movies or series with similar tone/vibe.
`;

  parts.push({ text: promptText });

  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts,
        },
        config: {
          systemInstruction: 'You are an authoritative movie and TV recognition AI. Return only accurate JSON analyzing the visual frames with cinematic precision.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Standard English release title of the movie or series' },
              originalTitle: { type: Type.STRING, description: 'Original native title if foreign language or anime' },
              type: { 
                type: Type.STRING, 
                description: 'One of: movie, series, anime, documentary, short_film' 
              },
              year: { type: Type.STRING, description: 'Release year, e.g. "2014" or "2016-2025"' },
              season: { type: Type.STRING, description: 'Season number if series (e.g. "Season 4")' },
              episode: { type: Type.STRING, description: 'Episode number if series (e.g. "Episode 7")' },
              episodeTitle: { type: Type.STRING, description: 'Episode title if TV series/anime' },
              confidence: { type: Type.NUMBER, description: 'Confidence percentage from 0 to 100' },
              confidenceLevel: { type: Type.STRING, description: 'High, Medium, or Low' },
              sceneDescription: { type: Type.STRING, description: 'Detailed breakdown of what is happening in this exact scene' },
              timestampEstimate: { type: Type.STRING, description: 'Estimated runtime position (e.g. ~01:42:15 or Act II Climax)' },
              cinematographyStyle: { type: Type.STRING, description: 'Visual style, lighting, camera work, color palette' },
              emotionalTone: { type: Type.STRING, description: 'Tense, comedic, melancholic, epic, etc.' },
              dialogueSnippet: { type: Type.STRING, description: 'Key line of dialogue spoken during or near this scene' },
              memorableQuote: { type: Type.STRING, description: 'Famous quote associated with this film or scene' },
              directors: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: 'Director names'
              },
              creators: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: 'Showrunners or creators for TV series'
              },
              cast: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    actor: { type: Type.STRING },
                    character: { type: Type.STRING },
                    inFrame: { type: Type.BOOLEAN, description: 'Whether this actor is visibly present in the uploaded frame' },
                  },
                  required: ['actor', 'character', 'inFrame'],
                },
              },
              genres: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              runtime: { type: Type.STRING, description: 'Runtime for movie (e.g. "2h 49m") or episode length' },
              synopsis: { type: Type.STRING, description: 'Engaging 2-3 sentence overview of the film/show plot' },
              contentRating: { type: Type.STRING, description: 'Age rating like PG-13, R, TV-MA, PG' },
              imdbRating: { type: Type.STRING, description: 'Estimated IMDb rating, e.g. "8.7/10"' },
              rottenTomatoesScore: { type: Type.STRING, description: 'Rotten Tomatoes percentage, e.g. "93%"' },
              metacriticScore: { type: Type.STRING, description: 'Metacritic score, e.g. "84/100"' },
              soundtrack: {
                type: Type.OBJECT,
                properties: {
                  songTitle: { type: Type.STRING },
                  artist: { type: Type.STRING },
                  composer: { type: Type.STRING },
                },
              },
              streamingProviders: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: 'Platform name (Netflix, Prime Video, Disney+, Max, Apple TV+, Hulu, etc.)' },
                    type: { type: Type.STRING, description: 'stream, rent, buy, or free' },
                    url: { type: Type.STRING },
                  },
                  required: ['name', 'type'],
                },
              },
              alternatives: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    year: { type: Type.STRING },
                    type: { type: Type.STRING },
                    reason: { type: Type.STRING, description: 'Why this might be mistaken for the scene' },
                    confidence: { type: Type.NUMBER },
                  },
                  required: ['title', 'year', 'type', 'reason', 'confidence'],
                },
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    year: { type: Type.STRING },
                    type: { type: Type.STRING },
                    reason: { type: Type.STRING },
                  },
                  required: ['title', 'year', 'type', 'reason'],
                },
              },
              trailerQuery: { type: Type.STRING, description: 'Search query to find official trailer on YouTube' },
              youtubeSceneQuery: { type: Type.STRING, description: 'Search query to watch the specific scene clip' },
            },
            required: [
              'title',
              'type',
              'year',
              'confidence',
              'confidenceLevel',
              'sceneDescription',
              'directors',
              'cast',
              'genres',
              'synopsis',
              'streamingProviders',
              'trailerQuery',
              'youtubeSceneQuery',
            ],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini model returned an empty response.');
      }

      const parsed = JSON.parse(responseText) as MovieIdentificationResult;
      return parsed;
    } catch (err: any) {
      console.warn(`Model ${modelName} call failed:`, err.message);
      lastError = err;
      // continue to next model if available
    }
  }

  throw new Error(
    lastError?.message || 'Unable to identify film or television scene at this moment. Please try again shortly.'
  );
}
