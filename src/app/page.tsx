import { ArticleFeed } from "@/components/article-feed";
import { CategoryNavigation } from "@/components/category-navigation";
import { ErrorState } from "@/components/error-state";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getArticles } from "@/lib/api/news";
import { formatCategory } from "@/lib/format";
import {
  ARTICLE_CATEGORIES,
  type ArticleCategory,
} from "@/types/api";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

function readCategory(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return ARTICLE_CATEGORIES.includes(candidate as ArticleCategory)
    ? (candidate as ArticleCategory)
    : undefined;
}

export default async function Home({ searchParams }: HomePageProps) {
  const category = readCategory((await searchParams).category);

  let articles;
  try {
    articles = await getArticles({
      page: 0,
      size: 20,
      category,
      sort: "publishedAt,desc",
    });
  } catch (error) {
    return (
      <div className="space-y-8">
        <header className="max-w-3xl">
          <p className="eyebrow">Latest coverage</p>
          <h1 className="page-title">News from across Sri Lanka</h1>
          <p className="page-intro">
            Browse recent reporting and continue to the original publisher for
            every story.
          </p>
        </header>
        <CategoryNavigation activeCategory={category} />
        <ErrorState message={getApiErrorMessage(error)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="eyebrow">Latest coverage</p>
        <h1 className="page-title">
          {category
            ? `${formatCategory(category)} news`
            : "News from across Sri Lanka"}
        </h1>
        <p className="page-intro">
          Browse recent reporting and continue to the original publisher for
          every story.
        </p>
      </header>
      <CategoryNavigation activeCategory={category} />
      <ArticleFeed
        articles={articles.content}
        emptyTitle={category ? "No articles in this category" : undefined}
        emptyMessage={
          category
            ? "Try another category or return to all latest news."
            : undefined
        }
      />
    </div>
  );
}
