import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StoryArticleReport } from "./story-article-report";
import { articleContent, translationLabel, withDisplayLanguage } from "@/lib/language";
import type { Article, LocalizedContent } from "@/types/api";

const sampleArticle: Article = {
  id: "art-99",
  title: "Public Headline Title",
  summary: "This is a safe public summary of the report.",
  originalUrl: "https://publisher.lk/news/123",
  originalLanguage: "si",
  publishedAt: "2026-09-02T12:00:00Z",
  discoveredAt: "2026-09-02T12:05:00Z",
  category: "BUSINESS",
  authors: ["Author Name"],
  topics: ["Central Bank", "Economy"],
  source: { name: "Daily Mirror", slug: "daily-mirror", baseUrl: "https://publisher.lk" },
};

test("Article detail contracts: safe public fields only without extractedContent", () => {
  const content = articleContent(sampleArticle);
  assert.equal(content.title, "Public Headline Title");
  assert.equal(content.summary, "This is a safe public summary of the report.");

  const html = renderToStaticMarkup(
    createElement(StoryArticleReport, {
      article: sampleArticle,
      displayLanguage: "si",
    })
  );

  assert.match(html, /Public Headline Title/);
  assert.match(html, /Daily Mirror/);
  assert.match(html, /href="https:\/\/publisher\.lk\/news\/123"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);

  // CRITICAL COPYRIGHT BOUNDARY: Must not contain internal scraped content or raw HTML
  assert.doesNotMatch(html, /extractedContent|scrapedBody|rawHtml|promptInput/);
});

test("Language link preservation preserves display language on internal routes", () => {
  const internalLink = withDisplayLanguage("/story/story-abc", "ta");
  assert.equal(internalLink, "/story/story-abc?lang=ta");
});

test("Translation provenance clearly credits platform translation for localized fields", () => {
  const localizedContent: LocalizedContent = {
    title: "Localized Title",
    summary: "Localized Summary",
    requestedLanguage: "en",
    resolvedLanguage: "en",
    fallback: false,
    translated: true,
  };
  const label = translationLabel(localizedContent, "si");
  assert.equal(label, "Translated from Sinhala");

  const nonTranslated: LocalizedContent = {
    title: "Original Title",
    summary: "Original Summary",
    requestedLanguage: "si",
    resolvedLanguage: "si",
    fallback: false,
    translated: false,
  };
  const sameLabel = translationLabel(nonTranslated, "si");
  assert.equal(sameLabel, null);
});
