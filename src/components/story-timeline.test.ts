import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { formatTimelineOffset, StoryTimeline } from "./story-timeline";
import type { StoryTimeline as Timeline } from "@/types/api";

test("formats deterministic human-friendly relative publication times", () => {
  assert.equal(formatTimelineOffset(0), "First available report");
  assert.equal(formatTimelineOffset(23), "23 min later");
  assert.equal(formatTimelineOffset(134), "2 hr 14 min later");
  assert.equal(formatTimelineOffset(1620), "1 day 3 hr later");
});

test("renders one report as an accessible valid timeline", () => {
  const html = renderToStaticMarkup(createElement(StoryTimeline, {
    timeline: timeline([event("article-one", "en", "2026-08-30T17:45:00Z", 0)]),
  }));
  assert.match(html, /<ol/);
  assert.match(html, /aria-label="Publisher reports in publication order"/);
  assert.match(html, /First available report/);
  assert.match(html, /href="\/article\/article-one"/);
  assert.match(html, /target="_blank"/);
  assert.doesNotMatch(html, /role="alert"/);
});

test("renders chronological multilingual reports across a date boundary", () => {
  const value = timeline([
    event("article-a", "en", "2026-08-30T17:45:00Z", 0),
    event("article-b", "si", "2026-08-30T18:08:00Z", 23),
    event("article-c", "ta", "2026-08-30T19:15:00Z", 90),
    event("article-d", "en", "2026-08-31T20:45:00Z", 1620),
  ]);
  const html = renderToStaticMarkup(createElement(StoryTimeline, { timeline: value }));

  assert.ok(html.indexOf("English report") < html.indexOf("සිංහල පුවත"));
  assert.ok(html.indexOf("සිංහල පුවත") < html.indexOf("தமிழ் செய்தி"));
  assert.match(html, /23 min later/);
  assert.match(html, /1 hr 30 min later/);
  assert.match(html, /1 day 3 hr later/);
  assert.match(html, /dateTime="2026-08-30T17:45:00Z"/);
  assert.match(html, /dateTime="2026-08-31T20:45:00Z"/);
  assert.doesNotMatch(html, /extractedContent|contentHash|semanticEmbedding|sourceId|matchingVersion/);
});

test("renders supplementary timeline failure without hiding Story information", () => {
  const html = renderToStaticMarkup(createElement(StoryTimeline, { timeline: null }));
  assert.match(html, /temporarily unavailable/);
  assert.match(html, /Other Story information remains available/);
});

function timeline(events: Timeline["events"]): Timeline {
  return {
    storyId: "story-1",
    canonicalTitle: "Story",
    firstPublishedAt: events[0].publishedAt,
    lastPublishedAt: events[events.length - 1].publishedAt,
    eventCount: events.length,
    sourceCount: new Set(events.map((item) => item.source.slug)).size,
    events,
  };
}

function event(
  articleId: string,
  language: "en" | "si" | "ta",
  publishedAt: string,
  minutesFromFirstReport: number,
): Timeline["events"][number] {
  const titles = { en: "English report", si: "සිංහල පුවත", ta: "தமிழ் செய்தி" };
  return {
    articleId,
    title: titles[language],
    summary: `Public ${language} summary`,
    originalLanguage: language,
    publishedAt,
    originalUrl: `https://example.com/${articleId}`,
    source: { name: language === "en" ? "NewsFirst" : "Hiru News", slug: `${language}-news` },
    minutesFromFirstReport,
  };
}
