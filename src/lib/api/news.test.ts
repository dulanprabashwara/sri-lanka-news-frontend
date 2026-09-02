import assert from "node:assert/strict";
import test from "node:test";
import {
  getArticle,
  getArticles,
  getArticleStory,
  getStories,
  getStory,
  getStoryCoverage,
  getStoryTimeline,
  askStory,
} from "./news";

const story = {
  id: "64f0c2f1289c0f0a87654321",
  canonicalTitle: "A developing story",
  category: "LOCAL",
  firstPublishedAt: "2026-08-30T05:00:00Z",
  lastPublishedAt: "2026-08-30T06:00:00Z",
  articleCount: 2,
  sourceCount: 2,
};

const originalBaseUrl = process.env.API_BASE_URL;
const originalFetch = globalThis.fetch;

test.beforeEach(() => {
  process.env.API_BASE_URL = "http://localhost:8080";
});

test("submits a guest Story question with the selected display language", async () => {
  let requestPath = "";
  let requestBody = "";
  let authorization: string | null = "unexpected";
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    requestPath = new URL(String(input)).pathname;
    requestBody = String(init?.body);
    authorization = new Headers(init?.headers).get("Authorization");
    return Response.json({
      storyId: story.id,
      answerable: false,
      answer: "ප්‍රමාණවත් තොරතුරු නොමැත.",
      citations: [],
    });
  }) as typeof fetch;

  const result = await askStory(story.id, "මොකක්ද සිදු වුණේ?", "si");

  assert.equal(requestPath, `/api/v1/stories/${story.id}/ask`);
  assert.equal(authorization, null);
  assert.deepEqual(JSON.parse(requestBody), {
    question: "මොකක්ද සිදු වුණේ?",
    displayLanguage: "si",
  });
  assert.equal(result.answerable, false);
});

test("sends displayLanguage independently from the original language filter", async () => {
  const paths: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(String(input));
    paths.push(url.pathname + url.search);
    if (url.pathname === "/api/v1/articles") {
      return Response.json({ content: [], page: 0, size: 20, totalElements: 0,
        totalPages: 0, first: true, last: true });
    }
    if (url.pathname.startsWith("/api/v1/stories/") && url.pathname.endsWith("/coverage")) {
      return Response.json({ ...story, storyId: story.id, comparisonAvailable: false,
        sharedTopics: [], sharedEntities: [], sources: [] });
    }
    return Response.json({
      id: "64f0c2f1289c0f0a12345678", title: "Original", originalUrl: "https://example.com/1",
      originalLanguage: "en", authors: [], publishedAt: "2026-09-01T00:00:00Z",
      discoveredAt: "2026-09-01T00:01:00Z", category: "LOCAL", summary: "Summary", topics: [],
      source: { name: "Publisher", slug: "publisher", baseUrl: "https://example.com" },
      localizedContent: { requestedLanguage: "si", resolvedLanguage: "si", translated: true,
        fallback: false, title: "සිංහල", summary: "සාරාංශය" },
    });
  }) as typeof fetch;

  await getArticles({ language: "en", displayLanguage: "si" });
  await getArticle("64f0c2f1289c0f0a12345678", "si");
  await getStoryCoverage(story.id, "si");

  assert.deepEqual(paths, [
    "/api/v1/articles?language=en&displayLanguage=si",
    "/api/v1/articles/64f0c2f1289c0f0a12345678?displayLanguage=si",
    `/api/v1/stories/${story.id}/coverage?displayLanguage=si`,
  ]);
});

test.after(() => {
  globalThis.fetch = originalFetch;
  if (originalBaseUrl === undefined) delete process.env.API_BASE_URL;
  else process.env.API_BASE_URL = originalBaseUrl;
});

test("uses dedicated Story list, detail, and Article lookup endpoints", async () => {
  const paths: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    const path = new URL(String(input)).pathname + new URL(String(input)).search;
    paths.push(path);
    if (path.startsWith("/api/v1/stories?")) {
      return Response.json({ content: [story], page: 0, size: 20, totalElements: 1,
        totalPages: 1, first: true, last: true });
    }
    if (path === `/api/v1/stories/${story.id}`) {
      return Response.json({ ...story, articles: [] });
    }
    if (path === `/api/v1/stories/${story.id}/coverage`) {
      return Response.json({ ...story, storyId: story.id, comparisonAvailable: false,
        sharedTopics: [], sharedEntities: [], sources: [] });
    }
    if (path === `/api/v1/stories/${story.id}/timeline`) {
      return Response.json({ ...story, storyId: story.id, eventCount: 0, events: [] });
    }
    return Response.json(story);
  }) as typeof fetch;

  await getStories({ page: 0, size: 20, category: "LOCAL", sort: "lastPublishedAt,desc" });
  await getStory(story.id);
  await getStoryCoverage(story.id);
  await getStoryTimeline(story.id);
  await getArticleStory("64f0c2f1289c0f0a12345678");

  assert.deepEqual(paths, [
    "/api/v1/stories?page=0&size=20&category=LOCAL&sort=lastPublishedAt%2Cdesc",
    `/api/v1/stories/${story.id}`,
    `/api/v1/stories/${story.id}/coverage`,
    `/api/v1/stories/${story.id}/timeline`,
    "/api/v1/articles/64f0c2f1289c0f0a12345678/story",
  ]);
});
