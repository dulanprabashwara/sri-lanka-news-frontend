"use client";

import { useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Check, CheckCircle2, Settings } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead, Notification } from "@/lib/api/notifications";
import { withDisplayLanguage, readDisplayLanguage } from "@/lib/language";
import { useSearchParams } from "next/navigation";

export default function NotificationsPage() {
  const searchParams = useSearchParams();
  const displayLanguage = readDisplayLanguage(searchParams.get("lang"));

  const { data, mutate, isLoading } = useSWR(
    "notifications-page-0",
    () => getNotifications(0, 50)
  );

  const notifications = data?.content || [];
  const hasUnread = notifications.some((n: Notification) => !n.readAt);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    mutate();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    mutate();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Notifications</h1>
          <p className="text-slate-500 mt-1">Stay updated with your followed stories and sources.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnread && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          )}
          <Link
            href={withDisplayLanguage("/account/notifications", displayLanguage)}
            className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <Settings className="w-4 h-4" />
            Preferences
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">You're all caught up!</h3>
            <p className="text-slate-500 mt-1">No new notifications right now.</p>
          </div>
        ) : (
          notifications.map((notification: Notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
              onRead={() => handleMarkAsRead(notification.id)}
              displayLanguage={displayLanguage}
            />
          ))
        )}
      </div>
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onRead,
  displayLanguage 
}: { 
  notification: Notification; 
  onRead: () => void;
  displayLanguage: any;
}) {
  const isUnread = !notification.readAt;

  return (
    <div className={`p-4 sm:p-6 transition-colors ${isUnread ? 'bg-teal-50/30' : 'bg-white'}`}>
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {notification.sourceName}
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500">
              {new Date(notification.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h4 className="text-base font-semibold text-slate-900 mb-1 leading-tight">
            {notification.title}
          </h4>
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {notification.message}
          </p>
          <div className="flex items-center gap-3">
            <Link 
              href={withDisplayLanguage(notification.linkPath, displayLanguage)}
              onClick={isUnread ? onRead : undefined}
              className="text-sm font-medium text-teal-700 hover:text-teal-800"
            >
              Read more &rarr;
            </Link>
            {isUnread && (
              <button 
                onClick={onRead}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Mark read
              </button>
            )}
          </div>
        </div>
        {isUnread && (
          <div className="shrink-0 flex items-start justify-end">
            <div className="w-2 h-2 rounded-full bg-teal-600 mt-2"></div>
          </div>
        )}
      </div>
    </div>
  );
}
