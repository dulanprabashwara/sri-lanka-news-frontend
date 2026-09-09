import Link from "next/link";
import { PublisherImage } from "@/components/ui/publisher-image";
import { formatCategory, formatPublishedAt } from "@/lib/format";
import { storyContentLanguage, storyTitle, withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage, StorySummary, TrendingReason } from "@/types/api";
import { Layers, Newspaper, Sparkles } from "lucide-react";
import { isPublisherPlaceholder } from "@/components/ui/publisher-image-utils";

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
  const contentLanguage = storyContentLanguage(story);
  const storyUrl = withDisplayLanguage(`/story/${encodeURIComponent(story.id)}`, displayLanguage);
  const hasImage =
    story.representativeMedia?.type === "IMAGE" && Boolean(story.representativeMedia?.url) && !isPublisherPlaceholder(story.representativeMedia.url);

  if (variant === "lead") {
    return (
      <article className="group relative overflow-hidden rounded-xl border border-border border-t-4 border-t-brand bg-surface p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-8">
        {/* Lead Badge Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
              <Sparkles className="size-3.5" />
              Most Reported Story
            </span>
            {story.category ? (
              <span className="rounded-md bg-surface-muted border border-border px-2.5 py-1 text-xs font-semibold text-foreground-secondary">
                {formatCategory(story.category)}
              </span>
            ) : null}
          </div>
          <time dateTime={story.lastPublishedAt} className="text-xs font-semibold text-foreground-muted">
            Updated {formatPublishedAt(story.lastPublishedAt)}
          </time>
        </div>

        {/* Lead Content Body */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {hasImage ? (
            <div className="md:col-span-5 w-full">
              <PublisherImage
                src={story.representativeMedia?.url}
                alt={story.representativeMedia?.altText || title}
                aspectRatio="16/9"
                priority={true}
                className="rounded-xl shadow-xs"
              />
            </div>
          ) : null}

          <div className={hasImage ? "md:col-span-7 space-y-4" : "md:col-span-12 space-y-4"}>
            <h2
              lang={contentLanguage}
            className="font-serif text-2xl font-semibold tracking-tight text-foreground leading-snug group-hover:text-brand transition-colors wrap-break-word sm:text-3xl"
            >
              <Link href={storyUrl} className="focus-visible:outline-2 focus-visible:outline-brand">
                {title}
              </Link>
            </h2>

            {/* Multi-Publisher Stats Pill */}
            <div className="inline-flex flex-wrap items-center gap-3 rounded-lg bg-brand-soft/50 px-3 py-1.5 text-xs font-bold text-brand">
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
                  <span
                    key={reason}
                    className="rounded-full bg-surface-muted border border-border px-2.5 py-0.5 text-xs font-medium text-foreground-secondary"
                  >
                    {reasonLabels[reason]}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium text-foreground-muted">
            Compare reporting across independent Sri Lankan newsrooms
          </span>
          <Link
            href={storyUrl}
            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-hover transition-colors focus-visible:outline-2 focus-visible:outline-brand"
          >
            View Full Coverage →
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-surface shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-soft hover:shadow-md flex flex-col justify-between">
      {hasImage ? (
        <PublisherImage
          src={story.representativeMedia?.url}
          alt={story.representativeMedia?.altText || title}
          aspectRatio="16/9"
          className="w-full border-b border-border/60"
        />
      ) : null}

      <div className="p-5 flex flex-col grow justify-between">
        <div>
          {/* Header Tag */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-foreground-muted mb-2">
            <span className="inline-flex items-center gap-1 rounded bg-brand-soft/50 px-2 py-0.5 text-xs font-bold text-brand uppercase tracking-wider">
              <Layers className="size-3" />
              Multi-Source Story
            </span>
            <time dateTime={story.lastPublishedAt} className="text-xs">
              {formatPublishedAt(story.lastPublishedAt)}
            </time>
          </div>

          {/* Title */}
          <h3
            lang={contentLanguage}
            className="font-serif text-lg font-semibold leading-snug tracking-tight text-foreground group-hover:text-brand transition-colors wrap-break-word sm:text-xl"
          >
            <Link href={storyUrl} className="focus-visible:outline-2 focus-visible:outline-brand">
              {title}
            </Link>
          </h3>

          {reasons && reasons.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {reasons.map((reason) => (
                <span
                  key={reason}
                  className="rounded-full bg-surface-muted border border-border px-2 py-0.5 text-xs font-medium text-foreground-secondary"
                >
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

          <Link href={storyUrl} className="text-xs font-bold text-brand hover:underline">
            View Story →
          </Link>
        </div>
      </div>
    </article>
  );
}
