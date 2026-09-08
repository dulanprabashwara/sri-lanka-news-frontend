import assert from "node:assert/strict";
import test from "node:test";
import { archivePage, archiveHref } from "./archive";

test("archive accepts zero-based pages and safely rejects malformed inputs", () => {
  for (const value of [undefined, "-1", "1.5", "NaN", "Infinity", "1oops", "9999999999999999999"]) assert.equal(archivePage(value), 0);
  assert.equal(archivePage("0"), 0);
  assert.equal(archivePage("12"), 12);
  assert.equal(archivePage(["2", "8"]), 2);
});

test("pagination preserves category, source, and display language", () => {
  const result = new URL(archiveHref(3, { source: "daily-mirror", category: "LOCAL", lang: "si" }), "https://example.test");
  assert.equal(result.pathname, "/articles");
  assert.equal(result.searchParams.get("page"), "3");
  assert.equal(result.searchParams.get("source"), "daily-mirror");
  assert.equal(result.searchParams.get("category"), "LOCAL");
  assert.equal(result.searchParams.get("lang"), "si");
  assert.equal(archiveHref(0, {}), "/articles?page=0");
});
