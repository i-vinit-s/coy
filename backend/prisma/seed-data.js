import { DEMO_USER_ID } from '../src/config.js';
import { mockProfiles, privateIncomingLikes } from './profiles.js';

export async function seedDatabase(db) {
  const users = [
    {
      id: DEMO_USER_ID,
      name: 'You',
      age: 24,
      photoUrl: '',
      bio: 'A little curiosity. A real connection.',
      location: 'Bengaluru',
      college: '',
      interests: ['Coffee', 'Music'],
    },
    ...mockProfiles,
  ];

  // Preserve existing profiles and decisions when reseeding.
  for (const user of users) {
    await db.user.upsert({ where: { id: user.id }, update: {}, create: user });
  }
  for (const userId of privateIncomingLikes) {
    await db.swipe.upsert({
      where: { userId_profileId: { userId, profileId: DEMO_USER_ID } },
      update: {},
      create: { userId, profileId: DEMO_USER_ID, action: 'LIKE' },
    });
  }
}
