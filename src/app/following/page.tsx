import Link from "next/link";
import { redirect } from "next/navigation";
import { FollowingList } from "@/components/following-list";
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
  const filter = (label: string, value?: FollowTargetType) => <Link href={href(value)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${type === value ? "border-teal-800 bg-teal-800 text-white" : "border-slate-300 bg-white text-slate-700"}`}>{label}</Link>;
  return <section><p className="eyebrow">Your interests</p><h1 className="page-title">Following</h1><div className="my-7 flex gap-2">{filter("All")}{filter("Sources", "SOURCE")}{filter("Topics", "TOPIC")}</div><FollowingList initial={follows.content} displayLanguage={displayLanguage} />{follows.content.length === 0 ? <Link href={withDisplayLanguage("/", displayLanguage)} className="mt-5 inline-flex font-semibold text-teal-800">Browse latest news</Link> : null}<nav aria-label="Following pages" className="mt-8 flex justify-between">{follows.first ? <span /> : <Link href={href(type, page - 1)} className="font-semibold text-teal-800">Previous</Link>}{follows.last ? null : <Link href={href(type, page + 1)} className="font-semibold text-teal-800">Next</Link>}</nav></section>;
}
