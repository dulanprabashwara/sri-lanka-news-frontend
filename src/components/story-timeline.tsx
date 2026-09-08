import Link from "next/link";
import { formatLanguage, formatPublishedAt } from "@/lib/format";
import { translationLabel, withDisplayLanguage } from "@/lib/language";
import { Surface } from "@/components/ui/surface";
import type { DisplayLanguage, StoryTimeline as Timeline } from "@/types/api";
import { ExternalLink } from "lucide-react";

export function StoryTimeline({
  timeline,
  displayLanguage,
}: {
  timeline: Timeline | null;
  displayLanguage?: DisplayLanguage;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          Chronological Story Timeline
        </h2>
        <p className="text-xs leading-relaxed text-foreground-secondary">
          Timeline orders constituent publisher reports chronologically by publication timestamp.
        </p>
      </div>

      {timeline === null ? (
        <Surface variant="bordered" className="p-4 text-sm text-foreground-secondary" role="status">
          Story timeline is temporarily unavailable. Other Story information remains available.
        </Surface>
      ) : timeline.events.length === 0 ? (
        <Surface variant="bordered" className="p-4 text-sm text-foreground-secondary" role="status">
          No timeline events recorded.
        </Surface>
      ) : (
        <ol className="relative space-y-6 border-l-2 border-brand-soft pl-4 sm:pl-6" aria-label="Publisher reports in publication order">
          {timeline.events.map((event) => (
            <li key={event.articleId} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[1.35rem] sm:-left-[1.85rem] top-1.5 size-3 rounded-full border-2 border-surface bg-brand ring-4 ring-brand-soft"
              />
              <Surface variant="bordered" className="p-5 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-foreground-secondary">
                  <time dateTime={event.publishedAt} className="font-mono text-foreground">
                    {formatPublishedAt(event.publishedAt)}
                  </time>
                  <span>•</span>
                  <span className="text-brand font-medium">
                    {formatTimelineOffset(event.minutesFromFirstReport)}
                  </span>
                </div>

                <div className="text-xs font-bold text-brand">
                  {event.source.name}
                </div>

                <h3 className="text-base font-bold text-foreground hover:text-brand">
                  <Link
                    href={withDisplayLanguage(`/article/${encodeURIComponent(event.articleId)}`, displayLanguage)}
                    className="hover:underline transition-colors"
                  >
                    {event.localizedContent?.title ?? event.title}
                  </Link>
                </h3>

                {(event.localizedContent?.summary ?? event.summary) && (
                  <p className="text-xs leading-relaxed text-foreground-secondary">
                    {event.localizedContent?.summary ?? event.summary}
                  </p>
                )}

                {translationLabel(event.localizedContent, event.originalLanguage) && (
                  <p className="text-xs font-semibold text-brand">
                    {translationLabel(event.localizedContent, event.originalLanguage)} • Platform translation
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border text-xs font-medium">
                  <span className="rounded bg-surface-muted px-2 py-0.5 text-foreground-secondary">
                    {formatLanguage(event.originalLanguage)}
                  </span>
                  <a
                    href={event.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                  >
                    <span>Original Publisher</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </Surface>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function formatTimelineOffset(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return "First available report";
  }
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (hours > 0) parts.push(`${hours} hr`);
  if (minutes > 0) parts.push(`${minutes} min`);
  return `${parts.join(" ")} later`;
}
