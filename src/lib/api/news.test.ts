import assert from "node:assert/strict";
import test from "node:test";
import { getArticleStory, getStories, getStory } from "./news";

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
    return Response.json(story);
  }) as typeof fetch;

  await getStories({ page: 0, size: 20, category: "LOCAL", sort: "lastPublishedAt,desc" });
  await getStory(story.id);
  await getArticleStory("64f0c2f1289c0f0a12345678");

  assert.deepEqual(paths, [
    "/api/v1/stories?page=0&size=20&category=LOCAL&sort=lastPublishedAt%2Cdesc",
    `/api/v1/stories/${story.id}`,
    "/api/v1/articles/64f0c2f1289c0f0a12345678/story",
  ]);
});
