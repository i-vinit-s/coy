import { Router } from 'express';
import { getMatches } from '../services/profileService.js';
export function matchesRouter(db) {
  const router = Router();
  router.get('/', async (_req, res) => res.json({ matches: await getMatches(db) }));
  return router;
}
