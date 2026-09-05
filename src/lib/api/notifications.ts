import { requestJson, requestNoContent } from "./client";
import { createClient } from "@/lib/supabase/client";

async function getAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

export interface Notification {
  id: string;
  type: string;
  storyId: string;
  triggeringArticleId: string;
  sourceId: string;
  sourceSlug: string;
  sourceName: string;
  reasons: string[];
  title: string;
  message: string;
  linkPath: string;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationPage {
  content: Notification[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationPreference {
  inAppEnabled: boolean;
  email: string | null;
  emailEnabled: boolean;
  sourceFollowNotificationsEnabled: boolean;
  topicFollowNotificationsEnabled: boolean;
  storyUpdateNotificationsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  timezone: string | null;
  emailAvailable: boolean;
}

export async function getNotifications(page = 0, size = 20): Promise<NotificationPage> {
  const accessToken = await getAccessToken();
  return requestJson(`/api/v1/me/notifications?page=${page}&size=${size}`, (payload: unknown) => payload as NotificationPage, { accessToken });
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const accessToken = await getAccessToken();
  return requestJson(`/api/v1/me/notifications/unread-count`, (payload: unknown) => payload as UnreadCountResponse, { accessToken });
}

export async function markAsRead(id: string): Promise<void> {
  const accessToken = await getAccessToken();
  await requestJson(`/api/v1/me/notifications/${id}/read`, () => undefined, { method: "POST", accessToken });
}

export async function markAllAsRead(): Promise<void> {
  const accessToken = await getAccessToken();
  await requestNoContent(`/api/v1/me/notifications/read-all`, { method: "POST", accessToken });
}

export async function getPreferences(): Promise<NotificationPreference> {
  const accessToken = await getAccessToken();
  return requestJson(`/api/v1/me/notification-preferences`, (payload: unknown) => {
    const prefs = payload as NotificationPreference;
    if (prefs) {
      if (Array.isArray(prefs.quietHoursStart)) {
        prefs.quietHoursStart = formatTime(prefs.quietHoursStart, "22:00");
      }
      if (Array.isArray(prefs.quietHoursEnd)) {
        prefs.quietHoursEnd = formatTime(prefs.quietHoursEnd, "07:00");
      }
    }
    return prefs;
  }, { accessToken });
}

function formatTime(time: unknown, fallback: string): string {
  if (Array.isArray(time) && time.length >= 2) {
    const hh = String(time[0]).padStart(2, '0');
    const mm = String(time[1]).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  if (typeof time === "string" && time.length > 0) {
    return time.length === 5 ? `${time}:00` : time;
  }
  return fallback;
}

export async function updatePreferences(prefs: Partial<NotificationPreference>): Promise<NotificationPreference> {
  const accessToken = await getAccessToken();
  
  const quietHoursEnabled = prefs.quietHoursEnabled ?? false;
  
  // Build the exact shape the backend expects (NotificationPreferenceRequest)
  const requestPayload = {
    inAppEnabled: prefs.inAppEnabled ?? false,
    emailEnabled: prefs.emailEnabled ?? false,
    sourceFollowNotificationsEnabled: prefs.sourceFollowNotificationsEnabled ?? false,
    topicFollowNotificationsEnabled: prefs.topicFollowNotificationsEnabled ?? false,
    storyUpdateNotificationsEnabled: prefs.storyUpdateNotificationsEnabled ?? false,
    quietHoursEnabled,
    quietHoursStart: quietHoursEnabled ? formatTime(prefs.quietHoursStart, "22:00:00") : null,
    quietHoursEnd: quietHoursEnabled ? formatTime(prefs.quietHoursEnd, "07:00:00") : null,
    timezone: quietHoursEnabled ? (prefs.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone) : null,
  };
  return requestJson(`/api/v1/me/notification-preferences`, (payload: unknown) => payload as NotificationPreference, {
    method: "PUT",
    body: requestPayload,
    accessToken,
  });
}

export async function unsubscribe(token: string): Promise<void> {
  await requestJson(`/api/v1/notifications/unsubscribe`, () => undefined, {
    method: "POST",
    body: { token },
  });
}
