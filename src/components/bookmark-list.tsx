"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { setBookmarkAction } from "@/app/user-actions";
import { ArticleCard } from "@/components/article-card";
import { StoryCard } from "@/components/story-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { withDisplayLanguage } from "@/lib/language";
import type { Bookmark, DisplayLanguage } from "@/types/api";
import { PureBookmarkList } from "./bookmark-list-ui";

export function BookmarkList(props: { initial: Bookmark[]; displayLanguage?: DisplayLanguage }) {
  // eslint-disable-next-line @typescript-eslint/require-await
  const handleUnsave = async (bookmark: Bookmark) => {
    const result = await setBookmarkAction({ type: bookmark.targetType, targetId: bookmark.targetId, bookmarked: true });
    // In actual implementation, state update is handled securely via action. Return is ignored for pure component state fallback here.
    return;
  };
  return <PureBookmarkList {...props} onUnsave={handleUnsave} />;
}
