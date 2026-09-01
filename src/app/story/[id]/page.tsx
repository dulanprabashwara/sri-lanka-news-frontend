import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/error-state";
import { StoryArticleReport } from "@/components/story-article-report";
import { CoverageComparison } from "@/components/coverage-comparison";
import { ApiError } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getStory } from "@/lib/api/news";
import { getOptionalStoryCoverage } from "@/lib/api/coverage";
import { formatCategory, formatPublishedAt } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Story coverage" };

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let story;
  try {
    story = await getStory(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return <ErrorState title="Unable to load story" message={getApiErrorMessage(error)} />;
  }
  const coverage = await getOptionalStoryCoverage(id);
  return (
    <div className="space-y-8">
      <header className="max-w-4xl">
        <p className="eyebrow">Story coverage</p>
        <h1 className="page-title">{story.canonicalTitle}</h1>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          {story.category ? <span>{formatCategory(story.category)}</span> : null}
          <span>{story.articleCount} reports from {story.sourceCount} sources</span>
          <span>First reported {formatPublishedAt(story.firstPublishedAt)}</span>
          <span>Latest report {formatPublishedAt(story.lastPublishedAt)}</span>
        </div>
      </header>
      <section aria-labelledby="story-reports-title">
        <h2 id="story-reports-title" className="mb-5 text-2xl font-extrabold tracking-tight text-slate-950">
          Publisher reports
        </h2>
        {story.articles.length === 0 ? (
          <div className="state-panel" role="status">No public reports are currently available for this story.</div>
        ) : (
          <div className="grid gap-4 sm:gap-5">
            {story.articles.map((article) => <StoryArticleReport key={article.id} article={article} />)}
          </div>
        )}
      </section>
      <CoverageComparison coverage={coverage} />
    </div>
  );
}
