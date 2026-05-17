import type { Express } from "express";
import cors from "cors";
import { securityHeaders } from "./http/securityHeaders";
import { corsOptions } from "./http/corsOptions";
import { apiRateLimiter } from "./rate-limit/rateLimiters";
import { noSqlSanitizer } from "./sanitization/noSqlSanitizer";

export function applyHttpSecurity(app: Express) {
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(securityHeaders);
  app.use(cors(corsOptions));
  app.use(apiRateLimiter);
}

export function applyParsedBodySecurity(app: Express) {
  app.use(noSqlSanitizer);
}
