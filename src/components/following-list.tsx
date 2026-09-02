"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setFollowAction } from "@/app/user-actions";
import { formatPublishedAt } from "@/lib/format";
import { withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage, Follow } from "@/types/api";

export function FollowingList({ initial, displayLanguage }: { initial: Follow[]; displayLanguage?: DisplayLanguage }) {
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();
  if (items.length === 0) return <div className="state-panel" role="status">You&apos;re not following anything yet.</div>;
  return <ul className="grid gap-4">{items.map((follow) => {
    const target = follow.targetType === "SOURCE" ? follow.source?.slug : follow.topic?.label;
    return <li key={follow.followId} className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{follow.targetType === "SOURCE" ? "Source" : "Topic"}</p>{follow.source ? <Link href={withDisplayLanguage(`/source/${encodeURIComponent(follow.source.slug)}`, displayLanguage)} className="mt-1 block text-lg font-bold text-teal-800 hover:underline">{follow.source.name}</Link> : follow.topic ? <p className="mt-1 text-lg font-bold text-slate-950">{follow.topic.label}</p> : <p className="mt-1 text-slate-500">This source is no longer available.</p>}<p className="mt-2 text-xs text-slate-500">Followed {formatPublishedAt(follow.createdAt)}</p></div>{target ? <button disabled={pending} onClick={() => startTransition(async () => { const result = await setFollowAction({ type: follow.targetType, target, followed: true }); if (result.ok) setItems((current) => current.filter((item) => item.followId !== follow.followId)); })} className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-bold text-rose-700 disabled:opacity-60">Unfollow</button> : null}</li>;
  })}</ul>;
}
