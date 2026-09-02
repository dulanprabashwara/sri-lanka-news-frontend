"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setFollowAction } from "@/app/user-actions";
import type { FollowTargetType } from "@/types/api";

export function FollowButton({ type, target, initialFollowed, authenticated, path, compact = false }: { type: FollowTargetType; target: string; initialFollowed: boolean; authenticated: boolean; path: string; compact?: boolean }) {
  const [followed, setFollowed] = useState(initialFollowed);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const classes = compact ? "rounded-md border border-teal-700 px-2 py-1 text-xs font-bold text-teal-800" : "rounded-lg border border-teal-700 px-4 py-2 text-sm font-bold text-teal-800";
  if (!authenticated) return <Link href={`/auth/login?next=${encodeURIComponent(path)}`} className={classes}>Sign in to follow</Link>;
  return <span className="inline-flex items-center gap-2"><button type="button" aria-pressed={followed} disabled={pending} onClick={() => startTransition(async () => { const result = await setFollowAction({ type, target, followed }); if (result.ok) { setFollowed(result.followed); setMessage(result.followed ? "Following." : "Unfollowed."); } else setMessage(result.message); })} className={`${classes} disabled:opacity-60`}>{pending ? "Updating…" : followed ? "Following" : "Follow"}</button>{message ? <span className="sr-only" role="status">{message}</span> : null}</span>;
}
