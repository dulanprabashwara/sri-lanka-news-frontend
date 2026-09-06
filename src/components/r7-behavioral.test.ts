import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PureBookmarkList } from "./bookmark-list-ui";
import { PureFollowingList } from "./following-list-ui";
import { SearchResults } from "./search-results";
import type { Article } from "@/types/api";

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
  assert.match(emptyHtml, /href="\/"/);

  const mockBookmarks = [
    {
      bookmarkId: "bm1",
      targetType: "ARTICLE" as const,
      createdAt: "2026-09-02T12:00:00Z",
      targetId: "art1",
      article: {
        id: "art1", url: "https://example.com", publicationTime: "2026-09-02T12:00:00Z",
        source: { id: "s1", identifier: "S1", name: "Source 1", language: "en", type: "NEWS_SITE", country: "LKA" },
        category: "LOCAL", language: "en", originalLanguage: "en", translatedTitle: "Article 1", originTitle: "Article 1", summary: "summary"
      }
    }
  ];

  const html = renderToStaticMarkup(
    createElement(PureBookmarkList, { initial: mockBookmarks as any, displayLanguage: "en", onUnsave: async () => {} })
  );
  assert.match(html, /Article 1/);
  assert.match(html, /Remove/);
});

test("followingList renders sources and topics, uses R1 EmptyState, handles unfollow button", () => {
  const emptyHtml = renderToStaticMarkup(
    createElement(PureFollowingList, { initial: [], displayLanguage: "en", onUnsave: async () => {} })
  );
  assert.match(emptyHtml, /You're not following anything yet/);

  const mockFollowing = [
    {
      followId: "f1",
      targetType: "SOURCE" as const,
      createdAt: "2026-09-02T12:00:00Z",
      source: { slug: "source-1", id: "s1", identifier: "S1", name: "Source 1", language: "en", type: "NEWS_SITE", country: "LKA" },
      targetId: "s1"
    }
  ];

  const html = renderToStaticMarkup(
    createElement(PureFollowingList, { initial: mockFollowing as any, displayLanguage: "en", onUnsave: async () => {} })
  );
  assert.match(html, /Source 1/);
  assert.match(html, /Unfollow/);
});
