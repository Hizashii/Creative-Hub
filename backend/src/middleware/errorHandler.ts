import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

// Express error middleware signature requires 4 arguments.
export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  void next;
  const status = err instanceof ApiError ? err.statusCode : 500;
  const message = err instanceof ApiError ? err.message : "Internal server error";

  res.status(status).json({
    error: {
      message,
      status,
    },
  });
}
