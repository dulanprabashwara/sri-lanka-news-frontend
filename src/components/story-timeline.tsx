import Link from "next/link";
import { formatLanguage, formatPublishedAt } from "@/lib/format";
import { translationLabel, withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage, StoryTimeline as Timeline } from "@/types/api";

export function StoryTimeline({ timeline, displayLanguage }: { timeline: Timeline | null; displayLanguage?: DisplayLanguage }) {
  return (
    <section aria-labelledby="story-timeline-title" className="border-t border-slate-200 pt-8">
      <div className="max-w-3xl">
        <p className="eyebrow">Reports over time</p>
        <h2 id="story-timeline-title" className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          Story Timeline
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This timeline shows when currently available publisher reports were published. It does not establish when the event occurred or infer publisher behavior.
        </p>
      </div>

      {timeline === null ? (
        <p className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600" role="status">
          The Story timeline is temporarily unavailable. Other Story information remains available.
        </p>
      ) : (
        <ol className="relative mt-8 space-y-6 border-l-2 border-teal-200 pl-6 sm:pl-8" aria-label="Publisher reports in publication order">
          {timeline.events.map((event) => (
            <li key={event.articleId} className="relative">
              <span aria-hidden="true" className="absolute -left-[1.95rem] top-1.5 size-3 rounded-full border-2 border-white bg-teal-700 ring-2 ring-teal-100 sm:-left-[2.45rem]" />
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <time dateTime={event.publishedAt}>{formatPublishedAt(event.publishedAt)}</time>
                  <span aria-hidden="true">•</span>
                  <span className="text-teal-700">{formatTimelineOffset(event.minutesFromFirstReport)}</span>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-700">{event.source.name}</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                  <Link href={withDisplayLanguage(`/article/${encodeURIComponent(event.articleId)}`, displayLanguage)} className="hover:text-teal-800 hover:underline">
                    {event.localizedContent?.title ?? event.title}
                  </Link>
                </h3>
                {(event.localizedContent?.summary ?? event.summary) ? <p className="mt-3 text-sm leading-6 text-slate-600">{event.localizedContent?.summary ?? event.summary}</p> : null}
                {translationLabel(event.localizedContent, event.originalLanguage) ? <p className="mt-2 text-xs font-semibold text-violet-700">{translationLabel(event.localizedContent, event.originalLanguage)} · Platform translation</p> : null}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{formatLanguage(event.originalLanguage)}</span>
                  <a href={event.originalUrl} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
                    Original publisher ↗
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
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
