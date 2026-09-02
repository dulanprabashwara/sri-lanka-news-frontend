import Link from "next/link";
import { formatCategory } from "@/lib/format";
import { withDisplayLanguage } from "@/lib/language";
import type { ArticleCategory, DisplayLanguage } from "@/types/api";

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
  basePath?: "/" | "/stories" | "/trending";
  label?: string;
  displayLanguage?: DisplayLanguage;
}

export function CategoryNavigation({
  activeCategory,
  basePath = "/",
  label = "News categories",
  displayLanguage,
}: CategoryNavigationProps) {
  return (
    <nav
      aria-label={label}
      className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-2">
        <li>
          <Link
            href={withDisplayLanguage(basePath, displayLanguage)}
            aria-current={!activeCategory ? "page" : undefined}
            className="category-link"
          >
            All
          </Link>
        </li>
        {featuredCategories.map((category) => (
          <li key={category}>
            <Link
              href={withDisplayLanguage(`${basePath}?category=${category}`, displayLanguage)}
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
