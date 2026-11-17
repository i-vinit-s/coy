import { Router } from 'express';
import { validateSwipe } from '../middleware/validate.js';
import { recordSwipe } from '../services/swipeService.js';
export function swipeRouter(db) {
  const router = Router();
  router.post('/', validateSwipe, async (req, res) => res.json(await recordSwipe(db, req.body)));
  return router;
}
