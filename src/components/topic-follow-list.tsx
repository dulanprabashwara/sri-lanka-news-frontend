import { FollowButton } from "@/components/follow-button";

export function TopicFollowList({ topics, followedTopics, authenticated, path }: { topics: string[]; followedTopics: string[]; authenticated: boolean; path: string }) {
  if (topics.length === 0) return null;
  const followed = new Set(followedTopics);
  return <section aria-labelledby="article-topics" className="mt-8"><h2 id="article-topics" className="text-lg font-bold text-slate-950">Topics</h2><ul className="mt-3 flex flex-wrap gap-3">{topics.map((topic) => <li key={topic} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"><span>{topic}</span><FollowButton type="TOPIC" target={topic} initialFollowed={followed.has(topic)} authenticated={authenticated} path={path} compact /></li>)}</ul></section>;
}
