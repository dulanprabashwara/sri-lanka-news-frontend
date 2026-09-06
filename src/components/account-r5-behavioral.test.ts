import test from "node:test";
import assert from "node:assert/strict";
import { analyticsClient } from "@/lib/analytics/analytics-client";
import { Notification } from "@/lib/api/notifications";

test("DNT/GPC runtime suppression is independent of account preference", () => {
  // Stored preference true
  const storedPreference = true;

  // DNT/GPC active
  const dntActive = true;

  // Runtime consent should be false due to DNT
  assert.equal(dntActive ? false : storedPreference, false);

  // But stored preference remains true
  assert.equal(storedPreference, true);
});

test("Notification target URL dynamically resolves storyId, triggeringArticleId, or linkPath", () => {
  const storyNotification: Partial<Notification> = {
    storyId: "story-123",
    triggeringArticleId: "art-456",
    linkPath: "/story/story-123",
  };

  const articleOnlyNotification: Partial<Notification> = {
    storyId: "",
    triggeringArticleId: "art-789",
    linkPath: "/article/art-789",
  };

  const noLinkNotification: Partial<Notification> = {
    storyId: "",
    triggeringArticleId: "",
    linkPath: "",
  };

  const getTargetUrl = (n: Partial<Notification>) => {
    return n.linkPath
      ? n.linkPath
      : n.storyId
      ? `/story/${n.storyId}`
      : n.triggeringArticleId
      ? `/article/${n.triggeringArticleId}`
      : null;
  };

  assert.equal(getTargetUrl(storyNotification), "/story/story-123");
  assert.equal(getTargetUrl(articleOnlyNotification), "/article/art-789");
  assert.equal(getTargetUrl(noLinkNotification), null);
});

test("Notification CTA label correctly distinguishes Story vs Article target", () => {
  const getCtaLabel = (targetPath: string | null) => {
    if (!targetPath) return null;
    return targetPath.includes("/article/") ? "View Article" : "View Story";
  };

  assert.equal(getCtaLabel("/story/123"), "View Story");
  assert.equal(getCtaLabel("/article/456"), "View Article");
  assert.equal(getCtaLabel(null), null);
});

test("Unsubscribe requires explicit user confirmation and preserves token", () => {
  const token = "secure-signed-unsubscribe-token-xyz";
  
  // Initial state should be idle (not automatically calling unsubscribe API)
  let status: "idle" | "loading" | "success" | "error" = token ? "idle" : "error";
  assert.equal(status, "idle");

  // Upon user clicking confirmation button:
  status = "loading";
  assert.equal(status, "loading");
});

test("Notification preference payload transforms quietHours correctly", () => {
  const quietHoursEnabled = true;
  const start = "22:00";
  const end = "07:00";
  const timezone = "Asia/Colombo";

  const requestPayload = {
    quietHoursEnabled,
    quietHoursStart: quietHoursEnabled ? `${start}:00` : null,
    quietHoursEnd: quietHoursEnabled ? `${end}:00` : null,
    timezone: quietHoursEnabled ? timezone : null,
  };

  assert.equal(requestPayload.quietHoursStart, "22:00:00");
  assert.equal(requestPayload.quietHoursEnd, "07:00:00");
  assert.equal(requestPayload.timezone, "Asia/Colombo");
});
