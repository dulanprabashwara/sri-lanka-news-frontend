import test from "node:test";
import assert from "node:assert/strict";
import { Notification } from "@/lib/api/notifications";

test("Notification DTO supports localizedContent and translation metadata", () => {
  const notification: Notification = {
    id: "notif-1",
    type: "STORY_ACTIVITY",
    storyId: "story-1",
    triggeringArticleId: "article-1",
    sourceId: "source-1",
    sourceSlug: "daily-mirror",
    sourceName: "Daily Mirror",
    reasons: ["FOLLOWED_TOPIC"],
    title: "Original Sinhala Title",
    message: "Original Sinhala Message",
    linkPath: "/story/story-1",
    createdAt: "2026-09-12T10:00:00Z",
    readAt: null,
    localizedContent: {
      requestedLanguage: "en",
      resolvedLanguage: "en",
      translated: true,
      fallback: false,
      title: "Translated English Title",
      summary: "Translated English Summary",
    },
  };

  assert.equal(notification.id, "notif-1");
  assert.equal(
    notification.localizedContent?.title,
    "Translated English Title",
  );
  assert.equal(
    notification.localizedContent?.summary,
    "Translated English Summary",
  );
  assert.equal(notification.localizedContent?.translated, true);
  assert.equal(notification.localizedContent?.requestedLanguage, "en");
});
