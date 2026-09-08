import Link from "next/link";
import { ContainerContent } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage } from "@/types/api";
import { User, Bell, Shield } from "lucide-react";

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
    href: string;
    icon: typeof User;
  }> = [
    {
      id: "overview",
      label: "Overview",
      href: "/account",
      icon: User,
    },
    {
      id: "notifications",
      label: "Notifications",
      href: "/account/notifications",
      icon: Bell,
    },
    {
      id: "privacy",
      label: "Privacy & Data",
      href: "/account/privacy",
      icon: Shield,
    },
  ];

  return (
    <ContainerContent className="space-y-6">
      <PageHeader
        eyebrow="ACCOUNT"
        title={title}
        description={description ?? "Manage your account preferences and privacy."}
      />

      <div className="grid gap-6 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_1fr] items-start">
        {/* Navigation Sidebar / Mobile Navigation */}
        <Surface variant="elevated" className="p-2 sm:p-3">
          <nav aria-label="Account Settings">
            {/* Desktop Navigation List */}
            <div className="hidden md:flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={withDisplayLanguage(item.href, displayLanguage)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-soft text-brand font-bold"
                        : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-brand" : "text-foreground-secondary"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Navigation Tabs */}
            <div className="flex md:hidden overflow-x-auto border-b border-border pb-1 space-x-1 scrollbar-none">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={withDisplayLanguage(item.href, displayLanguage)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-semibold rounded-md border-b-2 transition-colors ${
                      isActive
                        ? "border-brand text-brand font-bold bg-brand-soft/50"
                        : "border-transparent text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-brand" : "text-foreground-secondary"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </Surface>

        {/* Content Area */}
        <main className="min-w-0">{children}</main>
      </div>
    </ContainerContent>
  );
}
