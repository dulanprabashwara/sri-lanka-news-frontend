"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
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

  const handleMobileSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const targetUrl = value ? `${basePath}?category=${value}` : basePath;
    const fullHref = withDisplayLanguage(targetUrl, displayLanguage);
    if (typeof window !== "undefined") {
      window.location.assign(fullHref);
    }
  };

  return (
    <nav aria-label={label} className="w-full">
      {/* Mobile Category Dropdown (< sm) */}
      <div className="relative block sm:hidden">
        <label htmlFor="mobile-category-dropdown" className="sr-only">
          {label}
        </label>
        <div className="relative flex min-h-11 items-center rounded-xl border border-border-strong bg-surface shadow-2xs transition-colors focus-within:border-brand hover:border-brand">
          <select
            id="mobile-category-dropdown"
            aria-label={label}
            value={activeCategory ?? ""}
            onChange={handleMobileSelect}
            className="min-h-11 w-full cursor-pointer appearance-none rounded-xl bg-transparent pl-4 pr-10 text-xs font-bold text-foreground outline-none"
          >
            <option value="">All Categories</option>
            {featuredCategories.map((cat) => (
              <option key={cat} value={cat}>
                {formatCategory(cat)}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 size-4 text-foreground-muted"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Desktop / Tablet Horizontal Category Pills (sm+) */}
      <div className="-mx-4 hidden overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:block sm:px-0">
        <ul className="flex min-w-max flex-nowrap items-center gap-2 sm:min-w-0 sm:flex-wrap">
          <li>
            <Link
              href={withDisplayLanguage(basePath, displayLanguage)}
              aria-current={!activeCategory ? "page" : undefined}
              className={getCategoryLinkClasses(!activeCategory)}
              prefetch={false}
            >
              All Categories
            </Link>
          </li>
          {featuredCategories.map((category) => (
            <li key={category}>
              <Link
                href={withDisplayLanguage(
                  `${basePath}?category=${category}`,
                  displayLanguage,
                )}
                aria-current={activeCategory === category ? "page" : undefined}
                className={getCategoryLinkClasses(activeCategory === category)}
                prefetch={false}
              >
                {formatCategory(category)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
