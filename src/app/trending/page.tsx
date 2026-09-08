import type { Metadata } from "next";
import Link from "next/link";
import { CategoryNavigation } from "@/components/category-navigation";
import { ErrorState } from "@/components/error-state";
import { StoryCard } from "@/components/story-card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getTrendingStories } from "@/lib/api/news";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import { ARTICLE_CATEGORIES, type ArticleCategory } from "@/types/api";
import { TrendingUp } from "lucide-react";

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
  const filterNav = (
    <CategoryNavigation activeCategory={category} basePath="/trending"
      label="Trending Story categories" displayLanguage={displayLanguage} />
  );

  try {
    stories = await getTrendingStories({ limit: 10, category, displayLanguage });
  } catch (error) {
    return (
      <section className="space-y-8">
        <PageHeader          eyebrow="Reporting activity"          title="Trending"          description="Stories receiving recent and broad reporting coverage. Rankings are based on reporting recency, number of reports, and publisher coverage."
          filterSlot={filterNav}
        />
        <ErrorState title="Unable to load Trending Stories" message={getApiErrorMessage(error)} />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <PageHeader        eyebrow="Reporting activity"        title="Trending"        description="Stories receiving recent and broad reporting coverage. Rankings are based on reporting recency, number of reports, and publisher coverage."
        filterSlot={filterNav}
      />
      {stories.length === 0 ? (
        <EmptyState          icon={<TrendingUp className="size-6 text-foreground-secondary" />}
          title="No trending stories right now"
          description="Recent grouped coverage will appear here. No stories have crossed the multi-publisher reporting threshold for this category yet."
          primaryAction={
            <Link href={withDisplayLanguage("/", displayLanguage)} className="inline-flex items-center justify-center font-semibold rounded-lg bg-brand text-brand-foreground hover:bg-brand-hover shadow-sm px-4 py-2 text-sm gap-2 cursor-pointer transition-all duration-150">
              Browse latest news
            </Link>
          }
          secondaryAction={
            <Link href={withDisplayLanguage("/stories", displayLanguage)} className="inline-flex items-center justify-center font-semibold rounded-lg bg-surface-muted text-foreground-secondary hover:bg-border hover:text-foreground border border-border px-4 py-2 text-sm gap-2 cursor-pointer transition-all duration-150">
              Browse all stories
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:gap-5">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} reasons={story.reasons}
              displayLanguage={displayLanguage} />
          ))}
        </div>
      )}
    </section>
  );
}
