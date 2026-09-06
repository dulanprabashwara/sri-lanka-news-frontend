import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchResults } from "./search-results";
import type { Article } from "@/types/api";

const article: Article = {
  id: "article-si", title: "මැතිවරණ ප්‍රවෘත්ති", originalUrl: "https://publisher.example/report",
  originalLanguage: "si", authors: [], publishedAt: "2026-09-02T10:00:00Z",
  discoveredAt: "2026-09-02T10:01:00Z", category: "POLITICS", summary: "සාරාංශය",
  topics: ["මැතිවරණ"], source: { name: "Hiru News", slug: "hiru-news-sinhala", baseUrl: "https://publisher.example" },
  localizedContent: { requestedLanguage: "ta", resolvedLanguage: "ta", translated: true,
    fallback: false, title: "தேர்தல் செய்திகள்", summary: "தமிழ் சுருக்கம்" },
};

test("renders multilingual localized results and preserves display language on internal links", () => {
  const html = renderToStaticMarkup(createElement(SearchResults, { query: "தேர்தல்", articles: [article], displayLanguage: "ta" }));
  assert.match(html, /தேர்தல் செய்திகள்/);
  assert.match(html, /Platform translation/);
  assert.match(html, /\/article\/article-si\?lang=ta/);
  assert.match(html, /\/source\/hiru-news-sinhala\?lang=ta/);
  assert.doesNotMatch(html, /textScore|extractedContent|semanticEmbedding/);
});

test("renders useful Unicode empty-search guidance", () => {
  const html = renderToStaticMarkup(createElement(SearchResults, { query: "ක්‍රිකට්", articles: [], displayLanguage: "si" }));
  assert.match(html, /No results found for/);
  assert.match(html, /ක්‍රිකට්/);
  assert.match(html, /\/\?lang=si/);
});

test("renders semantic empty guidance and keyword fallback without a score", () => {
  const html = renderToStaticMarkup(createElement(SearchResults, {
    query: "road accident", articles: [], displayLanguage: "en", mode: "semantic",
    keywordHref: "/search?q=road+accident&mode=text&category=LOCAL&language=si&lang=en",
  }));
  assert.match(html, /No semantically related reports found/);
  assert.match(html, /Keyword Search/i);
  assert.match(html, /mode=text/);
  assert.doesNotMatch(html, /similarity|confidence|0\.\d+/i);
});

test("semantic results reuse localized Article cards without exposing similarity", () => {
  const html = renderToStaticMarkup(createElement(SearchResults, {
    query: "election", articles: [article], displayLanguage: "ta", mode: "semantic",
  }));
  assert.match(html, /தேர்தல் செய்திகள்/);
  assert.match(html, /\/article\/article-si\?lang=ta/);
  assert.doesNotMatch(html, /similarity|confidence|semanticEmbedding|vectorSearchScore/i);
});
