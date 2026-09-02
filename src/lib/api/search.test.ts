import assert from "node:assert/strict";
import test from "node:test";
import { parseSemanticSearchResponse, parseTextSearchResponse, searchArticles, searchArticlesSemantically } from "./search";

const originalFetch = globalThis.fetch;
const originalBaseUrl = process.env.API_BASE_URL;
test.beforeEach(() => { process.env.API_BASE_URL = "http://localhost:8080"; });
test.after(() => { globalThis.fetch = originalFetch; if (originalBaseUrl === undefined) delete process.env.API_BASE_URL; else process.env.API_BASE_URL = originalBaseUrl; });

test("parses only the public Article search contract", () => {
  const result = parseTextSearchResponse({ query: "ක්‍රිකට්", content: [{
    id: "a1", title: "ක්‍රිකට්", originalUrl: "https://example.com/a1", originalLanguage: "si",
    authors: [], publishedAt: "2026-09-02T10:00:00Z", discoveredAt: "2026-09-02T10:01:00Z",
    category: "SPORTS", summary: null, topics: [], source: { name: "Hiru", slug: "hiru", baseUrl: "https://example.com" },
    textScore: 12, extractedContent: "private", semanticEmbedding: [1, 2],
  }], page: 0, size: 20, totalElements: 1, totalPages: 1, first: true, last: true, textScore: 12 });
  assert.equal(result.query, "ක්‍රිකට්");
  assert.equal("textScore" in result, false);
  assert.equal("extractedContent" in result.content[0]!, false);
});

test("builds an encoded guest search request with distinct filters and display language", async () => {
  let seen: { path: string; auth: string | null } | undefined;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    seen = { path: url.pathname + url.search, auth: new Headers(init?.headers).get("authorization") };
    return Response.json({ query: "தமிழ் செய்தி", content: [], page: 1, size: 20, totalElements: 0, totalPages: 0, first: false, last: true });
  }) as typeof fetch;
  await searchArticles({ query: "தமிழ் செய்தி", page: 1, category: "LOCAL", language: "ta", source: "newsfirst", displayLanguage: "si" });
  assert.deepEqual(seen, { path: "/api/v1/search/articles?q=%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D+%E0%AE%9A%E0%AF%86%E0%AE%AF%E0%AF%8D%E0%AE%A4%E0%AE%BF&page=1&size=20&source=newsfirst&category=LOCAL&language=ta&displayLanguage=si", auth: null });
});

test("parses a private-field-free semantic response without similarity scores", () => {
  const result = parseSemanticSearchResponse({ query: "road accident", content: [{
    id: "a1", title: "Road collision", originalUrl: "https://example.com/a1",
    originalLanguage: "en", authors: [], publishedAt: "2026-09-02T10:00:00Z",
    discoveredAt: "2026-09-02T10:01:00Z", category: "LOCAL", summary: "Public summary",
    topics: [], source: { name: "NewsFirst", slug: "newsfirst", baseUrl: "https://example.com" },
    vectorSearchScore: 0.91, semanticEmbedding: { values: [1, 2], inputHash: "private" },
    extractedContent: "private",
  }], page: 0, size: 20, hasMore: false, first: true, vectorSearchScore: 0.91 });
  assert.equal(result.content[0]!.title, "Road collision");
  assert.equal("vectorSearchScore" in result, false);
  assert.equal("semanticEmbedding" in result.content[0]!, false);
  assert.equal("extractedContent" in result.content[0]!, false);
});

test("builds a guest semantic request with all filters and no authorization", async () => {
  let seen: { path: string; auth: string | null } | undefined;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    seen = { path: url.pathname + url.search, auth: new Headers(init?.headers).get("authorization") };
    return Response.json({ query: "මාර්ග අනතුර", content: [], page: 1, size: 10, hasMore: true, first: false });
  }) as typeof fetch;
  await searchArticlesSemantically({ query: "මාර්ග අනතුර", page: 1, size: 10,
    source: "hiru-news-sinhala", category: "LOCAL", language: "si", displayLanguage: "ta" });
  assert.deepEqual(seen, { path: "/api/v1/search/semantic?q=%E0%B6%B8%E0%B7%8F%E0%B6%BB%E0%B7%8A%E0%B6%9C+%E0%B6%85%E0%B6%B1%E0%B6%AD%E0%B7%94%E0%B6%BB&page=1&size=10&source=hiru-news-sinhala&category=LOCAL&language=si&displayLanguage=ta", auth: null });
});
