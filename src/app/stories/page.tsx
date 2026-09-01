import type { Metadata } from "next";
import { CategoryNavigation } from "@/components/category-navigation";
import { ErrorState } from "@/components/error-state";
import { StoryList } from "@/components/story-list";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getStories } from "@/lib/api/news";
import { ARTICLE_CATEGORIES, type ArticleCategory } from "@/types/api";
import { readDisplayLanguage } from "@/lib/language";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Latest Stories" };

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
        <StoryPageHeader />
        <CategoryNavigation activeCategory={category} basePath="/stories" label="Story categories" displayLanguage={displayLanguage} />
        <ErrorState title="Unable to load stories" message={getApiErrorMessage(error)} />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <StoryPageHeader />
      <CategoryNavigation activeCategory={category} basePath="/stories" label="Story categories" displayLanguage={displayLanguage} />
      <StoryList stories={stories.content} displayLanguage={displayLanguage} />
    </div>
  );
}

function StoryPageHeader() {
  return (
    <header className="max-w-3xl">
      <p className="eyebrow">Grouped coverage</p>
      <h1 className="page-title">Latest Stories</h1>
      <p className="page-intro">Follow how multiple publishers are reporting the same developing event.</p>
    </header>
  );
}
