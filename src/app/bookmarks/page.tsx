import Link from "next/link";
import { redirect } from "next/navigation";
import { BookmarkList } from "@/components/bookmark-list";
import { PageHeader } from "@/components/ui/page-header";
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
  const filter = (label: string, value?: BookmarkTargetType) => (
    <Link      href={withDisplayLanguage(value ? `/bookmarks?type=${value}` : "/bookmarks", displayLanguage)}      className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${type === value ? "border-brand bg-brand text-brand-foreground shadow-sm" : "border-border bg-surface text-foreground-secondary hover:border-border-strong hover:text-foreground"}`}
    >
      {label}
    </Link>
  );
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams({ page: String(nextPage) });
    if (type) query.set("type", type);
    return withDisplayLanguage(`/bookmarks?${query}`, displayLanguage);
  };
  return (
    <section className="space-y-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader        eyebrow="Your library"        title="Bookmarks"        filterSlot={<div className="flex flex-wrap gap-2 pt-2">{filter("All")}{filter("Articles", "ARTICLE")}{filter("Stories", "STORY")}</div>}
      />
      <BookmarkList initial={bookmarks.content} displayLanguage={displayLanguage} />
      {(page > 0 || !bookmarks.last) && (
        <nav aria-label="Bookmark pages" className="flex items-center justify-between border-t border-border pt-6 mt-8">
          {bookmarks.first ? <span /> : (
            <Link href={pageHref(page - 1)} className="inline-flex items-center justify-center font-bold text-sm text-foreground hover:text-brand transition-colors">
              &larr; Previous Page
            </Link>
          )}
          {bookmarks.last ? null : (
            <Link href={pageHref(page + 1)} className="inline-flex items-center justify-center font-bold text-sm text-foreground hover:text-brand transition-colors">
              Next Page &rarr;
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
