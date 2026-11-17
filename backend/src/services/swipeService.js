import { DEMO_USER_ID } from '../config.js';
import { ApiError } from '../middleware/errorHandler.js';
import { publicProfileSelect } from './profileService.js';

export async function recordSwipe(db, { profileId, action }) {
  if (profileId === DEMO_USER_ID) throw new ApiError(400, 'You cannot swipe on yourself.');
  const profile = await db.user.findUnique({
    where: { id: profileId },
    select: publicProfileSelect,
  });
  if (!profile) throw new ApiError(404, 'Profile not found.');

  let swipe;
  try {
    swipe = await db.swipe.create({
      data: { userId: DEMO_USER_ID, profileId, action: action.toUpperCase() },
    });
  } catch (error) {
    // The unique constraint also handles concurrent duplicates.
    if (error.code === 'P2002') throw new ApiError(409, 'This profile has already been swiped on.');
    throw error;
  }

  if (action === 'pass') return { matched: false, match: null };
  const reciprocal = await db.swipe.findUnique({
    where: { userId_profileId: { userId: profileId, profileId: DEMO_USER_ID } },
    select: { action: true },
  });
  const matched = reciprocal?.action === 'LIKE';
  return {
    matched,
    match: matched ? { ...profile, matchedAt: swipe.createdAt.toISOString() } : null,
  };
}
