import { redirect } from "next/navigation";
import Link from "next/link";
import { AccountLayout } from "@/components/account/account-layout";
import { PreferencesForm } from "@/components/preferences-form";
import { Surface } from "@/components/ui/surface";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { getCurrentUser } from "@/lib/api/me";
import { getPreferences } from "@/lib/api/user";
import { getValidatedAuth } from "@/lib/auth";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import { Bell, Bookmark, Shield, UserCheck, LogOut } from "lucide-react";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const parameters = await searchParams;
  const language = readDisplayLanguage(parameters.lang);
  const auth = await getValidatedAuth();
  if (!auth) {
    const accountPath = withDisplayLanguage("/account", language);
    redirect(withDisplayLanguage(`/auth/login?next=${encodeURIComponent(accountPath)}`, language));
  }
  const { data: sessionData } = await auth.supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) redirect("/auth/login?next=/account");

  let user;
  let preferences;
  try {
    [user, preferences] = await Promise.all([getCurrentUser(accessToken), getPreferences(accessToken)]);
  } catch (cause) {
    if (cause instanceof ApiError && cause.status === 401) redirect("/auth/login?next=/account");
    throw cause;
  }

  return (
    <AccountLayout
      title="Account Overview"
      description="Manage your account preferences, notifications, and privacy options."
      activeSection="overview"
      displayLanguage={language}
    >
      <div className="space-y-6">
        {/* Account Identity Card */}
        <Surface variant="elevated" className="p-6 space-y-4">
          <SectionHeader
            title="Signed-In Account"
            description="Your active platform identity and authorization status."
          />
          <div className="flex items-center gap-3 pt-2">
            <div className="p-2.5 rounded-full bg-brand-soft text-brand-primary">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                Account Email
              </p>
              <p className="text-base font-bold text-foreground">
                {user.email ?? "Signed-in User"}
              </p>
            </div>
          </div>
        </Surface>

        {/* Settings Shortcuts */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Surface variant="elevated" className="p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-brand-primary font-bold text-sm mb-1">
                <Bell className="w-4 h-4" />
                Notification Preferences
              </div>
              <p className="text-xs text-foreground-secondary">
                Configure email, in-app alerts, followed topics, and quiet hours.
              </p>
            </div>
            <Link
              href={withDisplayLanguage("/account/notifications", language)}
              className="inline-flex items-center text-xs font-bold text-brand-primary hover:underline pt-2"
            >
              Manage Notifications →
            </Link>
          </Surface>

          <Surface variant="elevated" className="p-5 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-brand-primary font-bold text-sm mb-1">
                <Shield className="w-4 h-4" />
                Privacy & Data
              </div>
              <p className="text-xs text-foreground-secondary">
                Control usage analytics preferences and browser privacy signals.
              </p>
            </div>
            <Link
              href={withDisplayLanguage("/account/privacy", language)}
              className="inline-flex items-center text-xs font-bold text-brand-primary hover:underline pt-2"
            >
              Privacy Options →
            </Link>
          </Surface>
        </div>

        {/* Content Destination Shortcuts */}
        <Surface variant="muted" className="p-5 space-y-3">
          <SectionHeader
            title="Personal Reading Shortcuts"
            description="Quick links to your saved content and followed entities."
          />
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={withDisplayLanguage("/bookmarks", language)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors"
            >
              <Bookmark className="w-4 h-4 text-brand-primary" />
              View Bookmarks
            </Link>
            <Link
              href={withDisplayLanguage("/following", language)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-sm font-semibold text-foreground hover:bg-surface-muted transition-colors"
            >
              <UserCheck className="w-4 h-4 text-brand-primary" />
              Followed Topics & Sources
            </Link>
          </div>
        </Surface>

        {/* Display & Category Preferences */}
        <Surface variant="elevated" className="p-6">
          <PreferencesForm initial={preferences} />
        </Surface>

        {/* Sign Out */}
        <div className="pt-2 flex justify-end">
          <form action={`/auth/logout?next=${encodeURIComponent(withDisplayLanguage("/", language))}`} method="post">
            <Button variant="outline" type="submit" className="gap-2 text-foreground-secondary hover:text-foreground">
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </AccountLayout>
  );
}
