import assert from "node:assert/strict";
import test from "node:test";
import {
  ApiResponseError,
  parseCoverageComparison,
  parseArticle,
  parsePagedArticles,
  parsePagedStories,
  parseSource,
  parseStoryDetail,
  parseStorySummary,
  parseStoryTimeline,
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
  summary: "A concise public summary.",
  topics: ["Sri Lanka"],
  source,
};

const story = {
  id: "64f0c2f1289c0f0a87654321",
  canonicalTitle: "A developing Sri Lankan story",
  category: "LOCAL",
  firstPublishedAt: "2026-08-30T05:00:00Z",
  lastPublishedAt: "2026-08-30T06:00:00Z",
  articleCount: 3,
  sourceCount: 2,
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

test("parses public Story summary, page, and mixed-language detail contracts", () => {
  assert.deepEqual(parseStorySummary(story), story);
  const page = parsePagedStories({
    content: [story], page: 0, size: 20, totalElements: 1,
    totalPages: 1, first: true, last: true,
  });
  assert.equal(page.content[0].sourceCount, 2);

  const detail = parseStoryDetail({
    ...story,
    articles: [article, { ...article, id: "si", originalLanguage: "si", title: "සිංහල පුවත" },
      { ...article, id: "ta", originalLanguage: "ta", title: "தமிழ் செய்தி" }],
    articleIds: ["private"],
    matchingVersion: "hybrid-v1",
    semanticEmbedding: [0.1, 0.2],
  });
  assert.deepEqual(detail.articles.map((item) => item.originalLanguage), ["en", "si", "ta"]);
  assert.equal("articleIds" in detail, false);
  assert.equal("matchingVersion" in detail, false);
  assert.equal("semanticEmbedding" in detail, false);
});

test("rejects malformed Story dates and member Articles", () => {
  assert.throws(() => parseStorySummary({ ...story, lastPublishedAt: "invalid" }), ApiResponseError);
  assert.throws(() => parseStoryDetail({ ...story, articles: "private IDs" }), ApiResponseError);
});

test("parses safe single-source and multi-source coverage contracts", () => {
  const single = parseCoverageComparison({
    storyId: story.id,
    canonicalTitle: story.canonicalTitle,
    articleCount: 1,
    sourceCount: 1,
    comparisonAvailable: false,
    sharedTopics: [],
    sharedEntities: [],
    sources: [{
      source: { name: "Daily News", slug: "daily-news" },
      reportCount: 1,
      languages: ["en"],
      firstPublishedAt: article.publishedAt,
      lastPublishedAt: article.publishedAt,
      articles: [{
        id: article.id,
        title: article.title,
        summary: article.summary,
        originalLanguage: article.originalLanguage,
        publishedAt: article.publishedAt,
        originalUrl: article.originalUrl,
        extractedContent: "must be ignored",
      }],
      topics: ["Transport"],
      uniqueTopics: ["Transport"],
      entities: [{ name: "Colombo", type: "LOCATION" }],
      uniqueEntities: [{ name: "Colombo", type: "LOCATION" }],
    }],
    matchingVersion: "hybrid-v1",
    semanticEmbedding: [0.1],
  });
  assert.equal(single.comparisonAvailable, false);
  assert.equal(single.sources[0].articles[0].summary, article.summary);
  assert.equal("matchingVersion" in single, false);
  assert.equal("semanticEmbedding" in single, false);
  assert.equal("extractedContent" in single.sources[0].articles[0], false);

  const multi = parseCoverageComparison({
    ...single,
    sourceCount: 2,
    comparisonAvailable: true,
    sharedTopics: ["Transport"],
    sharedEntities: [{ name: "Colombo", type: "LOCATION" }],
    sources: [single.sources[0], {
      ...single.sources[0],
      source: { name: "සිංහල පුවත්", slug: "sinhala-news" },
      languages: ["si", "ta"],
    }],
  });
  assert.equal(multi.comparisonAvailable, true);
  assert.deepEqual(multi.sources[1].languages, ["si", "ta"]);
});

test("rejects malformed coverage metadata", () => {
  assert.throws(() => parseCoverageComparison({ storyId: story.id }), ApiResponseError);
});

test("parses a safe multilingual Story timeline and ignores private fields", () => {
  const timeline = parseStoryTimeline({
    storyId: story.id,
    canonicalTitle: story.canonicalTitle,
    firstPublishedAt: "2026-08-30T18:00:00Z",
    lastPublishedAt: "2026-08-30T19:30:00Z",
    eventCount: 3,
    sourceCount: 2,
    events: [
      timelineEvent("en", "English report", 0),
      timelineEvent("si", "සිංහල පුවත", 23),
      timelineEvent("ta", "தமிழ் செய்தி", 90),
    ],
    articleIds: ["private"],
    matchingVersion: "hybrid-v1",
  });
  assert.deepEqual(timeline.events.map((event) => event.originalLanguage), ["en", "si", "ta"]);
  assert.deepEqual(timeline.events.map((event) => event.minutesFromFirstReport), [0, 23, 90]);
  assert.equal("articleIds" in timeline, false);
  assert.equal("matchingVersion" in timeline, false);
  assert.equal("sourceId" in timeline.events[0], false);
  assert.equal("extractedContent" in timeline.events[0], false);
});

test("rejects malformed Story timeline events", () => {
  assert.throws(() => parseStoryTimeline({ storyId: story.id, events: "private" }), ApiResponseError);
});

function timelineEvent(language: "en" | "si" | "ta", title: string, minutes: number) {
  return {
    articleId: `${language}-article`,
    title,
    summary: "Public summary",
    originalLanguage: language,
    publishedAt: "2026-08-30T18:00:00Z",
    originalUrl: `https://example.com/${language}`,
    source: { name: `${language} publisher`, slug: `${language}-publisher` },
    minutesFromFirstReport: minutes,
    contentHash: "private",
    semanticEmbedding: [0.1],
  };
}

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
