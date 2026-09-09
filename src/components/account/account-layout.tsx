import Link from "next/link";
import { ContainerWide } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage } from "@/types/api";
import {
  Bell,
  Bookmark,
  ChevronRight,
  Compass,
  HeartHandshake,
  Shield,
  User,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type AccountSection = "overview" | "notifications" | "privacy";

interface AccountLayoutProps {
  title: string;
  description?: string;
  activeSection: AccountSection;
  displayLanguage?: DisplayLanguage;
  children?: React.ReactNode;
}

export function AccountLayout({
  title,
  description,
  activeSection,
  displayLanguage,
  children,
}: AccountLayoutProps) {
  const navItems: Array<{
    id: AccountSection;
    label: string;
    description: string;
    href: string;
    icon: LucideIcon;
  }> = [
    {
      id: "overview",
      label: "Overview",
      description: "Profile and reading preferences",
      href: "/account",
      icon: User,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Alerts, topics, and quiet hours",
      href: "/account/notifications",
      icon: Bell,
    },
    {
      id: "privacy",
      label: "Privacy & Data",
      description: "Analytics and browser controls",
      href: "/account/privacy",
      icon: Shield,
    },
  ];

  const readingLinks: Array<{ label: string; href: string; icon: LucideIcon }> = [
    { label: "For You", href: "/for-you", icon: Compass },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { label: "Following", href: "/following", icon: UsersRound },
  ];

  return (
    <ContainerWide>
      <div className="grid items-start gap-7 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-10">
        <aside className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm lg:sticky lg:top-28">
          <div className="relative overflow-hidden bg-foreground px-5 py-6 text-white">
            <div className="absolute -right-8 -top-8 size-28 rounded-full bg-brand/25" aria-hidden="true" />
            <div className="relative">
              <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
                <HeartHandshake className="size-5" aria-hidden="true" />
              </span>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-blue-300">Your Ceylon News</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold">Account workspace</h2>
              <p className="mt-2 text-xs leading-5 text-slate-300">Shape how you read, follow, and receive reporting.</p>
            </div>
          </div>

          <nav aria-label="Account Settings" className="p-3">
            <p className="px-2 pb-2 pt-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-foreground-muted">Account settings</p>
            <div className="grid gap-1 sm:grid-cols-3 lg:grid-cols-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={withDisplayLanguage(item.href, displayLanguage)}
                    aria-current={isActive ? "page" : undefined}
                    className={`group flex min-w-0 items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                      isActive
                        ? "bg-brand text-white shadow-sm"
                        : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className={`size-4 shrink-0 ${isActive ? "text-white" : "text-foreground-muted group-hover:text-brand"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className={`mt-0.5 hidden text-[0.68rem] leading-4 lg:block ${isActive ? "text-blue-100" : "text-foreground-muted"}`}>
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight className={`hidden size-3.5 shrink-0 lg:block ${isActive ? "text-blue-100" : "text-border-strong"}`} />
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <p className="px-2 pb-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-foreground-muted">My reading</p>
              <div className="grid grid-cols-3 gap-1 lg:grid-cols-1">
                {readingLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={withDisplayLanguage(item.href, displayLanguage)}
                      className="flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-semibold text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-brand lg:justify-start lg:px-3"
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        <div className="min-w-0 space-y-6">
          <PageHeader
            eyebrow="Account"
            title={title}
            description={description ?? "Manage your account preferences and privacy."}
            className="lg:p-8"
          />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </ContainerWide>
  );
}
