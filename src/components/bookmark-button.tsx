"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setBookmarkAction } from "@/app/user-actions";
import type { BookmarkTargetType } from "@/types/api";

export function BookmarkButton({ type, targetId, initialBookmarked, authenticated, path }: { type: BookmarkTargetType; targetId: string; initialBookmarked: boolean; authenticated: boolean; path: string }) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  if (!authenticated) return <Link href={`/auth/login?next=${encodeURIComponent(path)}`} className="inline-flex rounded-lg border border-brand px-4 py-2 text-sm font-bold text-brand">Sign in to save</Link>;
  return <div className="flex items-center gap-3"><button type="button" disabled={pending} aria-pressed={bookmarked} onClick={() => startTransition(async () => { const result = await setBookmarkAction({ type, targetId, bookmarked }); if (result.ok) { setBookmarked(result.bookmarked); setMessage(result.bookmarked ? "Saved." : "Removed."); } else setMessage(result.message); })} className="rounded-lg border border-brand px-4 py-2 text-sm font-bold text-brand disabled:opacity-60">{pending ? "Updating…" : bookmarked ? "Saved" : "Save"}</button>{message ? <span role="status" className="text-sm text-slate-600">{message}</span> : null}</div>;
}
