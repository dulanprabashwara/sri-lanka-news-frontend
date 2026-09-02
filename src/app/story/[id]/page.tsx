import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/error-state";
import { StoryArticleReport } from "@/components/story-article-report";
import { CoverageComparison } from "@/components/coverage-comparison";
import { StoryTimeline } from "@/components/story-timeline";
import { BookmarkButton } from "@/components/bookmark-button";
import { AskThisStory } from "@/components/ask-this-story";
import { ApiError } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getStory } from "@/lib/api/news";
import { getBookmarkStatus, getPreferences, preferredDisplayLanguage } from "@/lib/api/user";
import { getAuthenticatedAccessToken } from "@/lib/auth";
import { getOptionalStoryCoverage } from "@/lib/api/coverage";
import { getOptionalStoryTimeline } from "@/lib/api/timeline";
import { formatCategory, formatPublishedAt } from "@/lib/format";
import { readDisplayLanguage, storyTitle, withDisplayLanguage } from "@/lib/language";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Story coverage" };

export default async function StoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string | string[] }> }) {
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
    <div className="space-y-8">
      <header className="max-w-4xl">
        <p className="eyebrow">Story coverage</p>
        <h1 className="page-title">{storyTitle(story)}</h1>
        <div className="mt-5"><BookmarkButton type="STORY" targetId={id} initialBookmarked={bookmarked} authenticated={Boolean(accessToken)} path={currentPath} /></div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          {story.category ? <span>{formatCategory(story.category)}</span> : null}
          <span>{story.articleCount} reports from {story.sourceCount} sources</span>
          <span>First reported {formatPublishedAt(story.firstPublishedAt)}</span>
          <span>Latest report {formatPublishedAt(story.lastPublishedAt)}</span>
        </div>
      </header>
      <AskThisStory storyId={id} displayLanguage={displayLanguage} />
      <section aria-labelledby="story-reports-title">
        <h2 id="story-reports-title" className="mb-5 text-2xl font-extrabold tracking-tight text-slate-950">
          Publisher reports
        </h2>
        {story.articles.length === 0 ? (
          <div className="state-panel" role="status">No public reports are currently available for this story.</div>
        ) : (
          <div className="grid gap-4 sm:gap-5">
            {story.articles.map((article) => <StoryArticleReport key={article.id} article={article} displayLanguage={displayLanguage} />)}
          </div>
        )}
      </section>
      <CoverageComparison coverage={coverage} displayLanguage={displayLanguage} />
      <StoryTimeline timeline={timeline} displayLanguage={displayLanguage} />
    </div>
  );
}
