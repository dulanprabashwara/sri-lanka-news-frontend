import assert from "node:assert/strict";
import test from "node:test";
import { parseCurrentUser } from "./me";

test("parses the minimal Spring current-user response", () => {
  assert.deepEqual(parseCurrentUser({ authenticated: true, userId: "user-1", email: "reader@example.com" }), {
    authenticated: true, userId: "user-1", email: "reader@example.com",
  });
});

test("allows an absent email but rejects an absent subject", () => {
  assert.equal(parseCurrentUser({ authenticated: true, userId: "user-1" }).email, null);
  assert.throws(() => parseCurrentUser({ authenticated: true }));
});
