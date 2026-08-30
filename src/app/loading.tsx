import { FeedSkeleton } from "@/components/feed-skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
      <FeedSkeleton />
    </div>
  );
}
