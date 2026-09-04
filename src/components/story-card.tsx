import Link from "next/link";
import { formatCategory, formatPublishedAt } from "@/lib/format";
import { storyTitle, withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage, StorySummary, TrendingReason } from "@/types/api";

const reasonLabels: Record<TrendingReason, string> = {
  RECENTLY_UPDATED: "Recently updated",
  MULTIPLE_SOURCES: "Multiple publishers",
  MULTIPLE_REPORTS: "Multiple reports",
};

export function StoryCard({ story, displayLanguage, reasons }: {
  story: StorySummary;
  displayLanguage?: DisplayLanguage;
  reasons?: TrendingReason[];
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md overflow-hidden flex flex-col sm:flex-row">
      {story.representativeMedia?.type === "IMAGE" ? (
        <div className="sm:w-1/3 shrink-0 relative bg-slate-100 aspect-video sm:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.representativeMedia.url}
            alt={story.representativeMedia.altText || storyTitle(story)}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}
      <div className="p-5 sm:p-6 flex flex-col grow">
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
      <h2 className="mt-4 text-xl font-bold leading-snug tracking-tight text-slate-950 sm:text-2xl break-words">
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
      {reasons && reasons.length > 0 ? (
        <ul aria-label="Why this Story is trending" className="mt-4 flex flex-wrap gap-2">
          {reasons.map((reason) => (
            <li key={reason} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
              {reasonLabels[reason]}
            </li>
          ))}
        </ul>
        ) : null}
      </div>
    </article>
  );
}
