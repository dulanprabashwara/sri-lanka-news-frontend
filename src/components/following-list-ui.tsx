"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatPublishedAt } from "@/lib/format";
import { withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage, Follow } from "@/types/api";
import { Heart } from "lucide-react";

export function PureFollowingList({
  initial,
  displayLanguage,
  onUnsave,
  onMarkSeen,
}: {
  initial: Follow[];
  displayLanguage?: DisplayLanguage;
  onUnsave: (follow: Follow, target: string) => Promise<void>;
  onMarkSeen?: (slug: string) => Promise<void>;
}) {
  const [items, setItems] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleMarkSeen = async (slug: string) => {
    setItems((current) =>
      current.map((item) =>
        item.targetType === "SOURCE" && item.source?.slug === slug
          ? { ...item, newArticleCount: 0 }
          : item,
      ),
    );
    if (onMarkSeen) {
      try {
        await onMarkSeen(slug);
      } catch {
        // ignore error
      }
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="size-6 text-foreground-secondary" />}
        title="You're not following anything yet"
        description="Follow sources and topics to personalize your For You feed."
        primaryAction={
          <Link
            href={withDisplayLanguage("/", displayLanguage)}
            className="inline-flex items-center justify-center font-semibold rounded-lg bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm px-4 py-2 text-sm gap-2 cursor-pointer transition-all duration-150"
          >
            Browse latest news
          </Link>
        }
      />
    );
  }

  return (
    <ul className="grid gap-4">
      {items.map((follow) => {
        const target =
          follow.targetType === "SOURCE"
            ? follow.source?.slug
            : follow.topic?.label;
        const newCount = follow.newArticleCount ?? 0;
        return (
          <li
            key={follow.followId}
            className="flex items-center justify-between gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-brand">
                  {follow.targetType === "SOURCE" ? "Source" : "Topic"}
                </p>
                {follow.targetType === "SOURCE" && (
                  <span
                    data-testid={`new-articles-${follow.source?.slug ?? follow.followId}`}
                    className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                      newCount > 0
                        ? "bg-brand/10 text-brand font-semibold border border-brand/20"
                        : "bg-surface-secondary text-foreground-muted border border-border"
                    }`}
                  >
                    {newCount === 0
                      ? "No new articles"
                      : newCount === 1
                        ? "1 new article"
                        : `${newCount} new articles`}
                  </span>
                )}
              </div>
              {follow.source ? (
                <Link
                  href={withDisplayLanguage(
                    `/source/${encodeURIComponent(follow.source.slug)}`,
                    displayLanguage,
                  )}
                  onClick={() => {
                    if (newCount > 0 && follow.source) {
                      handleMarkSeen(follow.source.slug);
                    }
                  }}
                  className="mt-1 block text-lg font-bold text-foreground hover:text-brand transition-colors"
                >
                  {follow.source.name}
                </Link>
              ) : follow.topic ? (
                <p className="mt-1 text-lg font-bold text-foreground">
                  {follow.topic.label}
                </p>
              ) : (
                <p className="mt-1 text-foreground-secondary">
                  This source is no longer available.
                </p>
              )}
              <div className="mt-2 flex items-center gap-3">
                <p className="text-xs font-medium text-foreground-muted">
                  Followed {formatPublishedAt(follow.createdAt)}
                </p>
                {follow.targetType === "SOURCE" &&
                  newCount > 0 &&
                  follow.source && (
                    <button
                      type="button"
                      onClick={() => handleMarkSeen(follow.source!.slug)}
                      className="text-xs text-foreground-muted hover:text-foreground underline cursor-pointer"
                    >
                      Mark caught up
                    </button>
                  )}
              </div>
            </div>
            {target ? (
              <Button
                variant="outline"
                size="sm"
                isLoading={pendingId === follow.followId}
                onClick={async () => {
                  setPendingId(follow.followId);
                  await onUnsave(follow, target);
                  setItems((current) =>
                    current.filter((item) => item.followId !== follow.followId),
                  );
                  setPendingId(null);
                }}
              >
                Unfollow
              </Button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
