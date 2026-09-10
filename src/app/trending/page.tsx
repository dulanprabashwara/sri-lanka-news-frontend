import type { Metadata } from "next";
import Link from "next/link";
import { CategoryNavigation } from "@/components/category-navigation";
import { ErrorState } from "@/components/error-state";
import { StoryCard } from "@/components/story-card";
import { ArticleCard } from "@/components/article-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getTrendingArticles, getTrendingStories } from "@/lib/api/news";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import {
  ARTICLE_CATEGORIES,
  type Article,
  type ArticleCategory,
  type TrendingStory,
} from "@/types/api";
import { Flame, Layers3, TrendingUp } from "lucide-react";

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
  searchParams: Promise<{
    category?: string | string[];
    lang?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const category = readCategory(params.category);
  const displayLanguage = readDisplayLanguage(params.lang);

  const filterNav = (
    <CategoryNavigation
      activeCategory={category}
      basePath="/trending"
      label="Trending Story categories"
      displayLanguage={displayLanguage}
    />
  );

  const [articlesResult, storiesResult] = await Promise.allSettled([
    getTrendingArticles({ limit: 20, category, displayLanguage }),
    getTrendingStories({ limit: 10, category, displayLanguage }),
  ]);

  if (
    articlesResult.status === "rejected" &&
    storiesResult.status === "rejected"
  ) {
    return (
      <section className="space-y-8">
        <PageHeader
          eyebrow="Reporting activity"
          title="Trending"
          description="Stories receiving recent and broad reporting coverage. Rankings are based on reporting recency, number of reports, and publisher coverage."
          filterSlot={filterNav}
        />
        <ErrorState
          title="Unable to load Trending"
          message={getApiErrorMessage(
            articlesResult.reason ?? storiesResult.reason,
          )}
        />
      </section>
    );
  }

  const articles: Article[] =
    articlesResult.status === "fulfilled" ? articlesResult.value : [];
  const stories: TrendingStory[] =
    storiesResult.status === "fulfilled" ? storiesResult.value : [];

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Reporting activity"
        title="Trending"
        description="Stories receiving recent and broad reporting coverage. Rankings are based on reporting recency, number of reports, and publisher coverage."
        filterSlot={filterNav}
      />

      {/* Primary Section: Trending Articles */}
      <section aria-labelledby="trending-articles-title" className="space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between border-b border-border pb-3">
          <div>
            <h2
              id="trending-articles-title"
              className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2"
            >
              <Flame className="size-5 text-brand" />
              Trending Articles
            </h2>
            <p className="text-xs sm:text-sm text-foreground-secondary mt-0.5">
              Individual reports receiving rapid newsroom attention, high
              recency, and source velocity.
            </p>
          </div>
          {articlesResult.status === "fulfilled" && articles.length > 0 && (
            <span className="text-xs font-semibold text-foreground-muted">
              {articles.length} {articles.length === 1 ? "report" : "reports"}
            </span>
          )}
        </div>

        {articlesResult.status === "rejected" ? (
          <ErrorState
            title="Unable to load Trending Articles"
            message={getApiErrorMessage(articlesResult.reason)}
          />
        ) : articles.length === 0 ? (
          <EmptyState
            icon={<Flame className="size-6 text-foreground-secondary" />}
            title="No trending articles right now"
            description="Individual reports with recent reporting activity will appear here as news breaks."
            primaryAction={
              <Link
                href={withDisplayLanguage("/", displayLanguage)}
                className="inline-flex items-center justify-center font-semibold rounded-lg bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm px-4 py-2 text-sm gap-2 cursor-pointer transition-all duration-150"
              >
                Browse latest news
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
                <Flame className="size-3.5" /> Top Trending Report
              </div>
              <ArticleCard
                article={articles[0]}
                displayLanguage={displayLanguage}
              />
            </div>

            {articles.length > 1 && (
              <div className="grid gap-4 sm:gap-5 pt-2">
                {articles.slice(1).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    displayLanguage={displayLanguage}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Secondary Section: Trending Stories */}
      <section aria-labelledby="trending-stories-title" className="space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between border-b border-border pb-3">
          <div>
            <h2
              id="trending-stories-title"
              className="text-xl font-bold tracking-tight text-foreground sm:text-2xl flex items-center gap-2"
            >
              <Layers3 className="size-5 text-brand" />
              Trending Stories
            </h2>
            <p className="text-xs sm:text-sm text-foreground-secondary mt-0.5">
              Developing stories corroborated across multiple independent
              publishers.
            </p>
          </div>
          {storiesResult.status === "fulfilled" && stories.length > 0 && (
            <span className="text-xs font-semibold text-foreground-muted">
              {stories.length} {stories.length === 1 ? "story" : "stories"}
            </span>
          )}
        </div>

        {storiesResult.status === "rejected" ? (
          <ErrorState
            title="Unable to load Trending Stories"
            message={getApiErrorMessage(storiesResult.reason)}
          />
        ) : stories.length === 0 ? (
          <EmptyState
            icon={<TrendingUp className="size-6 text-foreground-secondary" />}
            title="No trending stories right now"
            description="Multi-source stories will appear here as coverage develops."
            primaryAction={
              <Link
                href={withDisplayLanguage("/", displayLanguage)}
                className="inline-flex items-center justify-center font-semibold rounded-lg bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm px-4 py-2 text-sm gap-2 cursor-pointer transition-all duration-150"
              >
                Browse latest news
              </Link>
            }
            secondaryAction={
              <Link
                href={withDisplayLanguage("/stories", displayLanguage)}
                className="inline-flex items-center justify-center font-semibold rounded-lg bg-surface-muted text-foreground-secondary hover:bg-border hover:text-foreground border border-border px-4 py-2 text-sm gap-2 cursor-pointer transition-all duration-150"
              >
                Browse all stories
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:gap-5">
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                reasons={story.reasons}
                displayLanguage={displayLanguage}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
