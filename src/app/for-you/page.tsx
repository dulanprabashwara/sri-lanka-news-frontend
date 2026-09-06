import Link from "next/link";
import { redirect } from "next/navigation";
import { ErrorState } from "@/components/error-state";
import { ForYouFeed } from "@/components/for-you-feed";
import { PageHeader } from "@/components/ui/page-header";
import { Surface } from "@/components/ui/surface";
import { ApiError } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getForYouFeed, getPreferences, resolveDisplayLanguage } from "@/lib/api/user";
import { getAuthenticatedAccessToken } from "@/lib/auth";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ForYouPage({ searchParams }: {
  searchParams: Promise<{ lang?: string | string[]; page?: string }>;
}) {
  const parameters = await searchParams;
  const explicitLanguage = readDisplayLanguage(parameters.lang);
  const currentPath = withDisplayLanguage("/for-you", explicitLanguage);
  const accessToken = await getAuthenticatedAccessToken();
  if (!accessToken) redirect(`/auth/login?next=${encodeURIComponent(currentPath)}`);

  const requestedPage = Number.parseInt(Array.isArray(parameters.page) ? parameters.page[0] ?? "0" : parameters.page ?? "0", 10);
  const page = Number.isFinite(requestedPage) && requestedPage >= 0 ? requestedPage : 0;
  let displayLanguage = explicitLanguage;
  let feed: Awaited<ReturnType<typeof getForYouFeed>> | undefined;
  let loadError: unknown;
  try {
    if (!displayLanguage) {
      displayLanguage = resolveDisplayLanguage(undefined, (await getPreferences(accessToken)).preferredDisplayLanguage);
    }
    feed = await getForYouFeed(accessToken, { page, displayLanguage });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(`/auth/login?next=${encodeURIComponent(currentPath)}`);
    loadError = error;
  }
  if (!explicitLanguage && displayLanguage) {
    redirect(withDisplayLanguage(`/for-you${page > 0 ? `?page=${page}` : ""}`, displayLanguage));
  }
  if (!feed) return <section className="space-y-8"><header><p className="eyebrow">Your interests</p><h1 className="page-title">For You</h1></header><ErrorState message={getApiErrorMessage(loadError)} /></section>;
  const pageHref = (nextPage: number) => withDisplayLanguage(
    `/for-you${nextPage > 0 ? `?page=${nextPage}` : ""}`, displayLanguage);
  return <section className="space-y-8">
    <header className="max-w-3xl"><p className="eyebrow">Your interests</p><h1 className="page-title">For You</h1><p className="page-intro">Based on the sources, topics, and categories you&apos;ve chosen.</p></header>
    {!feed.personalization.personalized ? <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><p>Your feed is currently showing recent news. Follow sources or topics and choose preferred categories to personalize it.</p><div className="mt-3 flex flex-wrap gap-4 font-semibold"><Link href={withDisplayLanguage("/account", displayLanguage)} className="underline">Manage preferences</Link><Link href={withDisplayLanguage("/following", displayLanguage)} className="underline">Manage following</Link><Link href={withDisplayLanguage("/", displayLanguage)} className="underline">Latest news</Link></div></aside> : null}
    <ForYouFeed items={feed.content} displayLanguage={displayLanguage} />
    <nav aria-label="For You pages" className="flex justify-between">{feed.first ? <span /> : <Link href={pageHref(page - 1)} className="font-semibold text-teal-800">Previous</Link>}{feed.last ? null : <Link href={pageHref(page + 1)} className="font-semibold text-teal-800">Next</Link>}</nav>
  </section>;
}
