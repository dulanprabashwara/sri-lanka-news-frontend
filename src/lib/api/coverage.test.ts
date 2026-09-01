import assert from "node:assert/strict";
import test from "node:test";
import { getOptionalStoryCoverage } from "./coverage";

test("suppresses supplementary coverage failures so Story detail remains usable", async () => {
  const result = await getOptionalStoryCoverage("story-1", async () => {
    throw new Error("coverage unavailable");
  });
  assert.equal(result, null);
});
