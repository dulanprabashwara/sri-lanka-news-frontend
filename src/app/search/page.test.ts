import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import SearchPage from "./page";

const originalFetch = globalThis.fetch;
const originalBaseUrl = process.env.API_BASE_URL;

test.beforeEach(() => {
  process.env.API_BASE_URL = "http://localhost:8080";
});

test.after(() => {
  globalThis.fetch = originalFetch;
  if (originalBaseUrl === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBaseUrl;
});

test("missing mode keeps Keyword search as the guest-accessible default", async () => {
  let path = "";
  globalThis.fetch = (async (input: string | URL | Request) => {
    path = new URL(String(input)).pathname;
    return Response.json({ query: "cricket", content: [], page: 0, size: 20,
      totalElements: 0, totalPages: 0, first: true, last: true });
  }) as typeof fetch;

  const html = renderToStaticMarkup(await SearchPage({
    searchParams: Promise.resolve({ q: "cricket" }),
  }));

  assert.equal(path, "/api/v1/search/articles");
  assert.match(html, /aria-current="page"[\s\S]*?Keyword/i);
  assert.match(html, /mode=semantic/);
});

test("semantic provider failure keeps state and offers Keyword fallback", async () => {
  globalThis.fetch = (async () => { throw new Error("offline"); }) as typeof fetch;

  const html = renderToStaticMarkup(await SearchPage({
    searchParams: Promise.resolve({ q: "මාර්ග අනතුර", mode: "semantic",
      category: "LOCAL", language: "si", lang: "ta" }),
  }));

  assert.match(html, /Semantic search is temporarily unavailable/);
  assert.match(html, /Try Keyword search/);
  assert.match(html, /mode=text/);
  assert.match(html, /category=LOCAL/);
  assert.match(html, /language=si/);
  assert.match(html, /lang=ta/);
});
