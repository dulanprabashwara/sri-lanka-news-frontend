import Link from "next/link";
import { formatCategory, formatPublishedAt } from "@/lib/format";
import { storyTitle, withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage, StorySummary } from "@/types/api";

export function StoryCard({ story, displayLanguage }: { story: StorySummary; displayLanguage?: DisplayLanguage }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {story.category ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-900">
            {formatCategory(story.category)}
          </span>
        ) : null}
        <time dateTime={story.lastPublishedAt}>
          Updated {formatPublishedAt(story.lastPublishedAt)}
        </time>
      </div>
      <h2 className="mt-4 text-xl font-bold leading-snug tracking-tight text-slate-950 sm:text-2xl">
        <Link
          href={withDisplayLanguage(`/story/${encodeURIComponent(story.id)}`, displayLanguage)}
          className="rounded-sm hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
        >
          {storyTitle(story)}
        </Link>
      </h2>
      <p className="mt-4 text-sm font-medium text-slate-600">
        {story.articleCount} {story.articleCount === 1 ? "report" : "reports"}
        <span aria-hidden="true"> · </span>
        {story.sourceCount} {story.sourceCount === 1 ? "source" : "sources"}
      </p>
    </article>
  );
}
