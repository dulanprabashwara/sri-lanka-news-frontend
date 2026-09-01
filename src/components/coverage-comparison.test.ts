import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CoverageComparison } from "./coverage-comparison";
import type { CoverageComparison as Coverage, SourceCoverage } from "@/types/api";

const source: SourceCoverage = {
  source: { name: "NewsFirst", slug: "newsfirst" },
  reportCount: 2,
  languages: ["en", "si"],
  firstPublishedAt: "2026-08-30T08:00:00Z",
  lastPublishedAt: "2026-08-30T10:00:00Z",
  articles: [{
    id: "64f0c2f1289c0f0a12345678",
    title: "සිංහල සහ English report",
    summary: "A public summary.",
    originalLanguage: "si" as const,
    publishedAt: "2026-08-30T08:00:00Z",
    originalUrl: "https://example.com/report",
  }],
  topics: ["Transport", "Colombo"],
  uniqueTopics: ["Colombo"],
  entities: [{ name: "Colombo", type: "LOCATION" }],
  uniqueEntities: [{ name: "NewsFirst", type: "ORGANIZATION" }],
};

test("renders neutral multi-source shared and source-specific coverage", () => {
  const coverage: Coverage = {
    storyId: "story-1", canonicalTitle: "Story", articleCount: 3,
    sourceCount: 2, comparisonAvailable: true,
    sharedTopics: ["Transport"],
    sharedEntities: [{ name: "Colombo", type: "LOCATION" }],
    sources: [source, { ...source, source: { name: "Hiru News", slug: "hiru-news-sinhala" },
      reportCount: 1, languages: ["ta"] }],
  };
  const html = renderToStaticMarkup(createElement(CoverageComparison, { coverage }));

  assert.match(html, /Coverage Comparison/);
  assert.match(html, /Shared topics/);
  assert.match(html, /Source-specific topics/);
  assert.match(html, /Shared entities/);
  assert.match(html, /Source-specific entities/);
  assert.match(html, /සිංහල සහ English report/);
  assert.match(html, /href="\/article\/64f0c2f1289c0f0a12345678"/);
  assert.match(html, /target="_blank"/);
  assert.doesNotMatch(html, /bias|accuracy score|extractedContent|semanticEmbedding|contentHash/);
});

test("renders single-source comparison as a non-error waiting state", () => {
  const coverage: Coverage = {
    storyId: "story-1", canonicalTitle: "Story", articleCount: 2,
    sourceCount: 1, comparisonAvailable: false,
    sharedTopics: [], sharedEntities: [], sources: [source],
  };
  const html = renderToStaticMarkup(createElement(CoverageComparison, { coverage }));
  assert.match(html, /reports from multiple publishers/);
  assert.match(html, /NewsFirst/);
  assert.doesNotMatch(html, /role="alert"/);
});

test("renders supplementary failure without hiding Story content", () => {
  const html = renderToStaticMarkup(createElement(CoverageComparison, { coverage: null }));
  assert.match(html, /temporarily unavailable/);
  assert.match(html, /Story reports above are still available/);
});
