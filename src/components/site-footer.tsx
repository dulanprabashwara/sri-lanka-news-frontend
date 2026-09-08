"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  const searchParams = useSearchParams();
  const displayLanguage = readDisplayLanguage(searchParams.get("lang"));

  const footerLinkClasses =
    "text-sm text-foreground-secondary hover:text-brand hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <footer className="mt-auto border-t border-border bg-surface text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-5 pb-10 border-b border-border">
          {/* Brand & Purpose Column (Spans 2 on desktop) */}
          <div className="md:col-span-2 space-y-3">
            <div className="w-36">
              <BrandLogo />
            </div>
            <p className="text-sm text-foreground-secondary leading-relaxed max-w-sm">
              Aggregating news from independent publishers across Sri Lanka in English, Sinhala, and Tamil.
            </p>
            <div className="pt-1 text-xs text-foreground-muted">
              Built for analytical neutrality, multi-publisher clustering, and multilingual verification.
            </div>
          </div>

          {/* Column 1: Explore */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Explore
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href={withDisplayLanguage("/", displayLanguage)} className={footerLinkClasses}>
                  Latest News
                </Link>
              </li>
              <li>
                <Link href={withDisplayLanguage("/stories", displayLanguage)} className={footerLinkClasses}>
                  Grouped Stories
                </Link>
              </li>
              <li>
                <Link href={withDisplayLanguage("/trending", displayLanguage)} className={footerLinkClasses}>
                  Trending Coverage
                </Link>
              </li>
              <li>
                <Link href={withDisplayLanguage("/search", displayLanguage)} className={footerLinkClasses}>
                  News Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: My News */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              My News
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href={withDisplayLanguage("/for-you", displayLanguage)} className={footerLinkClasses}>
                  For You
                </Link>
              </li>
              <li>
                <Link href={withDisplayLanguage("/bookmarks", displayLanguage)} className={footerLinkClasses}>
                  Bookmarks
                </Link>
              </li>
              <li>
                <Link href={withDisplayLanguage("/following", displayLanguage)} className={footerLinkClasses}>
                  Following Sources
                </Link>
              </li>
              <li>
                <Link href={withDisplayLanguage("/notifications", displayLanguage)} className={footerLinkClasses}>
                  Notifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Platform
            </h3>
            <ul className="space-y-2">
              <li><Link href={withDisplayLanguage("/about", displayLanguage)} className={footerLinkClasses}>About Ceylon News</Link></li>
              <li><Link href={withDisplayLanguage("/guide", displayLanguage)} className={footerLinkClasses}>User manual</Link></li>
              <li><Link href={withDisplayLanguage("/articles", displayLanguage)} className={footerLinkClasses}>All articles</Link></li>
              <li><Link href={withDisplayLanguage("/sources", displayLanguage)} className={footerLinkClasses}>Publisher directory</Link></li>
              <li>
                <Link href={withDisplayLanguage("/account/privacy", displayLanguage)} className={footerLinkClasses}>
                  Privacy & Telemetry
                </Link>
              </li>
              <li>
                <Link href={withDisplayLanguage("/account", displayLanguage)} className={footerLinkClasses}>
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-foreground-muted">
          <p>
            © {new Date().getFullYear()} Ceylon News. All headlines link directly to original publishers.
          </p>
          <p className="text-center sm:text-right">
            Independent news intelligence platform. Articles remain the property of their respective publishers.
          </p>
        </div>
      </div>
    </footer>
  );
}
