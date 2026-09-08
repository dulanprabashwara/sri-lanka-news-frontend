import Link from "next/link";
import { SourceIcon } from "@/components/source-icon";
import { withDisplayLanguage } from "@/lib/language";
import type { SourceSummary, DisplayLanguage } from "@/types/api";

export function PublisherDirectory({ sources, displayLanguage }: { sources: SourceSummary[]; displayLanguage?: DisplayLanguage }) {
  if (!sources.length) return null;
  return <section aria-labelledby="publisher-directory-title" className="space-y-5 border-t border-border pt-8">
    <div><p className="eyebrow">Explore the newsrooms</p><h2 id="publisher-directory-title" className="mt-2 font-serif text-3xl font-semibold">Your sources. Their reporting.</h2><p className="mt-2 text-sm text-foreground-secondary">Choose a publisher to browse its latest reports and follow its coverage.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sources.map(source => <Link key={source.slug} href={withDisplayLanguage(`/source/${encodeURIComponent(source.slug)}`, displayLanguage)} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand hover:bg-brand-soft"><SourceIcon name={source.name} baseUrl={source.baseUrl} slug={source.slug} size="lg" rounded="full" /><span className="flex-1"><strong className="block text-sm">{source.name}</strong><span className="mt-1 block text-xs text-foreground-muted">Explore publisher coverage</span></span><span aria-hidden="true" className="text-brand">→</span></Link>)}</div>
  </section>;
}
