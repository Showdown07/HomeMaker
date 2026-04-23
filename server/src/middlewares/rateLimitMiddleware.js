import { StatusCodes } from "http-status-codes";

const stores = new Map();

const getClientKey = (req) => req.ip || req.headers["x-forwarded-for"] || "unknown";

export const createRateLimiter = ({
  windowMs,
  maxRequests,
  message = "Too many requests, please try again later",
}) => {
  return (req, res, next) => {
    if (process.env.NODE_ENV === "test") {
      return next();
    }

    const key = `${req.originalUrl}:${getClientKey(req)}`;
    const now = Date.now();
    const entry = stores.get(key);

    if (!entry || entry.expiresAt <= now) {
      stores.set(key, {
        count: 1,
        expiresAt: now + windowMs,
      });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.expiresAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(StatusCodes.TOO_MANY_REQUESTS).json({
        success: false,
        message,
      });
    }

    entry.count += 1;
    stores.set(key, entry);
    next();
  };
};
