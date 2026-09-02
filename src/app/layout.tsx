import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getValidatedAuth } from "@/lib/auth";
import { getAdminMe } from "@/lib/api/admin";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sri Lanka News",
    template: "%s | Sri Lanka News",
  },
  description: "The latest headlines from Sri Lankan news publishers.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const auth = await getValidatedAuth();
  const authenticated = Boolean(auth);
  let admin = false;
  if (auth) {
    const { data } = await auth.supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      try { admin = (await getAdminMe(token)).admin; } catch { admin = false; }
    }
  }
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <Suspense><SiteHeader authenticated={authenticated} admin={admin} /></Suspense>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
