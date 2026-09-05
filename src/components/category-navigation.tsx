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
  const getCategoryLinkClasses = (isActive: boolean) =>
    `inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand cursor-pointer ${
      isActive
        ? "bg-brand text-white shadow-xs"
        : "bg-surface border border-border text-foreground-secondary hover:border-brand-soft hover:text-foreground hover:bg-surface-muted"
    }`;

  return (
    <nav
      aria-label={label}
      className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 scrollbar-none"
    >
      <ul className="flex min-w-max items-center gap-2">
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
