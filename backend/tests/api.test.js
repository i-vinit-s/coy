import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../src/app.js';
import { createTestDatabase } from './helpers/database.js';
import { seedDatabase } from '../prisma/seed-data.js';
import { DEMO_USER_ID } from '../src/config.js';

async function fixture(t) {
  const database = await createTestDatabase();
  t.after(() => database.cleanup());
  return { ...database, api: request(createApp(database.db)) };
}

test('feed has 32 complete adult profiles, explicit public fields, no incoming-like data', async (t) => {
  const { api } = await fixture(t);
  const response = await api.get('/api/feed').expect(200);
  assert.equal(response.headers['cache-control'], 'no-store');
  assert.equal(response.headers['x-powered-by'], undefined);
  assert.equal(response.body.profiles.length, 32);
  for (const profile of response.body.profiles) {
    assert.deepEqual(
      Object.keys(profile).sort(),
      ['id', 'name', 'age', 'photoUrl', 'bio', 'location', 'college', 'interests'].sort(),
    );
    assert.ok(
      profile.age >= 18 &&
        profile.bio &&
        profile.location &&
        profile.photoUrl.startsWith('https://'),
    );
    assert.ok(profile.interests.length && profile.interests.every((i) => typeof i === 'string'));
  }
  assert.deepEqual((await api.get('/api/matches').expect(200)).body, { matches: [] });
});

test('one-sided like and a pass on an incoming like return indistinguishable non-matches', async (t) => {
  const { api } = await fixture(t);
  const like = await api
    .post('/api/swipe')
    .send({ profileId: 'profile-02', action: 'like' })
    .expect(200);
  const pass = await api
    .post('/api/swipe')
    .send({ profileId: 'profile-01', action: 'pass' })
    .expect(200);
  assert.deepEqual(like.body, { matched: false, match: null });
  assert.deepEqual(pass.body, like.body);
  assert.deepEqual((await api.get('/api/matches')).body.matches, []);
  const ids = (await api.get('/api/feed')).body.profiles.map((p) => p.id);
  assert.equal(ids.length, 30);
  assert.ok(!ids.includes('profile-01') && !ids.includes('profile-02'));
});

test('mutual likes create exactly one match; duplicate decisions cannot overwrite it', async (t) => {
  const { api, db } = await fixture(t);
  const response = await api
    .post('/api/swipe')
    .send({ profileId: 'profile-01', action: 'like' })
    .expect(200);
  assert.equal(response.body.matched, true);
  assert.equal(response.body.match.id, 'profile-01');
  assert.ok(Number.isFinite(Date.parse(response.body.match.matchedAt)));
  await api.post('/api/swipe').send({ profileId: 'profile-01', action: 'pass' }).expect(409);
  const matches = (await api.get('/api/matches')).body.matches;
  assert.equal(matches.length, 1);
  assert.deepEqual(matches[0], response.body.match);
  assert.equal(
    await db.swipe.count({ where: { userId: DEMO_USER_ID, profileId: 'profile-01' } }),
    1,
  );
});

test('saved decisions and mutual matches survive a fresh connection and Express app', async (t) => {
  const { api, db, url } = await fixture(t);
  await api.post('/api/swipe').send({ profileId: 'profile-01', action: 'like' }).expect(200);
  await api.post('/api/swipe').send({ profileId: 'profile-02', action: 'pass' }).expect(200);
  await db.$disconnect();
  const freshDb = new PrismaClient({ datasourceUrl: url });
  t.after(() => freshDb.$disconnect());
  const fresh = request(createApp(freshDb));
  assert.equal((await fresh.get('/api/feed')).body.profiles.length, 30);
  assert.equal((await fresh.get('/api/matches')).body.matches[0].id, 'profile-01');
  await freshDb.$disconnect();
});

test('malformed JSON, invalid actions, extra fields, self-swipes, and unknown profiles are rejected', async (t) => {
  const { api, db } = await fixture(t);
  for (const body of [
    null,
    [],
    {},
    { action: 'like' },
    { profileId: 'profile-01', action: 'yes' },
    { profileId: 1, action: 'like' },
    { profileId: 'profile-01', action: 'like', userId: 'other' },
    { profileId: DEMO_USER_ID, action: 'like' },
  ]) {
    await api.post('/api/swipe').send(body).expect(400);
  }
  await api
    .post('/api/swipe')
    .set('Content-Type', 'application/json')
    .send('{bad json')
    .expect(400);
  await api.post('/api/swipe').send({ profileId: 'not-a-profile', action: 'like' }).expect(404);
  await api
    .post('/api/swipe')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({ data: 'x'.repeat(9000) }))
    .expect(413);
  assert.equal(await db.swipe.count({ where: { userId: DEMO_USER_ID } }), 0);
});

test('concurrent duplicate swipes yield one saved decision and one conflict', async (t) => {
  const { api, db } = await fixture(t);
  const responses = await Promise.all(
    ['like', 'pass'].map((action) =>
      api.post('/api/swipe').send({ profileId: 'profile-01', action }),
    ),
  );
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
  assert.equal(await db.swipe.count({ where: { userId: DEMO_USER_ID } }), 1);
});

test('concurrent distinct swipes preserve every decision', async (t) => {
  const { api, db } = await fixture(t);
  const responses = await Promise.all(
    Array.from({ length: 12 }, (_, index) =>
      api
        .post('/api/swipe')
        .send({ profileId: `profile-${String(index + 1).padStart(2, '0')}`, action: 'like' }),
    ),
  );
  assert.ok(responses.every((r) => r.status === 200));
  assert.equal(await db.swipe.count({ where: { userId: DEMO_USER_ID } }), 12);
  assert.equal((await api.get('/api/feed')).body.profiles.length, 20);
  assert.equal((await api.get('/api/matches')).body.matches.length, 4);
});

test('exhausted feed is empty, and re-seeding never reintroduces saved profiles', async (t) => {
  const { api, db } = await fixture(t);
  for (const profile of (await api.get('/api/feed')).body.profiles)
    await api.post('/api/swipe').send({ profileId: profile.id, action: 'pass' }).expect(200);
  await seedDatabase(db);
  assert.deepEqual((await api.get('/api/feed')).body.profiles, []);
  assert.deepEqual((await api.get('/api/matches')).body.matches, []);
});

test('CORS allows only the configured origin; source and database files are not served', async (t) => {
  const { api } = await fixture(t);
  const response = await api.get('/api/feed').set('Origin', 'http://localhost:3000').expect(200);
  assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:3000');
  await api.get('/api/feed').set('Origin', 'https://untrusted.example').expect(403);
  await api
    .options('/api/swipe')
    .set('Origin', 'http://localhost:3000')
    .set('Access-Control-Request-Method', 'POST')
    .expect(204);
  for (const route of ['/prisma/profiles.js', '/prisma/dev.db', '/api/reset', '/.env'])
    await api.get(route).expect(404);
});
