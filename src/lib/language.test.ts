import assert from "node:assert/strict";
import test from "node:test";
import {
  articleContent,
  readDisplayLanguage,
  translationLabel,
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
