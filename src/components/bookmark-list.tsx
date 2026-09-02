"use client";

import { useState, useTransition } from "react";
import { setBookmarkAction } from "@/app/user-actions";
import { ArticleCard } from "@/components/article-card";
import { StoryCard } from "@/components/story-card";
import type { Bookmark, DisplayLanguage } from "@/types/api";

export function BookmarkList({ initial, displayLanguage }: { initial: Bookmark[]; displayLanguage?: DisplayLanguage }) {
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();
  if (items.length === 0) return <div className="state-panel" role="status">No bookmarks yet.</div>;
  return <div className="grid gap-5">{items.map((bookmark) => <div key={bookmark.bookmarkId} className="relative"><div className="absolute right-4 top-4 z-10"><button disabled={pending} onClick={() => startTransition(async () => { const result = await setBookmarkAction({ type: bookmark.targetType, targetId: bookmark.targetId, bookmarked: true }); if (result.ok) setItems((current) => current.filter((item) => item.bookmarkId !== bookmark.bookmarkId)); })} className="rounded-md bg-white px-3 py-1 text-xs font-bold text-rose-700 shadow">Remove</button></div>{bookmark.article ? <ArticleCard article={bookmark.article} displayLanguage={displayLanguage} /> : bookmark.story ? <StoryCard story={bookmark.story} displayLanguage={displayLanguage} /> : <div className="state-panel">This saved item is no longer available.</div>}</div>)}</div>;
}
