import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StoryTools } from "./story-tools";

const mockArticles = [
  {
    id: "art-1",
    title: "First report title",
    originalUrl: "https://example.com/art-1",
    originalLanguage: "en" as const,
    authors: [],
    publishedAt: "2026-09-01T10:00:00Z",
    discoveredAt: "2026-09-01T10:05:00Z",
    category: "LOCAL" as const,
    summary: "Summary of first report",
    topics: [],
    source: { name: "Daily FT", slug: "daily-ft", baseUrl: "https://example.com" },
  },
];

test("StoryTools renders ARIA tablist with constituent reports as initial tab", () => {
  const html = renderToStaticMarkup(
    createElement(StoryTools, {
      storyId: "story-123",
      articles: mockArticles,
      coverage: null,
      timeline: null,
      displayLanguage: "en",
    })
  );

  // Tablist & Tabs
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-label="Story Intelligence Tools"/);
  assert.match(html, /id="tab-reports"/);
  assert.match(html, /aria-controls="panel-reports"/);
  assert.match(html, /aria-selected="true"/);
  assert.match(html, /Publisher Reports/);
  assert.match(html, /Coverage Comparison/);
  assert.match(html, /Timeline/);
  assert.match(html, /Ask This Story/);

  // Active panel (reports)
  assert.match(html, /role="tabpanel"/);
  assert.match(html, /id="panel-reports"/);
  assert.match(html, /aria-labelledby="tab-reports"/);
  assert.match(html, /First report title/);
  assert.match(html, /Daily FT/);

  // Inactive panels must not render concurrently
  assert.doesNotMatch(html, /id="panel-coverage"/);
  assert.doesNotMatch(html, /id="panel-timeline"/);
  assert.doesNotMatch(html, /id="panel-ask"/);
});
