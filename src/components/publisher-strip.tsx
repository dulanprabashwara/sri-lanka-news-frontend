"use client";

import { useState } from "react";
import { SourceIcon } from "@/components/source-icon";
import type { SourceSummary } from "@/types/api";

export function PublisherStrip({ sources }: { sources: SourceSummary[] }) {
  const [paused, setPaused] = useState(false);
  if (!sources.length) return null;
  return (
    <section aria-label="Publishers in the news index" className="publisher-strip overflow-hidden rounded-xl border border-slate-700 bg-foreground py-6 text-white shadow-sm sm:py-8">
      <div className="mb-5 px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Across Sri Lanka’s newsrooms</p>
        <p className="mt-1 text-xs text-slate-400">Select a publisher above to explore its reporting.</p>
    <section aria-label="Publishers in the news index" className="publisher-strip overflow-hidden rounded-xl border border-slate-700 bg-foreground py-6 text-white shadow-sm sm:py-8" data-paused={paused}>
      <div className="mb-5 flex items-center justify-between gap-4 px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Across Sri Lanka’s newsrooms</p>
          <p className="mt-1 text-xs text-slate-400">Select a publisher above to explore its reporting.</p>
        </div>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className="rounded-md border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-blue-300 hover:text-white cursor-pointer"
        >
          {paused ? "Resume" : "Pause"} animation
        </button>
      </div>
      <div className="publisher-track flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1 ? true : undefined} className="publisher-track-copy flex shrink-0 items-center gap-8 sm:gap-12 pr-8 sm:pr-12">
            {sources.map((source) => (
              <span key={source.slug} className="flex items-center shrink-0" title={source.name}>
                <SourceIcon name={source.name} baseUrl={source.baseUrl} slug={source.slug} size="xl" rounded="full" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
