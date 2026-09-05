import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/error-state";
import { BookmarkButton } from "@/components/bookmark-button";
import { StoryTools } from "@/components/story-tools";
import { Surface } from "@/components/ui/surface";
import { ContainerWide } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { ApiError } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getStory } from "@/lib/api/news";
import { getBookmarkStatus, getPreferences, preferredDisplayLanguage } from "@/lib/api/user";
import { getAuthenticatedAccessToken } from "@/lib/auth";
import { getOptionalStoryCoverage } from "@/lib/api/coverage";
import { getOptionalStoryTimeline } from "@/lib/api/timeline";
import { formatCategory, formatPublishedAt } from "@/lib/format";
import { readDisplayLanguage, storyTitle, withDisplayLanguage } from "@/lib/language";
import { ArrowLeft, Layers, Calendar, Newspaper, Clock } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Story Coverage" };

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { id } = await params;
  const explicitLanguage = readDisplayLanguage((await searchParams).lang);
  const accessToken = await getAuthenticatedAccessToken();
  let displayLanguage = explicitLanguage;
  if (!displayLanguage && accessToken) {
    try { displayLanguage = preferredDisplayLanguage((await getPreferences(accessToken)).preferredDisplayLanguage); } catch { /* Preference lookup is non-critical. */ }
  }
  const currentPath = withDisplayLanguage(`/story/${encodeURIComponent(id)}`, displayLanguage);
  let story;
  try {
    story = await getStory(id, displayLanguage);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return <ErrorState title="Unable to load story" message={getApiErrorMessage(error)} />;
  }

  const [coverage, timeline] = await Promise.all([
    getOptionalStoryCoverage(id, displayLanguage),
    getOptionalStoryTimeline(id, displayLanguage),
  ]);

  let bookmarked = false;
  if (accessToken) {
    try { bookmarked = (await getBookmarkStatus(accessToken, "STORY", id)).bookmarked; } catch { /* Bookmark state is non-critical. */ }
  }

  return (
    <ContainerWide className="py-6 sm:py-10 space-y-8">
      {/* 1. Context Navigation & Bookmark */}
      <div className="flex items-center justify-between">
        <Link
          href={withDisplayLanguage("/stories", displayLanguage)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-secondary hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Grouped Stories</span>
        </Link>
        <BookmarkButton
          type="STORY"
          targetId={id}
          initialBookmarked={bookmarked}
          authenticated={Boolean(accessToken)}
          path={currentPath}
        />
      </div>

      {/* 2. Flagship Story Header */}
      <Surface variant="bordered" className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <StatusBadge status="info" label="Multi-Source Story" icon={<Layers className="size-3" />} />
          {story.category && (
            <span className="rounded bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-primary">
              {formatCategory(story.category)}
            </span>
          )}
        </div>

        {/* Headline */}
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl leading-tight">
          {storyTitle(story)}
        </h1>

        {/* Representative Media (If available) */}
        {story.representativeMedia?.type === "IMAGE" && story.representativeMedia.url && (
          <div className="overflow-hidden rounded-xl bg-surface-muted max-h-[360px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.representativeMedia.url}
              alt={story.representativeMedia.altText || storyTitle(story)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Metrics Bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-foreground-secondary pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 bg-brand-soft text-brand-primary px-3 py-1.5 rounded-md">
            <Newspaper className="size-4" />
            <span>{story.articleCount} reports • {story.sourceCount} publishers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-4 text-foreground-secondary" />
            <span>First reported {formatPublishedAt(story.firstPublishedAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-4 text-foreground-secondary" />
            <span>Updated {formatPublishedAt(story.lastPublishedAt)}</span>
          </div>
        </div>
      </Surface>

      {/* 3. Story Intelligence Navigation & Progressive Disclosure Tabs */}
      <StoryTools
        storyId={id}
        articles={story.articles}
        coverage={coverage}
        timeline={timeline}
        displayLanguage={displayLanguage}
      />
    </ContainerWide>
  );
}
