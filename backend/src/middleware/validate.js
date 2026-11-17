import { ApiError } from './errorHandler.js';

export function validateSwipe(req, _res, next) {
  const body = req.body;
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !['profileId', 'action'].includes(key)) ||
    typeof body.profileId !== 'string' ||
    !body.profileId.trim() ||
    body.profileId.length > 100 ||
    !['like', 'pass'].includes(body.action)
  ) {
    throw new ApiError(
      400,
      'Send a profileId and an action of like or pass. Extra fields are not accepted.',
    );
  }
  next();
}
