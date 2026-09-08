import type { Metadata } from "next";
import { CategoryNavigation } from "@/components/category-navigation";
import { ErrorState } from "@/components/error-state";
import { StoryList } from "@/components/story-list";
import { PageHeader } from "@/components/ui/page-header";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getStories } from "@/lib/api/news";
import { formatCategory } from "@/lib/format";
import { readDisplayLanguage } from "@/lib/language";
import { ARTICLE_CATEGORIES, type ArticleCategory } from "@/types/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Grouped Stories — Ceylon News",
  description: "Explore multi-publisher news coverage grouped across independent Sri Lankan newsrooms.",
};

function readCategory(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return ARTICLE_CATEGORIES.includes(candidate as ArticleCategory)
    ? (candidate as ArticleCategory)
    : undefined;
}

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; lang?: string | string[] }>;
}) {
  const resolvedParams = await searchParams;
  const category = readCategory(resolvedParams.category);
  const displayLanguage = readDisplayLanguage(resolvedParams.lang);

  let stories;
  try {
    stories = await getStories({
      page: 0,
      size: 20,
      category,
      sort: "lastPublishedAt,desc",
      displayLanguage,
    });
  } catch (error) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Multi-Publisher Coverage"
          title={category ? `${formatCategory(category)} Stories` : "Grouped Stories"}
          description="Follow how multiple independent publishers are reporting the same developing events across Sri Lanka."
        />
        <CategoryNavigation
          activeCategory={category}
          basePath="/stories"
          label="Story categories"
          displayLanguage={displayLanguage}
        />
        <ErrorState title="Unable to load stories" message={getApiErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Multi-Publisher Coverage"
        title={category ? `${formatCategory(category)} Stories` : "Grouped Stories"}
        description="Follow how multiple independent publishers are reporting the same developing events across Sri Lanka."
      />

      <CategoryNavigation
        activeCategory={category}
        basePath="/stories"
        label="Story categories"
        displayLanguage={displayLanguage}
      />

      <StoryList
        stories={stories.content}
        displayLanguage={displayLanguage}
        emptyTitle={category ? `No ${formatCategory(category).toLowerCase()} stories` : undefined}
        emptyMessage={
          category
            ? "Try selecting another category or view all grouped stories."
            : undefined
        }
      />
    </div>
  );
}
