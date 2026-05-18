import test from "node:test";
import assert from "node:assert/strict";

import { registerBody } from "../../backend/src/schemas/validation";
import { errorHandler } from "../../backend/src/middleware/errorHandler";
import { validateBody } from "../../backend/src/middleware/validateBody";
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

test("validateBody replaces req.body with parsed schema data", () => {
  const req = {
    body: {
      email: "client@example.com",
      password: "password123",
      name: "Client User",
    },
  };
  let nextError: unknown;

  validateBody(registerBody)(req as never, {} as never, (err?: unknown) => {
    nextError = err;
  });

  assert.equal(nextError, undefined);
  assert.equal(req.body.role, "client");
});

test("validateBody passes ApiError to next on invalid input", () => {
  const req = {
    body: {
      email: "bad-email",
      password: "short",
      name: "",
    },
  };
  let nextError: unknown;

  validateBody(registerBody)(req as never, {} as never, (err?: unknown) => {
    nextError = err;
  });

  assert.ok(nextError instanceof ApiError);
  assert.equal(nextError.statusCode, 400);
});

test("errorHandler serializes ApiError status and message", () => {
  const res = createResponseRecorder();

  errorHandler(new ApiError(403, "Forbidden"), {} as never, res as never, () => undefined);

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.payload, {
    error: {
      message: "Forbidden",
      status: 403,
    },
  });
});

test("errorHandler masks unknown errors as internal server errors", () => {
  const res = createResponseRecorder();

  errorHandler(new Error("database exploded"), {} as never, res as never, () => undefined);

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.payload, {
    error: {
      message: "Internal server error",
      status: 500,
    },
  });
});
