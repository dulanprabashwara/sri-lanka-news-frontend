"use client";

import { useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getUnreadCount } from "@/lib/api/notifications";

export default function NotificationBadge() {
  const { data, mutate } = useSWR(
    "unread-count",
    getUnreadCount,
    { refreshInterval: 60000 }
  );

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
      href="/notifications"
      className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
