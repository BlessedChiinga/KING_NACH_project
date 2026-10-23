import express, { Request, Response, Router } from 'express';
import { identifyMovieOrSeries } from './geminiService';
import { IdentifyRequestPayload } from '../src/types';

export const apiRouter = Router();

apiRouter.use(express.json({ limit: '50mb' }));
apiRouter.use(express.urlencoded({ extended: true, limit: '50mb' }));

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.post('/identify', async (req: Request, res: Response) => {
  try {
    const payload = req.body as IdentifyRequestPayload;

    if (!payload || !payload.images || payload.images.length === 0) {
      res.status(400).json({
        error: 'Missing images: Please provide at least one screenshot or extracted video frame.',
      });
      return;
    }

    const result = await identifyMovieOrSeries(payload);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/identify:', error);
    res.status(500).json({
      error: error.message || 'An unexpected error occurred while analyzing the media.',
    });
  }
});
