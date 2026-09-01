import assert from "node:assert/strict";
import test from "node:test";
import { getOptionalStoryTimeline } from "./timeline";

test("suppresses supplementary timeline failures so Story detail remains usable", async () => {
  const result = await getOptionalStoryTimeline("story-1", async () => {
    throw new Error("timeline unavailable");
  });
  assert.equal(result, null);
});
