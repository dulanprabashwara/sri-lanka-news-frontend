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
      className={`relative inline-flex items-center justify-center p-2 text-foreground-secondary hover:text-foreground hover:bg-surface-muted rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-brand ${className}`.trim()}
      aria-label={`Notifications ${count > 0 ? `(${count} unread)` : ""}`}
    >
      <Bell className="w-5 h-5 shrink-0" />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white shadow-sm">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
