"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  CheckCircle2,
  Settings,
  Bell,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  Notification,
} from "@/lib/api/notifications";
import { withDisplayLanguage, readDisplayLanguage } from "@/lib/language";
import { Language } from "@/types/api";

export default function NotificationsPage() {
  const searchParams = useSearchParams();
  const displayLanguage = readDisplayLanguage(searchParams.get("lang"));
  const { mutate: globalMutate } = useSWRConfig();

  const [markingAll, setMarkingAll] = useState(false);
  const [readingIds, setReadingIds] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, mutate, isLoading, error } = useSWR(
    "notifications-page-0",
    () => getNotifications(0, 50),
    ["notifications-page-0", displayLanguage],
    () => getNotifications(0, 50, displayLanguage),
  );

  const notifications = data?.content || [];
  const hasUnread = notifications.some((n: Notification) => !n.readAt);

  const handleMarkAsRead = async (id: string) => {
    if (readingIds[id]) return;
    setReadingIds((prev) => ({ ...prev, [id]: true }));
    setActionError(null);
    try {
      await markAsRead(id);
      await Promise.all([mutate(), globalMutate("unread-count")]);
    } catch (err) {
      console.error(err);
      setActionError("Failed to mark notification as read.");
    } finally {
      setReadingIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll || !hasUnread) return;
    setMarkingAll(true);
    setActionError(null);
    try {
      await markAllAsRead();
      await Promise.all([mutate(), globalMutate("unread-count")]);
    } catch (err) {
      console.error(err);
      setActionError("Failed to mark all notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <section className="w-full space-y-6">
      <PageHeader
        eyebrow="MY NEWS"
        title="Notifications"
        description="Updates from sources and topics you follow."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {hasUnread && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markingAll}
                className="gap-2 text-xs"
              >
                {markingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand" />
                ) : (
                  <Check className="w-4 h-4 text-brand" />
                )}
                {markingAll ? "Marking..." : "Mark all read"}
              </Button>
            )}
            <Link
              href={withDisplayLanguage(
                "/account/notifications",
                displayLanguage,
              )}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors shadow-2xs"
            >
              <Settings className="w-4 h-4 text-foreground-secondary" />
              Notification Preferences
            </Link>
          </div>
        }
      />

      {actionError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
          {actionError}
        </div>
      )}

      <Surface
        variant="elevated"
        className="w-full divide-y divide-border overflow-hidden p-0"
      >
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-foreground-secondary">
            <p className="text-sm font-semibold">
              Unable to load notifications at this time.
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 sm:p-12">
            <EmptyState
              icon={<CheckCircle2 className="w-6 h-6 text-brand" />}
              title="You're all caught up!"
              description="There are no unread notifications for your followed sources or topics."
              primaryAction={
                <Link
                  href={withDisplayLanguage(
                    "/account/notifications",
                    displayLanguage,
                  )}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover transition-colors"
                >
                  Manage Preferences
                </Link>
              }
            />
          </div>
        ) : (
          notifications.map((notification: Notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isMarkingRead={!!readingIds[notification.id]}
              onRead={() => handleMarkAsRead(notification.id)}
              displayLanguage={displayLanguage}
            />
          ))
        )}
      </Surface>
    </section>
  );
}

function NotificationItem({
  notification,
  isMarkingRead,
  onRead,
  displayLanguage,
}: {
  notification: Notification;
  isMarkingRead: boolean;
  onRead: () => void;
  displayLanguage: Language | undefined;
}) {
  const isUnread = !notification.readAt;

  // Determine target path dynamically from metadata
  const targetPath = notification.linkPath
    ? notification.linkPath
    : notification.storyId
      ? `/story/${notification.storyId}`
      : notification.triggeringArticleId
        ? `/article/${notification.triggeringArticleId}`
        : null;

  const ctaLabel = targetPath?.includes("/article/")
    ? "View Article"
    : "View Story";

  const displayTitle = notification.localizedContent?.title || notification.title;
  const displayMessage = notification.localizedContent?.summary || notification.message;

  return (
    <div
      className={`p-5 sm:p-6 transition-colors ${isUnread ? "bg-brand-soft/30" : "bg-surface"}`}
    >
      <div className="flex gap-4 sm:gap-6 items-start justify-between">
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              {notification.sourceName || "News Intelligence"}
            </span>
            {notification.localizedContent?.translated && (
              <>
                <span className="text-border">&bull;</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-brand/10 text-brand">
                  Translated
                </span>
              </>
            )}
            <span className="text-border">&bull;</span>
            <span className="text-xs text-foreground-secondary">
              {new Date(notification.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h4 className="text-base sm:text-lg font-bold text-foreground leading-snug">
            {targetPath ? (
              <Link
                href={withDisplayLanguage(targetPath, displayLanguage)}
                onClick={isUnread ? onRead : undefined}
                className="hover:text-brand transition-colors"
              >
                {notification.title}
                {displayTitle}
              </Link>
            ) : (
              notification.title
              displayTitle
            )}
          </h4>

          <p className="text-sm text-foreground-secondary line-clamp-2 leading-relaxed">
            {notification.message}
            {displayMessage}
          </p>

          <div className="flex items-center gap-4 pt-2">
            {targetPath && (
              <Link
                href={withDisplayLanguage(targetPath, displayLanguage)}
                onClick={isUnread ? onRead : undefined}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
            {isUnread && (
              <button
                onClick={onRead}
                disabled={isMarkingRead}
                className="text-xs font-medium text-foreground-secondary hover:text-foreground transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {isMarkingRead ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Marking...</span>
                  </>
                ) : (
                  <span>Mark read</span>
                )}
              </button>
            )}
          </div>
        </div>

        {isUnread && (
          <div className="shrink-0 flex items-start pt-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full bg-brand ring-4 ring-brand-soft"
              aria-label="Unread notification"
            />
          </div>
        )}
      </div>
    </div>
  );
}
