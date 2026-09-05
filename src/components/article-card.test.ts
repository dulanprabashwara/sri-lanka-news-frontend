import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleCard } from "./article-card";
import type { Article } from "@/types/api";

const mockArticleWithMedia: Article = {
  id: "article-123",
  title: "Economy stabilizes in Q3 report",
  originalUrl: "https://example.com/economy-q3",
  originalLanguage: "en",
  authors: ["Reporter A"],
  publishedAt: "2026-09-01T10:00:00Z",
  discoveredAt: "2026-09-01T10:05:00Z",
  category: "BUSINESS",
  summary: "Sri Lanka's fiscal indicators show steady recovery.",
  topics: ["economy", "finance"],
  source: {
    name: "Daily FT",
    slug: "daily-ft",
    baseUrl: "https://example.com",
  },
  leadMedia: {
    url: "https://images.example.com/lead.jpg",
    type: "IMAGE",
    altText: "Market chart",
    caption: null,
    credit: null,
    width: 800,
    height: 600,
  },
};

const mockArticleWithoutMedia: Article = {
  id: "article-456",
  title: "Local election date announced",
  originalUrl: "https://example.com/election-date",
  originalLanguage: "si",
  authors: [],
  publishedAt: "2026-09-02T12:00:00Z",
  discoveredAt: "2026-09-02T12:05:00Z",
  category: "POLITICS",
  summary: "Commission confirms scheduled voting timeline.",
  topics: ["politics"],
  source: {
    name: "Ada Derana",
    slug: "ada-derana",
    baseUrl: "https://example.com",
  },
};

test("ArticleCard standard variant renders publisher identity, headline, metadata, and media", () => {
  const html = renderToStaticMarkup(
    createElement(ArticleCard, { article: mockArticleWithMedia })
  );

  // Single Report visual identity tag
  assert.match(html, /Single Report/);
  // Source name & link
  assert.match(html, /Daily FT/);
  assert.match(html, /href="\/source\/daily-ft"/);
  // Headline & detail link
  assert.match(html, /Economy stabilizes in Q3 report/);
  assert.match(html, /href="\/article\/article-123"/);
  // Summary & metadata
  assert.match(html, /Sri Lanka&#x27;s fiscal indicators show steady recovery/);
  assert.match(html, /Business/);
  assert.match(html, /English/);
  // Media present
  assert.match(html, /src="https:\/\/images.example.com\/lead.jpg"/);
  assert.match(html, /alt="Market chart"/);
});

test("ArticleCard renders cleanly without lead media", () => {
  const html = renderToStaticMarkup(
    createElement(ArticleCard, { article: mockArticleWithoutMedia })
  );

  assert.match(html, /Ada Derana/);
  assert.match(html, /Local election date announced/);
  assert.doesNotMatch(html, /<img/);
});

test("ArticleCard preserves displayLanguage parameter across source and detail links", () => {
  const html = renderToStaticMarkup(
    createElement(ArticleCard, {
      article: mockArticleWithMedia,
      displayLanguage: "si",
    })
  );

  assert.match(html, /href="\/source\/daily-ft\?lang=si"/);
  assert.match(html, /href="\/article\/article-123\?lang=si"/);
});

test("ArticleCard compact variant renders lightweight headline list item", () => {
  const html = renderToStaticMarkup(
    createElement(ArticleCard, {
      article: mockArticleWithMedia,
      variant: "compact",
      displayLanguage: "ta",
    })
  );

  assert.match(html, /Economy stabilizes in Q3 report/);
  assert.match(html, /Daily FT/);
  assert.match(html, /href="\/article\/article-123\?lang=ta"/);
  assert.doesNotMatch(html, /Single Report/); // Compact variant omits verbose eyebrow tag
});
