import Link from "next/link";
import { formatCategory, formatPublishedAt } from "@/lib/format";
import { storyTitle, withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage, StorySummary, TrendingReason } from "@/types/api";
import { Layers, Newspaper, Sparkles } from "lucide-react";

const reasonLabels: Record<TrendingReason, string> = {
  RECENTLY_UPDATED: "Recently updated",
  MULTIPLE_SOURCES: "Multiple publishers",
  MULTIPLE_REPORTS: "Multiple reports",
};

export function StoryCard({
  story,
  displayLanguage,
  reasons,
  variant = "default",
}: {
  story: StorySummary;
  displayLanguage?: DisplayLanguage;
  reasons?: TrendingReason[];
  variant?: "default" | "lead";
}) {
  const title = storyTitle(story);

  if (variant === "lead") {
    return (
      <article className="group relative rounded-2xl border-2 border-brand/30 bg-surface p-6 sm:p-8 shadow-md hover:border-brand transition-all overflow-hidden">
        {/* Lead Badge Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
              <Sparkles className="size-3.5" />
              Most Reported Now
            </span>
            {story.category ? (
              <span className="rounded-md bg-surface-muted border border-border px-2.5 py-1 text-xs font-bold text-foreground-secondary">
                {formatCategory(story.category)}
              </span>
            ) : null}
          </div>
          <time dateTime={story.lastPublishedAt} className="text-xs font-semibold text-foreground-muted">
            Updated {formatPublishedAt(story.lastPublishedAt)}
          </time>
        </div>

        {/* Lead Content Body */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {story.representativeMedia?.type === "IMAGE" && story.representativeMedia?.url ? (
            <div className="relative aspect-video rounded-xl bg-surface-muted overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.representativeMedia.url}
                alt={story.representativeMedia.altText || title}
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-103"
                loading="lazy"
              />
            </div>
          ) : null}

          <div className={story.representativeMedia?.url ? "md:col-span-2 space-y-3" : "md:col-span-3 space-y-3"}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground leading-snug group-hover:text-brand transition-colors break-words">
              <Link
                href={withDisplayLanguage(`/story/${encodeURIComponent(story.id)}`, displayLanguage)}
                className="focus-visible:outline-2 focus-visible:outline-brand"
              >
                {title}
              </Link>
            </h2>

            {/* Multi-Publisher Stats Pill */}
            <div className="inline-flex items-center gap-3 rounded-lg bg-brand-soft/60 px-3 py-1.5 text-xs font-bold text-brand">
              <span className="flex items-center gap-1">
                <Newspaper className="size-3.5" />
                {story.articleCount} {story.articleCount === 1 ? "report" : "reports"}
              </span>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-1">
                <Layers className="size-3.5" />
                {story.sourceCount} {story.sourceCount === 1 ? "publisher" : "publishers"}
              </span>
            </div>

            {reasons && reasons.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {reasons.map((reason) => (
                  <span key={reason} className="rounded-full bg-surface-muted border border-border px-2.5 py-0.5 text-xs font-medium text-foreground-secondary">
                    {reasonLabels[reason]}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs font-medium text-foreground-muted">
            Compare reporting across independent newsrooms
          </span>
          <Link
            href={withDisplayLanguage(`/story/${encodeURIComponent(story.id)}`, displayLanguage)}
            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-hover transition-colors focus-visible:outline-2 focus-visible:outline-brand"
          >
            View Full Story Coverage →
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group rounded-2xl border border-border bg-surface shadow-xs transition-all hover:border-brand hover:shadow-md overflow-hidden flex flex-col justify-between">
      {story.representativeMedia?.type === "IMAGE" && story.representativeMedia?.url ? (
        <div className="relative aspect-video w-full bg-surface-muted overflow-hidden border-b border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={story.representativeMedia.url}
            alt={story.representativeMedia.altText || title}
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-102"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="p-5 flex flex-col grow justify-between">
        <div>
          {/* Header Tag */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-foreground-muted mb-2">
            <span className="inline-flex items-center gap-1 rounded bg-brand-soft/60 px-2 py-0.5 text-[11px] font-bold text-brand uppercase tracking-wider">
              <Layers className="size-3" />
              Multi-Source Story
            </span>
            <time dateTime={story.lastPublishedAt} className="text-[11px]">
              {formatPublishedAt(story.lastPublishedAt)}
            </time>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-brand transition-colors break-words">
            <Link
              href={withDisplayLanguage(`/story/${encodeURIComponent(story.id)}`, displayLanguage)}
              className="focus-visible:outline-2 focus-visible:outline-brand"
            >
              {title}
            </Link>
          </h3>

          {reasons && reasons.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {reasons.map((reason) => (
                <span key={reason} className="rounded-full bg-surface-muted border border-border px-2 py-0.5 text-[11px] font-medium text-foreground-secondary">
                  {reasonLabels[reason]}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Footer Metrics */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2 text-foreground-secondary">
            <span>{story.articleCount} reports</span>
            <span aria-hidden="true">•</span>
            <span>{story.sourceCount} publishers</span>
          </div>

          <Link
            href={withDisplayLanguage(`/story/${encodeURIComponent(story.id)}`, displayLanguage)}
            className="text-xs font-bold text-brand hover:underline"
          >
            View Story →
          </Link>
        </div>
      </div>
    </article>
  );
}
