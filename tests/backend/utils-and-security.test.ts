import test from "node:test";
import assert from "node:assert/strict";

import { corsOptions } from "../../backend/src/security/http/corsOptions";
import { noSqlSanitizer } from "../../backend/src/security/sanitization/noSqlSanitizer";
import { skipAuthBypass } from "../../backend/src/utils/skipAuthBypass";
import { ApiError } from "../../backend/src/utils/ApiError";
import { parseObjectId } from "../../backend/src/utils/mongoose";
import { readRouteString } from "../../backend/src/utils/routeParams";

test("parseObjectId returns a Mongo ObjectId for valid ids", () => {
  const id = "507f1f77bcf86cd799439011";

  assert.equal(parseObjectId(id).toHexString(), id);
});

test("parseObjectId throws ApiError 400 for invalid ids", () => {
  assert.throws(
    () => parseObjectId("bad-id", "project id"),
    (err) => err instanceof ApiError && err.statusCode === 400 && err.message === "Invalid project id"
  );
});

test("readRouteString returns the first string from array params", () => {
  const req = { params: { projectId: ["abc123", "ignored"] } };

  assert.equal(readRouteString(req as never, "projectId"), "abc123");
});

test("readRouteString rejects missing params", () => {
  const req = { params: {} };

  assert.throws(
    () => readRouteString(req as never, "projectId"),
    (err) => err instanceof ApiError && err.statusCode === 400 && err.message.includes("Missing route parameter")
  );
});

test("noSqlSanitizer strips unsafe Mongo keys from body, query, and params", () => {
  const req = {
    body: {
      title: "Safe",
      "$where": "this.ownerId",
      nested: {
        "profile.role": "admin",
        name: "Ada",
      },
    },
    query: {
      "$ne": "client",
      role: "designer",
    },
    params: {
      "project.id": "unsafe",
      projectId: "507f1f77bcf86cd799439011",
    },
  };

  noSqlSanitizer(req as never, {} as never, () => undefined);

  assert.deepEqual(req.body, { title: "Safe", nested: { name: "Ada" } });
  assert.deepEqual(req.query, { role: "designer" });
  assert.deepEqual(req.params, { projectId: "507f1f77bcf86cd799439011" });
});

test("noSqlSanitizer preserves safe objects inside arrays", () => {
  const req = {
    body: {
      filters: [
        { name: "Alice", "$gt": 1 },
        { name: "Bob", role: "designer" },
      ],
    },
    query: {},
    params: {},
  };

  noSqlSanitizer(req as never, {} as never, () => undefined);

  assert.deepEqual(req.body, {
    filters: [{ name: "Alice" }, { name: "Bob", role: "designer" }],
  });
});

test("skipAuthBypass is true only for the exact string true", () => {
  const previous = process.env.SKIP_AUTH;

  try {
    process.env.SKIP_AUTH = "true";
    assert.equal(skipAuthBypass(), true);

    process.env.SKIP_AUTH = "TRUE";
    assert.equal(skipAuthBypass(), false);
  } finally {
    if (previous === undefined) delete process.env.SKIP_AUTH;
    else process.env.SKIP_AUTH = previous;
  }
});

test("corsOptions allows configured origins", async () => {
  const previous = process.env.CORS_ORIGIN;

  try {
    process.env.CORS_ORIGIN = "http://app.example.com,http://localhost:5173";
    const originHandler = corsOptions.origin;
    assert.equal(typeof originHandler, "function");

    const allowed = await new Promise<boolean | string | undefined>((resolve, reject) => {
      originHandler("http://app.example.com", (err, value) => (err ? reject(err) : resolve(value)));
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
    const originHandler = corsOptions.origin;
    assert.equal(typeof originHandler, "function");

    const allowed = await new Promise<boolean | string | undefined>((resolve, reject) => {
      originHandler("http://evil.example.com", (err, value) => (err ? reject(err) : resolve(value)));
    });

    assert.equal(allowed, false);
  } finally {
    if (previous === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = previous;
  }
});
