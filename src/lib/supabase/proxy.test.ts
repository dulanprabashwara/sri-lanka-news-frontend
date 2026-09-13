import assert from "node:assert/strict";
import test from "node:test";
import { requiresAuthentication } from "./proxy";

test("notifications and privacy settings require authentication", () => {
  assert.equal(requiresAuthentication("/notifications"), true);
  assert.equal(requiresAuthentication("/account/privacy"), true);
});

test("public notification and authentication routes remain accessible", () => {
  assert.equal(requiresAuthentication("/notifications/unsubscribe"), false);
  assert.equal(requiresAuthentication("/auth/login"), false);
  assert.equal(requiresAuthentication("/"), false);
});
