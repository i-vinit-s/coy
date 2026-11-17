import { DEMO_USER_ID } from '../config.js';

// Only these fields can appear in API responses.
export const publicProfileSelect = {
  id: true,
  name: true,
  age: true,
  photoUrl: true,
  bio: true,
  location: true,
  college: true,
  interests: true,
};

export function getFeed(db) {
  return db.user.findMany({
    where: { id: { not: DEMO_USER_ID }, incomingSwipes: { none: { userId: DEMO_USER_ID } } },
    select: publicProfileSelect,
    orderBy: { id: 'asc' },
  });
}

export async function getMatches(db) {
  const swipes = await db.swipe.findMany({
    where: {
      userId: DEMO_USER_ID,
      action: 'LIKE',
      profile: { outgoingSwipes: { some: { profileId: DEMO_USER_ID, action: 'LIKE' } } },
    },
    select: { createdAt: true, profile: { select: publicProfileSelect } },
    orderBy: [{ createdAt: 'desc' }, { profileId: 'asc' }],
  });
  return swipes.map(({ profile, createdAt }) => ({
    ...profile,
    matchedAt: createdAt.toISOString(),
  }));
}
