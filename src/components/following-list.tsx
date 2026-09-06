"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { setFollowAction } from "@/app/user-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatPublishedAt } from "@/lib/format";
import { withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage, Follow } from "@/types/api";
import { PureFollowingList } from "./following-list-ui";

export function FollowingList(props: { initial: Follow[]; displayLanguage?: DisplayLanguage }) {
  // eslint-disable-next-line @typescript-eslint/require-await
  const handleUnsave = async (follow: Follow, target: string) => {
    const result = await setFollowAction({ type: follow.targetType, target, followed: true });
    return;
  };
  return <PureFollowingList {...props} onUnsave={handleUnsave} />;
}
