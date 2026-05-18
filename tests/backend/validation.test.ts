import test from "node:test";
import assert from "node:assert/strict";

import {
  acceptBriefBody,
  createAssetBody,
  createBriefBody,
  createInvoiceBody,
  createProjectBody,
  patchProjectBody,
  registerBody,
  updateBriefBody,
} from "../../backend/src/schemas/validation";

// ─── registerBody ────────────────────────────────────────────────────────────

test("registerBody defaults new accounts to client role", () => {
  const result = registerBody.parse({
    email: "client@example.com",
    password: "password123",
    name: "Client User",
  });

  assert.equal(result.role, "client");
});

test("registerBody accepts explicit designer role", () => {
  const result = registerBody.parse({
    email: "pro@example.com",
    password: "password123",
    name: "Pro User",
    role: "designer",
  });

  assert.equal(result.role, "designer");
});

test("registerBody rejects invalid email addresses", () => {
  const result = registerBody.safeParse({
    email: "not-an-email",
    password: "password123",
    name: "Client User",
  });

  assert.equal(result.success, false);
});

test("registerBody rejects passwords shorter than 8 characters", () => {
  const result = registerBody.safeParse({
    email: "user@example.com",
    password: "short",
    name: "User",
  });

  assert.equal(result.success, false);
});

test("registerBody does not allow public admin registration", () => {
  const result = registerBody.safeParse({
    email: "admin@example.com",
    password: "password123",
    name: "Admin User",
    role: "admin",
  });

  assert.equal(result.success, false);
});

test("registerBody rejects empty name", () => {
  const result = registerBody.safeParse({
    email: "user@example.com",
    password: "password123",
    name: "",
  });

  assert.equal(result.success, false);
});

// ─── createBriefBody ─────────────────────────────────────────────────────────

test("createBriefBody coerces deadline strings into Date objects", () => {
  const result = createBriefBody.parse({
    title: "Brand refresh",
    companyName: "Acme",
    designType: "branding",
    description: "Refresh the brand identity.",
    targetAudience: "Small business owners",
    stylePreference: "Clean and modern",
    deadline: "2026-06-15",
    budget: 2500,
    references: ["https://example.com/moodboard"],
  });

  assert.ok(result.deadline instanceof Date);
  assert.equal(result.designType, "branding");
});

test("createBriefBody budget is optional", () => {
  const result = createBriefBody.parse({
    title: "Logo design",
    companyName: "Startup",
    designType: "logo",
    description: "Simple wordmark logo.",
    targetAudience: "Tech professionals",
    stylePreference: "Minimal",
    deadline: "2026-12-01",
  });

  assert.equal(result.budget, undefined);
});

test("createBriefBody references defaults to undefined when omitted", () => {
  const result = createBriefBody.parse({
    title: "Poster",
    companyName: "Gallery",
    designType: "poster",
    description: "Event poster.",
    targetAudience: "Art lovers",
    stylePreference: "Bold",
    deadline: "2026-09-01",
  });

  assert.equal(result.references, undefined);
});

test("createBriefBody rejects unsupported design types", () => {
  const result = createBriefBody.safeParse({
    title: "Packaging",
    companyName: "Acme",
    designType: "packaging",
    description: "Create packaging visuals.",
    targetAudience: "Retail buyers",
    stylePreference: "Premium",
    deadline: "2026-06-15",
  });

  assert.equal(result.success, false);
});

test("updateBriefBody is fully partial — accepts any subset of fields", () => {
  const titleOnly = updateBriefBody.parse({ title: "New title" });
  assert.equal(titleOnly.title, "New title");
  assert.equal(titleOnly.description, undefined);

  const empty = updateBriefBody.parse({});
  assert.deepEqual(empty, {});
});

// ─── acceptBriefBody ─────────────────────────────────────────────────────────

test("acceptBriefBody accepts an empty body (designer picks up themselves)", () => {
  const result = acceptBriefBody.parse({});
  assert.equal(result.designerUserId, undefined);
});

test("acceptBriefBody accepts an optional designerUserId for admin assignment", () => {
  const result = acceptBriefBody.parse({ designerUserId: "507f1f77bcf86cd799439011" });
  assert.equal(result.designerUserId, "507f1f77bcf86cd799439011");
});

// ─── createProjectBody ───────────────────────────────────────────────────────

test("createProjectBody requires a non-empty title", () => {
  const missing = createProjectBody.safeParse({ description: "No title" });
  assert.equal(missing.success, false);

  const empty = createProjectBody.safeParse({ title: "", description: "Empty title" });
  assert.equal(empty.success, false);
});

test("createProjectBody accepts all valid statuses", () => {
  const statuses = ["draft", "in_progress", "pending", "paused", "completed"] as const;
  for (const status of statuses) {
    const result = createProjectBody.parse({ title: "Project", status });
    assert.equal(result.status, status);
  }
});

// ─── patchProjectBody ────────────────────────────────────────────────────────

test("patchProjectBody accepts partial project updates", () => {
  const result = patchProjectBody.parse({ status: "completed" });
  assert.deepEqual(result, { status: "completed" });
});

test("patchProjectBody accepts a price quote from the designer", () => {
  const result = patchProjectBody.parse({ price: 750 });
  assert.equal(result.price, 750);
});

test("patchProjectBody accepts price alongside a status change", () => {
  const result = patchProjectBody.parse({ price: 1200, status: "in_progress" });
  assert.equal(result.price, 1200);
  assert.equal(result.status, "in_progress");
});

test("patchProjectBody rejects negative prices", () => {
  const result = patchProjectBody.safeParse({ price: -50 });
  assert.equal(result.success, false);
});

test("patchProjectBody accepts price of zero", () => {
  const result = patchProjectBody.parse({ price: 0 });
  assert.equal(result.price, 0);
});

test("patchProjectBody strips unrecognised fields", () => {
  const result = patchProjectBody.parse({ title: "New title", __injected: true });
  assert.equal("__injected" in result, false);
});

// ─── createInvoiceBody ───────────────────────────────────────────────────────

test("createInvoiceBody accepts nullable project and client references", () => {
  const result = createInvoiceBody.parse({
    title: "Logo invoice",
    amount: 1250,
    projectId: null,
    clientUserId: null,
    dueDate: null,
  });

  assert.equal(result.projectId, null);
  assert.equal(result.clientUserId, null);
  assert.equal(result.dueDate, null);
});

test("createInvoiceBody rejects negative amounts", () => {
  const result = createInvoiceBody.safeParse({
    title: "Refund",
    amount: -100,
  });

  assert.equal(result.success, false);
});

test("createInvoiceBody accepts zero-amount invoices", () => {
  const result = createInvoiceBody.parse({ title: "Free tier", amount: 0 });
  assert.equal(result.amount, 0);
});

test("createInvoiceBody defaults currency and status when omitted", () => {
  const result = createInvoiceBody.parse({ title: "Invoice", amount: 500 });
  assert.equal(result.currency, undefined); // optional, no default in schema
  assert.equal(result.status, undefined);
});

// ─── createAssetBody ─────────────────────────────────────────────────────────

test("createAssetBody rejects non-url asset links", () => {
  const result = createAssetBody.safeParse({
    url: "not-a-url",
    filename: "preview.png",
  });

  assert.equal(result.success, false);
});

test("createAssetBody accepts https URLs with optional tags", () => {
  const result = createAssetBody.parse({
    url: "https://cdn.example.com/preview.png",
    filename: "preview.png",
    tags: ["preview", "client-review"],
  });

  assert.deepEqual(result.tags, ["preview", "client-review"]);
});

test("createAssetBody tags are optional", () => {
  const result = createAssetBody.parse({
    url: "https://cdn.example.com/logo.svg",
    filename: "logo.svg",
  });

  assert.equal(result.tags, undefined);
});
