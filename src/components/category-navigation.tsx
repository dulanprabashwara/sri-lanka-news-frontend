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
  basePath?: "/" | "/stories";
  label?: string;
}

export function CategoryNavigation({
  activeCategory,
  basePath = "/",
  label = "News categories",
}: CategoryNavigationProps) {
  return (
    <nav
      aria-label={label}
      className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-2">
        <li>
          <Link
            href={basePath}
            aria-current={!activeCategory ? "page" : undefined}
            className="category-link"
          >
            All
          </Link>
        </li>
        {featuredCategories.map((category) => (
          <li key={category}>
            <Link
              href={`${basePath}?category=${category}`}
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
