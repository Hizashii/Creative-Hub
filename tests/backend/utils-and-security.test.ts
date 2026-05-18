import test from "node:test";
import assert from "node:assert/strict";

import { corsOptions } from "../../backend/src/security/http/corsOptions";
import { noSqlSanitizer } from "../../backend/src/security/sanitization/noSqlSanitizer";
import { skipAuthBypass } from "../../backend/src/utils/skipAuthBypass";
import { ApiError } from "../../backend/src/utils/ApiError";
import { asyncHandler } from "../../backend/src/utils/asyncHandler";
import { parseObjectId } from "../../backend/src/utils/mongoose";
import { readRouteString } from "../../backend/src/utils/routeParams";
import { userToJSON } from "../../backend/src/utils/serialize";

// ─── ApiError ────────────────────────────────────────────────────────────────

test("ApiError is an instance of Error", () => {
  const err = new ApiError(404, "Not found");
  assert.ok(err instanceof Error);
  assert.ok(err instanceof ApiError);
});

test("ApiError exposes statusCode and message", () => {
  const err = new ApiError(422, "Unprocessable entity");
  assert.equal(err.statusCode, 422);
  assert.equal(err.message, "Unprocessable entity");
});

test("ApiError name is preserved as ApiError", () => {
  const err = new ApiError(500, "Server error");
  assert.equal(err.name, "ApiError");
});

// ─── parseObjectId ───────────────────────────────────────────────────────────

test("parseObjectId returns a Mongo ObjectId for valid 24-hex ids", () => {
  const id = "507f1f77bcf86cd799439011";
  assert.equal(parseObjectId(id).toHexString(), id);
});

test("parseObjectId throws ApiError 400 for malformed ids", () => {
  assert.throws(
    () => parseObjectId("bad-id", "project id"),
    (err) => err instanceof ApiError && err.statusCode === 400 && err.message === "Invalid project id"
  );
});

test("parseObjectId uses a generic label when none is provided", () => {
  assert.throws(
    () => parseObjectId("xyz"),
    (err) => err instanceof ApiError && err.statusCode === 400
  );
});

test("parseObjectId rejects empty strings", () => {
  assert.throws(
    () => parseObjectId("", "user id"),
    (err) => err instanceof ApiError && err.statusCode === 400
  );
});

// ─── readRouteString ─────────────────────────────────────────────────────────

test("readRouteString returns the first string from array params", () => {
  const req = { params: { projectId: ["abc123", "ignored"] } };
  assert.equal(readRouteString(req as never, "projectId"), "abc123");
});

test("readRouteString returns a plain string param directly", () => {
  const req = { params: { projectId: "abc123" } };
  assert.equal(readRouteString(req as never, "projectId"), "abc123");
});

test("readRouteString rejects missing params with 400 ApiError", () => {
  const req = { params: {} };
  assert.throws(
    () => readRouteString(req as never, "projectId"),
    (err) => err instanceof ApiError && err.statusCode === 400 && err.message.includes("Missing route parameter")
  );
});

// ─── userToJSON ──────────────────────────────────────────────────────────────

test("userToJSON maps _id to id string and excludes password", () => {
  const user = {
    _id: { toString: () => "507f1f77bcf86cd799439011" } as unknown as object,
    email: "user@example.com",
    name: "Alice",
    role: "client" as const,
    password: "hashed-secret",
  };

  const json = userToJSON(user as never);
  assert.equal(json?.id, "507f1f77bcf86cd799439011");
  assert.equal(json?.email, "user@example.com");
  assert.equal(json?.role, "client");
  assert.equal("password" in (json ?? {}), false);
});

test("userToJSON returns null for null input", () => {
  assert.equal(userToJSON(null), null);
});

test("userToJSON returns null for undefined input", () => {
  assert.equal(userToJSON(undefined), null);
});

test("userToJSON preserves designer role", () => {
  const user = {
    _id: { toString: () => "507f1f77bcf86cd799439012" } as unknown as object,
    email: "pro@example.com",
    name: "Bob",
    role: "designer" as const,
  };

  const json = userToJSON(user);
  assert.equal(json?.role, "designer");
});

// ─── asyncHandler ────────────────────────────────────────────────────────────

test("asyncHandler forwards async rejection to next()", async () => {
  const error = new ApiError(500, "Async failure");
  const handler = asyncHandler(async () => {
    throw error;
  });

  let captured: unknown;
  const fakeNext = (err?: unknown) => { captured = err; };
  const fakeReq = {} as never;
  const fakeRes = {} as never;

  handler(fakeReq, fakeRes, fakeNext);
  // Let the microtask queue flush
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.strictEqual(captured, error);
});

test("asyncHandler calls next() with no argument when handler resolves", async () => {
  const handler = asyncHandler(async (_req, res: never & { json: (v: unknown) => void }) => {
    res.json({ ok: true });
  });

  let nextCalled = false;
  let nextError: unknown = "sentinel";
  const fakeNext = (err?: unknown) => { nextCalled = true; nextError = err; };
  const fakeRes = { json: () => undefined } as never;

  handler({} as never, fakeRes, fakeNext);
  await new Promise((resolve) => setTimeout(resolve, 0));

  // next() should not have been called (handler resolved normally)
  assert.equal(nextCalled, false);
  assert.equal(nextError, "sentinel");
});

// ─── skipAuthBypass ──────────────────────────────────────────────────────────

test("skipAuthBypass is true only for the exact string 'true'", () => {
  const previous = process.env.SKIP_AUTH;

  try {
    process.env.SKIP_AUTH = "true";
    assert.equal(skipAuthBypass(), true);

    process.env.SKIP_AUTH = "TRUE";
    assert.equal(skipAuthBypass(), false);

    process.env.SKIP_AUTH = "1";
    assert.equal(skipAuthBypass(), false);

    delete process.env.SKIP_AUTH;
    assert.equal(skipAuthBypass(), false);
  } finally {
    if (previous === undefined) delete process.env.SKIP_AUTH;
    else process.env.SKIP_AUTH = previous;
  }
});

// ─── noSqlSanitizer ──────────────────────────────────────────────────────────

test("noSqlSanitizer strips $ operators and dotted keys from body, query, and params", () => {
  const req = {
    body: {
      title: "Safe",
      "$where": "this.ownerId",
      nested: { "profile.role": "admin", name: "Ada" },
    },
    query: { "$ne": "client", role: "designer" },
    params: { "project.id": "unsafe", projectId: "507f1f77bcf86cd799439011" },
  };

  noSqlSanitizer(req as never, {} as never, () => undefined);

  assert.deepEqual(req.body, { title: "Safe", nested: { name: "Ada" } });
  assert.deepEqual(req.query, { role: "designer" });
  assert.deepEqual(req.params, { projectId: "507f1f77bcf86cd799439011" });
});

test("noSqlSanitizer preserves safe objects inside arrays", () => {
  const req = {
    body: { filters: [{ name: "Alice", "$gt": 1 }, { name: "Bob", role: "designer" }] },
    query: {},
    params: {},
  };

  noSqlSanitizer(req as never, {} as never, () => undefined);

  assert.deepEqual(req.body, {
    filters: [{ name: "Alice" }, { name: "Bob", role: "designer" }],
  });
});

test("noSqlSanitizer passes through primitive body values unchanged", () => {
  const req = { body: "raw string", query: {}, params: {} };
  noSqlSanitizer(req as never, {} as never, () => undefined);
  assert.equal(req.body, "raw string");
});

test("noSqlSanitizer handles deeply nested $ injection attempts", () => {
  const req = {
    body: { a: { b: { "$gt": 0, safe: "value" } } },
    query: {},
    params: {},
  };

  noSqlSanitizer(req as never, {} as never, () => undefined);
  assert.deepEqual(req.body, { a: { b: { safe: "value" } } });
});

test("noSqlSanitizer calls next() after sanitizing", () => {
  let nextCalled = false;
  const req = { body: {}, query: {}, params: {} };
  noSqlSanitizer(req as never, {} as never, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
});

// ─── corsOptions ─────────────────────────────────────────────────────────────

test("corsOptions allows configured origins", async () => {
  const previous = process.env.CORS_ORIGIN;

  try {
    process.env.CORS_ORIGIN = "http://app.example.com,http://localhost:5173";
    const originHandler = corsOptions.origin as Function;

    const allowed = await new Promise<boolean | string | undefined>((resolve, reject) => {
      originHandler("http://app.example.com", (err: Error | null, value: boolean | undefined) =>
        err ? reject(err) : resolve(value)
      );
    });

    assert.equal(allowed, true);
  } finally {
    if (previous === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = previous;
  }
});

test("corsOptions rejects unconfigured browser origins", async () => {
  const previous = process.env.CORS_ORIGIN;

  try {
    process.env.CORS_ORIGIN = "http://app.example.com";
    const originHandler = corsOptions.origin as Function;

    const allowed = await new Promise<boolean | string | undefined>((resolve, reject) => {
      originHandler("http://evil.example.com", (err: Error | null, value: boolean | undefined) =>
        err ? reject(err) : resolve(value)
      );
    });

    assert.equal(allowed, false);
  } finally {
    if (previous === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = previous;
  }
});

test("corsOptions allows requests with no Origin header (server-to-server)", async () => {
  const originHandler = corsOptions.origin as Function;

  const allowed = await new Promise<boolean | string | undefined>((resolve, reject) => {
    originHandler(undefined, (err: Error | null, value: boolean | undefined) =>
      err ? reject(err) : resolve(value)
    );
  });

  assert.equal(allowed, true);
});

test("corsOptions allows all origins when CORS_ORIGIN is *", async () => {
  const previous = process.env.CORS_ORIGIN;

  try {
    process.env.CORS_ORIGIN = "*";
    const originHandler = corsOptions.origin as Function;

    const allowed = await new Promise<boolean | string | undefined>((resolve, reject) => {
      originHandler("http://any-random-origin.com", (err: Error | null, value: boolean | undefined) =>
        err ? reject(err) : resolve(value)
      );
    });

    assert.equal(allowed, true);
  } finally {
    if (previous === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = previous;
  }
});

test("corsOptions falls back to localhost dev origins when env var is unset", async () => {
  const previous = process.env.CORS_ORIGIN;

  try {
    delete process.env.CORS_ORIGIN;
    const originHandler = corsOptions.origin as Function;

    const allowed = await new Promise<boolean | string | undefined>((resolve, reject) => {
      originHandler("http://localhost:5173", (err: Error | null, value: boolean | undefined) =>
        err ? reject(err) : resolve(value)
      );
    });

    assert.equal(allowed, true);
  } finally {
    if (previous === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = previous;
  }
});
