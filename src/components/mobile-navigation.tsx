"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  Bookmark,
  Building2,
  Globe,
  LibraryBig,
  LogOut,
  Rss,
  Search,
  Settings,
  Shield,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage } from "@/types/api";

const emptySubscribe = () => () => {};

export type MobileMenuAction = "toggle" | "escape" | "backdrop" | "route";

export function reduceMobileMenuState(
  current: boolean,
  action: MobileMenuAction,
): boolean {
  return action === "toggle" ? !current : false;
}

interface PageScrollLockDocument {
  body: {
    style: Pick<
      CSSStyleDeclaration,
      "overflow" | "position" | "top" | "width"
    >;
  };
  documentElement: {
    style: Pick<CSSStyleDeclaration, "overflow" | "overscrollBehavior">;
  };
}

interface PageScrollLockViewport {
  scrollY: number;
  scrollTo: (x: number, y: number) => void;
}

export function lockPageScroll(
  pageDocument: PageScrollLockDocument = document,
  viewport: PageScrollLockViewport = window,
): () => void {
  const bodyStyle = pageDocument.body.style;
  const rootStyle = pageDocument.documentElement.style;
  const scrollY = viewport.scrollY ?? 0;
  const previous = {
    rootOverflow: rootStyle.overflow,
    rootOverscrollBehavior: rootStyle.overscrollBehavior,
    bodyOverflow: bodyStyle.overflow,
    bodyPosition: bodyStyle.position,
    bodyTop: bodyStyle.top,
    bodyWidth: bodyStyle.width,
  };

  rootStyle.overflow = "hidden";
  rootStyle.overscrollBehavior = "none";
  bodyStyle.overflow = "hidden";
  bodyStyle.position = "fixed";
  bodyStyle.top = `-${scrollY}px`;
  bodyStyle.width = "100%";

  return () => {
    rootStyle.overflow = previous.rootOverflow;
    rootStyle.overscrollBehavior = previous.rootOverscrollBehavior;
    bodyStyle.overflow = previous.bodyOverflow;
    bodyStyle.position = previous.bodyPosition;
    bodyStyle.top = previous.bodyTop;
    bodyStyle.width = previous.bodyWidth;
    if (typeof viewport.scrollTo === "function") {
      viewport.scrollTo(0, scrollY);
    }
  };
}

interface MobileNavigationDrawerProps {
  open: boolean;
  authenticated: boolean;
  admin: boolean;
  pathname?: string;
  displayLanguage?: DisplayLanguage;
  onClose: () => void;
  onSignOut: () => void;
  onLanguageChange: (language: "original" | DisplayLanguage) => void;
}

export function MobileNavigationDrawer({
  open,
  authenticated,
  admin,
  pathname = "",
  displayLanguage,
  onClose,
  onSignOut,
  onLanguageChange,
}: MobileNavigationDrawerProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const unlockPageScroll = lockPageScroll();
    closeButtonRef.current?.focus({ preventScroll: true });
    return unlockPageScroll;
  }, [open]);

  if (!open) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);
  const linkClass = (href: string) =>
    `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
      isActive(href)
        ? "bg-brand-soft/50 text-brand"
        : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
    }`;

  function handlePanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const controls = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), select:not([disabled])',
      ),
    );
    if (controls.length === 0) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const link = (
    href: string,
    label: string,
    Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>,
  ) => (
    <Link
      href={withDisplayLanguage(href, displayLanguage)}
      className={linkClass(href)}
      onClick={onClose}
    >
      <Icon className="size-4.5 shrink-0" aria-hidden={true} />
      <span>{label}</span>
    </Link>
  );

  const drawerContent = (
    <div id="mobile-navigation" className="fixed inset-0 z-50 flex overscroll-none lg:hidden">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-xs touch-none"
        onClick={onClose}
        aria-label="Close navigation menu"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-navigation-title"
        onKeyDown={handlePanelKeyDown}
        className="relative ml-auto flex h-dvh w-[min(22rem,calc(100%-1.25rem))] flex-col overflow-y-auto overscroll-contain bg-surface px-4 py-5 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <Link
            href={withDisplayLanguage("/", displayLanguage)}
            onClick={onClose}
            className="block w-28 rounded-md"
            aria-label="Ceylon News home"
          >
            <BrandLogo priority />
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 py-5">
          <section aria-labelledby="mobile-navigation-title">
            <h2 id="mobile-navigation-title" className="mb-1 px-3 text-xs font-bold uppercase tracking-wider text-foreground-muted">
              Discover
            </h2>
            <nav aria-label="Mobile primary navigation" className="space-y-1">
              {link("/articles", "Latest news", Rss)}
              {link("/stories", "Stories", Sparkles)}
              {link("/trending", "Trending", LibraryBig)}
              {link("/search", "Search", Search)}
              {link("/sources", "Publishers", Building2)}
              {link("/guide", "How to use Ceylon News", BookOpen)}
            </nav>
          </section>

          {authenticated && (
            <section className="border-t border-border pt-4" aria-labelledby="mobile-my-news-title">
              <h2 id="mobile-my-news-title" className="mb-1 px-3 text-xs font-bold uppercase tracking-wider text-foreground-muted">
                My News
              </h2>
              <nav aria-label="Mobile personalized navigation" className="space-y-1">
                {link("/for-you", "For You", Sparkles)}
                {link("/bookmarks", "Bookmarks", Bookmark)}
                {link("/following", "Following", Rss)}
                {link("/notifications", "Notifications", Bell)}
              </nav>
            </section>
          )}

          <section className="border-t border-border pt-4" aria-labelledby="mobile-account-title">
            <h2 id="mobile-account-title" className="mb-1 px-3 text-xs font-bold uppercase tracking-wider text-foreground-muted">
              Account &amp; settings
            </h2>
            <nav aria-label="Mobile account navigation" className="space-y-1">
              {authenticated ? (
                <>
                  {link("/account", "Account settings", User)}
                  {link("/account/notifications", "Notification preferences", Settings)}
                  {link("/account/privacy", "Privacy & telemetry", Shield)}
                  {admin && link("/admin", "Admin portal", Shield)}
                </>
              ) : (
                link("/auth/login", "Sign in", User)
              )}
            </nav>
          </section>

          <section className="border-t border-border pt-4" aria-labelledby="mobile-language-title">
            <h2 id="mobile-language-title" className="mb-2 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider text-foreground-muted">
              <Globe className="size-4" aria-hidden="true" /> Language
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {(["original", "en", "si", "ta"] as const).map((language) => {
                const selected = language === (displayLanguage ?? "original");
                const labels = { original: "Original", en: "English", si: "සිංහල", ta: "தமிழ்" };
                return (
                  <button
                    key={language}
                    type="button"
                    onClick={() => {
                      onLanguageChange(language);
                      onClose();
                    }}
                    aria-pressed={selected}
                    className={`min-h-11 rounded-lg border px-3 py-2 text-xs font-bold ${
                      selected
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-surface text-foreground hover:border-brand"
                    }`}
                  >
                    {labels[language]}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {authenticated && (
          <button
            type="button"
            onClick={onSignOut}
            className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-danger-border bg-danger-soft px-4 py-2 text-sm font-bold text-danger hover:bg-red-200"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        )}
      </div>
    </div>
  );

  if (!mounted || typeof document === "undefined") {
    return drawerContent;
  }

  return createPortal(drawerContent, document.body);
}
