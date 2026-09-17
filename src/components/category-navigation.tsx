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
  basePath?: "/" | "/articles" | "/stories" | "/trending";
  label?: string;
  displayLanguage?: DisplayLanguage;
}

export function CategoryNavigation({
  activeCategory,
  basePath = "/",
  label = "News categories",
  displayLanguage,
}: CategoryNavigationProps) {
  const getCategoryLinkClasses = (isActive: boolean) =>
    `inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand cursor-pointer ${
      isActive
        ? "border-brand bg-brand text-white shadow-xs"
        : "border-border bg-surface text-foreground-secondary hover:border-brand hover:text-brand hover:bg-brand-soft/30"
    }`;

  return (
    <nav
      aria-label={label}
      className="-mx-1 px-1"
    >
      <ul className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            href={withDisplayLanguage(basePath, displayLanguage)}
            aria-current={!activeCategory ? "page" : undefined}
            className={getCategoryLinkClasses(!activeCategory)}
          >
            All Categories
          </Link>
        </li>
        {featuredCategories.map((category) => (
          <li key={category}>
            <Link
              href={withDisplayLanguage(`${basePath}?category=${category}`, displayLanguage)}
              aria-current={activeCategory === category ? "page" : undefined}
              className={getCategoryLinkClasses(activeCategory === category)}
            >
              {formatCategory(category)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
