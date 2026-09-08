import type { Metadata } from "next";
import {
  Inter,
  Noto_Sans_Sinhala,
  Noto_Sans_Tamil,
  Source_Serif_4,
} from "next/font/google";
import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getValidatedAuth } from "@/lib/auth";
import { getAdminMe } from "@/lib/api/admin";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { MainContentWrapper } from "@/components/ui/main-content-wrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansSinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  variable: "--font-noto-sinhala",
  display: "swap",
  preload: false,
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-tamil",
  display: "swap",
  preload: false,
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

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
  if (auth) {
    const { data } = await auth.supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      try { admin = (await getAdminMe(token)).admin; } catch { admin = false; }
    }
  }
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSansSinhala.variable} ${notoSansTamil.variable} ${sourceSerif.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <Suspense><SiteHeader authenticated={authenticated} admin={admin} /></Suspense>
        <main className="w-full flex-1">
          <MainContentWrapper>{children}</MainContentWrapper>
        </main>
        <SiteFooter />
        <Suspense fallback={null}><AnalyticsTracker /></Suspense>
      </body>
    </html>
  );
}
