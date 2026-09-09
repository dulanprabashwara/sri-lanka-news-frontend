import Link from "next/link";
import { SourceIcon } from "@/components/source-icon";
import { withDisplayLanguage } from "@/lib/language";
import type { SourceSummary, DisplayLanguage } from "@/types/api";

export function PublisherDirectory({ sources, displayLanguage, showDirectoryLink = true }: { sources: SourceSummary[]; displayLanguage?: DisplayLanguage; showDirectoryLink?: boolean }) {
  if (!sources.length) return null;
  return <section aria-labelledby="publisher-directory-title" className="space-y-5 border-t border-border pt-8">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Explore the newsrooms</p><h2 id="publisher-directory-title" className="mt-2 font-serif text-3xl font-semibold">Go directly to a publisher.</h2><p className="mt-2 text-sm text-foreground-secondary">Browse each newsroom’s latest reporting and follow the sources you trust.</p></div>{showDirectoryLink && <Link href={withDisplayLanguage("/sources", displayLanguage)} className="shrink-0 text-sm font-bold text-brand hover:underline">View publisher directory →</Link>}</div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sources.map(source => <Link key={source.slug} href={withDisplayLanguage(`/source/${encodeURIComponent(source.slug)}`, displayLanguage)} className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-sm"><SourceIcon name={source.name} baseUrl={source.baseUrl} slug={source.slug} size="lg" rounded="full" /><span className="flex-1"><strong className="block font-serif text-lg font-semibold">{source.name}</strong><span className="mt-1 block text-xs text-foreground-muted">Latest reports and source details</span></span><span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-surface-muted text-brand transition-colors group-hover:bg-brand group-hover:text-white">→</span></Link>)}</div>
  </section>;
}
