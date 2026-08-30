import Link from "next/link";
import { formatCategory } from "@/lib/format";
import type { ArticleCategory } from "@/types/api";

const featuredCategories: ArticleCategory[] = [
  "LOCAL",
  "POLITICS",
  "BUSINESS",
  "SPORTS",
  "WORLD",
  "TECHNOLOGY",
];

interface CategoryNavigationProps {
  activeCategory?: ArticleCategory;
}

export function CategoryNavigation({
  activeCategory,
}: CategoryNavigationProps) {
  return (
    <nav
      aria-label="News categories"
      className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-2">
        <li>
          <Link
            href="/"
            aria-current={!activeCategory ? "page" : undefined}
            className="category-link"
          >
            All
          </Link>
        </li>
        {featuredCategories.map((category) => (
          <li key={category}>
            <Link
              href={`/?category=${category}`}
              aria-current={activeCategory === category ? "page" : undefined}
              className="category-link"
            >
              {formatCategory(category)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
