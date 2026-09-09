import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getValidatedAuth } from "@/lib/auth";
import { getAdminMe } from "@/lib/api/admin";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { MainContentWrapper } from "@/components/ui/main-content-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ceylon News",
    template: "%s | Ceylon News",
  },
  description: "Independent, multilingual news intelligence from Sri Lankan publishers.",
  applicationName: "Ceylon News",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const auth = await getValidatedAuth();
  const authenticated = Boolean(auth);
  let admin = false;
  let userDisplayName;
  if (auth) {
    const { data } = await auth.supabase.auth.getSession();
    const token = data.session?.access_token;
    const userMeta = data.session?.user?.user_metadata;
    const userEmail = data.session?.user?.email;
    if (userMeta?.full_name || userMeta?.name) {
      userDisplayName = userMeta.full_name || userMeta.name;
    } else if (userEmail) {
      userDisplayName = userEmail.split('@')[0];
    }
    if (token) {
      try { admin = (await getAdminMe(token)).admin; } catch { admin = false; }
    }
  }
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <a href="#main-content" className="sr-only z-50 rounded-md bg-brand px-4 py-2 font-bold text-white focus:fixed focus:left-4 focus:top-4 focus:not-sr-only">Skip to main content</a>
        <Suspense><SiteHeader authenticated={authenticated} admin={admin} userDisplayName={userDisplayName} /></Suspense>
        <main id="main-content" className="w-full flex-1" tabIndex={-1}>
          <MainContentWrapper>{children}</MainContentWrapper>
        </main>
        <SiteFooter />
        <Suspense fallback={null}><AnalyticsTracker /></Suspense>
      </body>
    </html>
  );
}
