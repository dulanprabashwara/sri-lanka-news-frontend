import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { ArticleFeed } from "@/components/article-feed";
import { CategoryNavigation } from "@/components/category-navigation";
import { ErrorState } from "@/components/error-state";
import { StoryCard } from "@/components/story-card";
import { SectionHeader } from "@/components/ui/section-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getArticles, getTrendingStories } from "@/lib/api/news";
import { formatCategory } from "@/lib/format";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategory,
  type PagedResponse,
  type Article,
  type TrendingStory,
} from "@/types/api";
import { Layers, Newspaper, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ category?: string | string[]; lang?: string | string[] }>;
}

function readCategory(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return ARTICLE_CATEGORIES.includes(candidate as ArticleCategory)
    ? (candidate as ArticleCategory)
    : undefined;
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const category = readCategory(resolvedParams.category);
  const displayLanguage = readDisplayLanguage(resolvedParams.lang);

  // Fetch trending stories and latest articles concurrently with error isolation
  const [trendingResult, articlesResult] = await Promise.allSettled([
    getTrendingStories({ limit: 4, category, displayLanguage }),
    getArticles({
      page: 0,
      size: 20,
      category,
      sort: "publishedAt,desc",
      displayLanguage,
    }),
  ]);

  const trendingStories: TrendingStory[] =
    trendingResult.status === "fulfilled" ? trendingResult.value : [];
  const articles: PagedResponse<Article> | null =
    articlesResult.status === "fulfilled" ? articlesResult.value : null;

  // Handle total failure of main article feed
  if (!articles) {
    const errorMsg =
      articlesResult.status === "rejected"
        ? getApiErrorMessage(articlesResult.reason)
        : "Failed to load news articles.";

    return (
      <div className="space-y-8">
        <HomeHeader category={category} />
        <CategoryNavigation activeCategory={category} displayLanguage={displayLanguage} />
        <ErrorState title="Unable to load news feed" message={errorMsg} />
      </div>
    );
  }

  const leadTrending = trendingStories[0];
  const secondaryTrending = trendingStories.slice(1, 4);
  const compactLatestReports = articles.content.slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Home Editorial Header */}
      <HomeHeader category={category} />

      {/* Category Filter Bar */}
      <CategoryNavigation activeCategory={category} displayLanguage={displayLanguage} />

      {/* Main 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3 width on desktop): Lead Story & Main Feed */}
        <div className="lg:col-span-2 space-y-10">
          {/* Lead Multi-Publisher Story Position */}
          {leadTrending ? (
            <section aria-label="Most reported story">
              <StoryCard
                story={leadTrending}
                reasons={leadTrending.reasons}
                displayLanguage={displayLanguage}
                variant="lead"
              />
            </section>
          ) : null}

          {/* Active Multi-Publisher Stories Discovery Section */}
          {secondaryTrending.length > 0 ? (
            <section aria-label="Active stories across newsrooms" className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader
                  title="Active Stories"
                  description="Multi-publisher coverage grouped from independent newsrooms."
                />
                <Link
                  href={withDisplayLanguage("/stories", displayLanguage)}
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-1 shrink-0"
                >
                  View all stories <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {secondaryTrending.map((item) => (
                  <StoryCard
                    key={item.id}
                    story={item}
                    reasons={item.reasons}
                    displayLanguage={displayLanguage}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {/* Main Article Feed: Latest Publisher Reports */}
          <section aria-label="Latest publisher reports" className="space-y-4">
            <SectionHeader
              title={category ? `${formatCategory(category)} Publisher Reports` : "Latest Publisher Reports"}
              description="Recent chronological reports direct from Sri Lankan news publishers."
            />
            <ArticleFeed
              articles={articles.content}
              displayLanguage={displayLanguage}
              emptyTitle={category ? "No articles in this category" : undefined}
              emptyMessage={
                category
                  ? "Try selecting another category or return to all latest news."
                  : undefined
              }
            />
          </section>
        </div>

        {/* Right Column (1/3 width on desktop): Compact Latest Reports Side Panel */}
        <aside aria-label="Recent reports panel" className="space-y-4 lg:sticky lg:top-20">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <Newspaper className="size-4 text-brand" />
                <span>Recent Headlines</span>
              </div>
              <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                Real-time
              </span>
            </div>

            <div className="space-y-3">
              {compactLatestReports.map((article) => (
                <ArticleCard
                  key={`compact-${article.id}`}
                  article={article}
                  displayLanguage={displayLanguage}
                  variant="compact"
                />
              ))}
            </div>

            <div className="pt-2 text-center">
              <Link
                href={withDisplayLanguage("/search", displayLanguage)}
                className="text-xs font-bold text-brand hover:underline"
              >
                Search all news headlines →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HomeHeader({ category }: { category?: ArticleCategory }) {
  return (
    <header className="max-w-3xl space-y-2">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft/60 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
        <Layers className="size-3.5" />
        Multilingual News Intelligence
      </div>
      <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground break-words">
        {category
          ? `${formatCategory(category)} News`
          : "News Intelligence Across Sri Lanka"}
      </h1>
      <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed">
        Aggregating independent Sri Lankan newsrooms in English, Sinhala, and Tamil.
        Grouped multi-publisher stories alongside recent single-publisher reports.
      </p>
    </header>
  );
}
