
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiRouter } from './server/apiRouter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// API routes must be registered before the frontend fallback.
app.use('/api', apiRouter);

// Resolve the production frontend directory.
const distPath = path.join(__dirname, 'dist');

// Serve compiled CSS, JavaScript, images, and other assets.
app.use(express.static(distPath));

// SPA fallback: return the production index.html.
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('Failed to serve frontend:', err);
      if (!res.headersSent) {
        res.status(500).send('Frontend build not found. Please check the deployment.');
      }
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`KING NACH server running on port ${PORT}`);
});
