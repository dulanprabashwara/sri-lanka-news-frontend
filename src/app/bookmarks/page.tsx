import Link from "next/link";
import { redirect } from "next/navigation";
import { BookmarkList } from "@/components/bookmark-list";
import { getAuthenticatedAccessToken } from "@/lib/auth";
import { getPreferences, listBookmarks, resolveDisplayLanguage } from "@/lib/api/user";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import type { BookmarkTargetType } from "@/types/api";

export const dynamic = "force-dynamic";

export default async function BookmarksPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[]; type?: string; page?: string }> }) {
  const parameters = await searchParams;
  const explicitLanguage = readDisplayLanguage(parameters.lang);
  const accessToken = await getAuthenticatedAccessToken();
  if (!accessToken) {
    const path = withDisplayLanguage("/bookmarks", explicitLanguage);
    redirect(`/auth/login?next=${encodeURIComponent(path)}`);
  }
  const preferences = explicitLanguage ? null : await getPreferences(accessToken);
  const displayLanguage = resolveDisplayLanguage(explicitLanguage, preferences?.preferredDisplayLanguage);
  const type: BookmarkTargetType | undefined = parameters.type === "ARTICLE" || parameters.type === "STORY" ? parameters.type : undefined;
  const requestedPage = Number.parseInt(parameters.page ?? "0", 10);
  const page = Number.isFinite(requestedPage) && requestedPage >= 0 ? requestedPage : 0;
  const bookmarks = await listBookmarks(accessToken, { page, type, displayLanguage });
  const filter = (label: string, value?: BookmarkTargetType) => <Link href={withDisplayLanguage(value ? `/bookmarks?type=${value}` : "/bookmarks", displayLanguage)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${type === value ? "border-teal-800 bg-teal-800 text-white" : "border-slate-300 bg-white text-slate-700"}`}>{label}</Link>;
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams({ page: String(nextPage) });
    if (type) query.set("type", type);
    return withDisplayLanguage(`/bookmarks?${query}`, displayLanguage);
  };
  return <section><p className="eyebrow">Your library</p><h1 className="page-title">Bookmarks</h1><div className="my-7 flex gap-2">{filter("All")}{filter("Articles", "ARTICLE")}{filter("Stories", "STORY")}</div><BookmarkList initial={bookmarks.content} displayLanguage={displayLanguage} />{bookmarks.content.length === 0 ? <div className="mt-5 flex gap-4 text-sm font-semibold"><Link href={withDisplayLanguage("/", displayLanguage)} className="text-teal-800">Browse latest news</Link><Link href={withDisplayLanguage("/stories", displayLanguage)} className="text-teal-800">Browse stories</Link></div> : null}<nav aria-label="Bookmark pages" className="mt-8 flex justify-between">{bookmarks.first ? <span /> : <Link href={pageHref(page - 1)} className="font-semibold text-teal-800">Previous</Link>}{bookmarks.last ? null : <Link href={pageHref(page + 1)} className="font-semibold text-teal-800">Next</Link>}</nav></section>;
}
