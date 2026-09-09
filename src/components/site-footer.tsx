"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  const searchParams = useSearchParams();
  const displayLanguage = readDisplayLanguage(searchParams.get("lang"));

  const footerLinkClasses =
    "text-sm text-slate-300 hover:text-white hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-blue-300";

  return (
    <footer className="mt-auto border-t border-slate-700 bg-foreground text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-5 pb-12 border-b border-white/10">
          {/* Brand & Purpose Column (Spans 2 on desktop) */}
          <div className="md:col-span-2 space-y-3">
            <div className="w-40 rounded-lg bg-white p-2">
              <BrandLogo />
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              A clearer way to discover, compare, and follow reporting from independent publishers across Sri Lanka.
            </p>
            <div className="pt-1 text-xs leading-5 text-slate-400">
              English, Sinhala, and Tamil when available. Every report leads back to the original publisher.
            </div>
          </div>

          {/* Column 1: Explore */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
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
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
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
