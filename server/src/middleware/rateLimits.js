/**
 * Rate limit for the contact form. Responses use the same error shape as
 * everything else, so the client can show the message inline.
 */
import { rateLimit } from "express-rate-limit";
import { HttpError } from "./errorHandler.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const formLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Only successful submissions count, so fixing a validation error
  // doesn't eat into someone's allowance.
  skipFailedRequests: true,
  handler: (req, res, next) =>
    next(new HttpError(429, "Too many submissions. Please wait a few minutes and try again.")),
});
