import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PureBookmarkList } from "./bookmark-list-ui";
import { PureFollowingList } from "./following-list-ui";
import { SearchResults } from "./search-results";
import type { Bookmark, Follow } from "@/types/api";

test("searchResults correctly displays empty state fallback for keyword vs semantic modes", () => {
  const keywordHtml = renderToStaticMarkup(
    createElement(SearchResults, { query: "nonexistent", articles: [], mode: "text" })
  );
  assert.match(keywordHtml, /No results found for (?:&quot;|")nonexistent(?:&quot;|")/);
  assert.match(keywordHtml, /Try different words/);

  const semanticHtml = renderToStaticMarkup(
    createElement(SearchResults, { query: "weird abstract query", articles: [], mode: "semantic", keywordHref: "/search?q=weird" })
  );
  assert.match(semanticHtml, /No semantically related reports found/);
  assert.match(semanticHtml, /Keyword Search/);
  assert.match(semanticHtml, /href="\/search\?q=weird"/);
});

test("bookmarkList renders articles/stories separately and provides R1 EmptyState when empty", () => {
  const emptyHtml = renderToStaticMarkup(
    createElement(PureBookmarkList, { initial: [], displayLanguage: "en", onUnsave: async () => {} })
  );
  assert.match(emptyHtml, /Your library is empty/);
  assert.match(emptyHtml, /href="\/\?lang=en"/);

  const mockBookmarks: Bookmark[] = [
    {
      bookmarkId: "bm1",
      targetType: "ARTICLE",
      createdAt: "2026-09-02T12:00:00Z",
      targetId: "art1",
      story: null,
      article: {
        id: "art1",
        title: "Article 1",
        originalUrl: "https://example.com",
        originalLanguage: "en",
        authors: [],
        publishedAt: "2026-09-02T12:00:00Z",
        discoveredAt: "2026-09-02T12:00:00Z",
        category: "LOCAL",
        summary: "summary",
        topics: [],
        source: { name: "Source 1", slug: "source-1", baseUrl: "https://example.com" }
      }
    }
  ];

  const html = renderToStaticMarkup(
    createElement(PureBookmarkList, { initial: mockBookmarks, displayLanguage: "en", onUnsave: async () => {} })
  );
  assert.match(html, /Article 1/);
  assert.match(html, /Remove/);
});

test("followingList renders sources and topics, uses R1 EmptyState, handles unfollow button", () => {
  const emptyHtml = renderToStaticMarkup(
    createElement(PureFollowingList, { initial: [], displayLanguage: "en", onUnsave: async () => {} })
  );
  assert.match(emptyHtml, /You(?:'|&#x27;)re not following anything yet/);

  const mockFollowing: Follow[] = [
    {
      followId: "f1",
      targetType: "SOURCE",
      createdAt: "2026-09-02T12:00:00Z",
      topic: null,
      source: { slug: "source-1", name: "Source 1", baseUrl: "https://example.com" }
    }
  ];

  const html = renderToStaticMarkup(
    createElement(PureFollowingList, { initial: mockFollowing, displayLanguage: "en", onUnsave: async () => {} })
  );
  assert.match(html, /Source 1/);
  assert.match(html, /Unfollow/);
  assert.match(html, /No new articles/);
});

test("followingList renders restrained publisher new article counts and excludes topics", () => {
  const follows: Follow[] = [
    {
      followId: "f-zero",
      targetType: "SOURCE",
      createdAt: "2026-09-02T12:00:00Z",
      topic: null,
      source: { slug: "source-a", name: "Publisher A", baseUrl: "https://a.com" },
      newArticleCount: 0,
    },
    {
      followId: "f-one",
      targetType: "SOURCE",
      createdAt: "2026-09-02T12:00:00Z",
      topic: null,
      source: { slug: "source-b", name: "Publisher B", baseUrl: "https://b.com" },
      newArticleCount: 1,
    },
    {
      followId: "f-multi",
      targetType: "SOURCE",
      createdAt: "2026-09-02T12:00:00Z",
      topic: null,
      source: { slug: "source-c", name: "Publisher C", baseUrl: "https://c.com" },
      newArticleCount: 7,
    },
    {
      followId: "f-topic",
      targetType: "TOPIC",
      createdAt: "2026-09-02T12:00:00Z",
      topic: { label: "Economy" },
      source: null,
      newArticleCount: null,
    },
  ];

  const html = renderToStaticMarkup(
    createElement(PureFollowingList, { initial: follows, displayLanguage: "en", onUnsave: async () => {} })
  );

  // Publisher count formatting
  assert.match(html, /No new articles/);
  assert.match(html, /1 new article/);
  assert.match(html, /7 new articles/);
  assert.match(html, /Mark caught up/);

  // Verify Topic card does not have article count badge
  assert.match(html, /Economy/);
  assert.equal(html.includes("new-articles-f-topic"), false);
});
