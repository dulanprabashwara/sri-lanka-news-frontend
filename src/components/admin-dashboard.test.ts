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
    overview: { 
      sources: { total: 3, enabled: 3, paused: 0, failing: 0 }, 
      articles: { total: 20, pending: 1, processing: 1, completed: 16, retrying: 0, failed: 2 }, 
      stories: { total: 8, createdRecently: 2, recentActive: 3 },
      ingestion: { totalRuns: 10, completedRuns: 9, failedRuns: 1, currentlyRunning: 0, failingSources: 0 },
      users: { totalProfiles: 100, totalBookmarks: 50, totalFollows: 20 },
      recentFailures: [failed] 
    },
    retryAction: async () => {},
  }));

  assert.match(html, /Processing Failed/);
  assert.match(html, /Failed report/);
  assert.equal((html.match(/>Retry</g) ?? []).length, 1);
  assert.doesNotMatch(html, /extractedContent|contentHash|embedding|API_KEY|token/);
});
