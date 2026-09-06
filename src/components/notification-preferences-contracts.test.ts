import test from "node:test";
import assert from "node:assert/strict";
import { NotificationPreference } from "@/lib/api/notifications";

test("NotificationPreference DTO defines only supported backend fields", () => {
  const samplePrefs: NotificationPreference = {
    inAppEnabled: true,
    email: "user@example.com",
    emailEnabled: true,
    sourceFollowNotificationsEnabled: true,
    topicFollowNotificationsEnabled: false,
    storyUpdateNotificationsEnabled: true,
    quietHoursEnabled: true,
    quietHoursStart: "22:00",
    quietHoursEnd: "07:00",
    timezone: "Asia/Colombo",
    emailAvailable: true,
  };

  assert.equal(samplePrefs.inAppEnabled, true);
  assert.equal(samplePrefs.emailEnabled, true);
  assert.equal(samplePrefs.sourceFollowNotificationsEnabled, true);
  assert.equal(samplePrefs.quietHoursStart, "22:00");
  assert.equal(samplePrefs.timezone, "Asia/Colombo");

  // Prove absence of unsupported conceptual features
  const keys = Object.keys(samplePrefs);
  assert.equal(keys.includes("breakingNewsEnabled"), false);
  assert.equal(keys.includes("dailyDigestEnabled"), false);
  assert.equal(keys.includes("weeklyDigestEnabled"), false);
  assert.equal(keys.includes("browserPushEnabled"), false);
  assert.equal(keys.includes("smsEnabled"), false);
});
