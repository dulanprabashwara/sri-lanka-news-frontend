import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import TrendingPage from "./page";

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

test("renders guest Trending explanation, localized cards, reasons, and preserved state", async () => {
  let requestPath = "";
  globalThis.fetch = (async (input: string | URL | Request) => {
    requestPath = new URL(String(input)).pathname + new URL(String(input)).search;
    return Response.json([{
      id: "64f0c2f1289c0f0a87654321",
      canonicalTitle: "A developing story",
      category: "LOCAL",
      firstPublishedAt: "2026-09-02T05:00:00Z",
      lastPublishedAt: "2026-09-02T06:00:00Z",
      articleCount: 3,
      sourceCount: 2,
      localizedContent: {
        requestedLanguage: "si", resolvedLanguage: "si", translated: true,
        fallback: false, title: "සිංහල ප්‍රවණතා කතාව",
      },
      reasons: ["RECENTLY_UPDATED", "MULTIPLE_SOURCES", "MULTIPLE_REPORTS"],
    }]);
  }) as typeof fetch;

  const html = renderToStaticMarkup(await TrendingPage({
    searchParams: Promise.resolve({ category: "LOCAL", lang: "si" }),
  }));

  assert.equal(requestPath,
    "/api/v1/stories/trending?limit=10&category=LOCAL&displayLanguage=si");
  assert.match(html, />Trending</);
  assert.match(html, /Stories receiving recent and broad reporting coverage/);
  assert.match(html, /reporting recency, number of reports, and publisher coverage/);
  assert.match(html, /සිංහල ප්‍රවණතා කතාව/);
  assert.match(html, /Recently updated/);
  assert.match(html, /Multiple publishers/);
  assert.match(html, /Multiple reports/);
  assert.match(html, /category=POLITICS&amp;lang=si/);
  assert.match(html, /story\/64f0c2f1289c0f0a87654321\?lang=si/);
  assert.doesNotMatch(html, /Most popular|score|sourceIds|articleIds/);
});

test("renders an empty state with language-preserving browsing links", async () => {
  globalThis.fetch = (async () => Response.json([])) as typeof fetch;

  const html = renderToStaticMarkup(await TrendingPage({
    searchParams: Promise.resolve({ lang: "ta" }),
  }));

  assert.match(html, /No trending stories right now/);
  assert.match(html, /href="\/\?lang=ta"/);
  assert.match(html, /href="\/stories\?lang=ta"/);
});

test("renders an isolated safe error state", async () => {
  globalThis.fetch = (async () => { throw new Error("offline"); }) as typeof fetch;

  const html = renderToStaticMarkup(await TrendingPage({
    searchParams: Promise.resolve({}),
  }));

  assert.match(html, /Unable to load Trending Stories/);
  assert.match(html, /news service is unavailable/i);
});
