import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AskStoryAnswer,
  AskThisStory,
  validateAskStoryQuestion,
} from "./ask-this-story";
import type { AskStoryResponse } from "@/types/api";

test("renders the guest-accessible Ask form without chat history", () => {
  const html = renderToStaticMarkup(createElement(AskThisStory, {
    storyId: "story-1",
    displayLanguage: "ta",
  }));
  assert.match(html, /Ask This Story/);
  assert.match(html, /Answers are generated only from reports linked to this story/);
  assert.match(html, /Your question/);
  assert.match(html, /No question or answer history is saved/);
  assert.match(html, /type="submit"/);
  assert.doesNotMatch(html, /Sign in/);
  assert.doesNotMatch(html, /chat history/i);
});

test("validates normalized Unicode questions by code point", () => {
  assert.match(validateAskStoryQuestion("ab") ?? "", /at least 3/);
  assert.equal(validateAskStoryQuestion("සිදු වූයේ කුමක්ද?"), null);
  assert.equal(validateAskStoryQuestion("தமிழில் என்ன நடந்தது?"), null);
  assert.match(validateAskStoryQuestion("x".repeat(501)) ?? "", /500/);
});

test("renders grounded answer markers and trusted publisher citations", () => {
  const response: AskStoryResponse = {
    storyId: "story-1",
    answerable: true,
    answer: "Two reports describe the decision [1], with a later update [2].",
    citations: [citation(1, "NewsFirst", "Localized first title"), citation(2, "Hiru News", "සිංහල මාතෘකාව")],
  };
  const html = renderToStaticMarkup(createElement(AskStoryAnswer, { response }));
  assert.match(html, /href="#ask-citation-1"/);
  assert.match(html, /id="ask-citation-1"/);
  assert.match(html, /Sources used/);
  assert.match(html, /Localized first title/);
  assert.match(html, /සිංහල මාතෘකාව/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /similarity|model|semanticEmbedding|extractedContent|token/i);
});

test("renders insufficient evidence as a successful non-chat state", () => {
  const html = renderToStaticMarkup(createElement(AskStoryAnswer, {
    response: {
      storyId: "story-1",
      answerable: false,
      answer: "The reports do not provide enough information.",
      citations: [],
    },
  }));
  assert.match(html, /Not enough evidence/);
  assert.match(html, /role="status"/);
  assert.doesNotMatch(html, /Sources used/);
});

function citation(number: number, source: string, title: string) {
  return {
    number,
    articleId: `article-${number}`,
    title,
    source: { name: source, slug: source.toLowerCase().replaceAll(" ", "-") },
    publishedAt: "2026-08-30T08:00:00Z",
    originalUrl: `https://example.com/article-${number}`,
  };
}
