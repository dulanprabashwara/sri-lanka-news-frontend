import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminDashboard } from "./admin-dashboard";

test("renders operational counts, processing, sources, and retry only for failures", () => {
  const failed = { articleId: "article-1", title: "Failed report",
    source: { name: "NewsFirst", slug: "newsfirst" }, processingStatus: "FAILED" as const,
    discoveredAt: "2026-09-02T00:00:00Z", publishedAt: "2026-09-01T23:00:00Z" };
  const completed = { ...failed, articleId: "article-2", title: "Completed report",
    processingStatus: "COMPLETED" as const };
  const html = renderToStaticMarkup(createElement(AdminDashboard, {
    overview: { sources: { total: 3 }, articles: { total: 20, pending: 1,
      processing: 1, completed: 16, retrying: 0, failed: 2 }, stories: { total: 8 },
      recentFailures: [failed] },
    articles: [failed, completed],
    sources: [{ id: "source-1", name: "NewsFirst", slug: "newsfirst",
      baseUrl: "https://example.com", defaultLanguage: "en", ingestionType: "HTML",
      enabled: true, articleCount: 12, createdAt: "2026-09-01T00:00:00Z",
      updatedAt: "2026-09-01T00:00:00Z" }],
    retryAction: async () => {},
  }));

  assert.match(html, /Failed processing/);
  assert.match(html, /Failed report/);
  assert.match(html, /Completed report/);
  assert.match(html, /NewsFirst/);
  assert.equal((html.match(/>Retry</g) ?? []).length, 1);
  assert.doesNotMatch(html, /extractedContent|contentHash|embedding|API_KEY|token/);
});
