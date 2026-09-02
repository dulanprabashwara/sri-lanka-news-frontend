import type { Metadata } from "next";
import Link from "next/link";
import { CategoryNavigation } from "@/components/category-navigation";
import { ErrorState } from "@/components/error-state";
import { StoryCard } from "@/components/story-card";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getTrendingStories } from "@/lib/api/news";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import { ARTICLE_CATEGORIES, type ArticleCategory } from "@/types/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Trending Stories" };

function readCategory(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return ARTICLE_CATEGORIES.includes(candidate as ArticleCategory)
    ? (candidate as ArticleCategory)
    : undefined;
}

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; lang?: string | string[] }>;
}) {
  const params = await searchParams;
  const category = readCategory(params.category);
  const displayLanguage = readDisplayLanguage(params.lang);
  let stories;
  try {
    stories = await getTrendingStories({ limit: 10, category, displayLanguage });
  } catch (error) {
    return (
      <div className="space-y-8">
        <TrendingHeader />
        <CategoryNavigation activeCategory={category} basePath="/trending"
          label="Trending Story categories" displayLanguage={displayLanguage} />
        <ErrorState title="Unable to load Trending Stories" message={getApiErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <TrendingHeader />
      <CategoryNavigation activeCategory={category} basePath="/trending"
        label="Trending Story categories" displayLanguage={displayLanguage} />
      {stories.length === 0 ? (
        <div className="state-panel" role="status">
          <h2 className="text-lg font-bold text-slate-900">No trending stories right now.</h2>
          <p className="mt-2 text-sm text-slate-600">Recent grouped coverage will appear here.</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
            <Link className="text-teal-800 hover:text-teal-700"
              href={withDisplayLanguage("/", displayLanguage)}>Browse latest news</Link>
            <Link className="text-teal-800 hover:text-teal-700"
              href={withDisplayLanguage("/stories", displayLanguage)}>Browse all stories</Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} reasons={story.reasons}
              displayLanguage={displayLanguage} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrendingHeader() {
  return (
    <header className="max-w-3xl">
      <p className="eyebrow">Reporting activity</p>
      <h1 className="page-title">Trending</h1>
      <p className="page-intro">Stories receiving recent and broad reporting coverage.</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Rankings are based on reporting recency, number of reports, and publisher coverage.
      </p>
    </header>
  );
}
