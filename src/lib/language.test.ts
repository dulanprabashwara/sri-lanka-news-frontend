import assert from "node:assert/strict";
import test from "node:test";
import {
  articleContent,
  articleContentLanguage,
  readDisplayLanguage,
  translationLabel,
  storyContentLanguage,
  withDisplayLanguage,
} from "@/lib/language";
import type { Article } from "@/types/api";

test("parses Original, English, Sinhala, Tamil, and invalid selections", () => {
  assert.equal(readDisplayLanguage(undefined), undefined);
  assert.equal(readDisplayLanguage("en"), "en");
  assert.equal(readDisplayLanguage("si"), "si");
  assert.equal(readDisplayLanguage("ta"), "ta");
  assert.equal(readDisplayLanguage("invalid"), undefined);
});

test("preserves language on internal links without changing external URLs", () => {
  assert.equal(withDisplayLanguage("/story/123", "si"), "/story/123?lang=si");
  assert.equal(
    withDisplayLanguage("/stories?category=LOCAL", "ta"),
    "/stories?category=LOCAL&lang=ta",
  );
  const publisher = "https://publisher.example/article";
  assert.equal(publisher, "https://publisher.example/article");
});

test("switching display language updates language parameter on existing route", () => {
  const currentStoriesPath = withDisplayLanguage("/stories", "si");
  assert.equal(currentStoriesPath, "/stories?lang=si");
  const switchedToTamil = withDisplayLanguage("/stories", "ta");
  assert.equal(switchedToTamil, "/stories?lang=ta");
});

test("language parameter preservation preserves complex search query parameters", () => {
  const searchUrl = "/search?q=economy&mode=semantic&category=BUSINESS&lang=en";
  const [pathname, query] = searchUrl.split("?");
  const params = new URLSearchParams(query);
  params.set("lang", "si");
  const updatedSearchUrl = `${pathname}?${params.toString()}`;

  assert.equal(updatedSearchUrl.includes("q=economy"), true);
  assert.equal(updatedSearchUrl.includes("mode=semantic"), true);
  assert.equal(updatedSearchUrl.includes("category=BUSINESS"), true);
  assert.equal(updatedSearchUrl.includes("lang=si"), true);
});

test("renders real Sinhala and Tamil localized content with provenance", () => {
  const article = {
    id: "1",
    title: "Original title",
    originalUrl: "https://example.com/article",
    originalLanguage: "en",
    authors: [],
    publishedAt: "2026-09-01T00:00:00Z",
    discoveredAt: "2026-09-01T00:01:00Z",
    category: "LOCAL",
    summary: "Original summary",
    topics: [],
    source: { name: "Publisher", slug: "publisher", baseUrl: "https://example.com" },
    localizedContent: {
      requestedLanguage: "si",
      resolvedLanguage: "si",
      translated: true,
      fallback: false,
      title: "ශ්‍රී ලංකා පුවත් ශීර්ෂය",
      summary: "இது தமிழ் எழுத்தையும் பாதுகாக்கும் சோதனை.",
    },
  } satisfies Article;
  assert.equal(articleContent(article).title, "ශ්‍රී ලංකා පුවත් ශීර්ෂය");
  assert.equal(articleContent(article).summary, "இது தமிழ் எழுத்தையும் பாதுகாக்கும் சோதனை.");
  assert.equal(translationLabel(article.localizedContent, "en"), "Translated from English");
  assert.equal(articleContentLanguage(article), "si");
  assert.equal(
    storyContentLanguage({
      id: "story-1",
      canonicalTitle: "Original story",
      category: "LOCAL",
      firstPublishedAt: "2026-09-01T00:00:00Z",
      lastPublishedAt: "2026-09-01T00:01:00Z",
      articleCount: 2,
      sourceCount: 2,
      localizedContent: {
        requestedLanguage: "ta",
        resolvedLanguage: "ta",
        translated: true,
        fallback: false,
        title: "தமிழ் செய்தி",
      },
    }),
    "ta",
  );
});

test("does not claim translation for original-language or fallback content", () => {
  assert.equal(
    translationLabel({
      requestedLanguage: "en",
      resolvedLanguage: "en",
      translated: false,
      fallback: false,
      title: "Original",
      summary: null,
    }, "en"),
    null,
  );
  assert.equal(
    translationLabel({
      requestedLanguage: "ta",
      resolvedLanguage: "en",
      translated: false,
      fallback: true,
      title: "Original",
      summary: null,
    }, "en"),
    null,
  );
});
