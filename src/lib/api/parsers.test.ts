import assert from "node:assert/strict";
import test from "node:test";
import {
  ApiResponseError,
  parseArticle,
  parsePagedArticles,
  parseSource,
} from "./parsers";

const source = {
  name: "Daily News",
  slug: "daily-news",
  baseUrl: "https://example.com",
};

const article = {
  id: "64f0c2f1289c0f0a12345678",
  title: "A verified headline",
  originalUrl: "https://example.com/news/verified",
  originalLanguage: "en",
  authors: ["News Desk"],
  publishedAt: "2026-08-30T06:00:00Z",
  discoveredAt: "2026-08-30T06:05:00Z",
  category: "LOCAL",
  source,
};

test("parses the Phase 3 source DTO", () => {
  assert.deepEqual(
    parseSource({ ...source, defaultLanguage: "en" }),
    { ...source, defaultLanguage: "en" },
  );
});

test("parses an article and its embedded source attribution", () => {
  assert.deepEqual(parseArticle(article), article);
});

test("parses a paged article response", () => {
  const parsed = parsePagedArticles({
    content: [article],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true,
  });
  assert.equal(parsed.content[0].source.slug, "daily-news");
  assert.equal(parsed.totalElements, 1);
});

test("rejects unsafe publisher URLs", () => {
  assert.throws(
    () => parseArticle({ ...article, originalUrl: "javascript:alert(1)" }),
    ApiResponseError,
  );
});

test("rejects responses that do not match the public DTO", () => {
  assert.throws(
    () => parseArticle({ ...article, publishedAt: "not-a-date" }),
    ApiResponseError,
  );
});
