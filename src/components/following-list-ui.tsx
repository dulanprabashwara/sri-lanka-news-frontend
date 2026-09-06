"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatPublishedAt } from "@/lib/format";
import { withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage, Follow } from "@/types/api";
import { Heart } from "lucide-react";

export function PureFollowingList({ initial, displayLanguage, onUnsave }: { initial: Follow[]; displayLanguage?: DisplayLanguage; onUnsave: (follow: Follow, target: string) => Promise<void> }) {
  const [items, setItems] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="size-6 text-foreground-secondary" />}
        title="You're not following anything yet"
        description="Follow sources and topics to personalize your For You feed."
        primaryAction={
          <Link href={withDisplayLanguage("/", displayLanguage)} className="inline-flex items-center justify-center font-semibold rounded-lg bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm px-4 py-2 text-sm gap-2 cursor-pointer transition-all duration-150">
            Browse latest news
          </Link>
        }
      />
    );
  }

  return (
    <ul className="grid gap-4">
      {items.map((follow) => {
        const target = follow.targetType === "SOURCE" ? follow.source?.slug : follow.topic?.label;
        return (
          <li key={follow.followId} className="flex items-center justify-between gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand">
                {follow.targetType === "SOURCE" ? "Source" : "Topic"}
              </p>
              {follow.source ? (
                <Link href={withDisplayLanguage(`/source/${encodeURIComponent(follow.source.slug)}`, displayLanguage)} className="mt-1 block text-lg font-bold text-foreground hover:text-brand transition-colors">
                  {follow.source.name}
                </Link>
              ) : follow.topic ? (
                <p className="mt-1 text-lg font-bold text-foreground">{follow.topic.label}</p>
              ) : (
                <p className="mt-1 text-foreground-secondary">This source is no longer available.</p>
              )}
              <p className="mt-2 text-xs font-medium text-foreground-muted">
                Followed {formatPublishedAt(follow.createdAt)}
              </p>
            </div>
            {target ? (
              <Button
                variant="outline"
                size="sm"
                isLoading={pendingId === follow.followId}
                onClick={async () => {
                  setPendingId(follow.followId);
                  await onUnsave(follow, target);
                  setItems((current) => current.filter((item) => item.followId !== follow.followId));
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
