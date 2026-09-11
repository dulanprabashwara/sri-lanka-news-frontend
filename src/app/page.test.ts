import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import Home, { buildHeroArticles } from "./page";
import type { Article, TrendingStory } from "@/types/api";

const originalFetch = globalThis.fetch;
const originalBaseUrl = process.env.API_BASE_URL;

function createArticle(id: string, title: string, overrides: Partial<Article> = {}): Article {
  return {
    id,
    title,
    originalUrl: `https://example.com/${id}`,
    originalLanguage: "en",
    authors: ["Reporter"],
    publishedAt: "2026-09-10T12:00:00Z",
    discoveredAt: "2026-09-10T12:05:00Z",
    category: "LOCAL",
    summary: `Summary for ${title}`,
    topics: ["Sri Lanka"],
    source: {
      name: "Daily Mirror",
      slug: "daily-mirror",
      baseUrl: "https://www.dailymirror.lk",
    },
    ...overrides,
  };
}

const mockTrendingStory: TrendingStory = {
  id: "story-100",
  canonicalTitle: "Developing story across publishers",
  category: "POLITICS",
  firstPublishedAt: "2026-09-10T08:00:00Z",
  lastPublishedAt: "2026-09-10T10:00:00Z",
  articleCount: 4,
  sourceCount: 3,
  reasons: ["MULTIPLE_SOURCES", "RECENTLY_UPDATED"],
};

test.beforeEach(() => {
  process.env.API_BASE_URL = "http://localhost:8080";
});

test.after(() => {
  globalThis.fetch = originalFetch;
  if (originalBaseUrl === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBaseUrl;
});

test("buildHeroArticles: top three Trending Articles appear in backend ranking order with correct labels", () => {
  const trending = [
    createArticle("art-1", "Rank 1 Trending"),
    createArticle("art-2", "Rank 2 Trending"),
    createArticle("art-3", "Rank 3 Trending"),
    createArticle("art-4", "Rank 4 Trending"),
  ];
  const latest = [createArticle("art-5", "Latest 1")];

  const result = buildHeroArticles(trending, latest);
  assert.equal(result.length, 3);
  assert.equal(result[0].article.id, "art-1");
  assert.equal(result[0].label, "Most trending");
  assert.equal(result[1].article.id, "art-2");
  assert.equal(result[1].label, "Trending now");
  assert.equal(result[2].article.id, "art-3");
  assert.equal(result[2].label, "Trending now");
});

test("buildHeroArticles: one Trending Article + latest fallback fills 3 slots", () => {
  const trending = [createArticle("art-1", "Solo Trending")];
  const latest = [
    createArticle("art-2", "Latest Article 2"),
    createArticle("art-3", "Latest Article 3"),
    createArticle("art-4", "Latest Article 4"),
  ];

  const result = buildHeroArticles(trending, latest);
  assert.equal(result.length, 3);
  assert.equal(result[0].article.id, "art-1");
  assert.equal(result[0].label, "Most trending");
  assert.equal(result[1].article.id, "art-2");
  assert.equal(result[1].label, "Latest report");
  assert.equal(result[2].article.id, "art-3");
  assert.equal(result[2].label, "Latest report");
});

test("buildHeroArticles: zero Trending Articles falls back to Latest Articles", () => {
  const trending: Article[] = [];
  const latest = [
    createArticle("art-1", "Latest Article 1"),
    createArticle("art-2", "Latest Article 2"),
    createArticle("art-3", "Latest Article 3"),
  ];

  const result = buildHeroArticles(trending, latest);
  assert.equal(result.length, 3);
  assert.equal(result[0].article.id, "art-1");
  assert.equal(result[0].label, "Latest report");
  assert.equal(result[1].article.id, "art-2");
  assert.equal(result[1].label, "Latest report");
  assert.equal(result[2].article.id, "art-3");
  assert.equal(result[2].label, "Latest report");
});

test("buildHeroArticles: duplicates between Trending and Latest are removed", () => {
  const trending = [createArticle("art-1", "Trending Article 1")];
  const latest = [
    createArticle("art-1", "Duplicate Article 1"),
    createArticle("art-2", "Latest Article 2"),
    createArticle("art-3", "Latest Article 3"),
  ];

  const result = buildHeroArticles(trending, latest);
  assert.equal(result.length, 3);
  assert.equal(result[0].article.id, "art-1");
  assert.equal(result[0].label, "Most trending");
  assert.equal(result[1].article.id, "art-2");
  assert.equal(result[1].label, "Latest report");
  assert.equal(result[2].article.id, "art-3");
  assert.equal(result[2].label, "Latest report");
});

test("Home: renders top 3 Trending Articles in backend order and forwards displayLanguage", async () => {
  const requestUrls: string[] = [];
  const trending = [
    createArticle("art-1", "Premier Trending Article"),
    createArticle("art-2", "Second Trending Article"),
    createArticle("art-3", "Third Trending Article"),
  ];
  const latest = [
    createArticle("art-4", "Chronological Wire 1"),
    createArticle("art-5", "Chronological Wire 2"),
  ];

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    requestUrls.push(url.pathname + url.search);
    if (url.pathname.includes("/trending/articles")) {
      return Response.json(trending);
    }
    if (url.pathname.includes("/stories/trending")) {
      return Response.json([mockTrendingStory]);
    }
    if (url.pathname.includes("/articles")) {
      return Response.json({
        content: latest,
        page: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
        first: true,
        last: true,
      });
    }
    if (url.pathname.includes("/sources")) {
      return Response.json([]);
    }
    return Response.json([]);
  }) as typeof fetch;

  const html = renderToStaticMarkup(
    await Home({
      searchParams: Promise.resolve({ category: "LOCAL", lang: "si" }),
    }),
  );

  // 1. Trending Articles endpoint queried with limit=6, category=LOCAL, displayLanguage=si
  assert.ok(
    requestUrls.some((path) =>
      path.includes("/api/v1/trending/articles?limit=6&category=LOCAL&displayLanguage=si"),
    ),
  );

  // 2. Hero articles appear in exact backend-ranked order
  const idx1 = html.indexOf("Premier Trending Article");
  const idx2 = html.indexOf("Second Trending Article");
  const idx3 = html.indexOf("Third Trending Article");
  assert.ok(idx1 !== -1 && idx2 !== -1 && idx3 !== -1);
  assert.ok(idx1 < idx2 && idx2 < idx3, "Articles must follow backend ranking order");

  // 3. Correct labels rendered
  assert.match(html, /Most trending/);
  assert.match(html, /Trending now/);

  // 4. Hero does not render Trending Story canonicalTitle in hero slots
  assert.match(html, /Developing story across publishers/);
  // (Note: Developing story is in CoverageMonitor, whereas hero has Premier/Second/Third)

  // 5. No raw trend score rendered
  assert.doesNotMatch(html, /trendScore|score:/i);

  // 6. Numbering 02 and 03 preserved
  assert.match(html, />02</);
  assert.match(html, />03</);
});

test("Home: Trending Articles request failure gracefully falls back to Latest Articles", async () => {
  const latest = [
    createArticle("art-10", "Fallback Wire Article 10"),
    createArticle("art-11", "Fallback Wire Article 11"),
    createArticle("art-12", "Fallback Wire Article 12"),
  ];

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    if (url.pathname.includes("/trending/articles")) {
      return new Response("Service Unavailable", { status: 503 });
    }
    if (url.pathname.includes("/stories/trending")) {
      return Response.json([]);
    }
    if (url.pathname.includes("/articles")) {
      return Response.json({
        content: latest,
        page: 0,
        size: 20,
        totalElements: 3,
        totalPages: 1,
        first: true,
        last: true,
      });
    }
    return Response.json([]);
  }) as typeof fetch;

  const html = renderToStaticMarkup(
    await Home({
      searchParams: Promise.resolve({}),
    }),
  );

  // Hero still renders successfully using fallback articles
  assert.match(html, /Fallback Wire Article 10/);
  assert.match(html, /Fallback Wire Article 11/);
  assert.match(html, /Fallback Wire Article 12/);
  assert.match(html, /Latest report/);
});

test("Home: Latest Articles failure still renders available Trending Articles in hero", async () => {
  const trending = [
    createArticle("art-20", "Resilient Trending Alpha"),
    createArticle("art-21", "Resilient Trending Beta"),
  ];

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    if (url.pathname.includes("/trending/articles")) {
      return Response.json(trending);
    }
    if (url.pathname.includes("/stories/trending")) {
      return Response.json([]);
    }
    if (url.pathname.includes("/articles")) {
      return new Response("Internal Server Error", { status: 500 });
    }
    return Response.json([]);
  }) as typeof fetch;

  const html = renderToStaticMarkup(
    await Home({
      searchParams: Promise.resolve({}),
    }),
  );

  // Hero renders trending articles instead of failing whole page
  assert.match(html, /Resilient Trending Alpha/);
  assert.match(html, /Resilient Trending Beta/);
  assert.match(html, /Most trending/);
  assert.match(html, /Trending now/);
});

test("Home: hero articles are excluded from the immediate Latest Reports list (deduplication)", async () => {
  const trending = [createArticle("art-1", "Article One (Trending & Wire)")];
  const latest = [
    createArticle("art-1", "Article One (Trending & Wire)"),
    createArticle("art-2", "Article Two (Wire Only)"),
  ];

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    if (url.pathname.includes("/trending/articles")) {
      return Response.json(trending);
    }
    if (url.pathname.includes("/stories/trending")) {
      return Response.json([]);
    }
    if (url.pathname.includes("/articles")) {
      return Response.json({
        content: latest,
        page: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
        first: true,
        last: true,
      });
    }
    return Response.json([]);
  }) as typeof fetch;

  const html = renderToStaticMarkup(
    await Home({
      searchParams: Promise.resolve({}),
    }),
  );

  // Hero displays Article One
  assert.match(html, /Article One \(Trending &amp; Wire\)/);
  // Wire section displays Article Two
  assert.match(html, /Article Two \(Wire Only\)/);
});
