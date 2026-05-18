import test from "node:test";
import assert from "node:assert/strict";

import { registerBody, patchProjectBody } from "../../backend/src/schemas/validation";
import { errorHandler } from "../../backend/src/middleware/errorHandler";
import { validateBody } from "../../backend/src/middleware/validateBody";
import { requireRole } from "../../backend/src/middleware/requireRole";
import { notFound } from "../../backend/src/middleware/notFound";
import { ApiError } from "../../backend/src/utils/ApiError";

function createResponseRecorder() {
  return {
    statusCode: 200,
    payload: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.payload = body;
      return this;
    },
  };
}

// ─── validateBody ────────────────────────────────────────────────────────────

test("validateBody replaces req.body with parsed schema data", () => {
  const req = {
    body: { email: "client@example.com", password: "password123", name: "Client User" },
  };
  let nextError: unknown;

  validateBody(registerBody)(req as never, {} as never, (err?: unknown) => { nextError = err; });

  assert.equal(nextError, undefined);
  assert.equal(req.body.role, "client");
});

test("validateBody passes ApiError to next on invalid input", () => {
  const req = { body: { email: "bad-email", password: "short", name: "" } };
  let nextError: unknown;

  validateBody(registerBody)(req as never, {} as never, (err?: unknown) => { nextError = err; });

  assert.ok(nextError instanceof ApiError);
  assert.equal(nextError.statusCode, 400);
});

test("validateBody passes with price field in patchProjectBody", () => {
  const req = { body: { price: 500, status: "in_progress" } };
  let nextError: unknown;

  validateBody(patchProjectBody)(req as never, {} as never, (err?: unknown) => { nextError = err; });

  assert.equal(nextError, undefined);
  assert.equal(req.body.price, 500);
  assert.equal(req.body.status, "in_progress");
});

test("validateBody rejects negative price via patchProjectBody", () => {
  const req = { body: { price: -1 } };
  let nextError: unknown;

  validateBody(patchProjectBody)(req as never, {} as never, (err?: unknown) => { nextError = err; });

  assert.ok(nextError instanceof ApiError);
  assert.equal(nextError.statusCode, 400);
});

test("validateBody passes with empty patch (all fields optional)", () => {
  const req = { body: {} };
  let nextError: unknown;

  validateBody(patchProjectBody)(req as never, {} as never, (err?: unknown) => { nextError = err; });

  assert.equal(nextError, undefined);
});

test("validateBody strips unknown fields and passes the cleaned body", () => {
  const req = { body: { title: "Project", __hack: true } };
  let nextError: unknown;

  validateBody(patchProjectBody)(req as never, {} as never, (err?: unknown) => { nextError = err; });

  assert.equal(nextError, undefined);
  assert.equal("__hack" in req.body, false);
});

// ─── errorHandler ────────────────────────────────────────────────────────────

test("errorHandler serializes ApiError status and message", () => {
  const res = createResponseRecorder();

  errorHandler(new ApiError(403, "Forbidden"), {} as never, res as never, () => undefined);

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.payload, { error: { message: "Forbidden", status: 403 } });
});

test("errorHandler masks unknown errors as 500 internal server errors", () => {
  const res = createResponseRecorder();

  errorHandler(new Error("database exploded"), {} as never, res as never, () => undefined);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.payload, { error: { message: "Internal server error", status: 500 } });
});

test("errorHandler handles 404 ApiErrors correctly", () => {
  const res = createResponseRecorder();

  errorHandler(new ApiError(404, "Project not found"), {} as never, res as never, () => undefined);

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.payload, { error: { message: "Project not found", status: 404 } });
});

test("errorHandler handles 401 unauthorised errors", () => {
  const res = createResponseRecorder();

  errorHandler(new ApiError(401, "Not authenticated"), {} as never, res as never, () => undefined);

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.payload, { error: { message: "Not authenticated", status: 401 } });
});

test("errorHandler handles non-Error throwables as 500", () => {
  const res = createResponseRecorder();

  errorHandler("something weird" as never, {} as never, res as never, () => undefined);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.payload, { error: { message: "Internal server error", status: 500 } });
});

// ─── requireRole ─────────────────────────────────────────────────────────────

test("requireRole allows access when the user has a matching role", () => {
  const req = { user: { id: "123", role: "admin" } };
  let nextError: unknown;
  let nextCalledWithoutError = false;

  requireRole("admin", "designer")(
    req as never,
    {} as never,
    (err?: unknown) => { if (err) nextError = err; else nextCalledWithoutError = true; }
  );

  assert.equal(nextError, undefined);
  assert.equal(nextCalledWithoutError, true);
});

test("requireRole blocks access and passes 403 when role does not match", () => {
  const req = { user: { id: "456", role: "client" } };
  let nextError: unknown;

  requireRole("admin")(req as never, {} as never, (err?: unknown) => { nextError = err; });

  assert.ok(nextError instanceof ApiError);
  assert.equal(nextError.statusCode, 403);
  assert.equal(nextError.message, "Forbidden");
});

test("requireRole passes 401 when req.user is not set", () => {
  const req = {};
  let nextError: unknown;

  requireRole("designer")(req as never, {} as never, (err?: unknown) => { nextError = err; });

  assert.ok(nextError instanceof ApiError);
  assert.equal(nextError.statusCode, 401);
  assert.equal(nextError.message, "Not authenticated");
});

test("requireRole accepts any role in a multi-role allowlist", () => {
  for (const role of ["client", "designer", "admin"] as const) {
    const req = { user: { id: "1", role } };
    let nextError: unknown;
    let passed = false;

    requireRole("client", "designer", "admin")(
      req as never,
      {} as never,
      (err?: unknown) => { if (err) nextError = err; else passed = true; }
    );

    assert.equal(nextError, undefined, `Expected role '${role}' to pass`);
    assert.equal(passed, true);
  }
});

// ─── notFound ────────────────────────────────────────────────────────────────

test("notFound passes 404 ApiError for unknown routes", () => {
  const req = { method: "GET", originalUrl: "/api/nonexistent" };
  let nextError: unknown;

  notFound(req as never, {} as never, (err?: unknown) => { nextError = err; });

  assert.ok(nextError instanceof ApiError);
  assert.equal(nextError.statusCode, 404);
  assert.match(nextError.message, /GET/);
  assert.match(nextError.message, /\/api\/nonexistent/);
});

test("notFound message includes the HTTP method", () => {
  const req = { method: "DELETE", originalUrl: "/api/does-not-exist" };
  let nextError: unknown;

  notFound(req as never, {} as never, (err?: unknown) => { nextError = err; });

  assert.ok(nextError instanceof ApiError);
  assert.match(nextError.message, /DELETE/);
});
