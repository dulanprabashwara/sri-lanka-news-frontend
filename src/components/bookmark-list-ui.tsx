"use client";

import { useState } from "react";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { StoryCard } from "@/components/story-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { withDisplayLanguage } from "@/lib/language";
import type { Bookmark, DisplayLanguage } from "@/types/api";
import { Bookmark as BookmarkIcon } from "lucide-react";

export function PureBookmarkList({ initial, displayLanguage, onUnsave }: { initial: Bookmark[]; displayLanguage?: DisplayLanguage; onUnsave: (bookmark: Bookmark) => Promise<void> }) {
  const [items, setItems] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<BookmarkIcon className="size-6 text-foreground-secondary" />}
        title="Your library is empty"
        description="Articles and Stories you save will appear here for reading later."
        primaryAction={
          <Link href={withDisplayLanguage("/", displayLanguage)} className="inline-flex items-center justify-center font-semibold rounded-lg bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm px-4 py-2 text-sm gap-2 cursor-pointer transition-all duration-150">
            Browse latest news
          </Link>
        }
        secondaryAction={
          <Link href={withDisplayLanguage("/stories", displayLanguage)} className="inline-flex items-center justify-center font-semibold rounded-lg bg-surface-muted text-foreground-secondary hover:bg-border hover:text-foreground border border-border px-4 py-2 text-sm gap-2 cursor-pointer transition-all duration-150">
            Browse stories
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-5">
      {items.map((bookmark) => (
        <div key={bookmark.bookmarkId} className="relative group">
          <div className="absolute right-4 top-4 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Button
              variant="danger"
              size="sm"
              isLoading={pendingId === bookmark.bookmarkId}
              onClick={async () => {
                setPendingId(bookmark.bookmarkId);
                await onUnsave(bookmark);
                setItems((current) => current.filter((item) => item.bookmarkId !== bookmark.bookmarkId));
                setPendingId(null);
              }}
            >
              Remove
            </Button>
          </div>
          {bookmark.article ? (
            <ArticleCard article={bookmark.article} displayLanguage={displayLanguage} />
          ) : bookmark.story ? (
            <StoryCard story={bookmark.story} displayLanguage={displayLanguage} />
          ) : (
            <div className="rounded-2xl border border-border bg-surface-muted p-5 text-sm text-foreground-secondary">
              This saved item is no longer available.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
