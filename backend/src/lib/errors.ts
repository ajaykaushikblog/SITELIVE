/* Small typed HTTP error helpers so route handlers can `throw` cleanly and the
   central error middleware turns them into consistent JSON responses. */

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export const badRequest = (msg = 'Bad request', details?: unknown) => new HttpError(400, msg, details)
export const unauthorized = (msg = 'Authentication required') => new HttpError(401, msg)
export const forbidden = (msg = 'You do not have permission to do that') => new HttpError(403, msg)
export const notFound = (msg = 'Not found') => new HttpError(404, msg)
export const conflict = (msg = 'Conflict') => new HttpError(409, msg)
