/* eslint-disable @typescript-eslint/no-namespace -- Express merges `Request` via declaration merging */
import "express";
import type { AppUserRole } from "./roles";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: AppUserRole;
      };
    }
  }
}

export {};
