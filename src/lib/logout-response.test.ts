import assert from "node:assert/strict";
import test from "node:test";
import { createLogoutRedirectResponse } from "./logout-response";

test("logout uses a relative safe location so reverse-proxy localhost origins cannot leak", () => {
  const response = createLogoutRedirectResponse("/account?lang=si");

  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/account?lang=si");
});

test("logout rejects external return locations", () => {
  const response = createLogoutRedirectResponse("https://attacker.example/steal");

  assert.equal(response.headers.get("location"), "/");
});
