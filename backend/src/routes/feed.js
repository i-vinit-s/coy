import { Router } from 'express';
import { getFeed } from '../services/profileService.js';
export function feedRouter(db) {
  const router = Router();
  router.get('/', async (_req, res) => res.json({ profiles: await getFeed(db) }));
  return router;
}
