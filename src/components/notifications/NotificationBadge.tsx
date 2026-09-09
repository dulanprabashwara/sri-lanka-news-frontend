"use client";

import { useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getUnreadCount } from "@/lib/api/notifications";
import { withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage } from "@/types/api";

export default function NotificationBadge({
  displayLanguage,
  className = "",
}: {
  displayLanguage?: DisplayLanguage;
  className?: string;
}) {
  const { data, mutate } = useSWR("unread-count", getUnreadCount, {
    refreshInterval: 60000,
  });

  useEffect(() => {
    const handleFocus = () => {
      mutate();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [mutate]);

  const count = data?.count || 0;

  return (
    <Link
      href={withDisplayLanguage("/notifications", displayLanguage)}
      className={`relative h-9 min-w-9 px-2.5 inline-flex items-center justify-center rounded-xl border border-border bg-surface hover:bg-surface-muted hover:border-border-strong text-foreground-secondary hover:text-foreground shadow-2xs transition-all focus-visible:outline-2 focus-visible:outline-brand ${className}`.trim()}
      aria-label={`Notifications ${count > 0 ? `(${count} unread)` : ""}`}
    >
      <Bell className="size-4 shrink-0 text-foreground-secondary" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white shadow-xs">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
