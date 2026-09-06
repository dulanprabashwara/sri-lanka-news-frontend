import Link from "next/link";
import { redirect } from "next/navigation";
import { FollowingList } from "@/components/following-list";
import { PageHeader } from "@/components/ui/page-header";
import { getAuthenticatedAccessToken } from "@/lib/auth";
import { listFollows } from "@/lib/api/user";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";
import type { FollowTargetType } from "@/types/api";

export const dynamic = "force-dynamic";

export default async function FollowingPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[]; type?: string; page?: string }> }) {
  const parameters = await searchParams;
  const displayLanguage = readDisplayLanguage(parameters.lang);
  const accessToken = await getAuthenticatedAccessToken();
  if (!accessToken) redirect(`/auth/login?next=${encodeURIComponent(withDisplayLanguage("/following", displayLanguage))}`);
  const type: FollowTargetType | undefined = parameters.type === "SOURCE" || parameters.type === "TOPIC" ? parameters.type : undefined;
  const requestedPage = Number.parseInt(parameters.page ?? "0", 10);
  const page = Number.isFinite(requestedPage) && requestedPage >= 0 ? requestedPage : 0;
  const follows = await listFollows(accessToken, { page, type });
  const href = (selected?: FollowTargetType, selectedPage = 0) => {
    const query = new URLSearchParams();
    if (selected) query.set("type", selected);
    if (selectedPage > 0) query.set("page", String(selectedPage));
    return withDisplayLanguage(`/following${query.size ? `?${query}` : ""}`, displayLanguage);
  };
  const filter = (label: string, value?: FollowTargetType) => (
    <Link      href={href(value)}      className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${type === value ? "border-brand bg-brand text-brand-foreground shadow-sm" : "border-border bg-surface text-foreground-secondary hover:border-border-strong hover:text-foreground"}`}
    >
      {label}
    </Link>
  );
  return (
    <section className="space-y-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader        eyebrow="Your interests"        title="Following"        filterSlot={<div className="flex flex-wrap gap-2 pt-2">{filter("All")}{filter("Sources", "SOURCE")}{filter("Topics", "TOPIC")}</div>}
      />
      <FollowingList initial={follows.content} displayLanguage={displayLanguage} />
      {(page > 0 || !follows.last) && (
        <nav aria-label="Following pages" className="flex items-center justify-between border-t border-border pt-6 mt-8">
          {follows.first ? <span /> : (
            <Link href={href(type, page - 1)} className="inline-flex items-center justify-center font-bold text-sm text-foreground hover:text-brand transition-colors">
              &larr; Previous Page
            </Link>
          )}
          {follows.last ? null : (
            <Link href={href(type, page + 1)} className="inline-flex items-center justify-center font-bold text-sm text-foreground hover:text-brand transition-colors">
              Next Page &rarr;
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
