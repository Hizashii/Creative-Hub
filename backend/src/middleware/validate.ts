import type { Request, Response, NextFunction } from "express";
import type { ZodObject } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate =
  (schema: ZodObject<any>) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next(new ApiError(400, result.error.issues.map((i) => i.message).join(", ")));
    }

    next();
  };
