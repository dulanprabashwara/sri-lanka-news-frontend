import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleCard } from "./article-card";
import { CategoryNavigation } from "./category-navigation";
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
  assert.match(html, /2 publishers/);
});

test("renders Lead variant of StoryCard", () => {
  const html = renderToStaticMarkup(createElement(StoryCard, {
    story: {
      id: "64f0c2f1289c0f0a87654321",
      canonicalTitle: "Lead developing Sri Lankan story",
      category: "LOCAL",
      firstPublishedAt: "2026-08-30T05:00:00Z",
      lastPublishedAt: "2026-08-30T06:00:00Z",
      articleCount: 5,
      sourceCount: 3,
    },
    variant: "lead",
  }));

  assert.match(html, /Lead developing Sri Lankan story/);
  assert.match(html, /Most Reported Story/);
  assert.match(html, /5 reports/);
  assert.match(html, /3 publishers/);
});

test("renders only backend-provided Trending reason labels and preserves language", () => {
  const html = renderToStaticMarkup(createElement(StoryCard, {
    story: {
      id: "64f0c2f1289c0f0a87654321",
      canonicalTitle: "A developing Sri Lankan story",
      category: "LOCAL",
      firstPublishedAt: "2026-08-30T05:00:00Z",
      lastPublishedAt: "2026-08-30T06:00:00Z",
      articleCount: 3,
      sourceCount: 2,
      localizedContent: {
        requestedLanguage: "si", resolvedLanguage: "si", translated: true,
        fallback: false, title: "සිංහල කතාව",
      },
    },
    displayLanguage: "si",
    reasons: ["RECENTLY_UPDATED", "MULTIPLE_SOURCES"],
  }));

  assert.match(html, /සිංහල කතාව/);
  assert.match(html, /Recently updated/);
  assert.match(html, /Multiple publishers/);
  assert.doesNotMatch(html, /Multiple reports/);
  assert.match(html, /href="\/story\/64f0c2f1289c0f0a87654321\?lang=si"/);
  assert.doesNotMatch(html, /score|sourceIds|articleIds/);
});

test("renders ArticleCard with publisher source identity and language parameter preservation", () => {
  const html = renderToStaticMarkup(createElement(ArticleCard, {
    article: {
      id: "64f0c2f1289c0f0a12345678",
      title: "Daily Mirror Report",
      originalUrl: "https://example.com/report",
      originalLanguage: "en",
      authors: [],
      publishedAt: "2026-08-30T06:00:00Z",
      discoveredAt: "2026-08-30T06:05:00Z",
      category: "POLITICS",
      summary: "Detailed report breakdown.",
      topics: [],
      source: { name: "Daily Mirror", slug: "daily-mirror", baseUrl: "https://example.com" },
    },
    displayLanguage: "ta",
  }));

  assert.match(html, /Daily Mirror Report/);
  assert.match(html, /Daily Mirror/);
  assert.match(html, /href="\/article\/64f0c2f1289c0f0a12345678\?lang=ta"/);
  assert.match(html, /href="\/source\/daily-mirror\?lang=ta"/);
  assert.match(html, /Single Report/);
});

test("renders compact variant of ArticleCard", () => {
  const html = renderToStaticMarkup(createElement(ArticleCard, {
    article: {
      id: "64f0c2f1289c0f0a12345678",
      title: "Compact Headline",
      originalUrl: "https://example.com/report",
      originalLanguage: "en",
      authors: [],
      publishedAt: "2026-08-30T06:00:00Z",
      discoveredAt: "2026-08-30T06:05:00Z",
      category: "BUSINESS",
      summary: null,
      topics: [],
      source: { name: "Ada Derana", slug: "ada-derana", baseUrl: "https://example.com" },
    },
    variant: "compact",
  }));

  assert.match(html, /Compact Headline/);
  assert.match(html, /Ada Derana/);
  assert.match(html, /href="\/article\/64f0c2f1289c0f0a12345678"/);
});

test("renders CategoryNavigation with active category and display language preservation", () => {
  const html = renderToStaticMarkup(createElement(CategoryNavigation, {
    activeCategory: "POLITICS",
    displayLanguage: "si",
  }));

  assert.match(html, /href="\/\?category=POLITICS&amp;lang=si"/);
  assert.match(html, /aria-current="page"/);
  assert.match(html, /Politics/);
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
