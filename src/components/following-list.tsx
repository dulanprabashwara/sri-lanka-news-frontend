"use client";

import { markSourceSeenAction, setFollowAction } from "@/app/user-actions";
import type { DisplayLanguage, Follow } from "@/types/api";
import { PureFollowingList } from "./following-list-ui";

export function FollowingList(props: { initial: Follow[]; displayLanguage?: DisplayLanguage }) {
  const handleUnsave = async (follow: Follow, target: string) => {
    await setFollowAction({ type: follow.targetType, target, followed: true });
    return;
  };
  const handleMarkSeen = async (slug: string) => {
    await markSourceSeenAction(slug);
  };
  return <PureFollowingList {...props} onUnsave={handleUnsave} onMarkSeen={handleMarkSeen} />;
}
