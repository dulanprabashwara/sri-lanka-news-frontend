import { PageHeader } from "@/components/ui/page-header";
import { PublisherDirectory } from "@/components/publisher-directory";
import { ErrorState } from "@/components/error-state";
import { getSources } from "@/lib/api/news";
import { getApiErrorMessage } from "@/lib/api/errors";
import { readDisplayLanguage } from "@/lib/language";

export const dynamic = "force-dynamic";
export const metadata = { title: "Publishers" };
export default async function SourcesPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const lang = readDisplayLanguage((await searchParams).lang);
  let sources;
  try { sources = await getSources(); } catch (error) { return <ErrorState message={getApiErrorMessage(error)} />; }
  const ACTIVE_SLUGS = ["lankadeepa", "divaina", "the-island", "newswire", "hiru-news", "hiru-news-sinhala", "dailymirror", "daily-mirror", "newsfirst"];
  const activeSources = sources.filter(s => ACTIVE_SLUGS.includes(s.slug));
  return <div className="space-y-8"><PageHeader eyebrow="The source directory" title="Meet the newsrooms." description="Reporting belongs to its publishers. Explore their latest coverage, visit the original website, or follow a source." /><PublisherDirectory sources={activeSources.length ? activeSources : sources} displayLanguage={lang} />{!sources.length && <p>No publishers are available yet.</p>}</div>;
}
