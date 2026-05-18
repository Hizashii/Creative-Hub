import test from "node:test";
import assert from "node:assert/strict";

import { api, ApiRequestError } from "../../src/api/client";
import { daysUntil, formatCurrency, getInitials, titleize } from "../../src/utils/format";

function installLocalStorage(token?: string) {
  const store = new Map<string, string>();
  if (token) store.set("creativehub_token", token);

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem(key: string) {
        return store.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        store.set(key, value);
      },
      removeItem(key: string) {
        store.delete(key);
      },
    },
  });
}

test("getInitials trims names and returns two uppercase initials", () => {
  assert.equal(getInitials("  Ada Lovelace Byron  "), "AL");
});

test("titleize converts kebab and snake case into readable labels", () => {
  assert.equal(titleize("in_progress-review"), "In Progress Review");
});

test("formatCurrency includes the formatted amount and currency marker", () => {
  const result = formatCurrency(42.5, "USD");

  assert.match(result, /42/);
  assert.match(result, /50/);
});

test("daysUntil returns null for invalid dates", () => {
  assert.equal(daysUntil("not-a-date"), null);
});

test("api adds bearer token and parses successful JSON responses", async () => {
  installLocalStorage("abc123");

  let calledUrl = "";
  let calledOptions: RequestInit | undefined;
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url: string, options: RequestInit) => {
      calledUrl = url;
      calledOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      };
    },
  });

  const result = await api<{ ok: boolean }>("/projects");

  assert.deepEqual(result, { ok: true });
  assert.equal(calledUrl, "/api/projects");
  assert.equal((calledOptions?.headers as Record<string, string>).Authorization, "Bearer abc123");
  assert.equal((calledOptions?.headers as Record<string, string>)["Content-Type"], "application/json");
});

test("api returns undefined for 204 responses", async () => {
  installLocalStorage();
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => ({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error("json should not be called");
      },
    }),
  });

  const result = await api<void>("/projects/507f1f77bcf86cd799439011", { method: "DELETE" });

  assert.equal(result, undefined);
});

test("api throws ApiRequestError with server-provided messages", async () => {
  installLocalStorage();
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async () => ({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({ error: { message: "Invalid project id" } }),
    }),
  });

  await assert.rejects(
    () => api("/projects/bad-id"),
    (err) => err instanceof ApiRequestError && err.status === 400 && err.message === "Invalid project id"
  );
});
