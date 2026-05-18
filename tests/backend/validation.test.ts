import test from "node:test";
import assert from "node:assert/strict";

import {
  createAssetBody,
  createBriefBody,
  createInvoiceBody,
  patchProjectBody,
  registerBody,
} from "../../backend/src/schemas/validation";

test("registerBody defaults new accounts to client", () => {
  const result = registerBody.parse({
    email: "client@example.com",
    password: "password123",
    name: "Client User",
  });

  assert.equal(result.role, "client");
});

test("registerBody rejects invalid email addresses", () => {
  const result = registerBody.safeParse({
    email: "not-an-email",
    password: "password123",
    name: "Client User",
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

test("createBriefBody coerces deadline strings into dates", () => {
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

test("patchProjectBody accepts partial project updates", () => {
  const result = patchProjectBody.parse({
    status: "completed",
  });

  assert.deepEqual(result, { status: "completed" });
});

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

test("createAssetBody rejects non-url asset links", () => {
  const result = createAssetBody.safeParse({
    url: "not-a-url",
    filename: "preview.png",
  });

  assert.equal(result.success, false);
});
