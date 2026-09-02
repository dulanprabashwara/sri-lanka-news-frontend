import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ForYouFeed } from "./for-you-feed";
import type { Article, ForYouItem } from "@/types/api";

const article: Article = {
  id: "article-1", title: "Election update", originalUrl: "https://publisher.example/news",
  originalLanguage: "en", authors: [], publishedAt: "2026-09-02T10:00:00Z",
  discoveredAt: "2026-09-02T10:01:00Z", category: "POLITICS", summary: "Summary",
  topics: ["Elections"], source: { name: "NewsFirst", slug: "newsfirst", baseUrl: "https://newsfirst.lk" },
};

test("renders explicit recommendation reasons and language-preserving article/source links", () => {
  const item: ForYouItem = { article, personalized: true, reasons: [
    { type: "FOLLOWED_SOURCE", label: "NewsFirst" },
    { type: "FOLLOWED_TOPIC", label: "Elections" },
    { type: "PREFERRED_CATEGORY", label: "POLITICS" },
  ] };
  const html = renderToStaticMarkup(createElement(ForYouFeed, { items: [item], displayLanguage: "si" }));
  assert.match(html, /Because you follow NewsFirst/);
  assert.match(html, /Topic: Elections/);
  assert.match(html, /Preferred category: Politics/);
  assert.match(html, /\/article\/article-1\?lang=si/);
  assert.match(html, /\/source\/newsfirst\?lang=si/);
  assert.doesNotMatch(html, /userId|targetKey|score/);
});

test("does not falsely label fallback content and renders a normal empty state", () => {
  const fallback = renderToStaticMarkup(createElement(ForYouFeed, { items: [{ article, personalized: false, reasons: [] }] }));
  assert.doesNotMatch(fallback, /Why this article|Because you follow|Preferred category/);
  const empty = renderToStaticMarkup(createElement(ForYouFeed, { items: [] }));
  assert.match(empty, /No articles yet/);
});
