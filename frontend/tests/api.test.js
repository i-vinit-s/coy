import test from 'node:test';
import assert from 'node:assert/strict';
import { getFeed, getMatches, sendSwipe } from '../lib/api.js';

const profile = {
  id: 'profile-01',
  name: 'Aanya',
  age: 24,
  photoUrl: 'https://example.com/photo.jpg',
  bio: 'Hello',
  location: 'Bengaluru',
  interests: ['Coffee'],
};

test('valid feed and mutual-match payloads are accepted', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ profiles: [profile] }));
  assert.deepEqual(await getFeed(), [profile]);
  globalThis.fetch = async () =>
    Response.json({ matches: [{ ...profile, matchedAt: '2026-11-17T00:00:00.000Z' }] });
  assert.equal((await getMatches()).length, 1);
});
test('malformed profile and match payloads fail visibly', async (t) => {
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ profiles: [{ id: 'missing-fields' }] }),
  );
  await assert.rejects(getFeed(), /couldn’t load/);
  globalThis.fetch = async () =>
    Response.json({ matches: [{ ...profile, matchedAt: 'not-a-date' }] });
  await assert.rejects(getMatches(), /couldn’t load/);
});
test('swipes send only the profile and action; API conflicts retain their status', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), { profileId: profile.id, action: 'pass' });
    return Response.json({ error: 'Already swiped.' }, { status: 409 });
  });
  await assert.rejects(sendSwipe(profile.id, 'pass'), (e) => e.status === 409);
  assert.equal(mock.mock.calls.length, 1);
});
test('network failures and non-JSON server responses have useful error messages', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('Failed to fetch');
  });
  await assert.rejects(getFeed(), /couldn’t connect/);
  globalThis.fetch = async () => new Response('<html>Error</html>');
  await assert.rejects(getFeed(), /unexpected response/);
});
test('a success response must confirm a valid match or a non-match', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ matched: false, match: null }));
  assert.deepEqual(await sendSwipe(profile.id, 'like'), { matched: false, match: null });
  globalThis.fetch = async () => Response.json({ matched: true, match: null });
  await assert.rejects(sendSwipe(profile.id, 'like'), /couldn’t confirm/);
});
