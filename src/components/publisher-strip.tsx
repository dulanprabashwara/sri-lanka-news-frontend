"use client";

import { useState } from "react";
import { SourceIcon } from "@/components/source-icon";
import type { SourceSummary } from "@/types/api";

export function PublisherStrip({ sources }: { sources: SourceSummary[] }) {
  const [paused, setPaused] = useState(false);
  if (!sources.length) return null;
  return <section aria-label="Publishers in the news index" className="publisher-strip overflow-hidden rounded-2xl border border-border bg-surface py-6 sm:py-8" data-paused={paused}>
    <div className="mb-5 flex items-center justify-between gap-4 px-6"><p className="text-xs font-bold uppercase tracking-widest text-foreground-muted">Independent voices, one place</p><button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} className="text-xs font-semibold text-brand hover:underline">{paused ? "Resume animation" : "Pause animation"}</button></div>
    <div className="publisher-track flex w-max">{[0, 1].map(copy => <div key={copy} aria-hidden={copy === 1 ? true : undefined} className="publisher-track-copy flex shrink-0 items-center gap-8 sm:gap-12 pr-8 sm:pr-12">{sources.map(source => <span key={source.slug} className="flex items-center shrink-0" title={source.name}><SourceIcon name={source.name} baseUrl={source.baseUrl} slug={source.slug} size="xl" rounded="full" /></span>)}</div>)}</div>
  </section>;
}
