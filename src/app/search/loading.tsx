import { FeedSkeleton } from "@/components/feed-skeleton";

export default function SearchLoading() {
  return <section><p className="eyebrow">Public news search</p><h1 className="page-title">Search</h1><div className="mt-8"><FeedSkeleton /></div></section>;
}
