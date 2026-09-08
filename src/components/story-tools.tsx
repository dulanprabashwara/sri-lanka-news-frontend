"use client";

import { useRef, useState } from "react";
import { CoverageComparison } from "@/components/coverage-comparison";
import { StoryTimeline } from "@/components/story-timeline";
import { AskThisStory } from "@/components/ask-this-story";
import { StoryArticleReport } from "@/components/story-article-report";
import type { CoverageComparison as Coverage, DisplayLanguage, StoryTimeline as Timeline, Article } from "@/types/api";

type IntelligenceTab = "reports" | "coverage" | "timeline" | "ask";

interface StoryToolsProps {
  storyId: string;
  articles: Article[];
  coverage: Coverage | null;
  timeline: Timeline | null;
  displayLanguage?: DisplayLanguage;
}

export function StoryTools({
  storyId,
  articles,
  coverage,
  timeline,
  displayLanguage,
}: StoryToolsProps) {
  const [activeTab, setActiveTab] = useState<IntelligenceTab>("reports");
  const tabRefs = useRef<Record<IntelligenceTab, HTMLButtonElement | null>>({
    reports: null,
    coverage: null,
    timeline: null,
    ask: null,
  });

  const tabs: Array<{ id: IntelligenceTab; label: string; count?: number }> = [
    { id: "reports", label: "Publisher Reports", count: articles.length },
    { id: "coverage", label: "Coverage Comparison" },
    { id: "timeline", label: "Timeline", count: timeline?.events.length },
    { id: "ask", label: "Ask This Story (AI)" },
  ];

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      const nextTab = tabs[nextIndex].id;
      setActiveTab(nextTab);
      tabRefs.current[nextTab]?.focus();
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Navigation Tabs Header */}
      <div className="border-b border-border">
        <nav
          role="tablist"
          aria-label="Story Intelligence Tools"
          className="flex space-x-1 sm:space-x-3 overflow-x-auto pb-px scrollbar-none"
        >
          {tabs.map((tab, index) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[tab.id] = el; }}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
                  isSelected
                    ? "border-brand text-brand font-bold"
                    : "border-transparent text-foreground-secondary hover:border-border hover:text-foreground"
                }`.trim()}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isSelected
                        ? "bg-brand-soft text-brand"
                        : "bg-surface-muted text-foreground-secondary"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "reports" && (
          <div
            role="tabpanel"
            id="panel-reports"
            aria-labelledby="tab-reports"
            tabIndex={0}
            className="space-y-4 outline-none"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Constituent Publisher Reports
              </h2>
              <span className="text-xs font-medium text-foreground-secondary">
                {articles.length} {articles.length === 1 ? "report" : "reports"} linked
              </span>
            </div>
            {articles.length === 0 ? (
              <div
                className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-foreground-secondary"
                role="status"
              >
                No public reports are currently available for this story.
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-5">
                {articles.map((article) => (
                  <StoryArticleReport
                    key={article.id}
                    article={article}
                    displayLanguage={displayLanguage}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "coverage" && (
          <div
            role="tabpanel"
            id="panel-coverage"
            aria-labelledby="tab-coverage"
            tabIndex={0}
            className="outline-none"
          >
            <CoverageComparison
              coverage={coverage}
              displayLanguage={displayLanguage}
            />
          </div>
        )}

        {activeTab === "timeline" && (
          <div
            role="tabpanel"
            id="panel-timeline"
            aria-labelledby="tab-timeline"
            tabIndex={0}
            className="outline-none"
          >
            <StoryTimeline
              timeline={timeline}
              displayLanguage={displayLanguage}
            />
          </div>
        )}

        {activeTab === "ask" && (
          <div
            role="tabpanel"
            id="panel-ask"
            aria-labelledby="tab-ask"
            tabIndex={0}
            className="outline-none"
          >
            <AskThisStory
              storyId={storyId}
              displayLanguage={displayLanguage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
