import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { ApiError, errorHandler } from './middleware/errorHandler.js';
import { feedRouter } from './routes/feed.js';
import { swipeRouter } from './routes/swipe.js';
import { matchesRouter } from './routes/matches.js';

export function createApp(db) {
  const app = express();
  app.disable('x-powered-by');
  app.disable('etag');
  app.use(helmet());
  app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origin === config.frontendOrigin) return callback(null, true);
        return callback(new ApiError(403, 'Origin is not allowed.'));
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type'],
    }),
  );
  app.use(express.json({ limit: '8kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/feed', feedRouter(db));
  app.use('/api/swipe', swipeRouter(db));
  app.use('/api/matches', matchesRouter(db));
  app.use((_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
  app.use(errorHandler);
  return app;
}
