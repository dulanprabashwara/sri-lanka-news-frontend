import assert from "node:assert/strict";
import test from "node:test";
import { buildSearchHref, readSearchMode } from "./search-state";

test("Keyword mode is the default and explicit semantic mode is supported", () => {
  assert.equal(readSearchMode(undefined), "text");
  assert.equal(readSearchMode("unexpected"), "text");
  assert.equal(readSearchMode("semantic"), "semantic");
});

test("mode switching preserves query, filters, source, and display language", () => {
  const href = buildSearchHref({ query: "මාර්ග අනතුර", mode: "semantic",
    source: "hiru-news-sinhala", category: "LOCAL", language: "si",
    displayLanguage: "ta" });
  const url = new URL(href, "http://localhost");
  assert.equal(url.pathname, "/search");
  assert.equal(url.searchParams.get("q"), "මාර්ග අනතුර");
  assert.equal(url.searchParams.get("mode"), "semantic");
  assert.equal(url.searchParams.get("source"), "hiru-news-sinhala");
  assert.equal(url.searchParams.get("category"), "LOCAL");
  assert.equal(url.searchParams.get("language"), "si");
  assert.equal(url.searchParams.get("lang"), "ta");
});

test("semantic pagination preserves mode and bounded page state", () => {
  const href = buildSearchHref({ query: "தமிழ் செய்தி", mode: "semantic", page: 2,
    category: "POLITICS", language: "ta", displayLanguage: "si" });
  const url = new URL(href, "http://localhost");
  assert.equal(url.searchParams.get("page"), "2");
  assert.equal(url.searchParams.get("mode"), "semantic");
  assert.equal(url.searchParams.get("lang"), "si");
});
