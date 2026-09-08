"use client";

import { SourceIcon } from "@/components/source-icon";
import type { SourceSummary } from "@/types/api";

export function PublisherStrip({ sources }: { sources: SourceSummary[] }) {
  if (!sources.length) return null;
  return <section aria-label="Publishers in the news index" className="publisher-strip overflow-hidden rounded-xl border border-border bg-surface py-5" data-paused={false}>
    <div className="publisher-track flex w-max">{[0, 1].map(copy => <div key={copy} aria-hidden={copy === 1 ? true : undefined} className="publisher-track-copy flex shrink-0 items-center gap-8 pr-8">{sources.map(source => <span key={source.slug} className="flex items-center gap-3 whitespace-nowrap"><SourceIcon name={source.name} baseUrl={source.baseUrl} slug={source.slug} /><span className="text-sm font-semibold">{source.name}</span></span>)}</div>)}</div>
  </section>;
}
