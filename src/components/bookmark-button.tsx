"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setBookmarkAction } from "@/app/user-actions";
import { toast } from "@/components/ui/toast";
import type { BookmarkTargetType } from "@/types/api";
import { Bookmark, BookmarkCheck } from "lucide-react";

export function BookmarkButton({
  type,
  targetId,
  initialBookmarked,
  authenticated,
  path,
}: {
  type: BookmarkTargetType;
  targetId: string;
  initialBookmarked: boolean;
  authenticated: boolean;
  path: string;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, startTransition] = useTransition();

  if (!authenticated) {
    return (
      <Link
        href={`/auth/login?next=${encodeURIComponent(path)}`}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-foreground-secondary hover:border-brand hover:text-brand transition-colors"
      >
        <Bookmark className="size-4" />
        <span>Sign in to save</span>
      </Link>
    );
  }

  const handleToggle = () => {
    startTransition(async () => {
      const result = await setBookmarkAction({ type, targetId, bookmarked });
      if (result.ok) {
        setBookmarked(result.bookmarked);
        if (result.bookmarked) {
          toast.success(
            type === "ARTICLE"
              ? "Article saved to bookmarks"
              : "Story saved to bookmarks",
          );
        } else {
          toast.info(
            type === "ARTICLE"
              ? "Article removed from bookmarks"
              : "Story removed from bookmarks",
          );
        }
      } else {
        toast.error(result.message || "Unable to update bookmark");
      }
    });
  };

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={bookmarked}
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 ${
        bookmarked
          ? "border border-brand bg-brand-soft/40 text-brand hover:bg-brand-soft/70"
          : "border border-border bg-surface text-foreground-secondary hover:border-brand hover:text-brand"
      }`}
    >
      {pending ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0"
        />
      ) : bookmarked ? (
        <BookmarkCheck className="size-4 text-brand shrink-0" />
      ) : (
        <Bookmark className="size-4 shrink-0" />
      )}
      <span>
        {pending
          ? bookmarked
            ? "Removing…"
            : "Saving…"
          : bookmarked
            ? "Saved"
            : "Save"}
      </span>
    </button>
  );
}
