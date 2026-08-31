import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StoryArticleReport } from "./story-article-report";
import { StoryCard } from "./story-card";

test("renders a Story card with public counts and detail link", () => {
  const html = renderToStaticMarkup(createElement(StoryCard, { story: {
    id: "64f0c2f1289c0f0a87654321",
    canonicalTitle: "A developing Sri Lankan story",
    category: "LOCAL",
    firstPublishedAt: "2026-08-30T05:00:00Z",
    lastPublishedAt: "2026-08-30T06:00:00Z",
    articleCount: 3,
    sourceCount: 2,
  } }));

  assert.match(html, /A developing Sri Lankan story/);
  assert.match(html, /href="\/story\/64f0c2f1289c0f0a87654321"/);
  assert.match(html, /3 reports/);
  assert.match(html, /2 sources/);
});

test("renders Unicode member report, summary, internal link, and publisher link", () => {
  const html = renderToStaticMarkup(createElement(StoryArticleReport, { article: {
    id: "64f0c2f1289c0f0a12345678",
    title: "සිංහල පුවත",
    originalUrl: "https://example.com/sinhala",
    originalLanguage: "si",
    authors: [],
    publishedAt: "2026-08-30T06:00:00Z",
    discoveredAt: "2026-08-30T06:05:00Z",
    category: "LOCAL",
    summary: "සිදුවීම පිළිබඳ සාරාංශය.",
    topics: [],
    source: { name: "Hiru News", slug: "hiru-news-sinhala", baseUrl: "https://example.com" },
  } }));

  assert.match(html, /සිංහල පුවත/);
  assert.match(html, /සිදුවීම පිළිබඳ සාරාංශය/);
  assert.match(html, /href="\/article\/64f0c2f1289c0f0a12345678"/);
  assert.match(html, /target="_blank"/);
  assert.doesNotMatch(html, /extractedContent|semanticEmbedding|contentHash/);
});
