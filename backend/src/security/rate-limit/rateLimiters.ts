import rateLimit from "express-rate-limit";

function envNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function rateLimitMessage(message: string) {
  return {
    error: {
      message,
      status: 429,
    },
  };
}

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: envNumber("API_RATE_LIMIT", 600),
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage("Too many requests. Please try again shortly."),
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: envNumber("AUTH_RATE_LIMIT", 20),
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitMessage("Too many authentication attempts. Please try again later."),
});
