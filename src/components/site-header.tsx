"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  X,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
  Bookmark,
  Sparkles,
  Rss,
} from "lucide-react";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import NotificationBadge from "./notifications/NotificationBadge";
import { BrandLogo } from "./brand-logo";
import { getAdminMe } from "@/lib/api/admin";
import {
  MobileNavigationDrawer,
  reduceMobileMenuState,
} from "./mobile-navigation";
import {
  HeaderGuestActions,
  HeaderLanguageControl,
  HeaderSearchAction,
} from "./header-guest-actions";
import { navigateToDisplayLanguage } from "@/lib/display-language-navigation";

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
  const displayLanguage = readDisplayLanguage(searchParams.get("lang"));

  const [clientAuth, setClientAuth] = useState<{
    isAuth: boolean;
    isAdmin: boolean;
    displayName: string | undefined;
  } | null>(null);

  const isAuth =
    clientAuth !== null ? clientAuth.isAuth : Boolean(authenticated);
  const isAdmin = clientAuth !== null ? clientAuth.isAdmin : Boolean(admin);
  const displayName =
    clientAuth !== null ? clientAuth.displayName : userDisplayName;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [myNewsMenuOpen, setMyNewsMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const myNewsMenuRef = useRef<HTMLDivElement>(null);

  // Listen to client-side auth state changes so UI immediately reflects sign-out or sign-in
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createBrowserSupabaseClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setClientAuth({
          isAuth: false,
          isAdmin: false,
          displayName: undefined,
        });
      } else if (session) {
        let name = userDisplayName;
        const userMeta = session.user?.user_metadata;
        const userEmail = session.user?.email;
        if (userMeta?.full_name || userMeta?.name) {
          name = userMeta.full_name || userMeta.name;
        } else if (userEmail) {
          name = userEmail.split("@")[0];
        }

        let adminStatus = false;
        if (session.access_token) {
          try {
            const res = await getAdminMe(session.access_token);
            adminStatus = res.admin === true;
          } catch {
            adminStatus = false;
          }
        }
        setClientAuth({
          isAuth: true,
          isAdmin: adminStatus,
          displayName: name,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [userDisplayName]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setClientAuth({ isAuth: false, isAdmin: false, displayName: undefined });
    try {
      if (isSupabaseConfigured()) {
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Sign out error", err);
    }
    window.location.assign(
      withDisplayLanguage("/auth/logout", displayLanguage),
    );
  };

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
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        myNewsMenuRef.current &&
        !myNewsMenuRef.current.contains(event.target as Node)
      ) {
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
    const currentPath = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
    navigateToDisplayLanguage(
      window.location,
      currentPath,
      value === "en" || value === "si" || value === "ta" ? value : "original",
    );
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
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-xs">
      <div className="hidden border-b border-border/70 bg-foreground text-slate-300 lg:block">
        <div className="mx-auto flex h-8 w-full max-w-7xl items-center justify-between px-8 text-[0.68rem] font-semibold tracking-wide">
          <p className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blue-400" />
            Independent Sri Lankan news intelligence
          </p>
          <nav
            aria-label="Utility navigation"
            className="flex items-center gap-5"
          >
            <Link
              href={withDisplayLanguage("/articles", displayLanguage)}
              className="hover:text-white"
            >
              All reports
            </Link>
            <Link
              href={withDisplayLanguage("/sources", displayLanguage)}
              className="hover:text-white"
            >
              Publishers
            </Link>
            <Link
              href={withDisplayLanguage("/guide", displayLanguage)}
              className="hover:text-white"
            >
              How to use Ceylon News
            </Link>
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
          <span className="w-24 sm:hidden">
            <BrandLogo priority />
          </span>
          <span className="hidden w-[7.25rem] sm:block">
            <BrandLogo priority />
          </span>
        </Link>

        {/* Desktop Primary Navigation (lg+ breakpoint to prevent wrapping on 768px/820px) */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-1"
        >
          <Link
            href={withDisplayLanguage("/articles", displayLanguage)}
            className={navLinkClasses("/articles")}
          >
            Latest news
          </Link>
          <Link
            href={withDisplayLanguage("/stories", displayLanguage)}
            className={navLinkClasses("/stories")}
          >
            Stories
          </Link>
          <Link
            href={withDisplayLanguage("/trending", displayLanguage)}
            className={navLinkClasses("/trending")}
          >
            Trending
          </Link>
          {/* Authenticated Desktop "My News" Grouped Dropdown */}
          {isAuth && (
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
                <ChevronDown
                  className={`size-4 transition-transform ${myNewsMenuOpen ? "rotate-180" : ""}`}
                />
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

          {isAdmin && (
            <Link
              href={withDisplayLanguage("/admin", displayLanguage)}
              className={navLinkClasses("/admin")}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Desktop Utility Controls (lg+ breakpoint) */}
        <div className="hidden lg:flex items-center gap-2">
          {isAuth ? (
            <>
              <HeaderSearchAction displayLanguage={displayLanguage} active={isActive("/search")} />
              <HeaderLanguageControl displayLanguage={displayLanguage} onLanguageChange={selectLanguage} />
            </>
          ) : (
            <HeaderGuestActions
              displayLanguage={displayLanguage}
              searchActive={isActive("/search")}
              onLanguageChange={selectLanguage}
            />
          )}

          {/* Notifications (Authenticated Only) */}
          {isAuth && <NotificationBadge displayLanguage={displayLanguage} />}

          {/* Auth Button or User Menu Dropdown */}
          {isAuth ? (
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
                  {displayName ? (
                    displayName[0].toUpperCase()
                  ) : (
                    <User className="size-3" />
                  )}
                </div>
                <span>{displayName || "Account"}</span>
                <ChevronDown
                  className={`size-3.5 text-foreground-muted transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
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
                    href={withDisplayLanguage(
                      "/account/notifications",
                      displayLanguage,
                    )}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface-muted font-medium transition-colors"
                    role="menuitem"
                  >
                    <Settings className="size-4 text-foreground-secondary" />
                    <span>Notifications</span>
                  </Link>
                  <Link
                    href={withDisplayLanguage(
                      "/account/privacy",
                      displayLanguage,
                    )}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-foreground hover:bg-surface-muted font-medium transition-colors"
                    role="menuitem"
                  >
                    <Shield className="size-4 text-foreground-secondary" />
                    <span>Privacy & Telemetry</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href={withDisplayLanguage("/admin", displayLanguage)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-brand hover:bg-brand-soft/30 font-bold transition-colors border-t border-border mt-1"
                      role="menuitem"
                    >
                      <Settings className="size-4 text-brand" />
                      <span>Admin Portal</span>
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-danger hover:bg-danger-soft/60 font-medium transition-colors border-t border-border mt-1 text-left cursor-pointer"
                    role="menuitem"
                  >
                    <LogOut className="size-4 text-danger" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Mobile Header Bar Controls (< lg) */}
        <div className="flex lg:hidden items-center">
          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((current) =>
                reduceMobileMenuState(current, "toggle"),
              )
            }
            className="inline-flex size-11 items-center justify-center rounded-lg text-foreground hover:bg-surface-muted cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>
      </div>
    </header>

    <MobileNavigationDrawer
      open={mobileMenuOpen}
      authenticated={isAuth}
      admin={isAdmin}
      pathname={pathname}
      displayLanguage={displayLanguage}
      onClose={() => setMobileMenuOpen(false)}
      onSignOut={handleSignOut}
      onLanguageChange={selectLanguage}
    />
  </>
);
}
