"use client";

import { setBookmarkAction } from "@/app/user-actions";
import type { Bookmark, DisplayLanguage } from "@/types/api";
import { PureBookmarkList } from "./bookmark-list-ui";

export function BookmarkList(props: { initial: Bookmark[]; displayLanguage?: DisplayLanguage }) {
  const handleUnsave = async (bookmark: Bookmark) => {
    await setBookmarkAction({ type: bookmark.targetType, targetId: bookmark.targetId, bookmarked: true });
    return;
  };
  return <PureBookmarkList {...props} onUnsave={handleUnsave} />;
}
