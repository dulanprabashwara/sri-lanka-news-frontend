"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Menu, X, User, ChevronDown, LogOut, Settings, Shield, Bookmark, Sparkles, Rss, BookOpen, Building2, LibraryBig, Globe } from "lucide-react";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import NotificationBadge from "./notifications/NotificationBadge";
import { BrandLogo } from "./brand-logo";

export function SiteHeader({
  authenticated = false,
  admin = false,
  userDisplayName,
}: {
  authenticated?: boolean;
  admin?: boolean;
  userDisplayName?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const displayLanguage = readDisplayLanguage(searchParams.get("lang"));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [myNewsMenuOpen, setMyNewsMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const myNewsMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setMyNewsMenuOpen(false);
  }, [pathname, searchParams]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (myNewsMenuRef.current && !myNewsMenuRef.current.contains(event.target as Node)) {
        setMyNewsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Escape key listener for open menus/drawers
  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
        setMyNewsMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function selectLanguage(value: string) {
    const parameters = new URLSearchParams(searchParams.toString());
    if (value === "original") parameters.delete("lang");
    else parameters.set("lang", value);
    const query = parameters.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const isMyNewsActive = () => {
    return (
      pathname.startsWith("/for-you") ||
      pathname.startsWith("/bookmarks") ||
      pathname.startsWith("/following")
    );
  };

  const navLinkClasses = (href: string) =>
    `px-3 py-2 text-sm font-semibold rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
      isActive(href)
        ? "bg-brand-soft/40 text-brand font-bold"
        : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
    }`;

  const mobileNavLinkClasses = (href: string) =>
    `flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
      isActive(href)
        ? "bg-brand-soft/40 text-brand font-bold"
        : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
    }`;

  const handleMyNewsKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setMyNewsMenuOpen((prev) => !prev);
    }
  };

  const handleUserMenuKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setUserMenuOpen((prev) => !prev);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-xs">
      <div className="hidden border-b border-border/70 bg-foreground text-slate-300 lg:block">
        <div className="mx-auto flex h-8 w-full max-w-7xl items-center justify-between px-8 text-[0.68rem] font-semibold tracking-wide">
          <p className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-blue-400" />Independent Sri Lankan news intelligence</p>
          <nav aria-label="Utility navigation" className="flex items-center gap-5">
            <Link href={withDisplayLanguage("/articles", displayLanguage)} className="hover:text-white">All reports</Link>
            <Link href={withDisplayLanguage("/sources", displayLanguage)} className="hover:text-white">Publishers</Link>
            <Link href={withDisplayLanguage("/guide", displayLanguage)} className="hover:text-white">How to use Ceylon News</Link>
          </nav>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href={withDisplayLanguage("/", displayLanguage)}
          className="group flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand shrink-0"
          aria-label="Ceylon News home"
        >
          <span className="w-8 sm:hidden" aria-hidden="true">
            <BrandLogo compact priority />
          </span>
          <span className="hidden w-[7.25rem] sm:block">
            <BrandLogo priority />
          </span>
        </Link>

        {/* Desktop Primary Navigation (lg+ breakpoint to prevent wrapping on 768px/820px) */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1">
          <Link href={withDisplayLanguage("/", displayLanguage)} className={navLinkClasses("/")}>
            Latest news
          </Link>
          <Link href={withDisplayLanguage("/stories", displayLanguage)} className={navLinkClasses("/stories")}>
            Stories
          </Link>
          <Link href={withDisplayLanguage("/trending", displayLanguage)} className={navLinkClasses("/trending")}>
            Trending
          </Link>
          {/* Authenticated Desktop "My News" Grouped Dropdown */}
          {authenticated && (
            <div className="relative" ref={myNewsMenuRef}>
              <button
                type="button"
                onClick={() => setMyNewsMenuOpen(!myNewsMenuOpen)}
                onKeyDown={handleMyNewsKeyDown}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand cursor-pointer ${
                  isMyNewsActive()
                    ? "bg-brand-soft/40 text-brand font-bold"
                    : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
                }`}
                aria-expanded={myNewsMenuOpen}
                aria-haspopup="true"
                aria-label="My News navigation menu"
              >
                <span>My News</span>
                <ChevronDown className={`size-4 transition-transform ${myNewsMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {myNewsMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 rounded-xl border border-border bg-surface p-1.5 shadow-lg z-50 text-sm space-y-0.5"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <Link
                    href={withDisplayLanguage("/for-you", displayLanguage)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground-secondary hover:text-foreground hover:bg-surface-muted font-medium transition-colors"
                    role="menuitem"
                  >
                    <Sparkles className="size-4 text-brand" />
                    <span>For You</span>
                  </Link>
                  <Link
                    href={withDisplayLanguage("/bookmarks", displayLanguage)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground-secondary hover:text-foreground hover:bg-surface-muted font-medium transition-colors"
                    role="menuitem"
                  >
                    <Bookmark className="size-4 text-foreground-secondary" />
                    <span>Bookmarks</span>
                  </Link>
                  <Link
                    href={withDisplayLanguage("/following", displayLanguage)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground-secondary hover:text-foreground hover:bg-surface-muted font-medium transition-colors"
                    role="menuitem"
                  >
                    <Rss className="size-4 text-foreground-secondary" />
                    <span>Following</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {admin && (
            <Link href={withDisplayLanguage("/admin", displayLanguage)} className={navLinkClasses("/admin")}>
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Utility Controls (lg+ breakpoint) */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Search Icon Trigger */}
          <Link
            href={withDisplayLanguage("/search", displayLanguage)}
            className={`group h-9 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-foreground hover:bg-surface-muted hover:border-border-strong shadow-2xs transition-all focus-visible:outline-2 focus-visible:outline-brand ${
              isActive("/search") ? "text-brand bg-brand-soft/40" : ""
            }`}
            aria-label="Search news"
          >
            <Search className="size-4 text-foreground-muted group-hover:text-brand transition-colors" />
            <span>Search</span>
          </Link>

          {/* Language Selector */}
          <div className="relative flex items-center">
            <Globe className="pointer-events-none absolute left-2.5 size-4 text-foreground-muted z-10" />
            <label className="sr-only" htmlFor="desktop-display-language">
              Display language
            </label>
            <select
              id="desktop-display-language"
              value={displayLanguage ?? "original"}
              onChange={(e) => selectLanguage(e.target.value)}
              className="h-9 appearance-none rounded-xl border border-border bg-surface pl-8 pr-7 text-xs font-semibold text-foreground hover:bg-surface-muted hover:border-border-strong shadow-2xs transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-brand"
            >
              <option value="original">Original</option>
              <option value="en">English</option>
              <option value="si">සිංහල</option>
              <option value="ta">தமிழ்</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 size-3.5 text-foreground-muted z-10" />
          </div>

          {/* Notifications (Authenticated Only) */}
          {authenticated && <NotificationBadge displayLanguage={displayLanguage} />}

          {/* Auth Button or User Menu Dropdown */}
          {authenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onKeyDown={handleUserMenuKeyDown}
                className="h-9 flex items-center gap-2 rounded-xl border border-border bg-surface px-2.5 text-xs font-semibold text-foreground hover:bg-surface-muted hover:border-border-strong shadow-2xs transition-all focus-visible:outline-2 focus-visible:outline-brand cursor-pointer"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User account menu"
              >
                <div className="grid size-5 place-items-center rounded-full bg-brand-soft text-brand font-bold text-[10px] shrink-0">
                  {userDisplayName ? userDisplayName[0].toUpperCase() : <User className="size-3" />}
                </div>
                <span>{userDisplayName || "Account"}</span>
                <ChevronDown className={`size-3.5 text-foreground-muted transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface p-2 shadow-lg z-50 text-sm space-y-1"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-3 py-2 border-b border-border text-xs text-foreground-muted font-medium">
                    Signed in
                  </div>
                  <Link
                    href={withDisplayLanguage("/account", displayLanguage)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface-muted font-medium transition-colors"
                    role="menuitem"
                  >
                    <User className="size-4 text-foreground-secondary" />
                    <span>Account Settings</span>
                  </Link>
                  <Link
                    href={withDisplayLanguage("/account/notifications", displayLanguage)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface-muted font-medium transition-colors"
                    role="menuitem"
                  >
                    <Settings className="size-4 text-foreground-secondary" />
                    <span>Notifications</span>
                  </Link>
                  <Link
                    href={withDisplayLanguage("/account/privacy", displayLanguage)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface-muted font-medium transition-colors"
                    role="menuitem"
                  >
                    <Shield className="size-4 text-foreground-secondary" />
                    <span>Privacy & Telemetry</span>
                  </Link>
                  {admin && (
                    <Link
                      href={withDisplayLanguage("/admin", displayLanguage)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-brand hover:bg-brand-soft/30 font-bold transition-colors border-t border-border mt-1"
                      role="menuitem"
                    >
                      <Settings className="size-4 text-brand" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                  <Link
                    href="/auth/logout"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-danger hover:bg-danger-soft/60 font-medium transition-colors border-t border-border mt-1"
                    role="menuitem"
                  >
                    <LogOut className="size-4 text-danger" />
                    <span>Sign Out</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={withDisplayLanguage("/auth/login", displayLanguage)}
              className="inline-flex items-center justify-center rounded-lg bg-brand px-3.5 py-1.5 text-xs font-bold text-brand-foreground shadow-xs hover:bg-brand-hover transition-colors focus-visible:outline-2 focus-visible:outline-brand"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile Header Bar Controls (< lg) */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Quick Search */}
          <Link
            href={withDisplayLanguage("/search", displayLanguage)}
            className="p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-surface-muted"
            aria-label="Search"
          >
            <Search className="size-5" />
          </Link>

          {/* Quick Language Select */}
          <select
            id="mobile-header-language"
            aria-label="Display language"
            value={displayLanguage ?? "original"}
            onChange={(e) => selectLanguage(e.target.value)}
            className="rounded-lg border border-border-strong bg-surface px-2 py-1 text-xs font-bold text-foreground"
          >
            <option value="original">Original</option>
            <option value="en">EN</option>
            <option value="si">SI</option>
            <option value="ta">TA</option>
          </select>

          {/* Notifications (Authenticated Only) */}
          {authenticated && <NotificationBadge displayLanguage={displayLanguage} />}

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-foreground hover:bg-surface-muted cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sliding Drawer Overlay & Sheet */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-surface p-6 shadow-2xl z-50 overflow-y-auto space-y-6"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-8" aria-hidden="true">
                  <BrandLogo compact />
                </span>
                <span className="font-bold text-sm text-foreground">Ceylon News</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-surface-muted cursor-pointer"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Discovery Links */}
            <div className="space-y-1">
              <div className="px-3 text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">
                Discovery
              </div>
              <Link href={withDisplayLanguage("/", displayLanguage)} className={mobileNavLinkClasses("/")}>
                <Rss className="size-4" />
                <span>Latest News</span>
              </Link>
              <Link href={withDisplayLanguage("/stories", displayLanguage)} className={mobileNavLinkClasses("/stories")}>
                <Sparkles className="size-4" />
                <span>Stories</span>
              </Link>
              <Link href={withDisplayLanguage("/trending", displayLanguage)} className={mobileNavLinkClasses("/trending")}>
                <Rss className="size-4" />
                <span>Trending</span>
              </Link>
              <Link href={withDisplayLanguage("/search", displayLanguage)} className={mobileNavLinkClasses("/search")}>
                <Search className="size-4" />
                <span>Search</span>
              </Link>
              <Link href={withDisplayLanguage("/articles", displayLanguage)} className={mobileNavLinkClasses("/articles")}>
                <LibraryBig className="size-4" />
                <span>All reports</span>
              </Link>
              <Link href={withDisplayLanguage("/sources", displayLanguage)} className={mobileNavLinkClasses("/sources")}>
                <Building2 className="size-4" />
                <span>Publishers</span>
              </Link>
              <Link href={withDisplayLanguage("/guide", displayLanguage)} className={mobileNavLinkClasses("/guide")}>
                <BookOpen className="size-4" />
                <span>How to use Ceylon News</span>
              </Link>
            </div>

            {/* My News Links (if authenticated) */}
            {authenticated && (
              <div className="space-y-1 border-t border-border pt-4">
                <div className="px-3 text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">
                  My News
                </div>
                <Link href={withDisplayLanguage("/for-you", displayLanguage)} className={mobileNavLinkClasses("/for-you")}>
                  <Sparkles className="size-4" />
                  <span>For You</span>
                </Link>
                <Link href={withDisplayLanguage("/bookmarks", displayLanguage)} className={mobileNavLinkClasses("/bookmarks")}>
                  <Bookmark className="size-4" />
                  <span>Bookmarks</span>
                </Link>
                <Link href={withDisplayLanguage("/following", displayLanguage)} className={mobileNavLinkClasses("/following")}>
                  <Rss className="size-4" />
                  <span>Following</span>
                </Link>
              </div>
            )}

            {/* Account & Settings */}
            <div className="space-y-1 border-t border-border pt-4">
              <div className="px-3 text-xs font-bold uppercase tracking-wider text-foreground-muted mb-1">
                Account & Settings
              </div>
              {authenticated ? (
                <>
                  <Link href={withDisplayLanguage("/account", displayLanguage)} className={mobileNavLinkClasses("/account")}>
                    <User className="size-4" />
                    <span>Account Overview</span>
                  </Link>
                  <Link href={withDisplayLanguage("/account/notifications", displayLanguage)} className={mobileNavLinkClasses("/account/notifications")}>
                    <Settings className="size-4" />
                    <span>Notification Preferences</span>
                  </Link>
                  <Link href={withDisplayLanguage("/account/privacy", displayLanguage)} className={mobileNavLinkClasses("/account/privacy")}>
                    <Shield className="size-4" />
                    <span>Privacy & Telemetry</span>
                  </Link>
                  {admin && (
                    <Link href={withDisplayLanguage("/admin", displayLanguage)} className={mobileNavLinkClasses("/admin")}>
                      <Settings className="size-4 text-brand" />
                      <span className="text-brand font-bold">Admin Portal</span>
                    </Link>
                  )}
                </>
              ) : (
                <Link href={withDisplayLanguage("/auth/login", displayLanguage)} className={mobileNavLinkClasses("/auth/login")}>
                  <User className="size-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Language Selector Buttons */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="px-3 text-xs font-bold uppercase tracking-wider text-foreground-muted">
                Language
              </div>
              <div className="grid grid-cols-2 gap-2 px-1">
                <button
                  type="button"
                  onClick={() => selectLanguage("original")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border text-center cursor-pointer ${
                    !displayLanguage ? "bg-brand text-white border-brand" : "bg-surface border-border text-foreground"
                  }`}
                >
                  Original
                </button>
                <button
                  type="button"
                  onClick={() => selectLanguage("en")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border text-center cursor-pointer ${
                    displayLanguage === "en" ? "bg-brand text-white border-brand" : "bg-surface border-border text-foreground"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => selectLanguage("si")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border text-center cursor-pointer ${
                    displayLanguage === "si" ? "bg-brand text-white border-brand" : "bg-surface border-border text-foreground"
                  }`}
                >
                  සිංහල
                </button>
                <button
                  type="button"
                  onClick={() => selectLanguage("ta")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border text-center cursor-pointer ${
                    displayLanguage === "ta" ? "bg-brand text-white border-brand" : "bg-surface border-border text-foreground"
                  }`}
                >
                  தமிழ்
                </button>
              </div>
            </div>

            {/* Auth Action */}
            {authenticated && (
              <div className="border-t border-border pt-4">
                <Link
                  href="/auth/logout"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger-soft px-4 py-2 text-sm font-bold text-danger hover:bg-red-200 transition-colors"
                >
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
