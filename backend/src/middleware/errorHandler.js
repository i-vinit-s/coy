export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(error, _req, res, _next) {
  if (error.type === 'entity.parse.failed')
    return res.status(400).json({ error: 'Send a valid JSON body.' });
  if (error.type === 'entity.too.large')
    return res.status(413).json({ error: 'Request body is too large.' });
  if (error instanceof ApiError) return res.status(error.status).json({ error: error.message });
  // Log error codes, not request bodies or database queries.
  console.error('Unexpected API failure:', error.code || error.name || 'Error');
  return res.status(500).json({ error: 'Unable to load or save your data. Please try again.' });
}
