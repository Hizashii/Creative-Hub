import type { NextFunction, Request, Response } from "express";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isUnsafeMongoKey(key: string) {
  return key.startsWith("$") || key.includes(".");
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (!isPlainObject(value)) return value;

  return Object.entries(value).reduce<Record<string, unknown>>((safe, [key, childValue]) => {
    if (!isUnsafeMongoKey(key)) safe[key] = sanitizeValue(childValue);
    return safe;
  }, {});
}

function sanitizeRecordInPlace(value: unknown) {
  if (!isPlainObject(value)) return;
  const sanitized = sanitizeValue(value);
  if (!isPlainObject(sanitized)) return;

  for (const key of Object.keys(value)) {
    delete value[key];
  }
  Object.assign(value, sanitized);
}

export function noSqlSanitizer(req: Request, _res: Response, next: NextFunction) {
  if (req.body !== undefined) req.body = sanitizeValue(req.body);
  sanitizeRecordInPlace(req.query);
  sanitizeRecordInPlace(req.params);
  next();
}
