import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import TrendingPage from "./page";

const originalFetch = globalThis.fetch;
const originalBaseUrl = process.env.API_BASE_URL;

const mockArticle = {
  id: "art-64f0c2f1289c0f0a12345678",
  title: "A trending headline",
  originalUrl: "https://example.com/article1",
  originalLanguage: "en",
  authors: ["Reporter"],
  publishedAt: "2026-09-02T05:30:00Z",
  discoveredAt: "2026-09-02T05:35:00Z",
  category: "LOCAL",
  summary: "Brief report summary",
  topics: ["Sri Lanka"],
  source: {
    name: "Daily News",
    slug: "daily-news",
    baseUrl: "https://example.com",
  },
};

const mockStory = {
  id: "64f0c2f1289c0f0a87654321",
  canonicalTitle: "A developing story",
  category: "LOCAL",
  firstPublishedAt: "2026-09-02T05:00:00Z",
  lastPublishedAt: "2026-09-02T06:00:00Z",
  articleCount: 3,
  sourceCount: 2,
  localizedContent: {
    requestedLanguage: "si",
    resolvedLanguage: "si",
    translated: true,
    fallback: false,
    title: "සිංහල ප්‍රවණතා කතාව",
  },
  reasons: ["RECENTLY_UPDATED", "MULTIPLE_SOURCES", "MULTIPLE_REPORTS"],
};

test.beforeEach(() => {
  process.env.API_BASE_URL = "http://localhost:8080";
});

test.after(() => {
  globalThis.fetch = originalFetch;
  if (originalBaseUrl === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBaseUrl;
});

test("renders dual sections: Trending Articles (primary) and Trending Stories (secondary)", async () => {
  const requestPaths: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    const path = url.pathname + url.search;
    requestPaths.push(path);
    if (url.pathname.includes("/trending/articles")) {
      return Response.json([mockArticle]);
    }
    if (url.pathname.includes("/stories/trending")) {
      return Response.json([mockStory]);
    }
    return Response.json([]);
  }) as typeof fetch;

  const html = renderToStaticMarkup(
    await TrendingPage({
      searchParams: Promise.resolve({ category: "LOCAL", lang: "si" }),
    }),
  );

  assert.ok(
    requestPaths.includes(
      "/api/v1/trending/articles?limit=20&category=LOCAL&displayLanguage=si",
    ),
  );
  assert.ok(
    requestPaths.includes(
      "/api/v1/stories/trending?limit=10&category=LOCAL&displayLanguage=si",
    ),
  );

  assert.match(html, />Trending</);
  assert.match(html, /Stories receiving recent and broad reporting coverage/);
  assert.match(html, /Trending Articles/);
  assert.match(html, /Top Trending Report/);
  assert.match(html, /A trending headline/);
  assert.match(html, /Trending Stories/);
  assert.match(html, /සිංහල ප්‍රවණතා කතාව/);
  assert.match(html, /Recently updated/);
  assert.match(html, /Multiple publishers/);
  assert.match(html, /Multiple reports/);
  assert.match(html, /category=POLITICS&amp;lang=si/);
  assert.match(html, /story\/64f0c2f1289c0f0a87654321\?lang=si/);
  assert.doesNotMatch(html, /Most popular|score|sourceIds|articleIds/);
});

test("renders empty states with calm messaging for stories when 0 stories exist", async () => {
  globalThis.fetch = (async () => Response.json([])) as typeof fetch;

  const html = renderToStaticMarkup(
    await TrendingPage({
      searchParams: Promise.resolve({ lang: "ta" }),
    }),
  );

  assert.match(html, /No trending articles right now/);
  assert.match(html, /No trending stories right now/);
  assert.match(
    html,
    /Multi-source stories will appear here as coverage develops\./,
  );
  assert.match(html, /href="\/\?lang=ta"/);
  assert.match(html, /href="\/stories\?lang=ta"/);
});

test("renders independent failure: stories failure does not hide trending articles", async () => {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    if (url.pathname.includes("/trending/articles")) {
      return Response.json([mockArticle]);
    }
    throw new Error("stories service down");
  }) as typeof fetch;

  const html = renderToStaticMarkup(
    await TrendingPage({
      searchParams: Promise.resolve({}),
    }),
  );

  // Articles succeed
  assert.match(html, /Trending Articles/);
  assert.match(html, /A trending headline/);
  // Stories fail isolated
  assert.match(html, /Unable to load Trending Stories/);
});

test("renders independent failure: articles failure does not hide trending stories", async () => {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    if (url.pathname.includes("/stories/trending")) {
      return Response.json([mockStory]);
    }
    throw new Error("articles service down");
  }) as typeof fetch;

  const html = renderToStaticMarkup(
    await TrendingPage({
      searchParams: Promise.resolve({}),
    }),
  );

  // Articles fail isolated
  assert.match(html, /Unable to load Trending Articles/);
  // Stories succeed
  assert.match(html, /Trending Stories/);
  assert.match(html, /සිංහල ප්‍රවණතා කතාව/);
});

test("renders full error state when both sections fail", async () => {
  globalThis.fetch = (async () => {
    throw new Error("offline");
  }) as typeof fetch;

  const html = renderToStaticMarkup(
    await TrendingPage({
      searchParams: Promise.resolve({}),
    }),
  );

  assert.match(html, /Unable to load Trending/);
  assert.match(html, /news service is unavailable/i);
});
