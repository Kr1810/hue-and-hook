/**
 * Central error handling. Every error leaves the API in the same shape:
 *   { error: { message, details? } }
 * Stack traces are logged on the server, never sent to clients in production.
 */
import { ZodError } from "zod";
import { config } from "../config.js";

/** Throw this from route handlers for expected failures (404, 409, …). */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature
export function errorHandler(err, req, res, next) {
  let status = 500;
  let message = "Something went wrong. Please try again.";
  let details;

  if (err instanceof ZodError) {
    status = 400;
    message = "Please check the highlighted fields.";
    details = err.flatten().fieldErrors;
  } else if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err?.type === "entity.parse.failed") {
    status = 400;
    message = "Request body must be valid JSON.";
  } else if (err?.type === "entity.too.large") {
    status = 413;
    message = "Request body is too large.";
  } else if (!config.isProd && err?.message) {
    // In development, show the real message to speed up debugging.
    message = err.message;
  }

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  if (res.headersSent) return;
  res.status(status).json({ error: details ? { message, details } : { message } });
}
