import type { Request } from "express";
import type { Types } from "mongoose";
import { ApiError } from "./ApiError";
import { parseObjectId } from "./mongoose";

type ParamRecord = Record<string, string | string[] | undefined>;

function paramsOf(req: Request): ParamRecord {
  return req.params as ParamRecord;
}

/** Single string route param (Express 5 may use `string | string[]`). */
export function readRouteString(req: Request, key: string): string {
  const raw = paramsOf(req)[key];
  if (raw === undefined) throw new ApiError(400, `Missing route parameter: ${key}`);
  if (Array.isArray(raw)) {
    const [first] = raw;
    if (typeof first !== "string" || first.length === 0) {
      throw new ApiError(400, `Invalid route parameter: ${key}`);
    }
    return first;
  }
  if (raw.length === 0) throw new ApiError(400, `Missing route parameter: ${key}`);
  return raw;
}

export function parseRequestObjectId(req: Request, key: string, label: string): Types.ObjectId {
  return parseObjectId(readRouteString(req, key), label);
}
