import { HttpError } from "./errorHandler.js";

/** JSON 404 for any /api route that no router handled. */
export function apiNotFound(req, res, next) {
  next(new HttpError(404, `No API route for ${req.method} ${req.originalUrl}`));
}
