import assert from "node:assert/strict";
import test from "node:test";
import { safeNextPath } from "./safe-redirect";

test("safeNextPath permits internal paths and preserves language queries", () => {
  assert.equal(safeNextPath("/article/123?lang=si"), "/article/123?lang=si");
});

test("safeNextPath rejects external and protocol-relative redirects", () => {
  assert.equal(safeNextPath("https://evil.example"), "/account");
  assert.equal(safeNextPath("//evil.example"), "/account");
});
