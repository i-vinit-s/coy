const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}

export function isProfile(value) {
  return (
    value &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    Number.isInteger(value.age) &&
    value.age >= 18 &&
    typeof value.photoUrl === 'string' &&
    typeof value.bio === 'string' &&
    typeof value.location === 'string' &&
    Array.isArray(value.interests) &&
    value.interests.every((i) => typeof i === 'string')
  );
}

async function request(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
      ...options,
    });
    let body;
    try {
      body = await response.json();
    } catch {
      throw new ApiError('The server sent an unexpected response. Please try again.');
    }
    if (!response.ok)
      throw new ApiError(body.error || 'Something went wrong. Please try again.', response.status);
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.name === 'TimeoutError'
        ? 'That took a little too long. Please try again.'
        : 'We couldn’t connect. Check your connection and try again.',
    );
  }
}

export async function getFeed() {
  const body = await request('/feed');
  if (!Array.isArray(body.profiles) || !body.profiles.every(isProfile))
    throw new ApiError('We couldn’t load the profiles. Please try again.');
  return body.profiles;
}

export async function getMatches() {
  const body = await request('/matches');
  if (
    !Array.isArray(body.matches) ||
    !body.matches.every((p) => isProfile(p) && Number.isFinite(Date.parse(p.matchedAt)))
  )
    throw new ApiError('We couldn’t load your matches. Please try again.');
  return body.matches;
}

export async function sendSwipe(profileId, action) {
  const body = await request('/swipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, action }),
  });
  if (
    typeof body.matched !== 'boolean' ||
    (body.matched
      ? !isProfile(body.match) || !Number.isFinite(Date.parse(body.match.matchedAt))
      : body.match !== null)
  )
    throw new ApiError('We couldn’t confirm your decision. Please refresh and try again.');
  return body;
}
