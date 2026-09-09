import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/error-state";
import { BookmarkButton } from "@/components/bookmark-button";
import { TopicFollowList } from "@/components/topic-follow-list";
import { Surface } from "@/components/ui/surface";
import { ContainerReading } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { isPublisherPlaceholder } from "@/components/ui/publisher-image-utils";
import { ApiError } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getArticle, getArticleStory } from "@/lib/api/news";
import { getBookmarkStatus, getFollowBatchStatus, getPreferences, preferredDisplayLanguage } from "@/lib/api/user";
import { getAuthenticatedAccessToken } from "@/lib/auth";
import {
  formatCategory,
  formatLanguage,
  formatPublishedAt,
} from "@/lib/format";
import { articleContent, articleContentLanguage, readDisplayLanguage, storyTitle, translationLabel, withDisplayLanguage } from "@/lib/language";
import { ExternalLink, Layers, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Article Report" };

export default async function ArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { id } = await params;
  const explicitLanguage = readDisplayLanguage((await searchParams).lang);
  const accessToken = await getAuthenticatedAccessToken();
  let displayLanguage = explicitLanguage;
  if (!displayLanguage && accessToken) {
    try { displayLanguage = preferredDisplayLanguage((await getPreferences(accessToken)).preferredDisplayLanguage); } catch { /* Preference lookup is non-critical. */ }
  }
  const currentPath = withDisplayLanguage(`/article/${encodeURIComponent(id)}`, displayLanguage);
  let article;
  try {
    article = await getArticle(id, displayLanguage);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return <ErrorState message={getApiErrorMessage(error)} />;
  }

  let story = null;
  try {
    story = await getArticleStory(id, displayLanguage);
  } catch {
    // Story navigation is optional and must not prevent the Article from rendering.
  }

  let bookmarked = false;
  let followedTopics: string[] = [];
  if (accessToken) {
    try { bookmarked = (await getBookmarkStatus(accessToken, "ARTICLE", id)).bookmarked; } catch { /* Bookmark state is non-critical. */ }
    try { followedTopics = (await getFollowBatchStatus(accessToken, [], article.topics)).topics.filter((topic) => topic.followed).map((topic) => topic.topic); } catch { /* Follow state is non-critical. */ }
  }

  const content = articleContent(article);
  const contentLanguage = articleContentLanguage(article);
  const provenance = translationLabel(content.localization, article.originalLanguage);

  return (
    <ContainerReading className="space-y-8">
      {/* 1. Context Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={withDisplayLanguage("/", displayLanguage)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-foreground-secondary hover:text-brand transition-colors focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Latest News</span>
        </Link>
        <BookmarkButton
          type="ARTICLE"
          targetId={id}
          initialBookmarked={bookmarked}
          authenticated={Boolean(accessToken)}
          path={currentPath}
        />
      </div>

      {/* 2. Publisher Identity & Metadata */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <StatusBadge status="neutral" label="Single Report" />
          <Link
            href={withDisplayLanguage(`/source/${encodeURIComponent(article.source.slug)}`, displayLanguage)}
            className="font-bold text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand"
          >
            {article.source.name}
          </Link>
          <span className="text-foreground-secondary">•</span>
          <time dateTime={article.publishedAt} className="text-foreground-secondary font-mono">
            {formatPublishedAt(article.publishedAt)}
          </time>
          {article.originalLanguage && (
            <span className="rounded bg-surface-muted px-2 py-0.5 text-xs font-semibold text-foreground-secondary">
              {formatLanguage(article.originalLanguage)}
            </span>
          )}
          {article.category && (
            <span className="rounded bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
              {formatCategory(article.category)}
            </span>
          )}
        </div>

        {/* 3. Headline */}
        <h1 lang={contentLanguage} className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
          {content.title}
        </h1>

        {article.authors.length > 0 && (
          <p className="text-xs font-medium text-foreground-secondary">
            By <span className="text-foreground">{article.authors.join(", ")}</span>
          </p>
        )}
      </header>

      {/* 4. Lead Media */}
      {article.leadMedia?.type === "IMAGE" && article.leadMedia.url && !isPublisherPlaceholder(article.leadMedia.url) && (
        <div className="overflow-hidden rounded-2xl bg-surface-muted border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.leadMedia.url}
            alt={article.leadMedia.altText || content.title}
            className="w-full max-h-[480px] object-cover"
            loading="lazy"
          />
          {article.leadMedia.caption && (
            <p className="p-3 text-xs text-foreground-secondary bg-surface border-t border-border">
              {article.leadMedia.caption}
            </p>
          )}
        </div>
      )}

      {/* 5. Safe Summary */}
      {content.summary && (
        <Surface variant="bordered" className="p-6 sm:p-8 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
            Report Summary
          </h2>
          <p lang={contentLanguage} className="text-base sm:text-lg leading-relaxed text-foreground font-serif">
            {content.summary}
          </p>
          {provenance && (
            <p className="text-xs font-semibold text-brand pt-2 border-t border-border">
              {provenance} • Platform translation
            </p>
          )}
        </Surface>
      )}

      {/* 6. Connected Story Context (If present) */}
      {story && (
        <Surface variant="highlight" className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-brand" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              Part of a Multi-Source Story
            </span>
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {storyTitle(story)}
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-foreground-secondary">
            <span>{story.articleCount} reports</span>
            <span>•</span>
            <span>{story.sourceCount} publishers</span>
          </div>
          <div>
            <Link
              href={withDisplayLanguage(`/story/${encodeURIComponent(story.id)}`, displayLanguage)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-hover transition-colors focus-visible:outline-2 focus-visible:outline-brand"
            >
              <span>View Full Story Coverage</span>
              <span>→</span>
            </Link>
          </div>
        </Surface>
      )}

      {/* 7. Topics / Source Context */}
      {article.topics.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-secondary">
            Topics Mentioned
          </h3>
          <TopicFollowList
            topics={article.topics}
            followedTopics={followedTopics}
            authenticated={Boolean(accessToken)}
            path={currentPath}
          />
        </div>
      )}

      {/* 8. Original Publisher Boundary & Outbound CTA (Copyright Critical) */}
      <Surface variant="bordered" className="p-6 sm:p-8 space-y-4 border-l-4 border-l-brand">
        <h3 className="text-base font-bold text-foreground">
          Read full article on {article.source.name}
        </h3>
        <p className="text-xs leading-relaxed text-foreground-secondary">
          Full article content remains on the original publisher&apos;s website.
        </p>
        <div>
          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-hover transition-colors focus-visible:outline-2 focus-visible:outline-brand"
          >
            <span>Read Original Article</span>
            <ExternalLink className="size-4" />
          </a>
        </div>
      </Surface>
    </ContainerReading>
  );
}
