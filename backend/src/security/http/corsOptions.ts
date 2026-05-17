import type { CorsOptions } from "cors";

const DEFAULT_DEV_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

function allowedOrigins() {
  const configured = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean);
  if (configured?.includes("*")) return "*";
  return new Set(configured && configured.length > 0 ? configured : DEFAULT_DEV_ORIGINS);
}

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowed = allowedOrigins();
    if (allowed === "*" || allowed.has(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Authorization", "Content-Type"],
  maxAge: 86_400,
};
