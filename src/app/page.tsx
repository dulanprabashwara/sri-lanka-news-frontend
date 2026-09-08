import Link from "next/link";
import { ArrowRight, BarChart3, Clock3, Globe2, Layers3, Newspaper, Search } from "lucide-react";
import { CategoryNavigation } from "@/components/category-navigation";
import { SourceIcon } from "@/components/source-icon";
import { PublisherDirectory } from "@/components/publisher-directory";
import { PublisherStrip } from "@/components/publisher-strip";
import { ErrorState } from "@/components/error-state";
import { PublisherImage } from "@/components/ui/publisher-image";
import { isPublisherPlaceholder } from "@/components/ui/publisher-image-utils";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getArticles, getTrendingStories, getSources } from "@/lib/api/news";
import { formatCategory, formatLanguage, formatPublishedAt } from "@/lib/format";
import { articleContent, articleContentLanguage, readDisplayLanguage, storyContentLanguage, storyTitle, translationLabel, withDisplayLanguage } from "@/lib/language";
import { ARTICLE_CATEGORIES, type Article, type ArticleCategory, type DisplayLanguage, type PagedResponse, type SourceSummary, type TrendingStory } from "@/types/api";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ category?: string | string[]; lang?: string | string[] }>;
}

type FeaturedItem = { kind: "story"; data: TrendingStory } | { kind: "article"; data: Article };
type SourcePulse = { name: string; slug: string; baseUrl: string; count: number };

function readCategory(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return ARTICLE_CATEGORIES.includes(candidate as ArticleCategory) ? (candidate as ArticleCategory) : undefined;
}

function featuredItems(stories: TrendingStory[], articles: Article[]) {
  const items: FeaturedItem[] = stories.slice(0, 3).map((data) => ({ kind: "story", data }));
  for (const data of articles) {
    if (items.length === 3) break;
    items.push({ kind: "article", data });
  }
  return items;
}

function sourcePulse(articles: Article[]): SourcePulse[] {
  const sources = new Map<string, SourcePulse>();
  for (const article of articles) {
    const current = sources.get(article.source.slug);
    sources.set(article.source.slug, { name: article.source.name, slug: article.source.slug, baseUrl: article.source.baseUrl, count: (current?.count ?? 0) + 1 });
  }
  return [...sources.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 6);
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const category = readCategory(params.category);
  const displayLanguage = readDisplayLanguage(params.lang);
  const [trendingResult, articlesResult, sourcesResult] = await Promise.allSettled([
    getTrendingStories({ limit: 5, category, displayLanguage }),
    getArticles({ page: 0, size: 20, category, sort: "publishedAt,desc", displayLanguage }),
    getSources(),
  ]);
  const stories = trendingResult.status === "fulfilled" ? trendingResult.value : [];
  const articles: PagedResponse<Article> | null = articlesResult.status === "fulfilled" ? articlesResult.value : null;

  if (!articles) {
    const message = articlesResult.status === "rejected" ? getApiErrorMessage(articlesResult.reason) : "Failed to load news articles.";
    return <div className="space-y-6"><Briefing category={category} /><CategoryBar category={category} displayLanguage={displayLanguage} /><ErrorState title="Unable to load the newsroom" message={message} /></div>;
  }

  const featured = featuredItems(stories, articles.content);
  const featuredArticleIds = new Set(featured.filter((item) => item.kind === "article").map((item) => item.data.id));
  const reports = articles.content.filter((article) => !featuredArticleIds.has(article.id));
  const pulse = sourcePulse(articles.content);
  const ALL_ACTIVE_SOURCES: SourceSummary[] = [
    { name: "Lankadeepa", slug: "lankadeepa", baseUrl: "https://www.lankadeepa.lk" },
    { name: "Divaina", slug: "divaina", baseUrl: "https://divaina.lk" },
    { name: "The Island", slug: "the-island", baseUrl: "https://island.lk" },
    { name: "Ada Derana", slug: "ada-derana", baseUrl: "https://adaderana.lk" },
    { name: "Hiru News", slug: "hiru-news", baseUrl: "https://www.hirunews.lk" },
    { name: "Daily Mirror", slug: "dailymirror", baseUrl: "https://www.dailymirror.lk" },
    { name: "Daily FT", slug: "dailyft", baseUrl: "https://www.ft.lk" },
    { name: "News First", slug: "newsfirst", baseUrl: "https://www.newsfirst.lk" },
  ];
  const fetchedSources = sourcesResult.status === "fulfilled" && sourcesResult.value.length > 0 ? sourcesResult.value : articles.content.map(a => a.source);
  const fetchedMap = new Map(fetchedSources.map(p => [p.slug, p]));
  const publishers = ALL_ACTIVE_SOURCES.map(def => fetchedMap.get(def.slug) || def);

  return (
    <div className="home-newsroom space-y-7 sm:space-y-9">
      <Briefing category={category} />
      <CategoryBar category={category} displayLanguage={displayLanguage} />

      {featured.length > 0 ? (
        <section aria-label="Lead news desk" className="border-b border-border pb-8 sm:pb-10">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.75fr)_minmax(18rem,0.8fr)] lg:gap-8">
            <Lead item={featured[0]} displayLanguage={displayLanguage} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:border-l lg:border-border lg:pl-8">
              {featured.slice(1).map((item, index) => <Supporting key={`${item.kind}-${item.data.id}`} item={item} number={index + 2} displayLanguage={displayLanguage} />)}
            </div>
          </div>
        </section>
      ) : <EmptyDesk />}

      {stories.length > 0 && <CoverageMonitor stories={stories} displayLanguage={displayLanguage} />}

      <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1.75fr)_minmax(18rem,0.8fr)] lg:gap-10">
        <section tabIndex={0} aria-labelledby="latest-reports-heading" className="lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-4">
          <header className="flex flex-col gap-3 py-5 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Publisher wire</p><h2 id="latest-reports-heading" className="mt-1 font-serif text-3xl font-semibold tracking-tight">{category ? `${formatCategory(category)} reports` : "Latest reports"}</h2></div>
            <p className="max-w-md text-sm leading-6 text-foreground-secondary">Direct reporting from independent Sri Lankan newsrooms, ordered by publication time.</p>
          </header>
          <div className="mt-2 divide-y divide-border border-t border-border">
            {reports.length > 0 ? reports.map((article, index) => <ReportRow key={article.id} article={article} displayLanguage={displayLanguage} priority={index < 2} />) : <p className="py-10 text-sm text-foreground-muted">No additional reports are available yet.</p>}
          </div>
          <Link href={withDisplayLanguage(`/articles${category ? `?category=${category}` : ""}`, displayLanguage)} className="my-5 flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand-hover">View all articles <ArrowRight className="size-4" /></Link>
        </section>
        <aside tabIndex={0} className="space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2" aria-label="Newsroom intelligence">
          <Headlines articles={articles.content.slice(0, 8)} displayLanguage={displayLanguage} />
          <NewsroomPulse sources={pulse} displayLanguage={displayLanguage} />
          <ExplorePanel displayLanguage={displayLanguage} />
        </aside>
      </div>
      <PublisherDirectory sources={publishers} displayLanguage={displayLanguage} />
      <PublisherStrip sources={publishers} />
    </div>
  );
}

function Briefing({ category }: { category?: ArticleCategory }) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-border bg-surface px-5 py-7 shadow-xs sm:px-8 sm:py-9 lg:px-10">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-brand" aria-hidden="true" />
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.8fr)] lg:items-center">
        <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand"><Globe2 className="size-4" />About Ceylon News</div><h1 className="mt-4 max-w-3xl font-serif text-3xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-5xl">{category ? `${formatCategory(category)} news, placed in context.` : "One clear view of Sri Lanka’s news."}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-foreground-secondary sm:text-base">Ceylon News brings independent reporting into one multilingual index, groups related coverage, and always sends readers back to the original publisher.</p></div>
        <ul className="grid gap-3 text-sm text-foreground-secondary sm:grid-cols-3 lg:grid-cols-1"><InfoPoint icon={Layers3} title="Compare coverage" text="Follow one event across newsrooms." /><InfoPoint icon={Globe2} title="Read your way" text="Browse English, Sinhala, and Tamil." /><InfoPoint icon={Newspaper} title="Publisher first" text="Every report links to its source." /></ul>
      </div>
    </section>
  );
}

function InfoPoint({ icon: Icon, title, text }: { icon: typeof Globe2; title: string; text: string }) {
  return <li className="flex gap-3 rounded-lg bg-surface-muted p-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand"><Icon className="size-4" /></span><span><strong className="block text-sm text-foreground">{title}</strong><span className="mt-0.5 block text-xs leading-5">{text}</span></span></li>;
}

function CategoryBar({ category, displayLanguage }: { category?: ArticleCategory; displayLanguage?: DisplayLanguage }) {
  return <div className="flex flex-col gap-3 border-y border-border py-3 sm:flex-row sm:items-center"><div className="flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-foreground-muted"><Globe2 className="size-4 text-brand" />Browse desk</div><div className="min-w-0 flex-1 sm:border-l sm:border-border sm:pl-4"><CategoryNavigation activeCategory={category} displayLanguage={displayLanguage} /></div></div>;
}

function EmptyDesk() {
  return <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center shadow-xs"><Newspaper className="mx-auto size-7 text-brand" /><h2 className="mt-3 font-serif text-2xl font-semibold">The desk is quiet</h2><p className="mt-2 text-sm text-foreground-secondary">New publisher reports will appear here as they arrive.</p></div>;
}

function itemView(item: FeaturedItem, lang?: DisplayLanguage) {
  if (item.kind === "story") {
    const story = item.data;
    const image = story.representativeMedia?.type === "IMAGE" && !isPublisherPlaceholder(story.representativeMedia.url) ? story.representativeMedia : undefined;
    return { title: storyTitle(story), summary: null, language: storyContentLanguage(story), href: withDisplayLanguage(`/story/${encodeURIComponent(story.id)}`, lang), category: story.category, date: story.lastPublishedAt, image, label: "Developing story", attribution: `${story.sourceCount} publishers`, detail: `${story.articleCount} reports`, notice: fallbackNotice(lang, story.localizedContent) };
  }
  const article = item.data, content = articleContent(article);
  const image = article.leadMedia?.type === "IMAGE" && !isPublisherPlaceholder(article.leadMedia.url) ? article.leadMedia : undefined;
  return { title: content.title, summary: content.summary, language: articleContentLanguage(article), href: withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, lang), category: article.category, date: article.publishedAt, image, label: "Latest report", attribution: article.source.name, detail: null, notice: fallbackNotice(lang, article.localizedContent) };
}

function fallbackNotice(requested: DisplayLanguage | undefined, localized: { fallback: boolean; resolvedLanguage: DisplayLanguage } | undefined) {
  if (!requested || !localized?.fallback) return null;
  return `${formatLanguage(requested)} translation unavailable · Showing ${formatLanguage(localized.resolvedLanguage)} original`;
}

function LanguageNotice({ notice }: { notice: string | null }) {
  return notice ? <p className="mt-3 inline-flex rounded-md bg-warning-soft px-2 py-1 text-[0.7rem] font-semibold text-warning">{notice}</p> : null;
}

function Meta({ view }: { view: ReturnType<typeof itemView> }) {
  return <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem] font-bold uppercase tracking-[0.13em] text-foreground-muted"><span className="text-brand">{view.label}</span><span>/</span><span>{view.category ? formatCategory(view.category) : "News"}</span><span>/</span><time dateTime={view.date}>{formatPublishedAt(view.date)}</time></div>;
}

function Lead({ item, displayLanguage }: { item: FeaturedItem; displayLanguage?: DisplayLanguage }) {
  const view = itemView(item, displayLanguage);
  return (
    <article className="group min-w-0">
      {view.image && <Link href={view.href} className="block overflow-hidden rounded-lg"><PublisherImage src={view.image.url} alt={view.image.altText || view.title} aspectRatio="16/9" priority className="border-0" imageClassName="duration-500 group-hover:scale-[1.025]" /></Link>}
      <div className={view.image ? "pt-5" : "border-t-4 border-brand pt-5"}><Meta view={item.kind === "story" ? { ...view, label: "Most trending" } : view} /><Link href={view.href}><h2 lang={view.language} className="mt-3 max-w-4xl font-serif text-3xl font-semibold leading-[1.12] tracking-tight transition-colors group-hover:text-brand sm:text-4xl lg:text-[2.85rem]">{view.title}</h2></Link>{view.summary && <p lang={view.language} className="mt-4 max-w-3xl text-[0.95rem] leading-7 text-foreground-secondary">{view.summary}</p>}<LanguageNotice notice={view.notice} /><div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-xs font-semibold text-foreground-muted"><span>{view.attribution}</span>{view.detail && <span>{view.detail}</span>}<Link href={view.href} className="inline-flex items-center gap-1.5 font-bold text-brand hover:underline sm:ml-auto">{item.kind === "story" ? "Open full coverage" : "Read publisher report"}<ArrowRight className="size-3.5" /></Link></div></div>
    </article>
  );
}

function Supporting({ item, number, displayLanguage }: { item: FeaturedItem; number: number; displayLanguage?: DisplayLanguage }) {
  const view = itemView(item, displayLanguage);
  return <article className="group grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] gap-3 border-t border-border pt-5 first:border-t-0 first:pt-0"><span className="font-serif text-2xl font-semibold text-border-strong">{String(number).padStart(2, "0")}</span><div>{view.image && <Link href={view.href} className="mb-4 block overflow-hidden rounded-md"><PublisherImage src={view.image.url} alt={view.image.altText || view.title} aspectRatio="16/9" className="border-0" /></Link>}<Meta view={view} /><Link href={view.href}><h3 lang={view.language} className="mt-2 font-serif text-xl font-semibold leading-snug transition-colors group-hover:text-brand sm:text-2xl lg:text-xl">{view.title}</h3></Link><LanguageNotice notice={view.notice} /><p className="mt-3 text-xs font-semibold text-foreground-muted">{view.attribution}</p></div></article>;
}

function CoverageMonitor({ stories, displayLanguage }: { stories: TrendingStory[]; displayLanguage?: DisplayLanguage }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-700 bg-foreground text-white shadow-sm" aria-labelledby="coverage-heading"><div className="grid lg:grid-cols-[17rem_minmax(0,1fr)]"><div className="border-b border-white/10 bg-white/[0.04] p-6 lg:border-b-0 lg:border-r lg:p-7"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-300"><BarChart3 className="size-4" />Coverage monitor</div><h2 id="coverage-heading" className="mt-3 font-serif text-2xl font-semibold">What is developing</h2><p className="mt-3 text-sm leading-6 text-slate-300">Events receiving attention across multiple publisher reports.</p><Link href={withDisplayLanguage("/trending", displayLanguage)} className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-white hover:underline">View trending coverage <ArrowRight className="size-3.5" /></Link></div><div className="grid sm:grid-cols-2 xl:grid-cols-3">{stories.slice(0, 3).map((story, index) => <article key={story.id} className="group border-b border-white/10 p-6 last:border-b-0 sm:border-r xl:border-b-0 xl:last:border-r-0"><div className="flex justify-between text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-400"><span>Signal {String(index + 1).padStart(2, "0")}</span><span>{story.sourceCount} sources</span></div><Link href={withDisplayLanguage(`/story/${encodeURIComponent(story.id)}`, displayLanguage)}><h3 lang={storyContentLanguage(story)} className="mt-4 font-serif text-lg font-semibold leading-snug transition-colors group-hover:text-blue-300">{storyTitle(story)}</h3></Link><p className="mt-5 text-xs font-semibold text-slate-400">{story.articleCount} reports · {formatPublishedAt(story.lastPublishedAt)}</p></article>)}</div></div></section>
  );
}

function ReportRow({ article, displayLanguage, priority }: { article: Article; displayLanguage?: DisplayLanguage; priority?: boolean }) {
  const content = articleContent(article), language = articleContentLanguage(article), href = withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, displayLanguage), sourceHref = withDisplayLanguage(`/source/${encodeURIComponent(article.source.slug)}`, displayLanguage), provenance = translationLabel(content.localization, article.originalLanguage), notice = fallbackNotice(displayLanguage, article.localizedContent), image = article.leadMedia?.type === "IMAGE" && !isPublisherPlaceholder(article.leadMedia.url) ? article.leadMedia : undefined;
  return <article className="group py-6 sm:py-7"><div className={`grid min-w-0 gap-5 ${image ? "sm:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)]" : ""}`}>{image && <Link href={href} className="block overflow-hidden rounded-md"><PublisherImage src={image.url} alt={image.altText || content.title} aspectRatio="16/10" priority={priority} className="border-0" /></Link>}<div className="flex min-w-0 flex-col justify-center"><div className="flex flex-wrap gap-x-2 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-foreground-muted"><Link href={sourceHref} className="text-brand hover:underline">{article.source.name}</Link><span>/</span><time dateTime={article.publishedAt}>{formatPublishedAt(article.publishedAt)}</time><span>/</span><span>{formatLanguage(article.originalLanguage)}</span></div><Link href={href}><h3 lang={language} className="mt-2 font-serif text-xl font-semibold leading-snug transition-colors group-hover:text-brand sm:text-2xl">{content.title}</h3></Link>{content.summary && <p lang={language} className="mt-2 line-clamp-2 text-sm leading-6 text-foreground-secondary">{content.summary}</p>}<LanguageNotice notice={notice} /><div className="mt-3 flex gap-3 text-xs font-semibold text-foreground-muted">{article.category && <span>{formatCategory(article.category)}</span>}{provenance && <span className="text-brand">{provenance} · Platform translation</span>}</div></div></div></article>;
}

function Headlines({ articles, displayLanguage }: { articles: Article[]; displayLanguage?: DisplayLanguage }) {
  return <section className="rounded-xl border border-border bg-surface p-5 shadow-xs" aria-labelledby="headlines-heading"><div className="flex items-center justify-between border-b border-border pb-4"><div><p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-brand">Latest wire</p><h2 id="headlines-heading" className="mt-1 font-serif text-xl font-semibold">Headlines</h2></div><Clock3 className="size-5 text-foreground-muted" /></div><ol className="divide-y divide-border">{articles.map((article, index) => { const content = articleContent(article), language = articleContentLanguage(article), notice = fallbackNotice(displayLanguage, article.localizedContent); return <li key={article.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2 py-4"><span className="font-serif text-sm text-border-strong">{String(index + 1).padStart(2, "0")}</span><div><Link href={withDisplayLanguage(`/article/${encodeURIComponent(article.id)}`, displayLanguage)}><h3 lang={language} className="text-sm font-bold leading-snug text-foreground hover:text-brand">{content.title}</h3></Link><p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-wide text-foreground-muted">{article.source.name} · {formatPublishedAt(article.publishedAt)}</p>{notice && <p className="mt-1 text-[0.68rem] font-semibold text-warning">Showing original language</p>}</div></li>; })}</ol></section>;
}

function NewsroomPulse({ sources, displayLanguage }: { sources: SourcePulse[]; displayLanguage?: DisplayLanguage }) {
  const maximum = Math.max(...sources.map((source) => source.count), 1);
  return <section className="rounded-xl border border-border bg-surface p-5 shadow-xs" aria-labelledby="pulse-heading"><div className="flex items-center justify-between border-b border-border pb-4"><div><p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-brand">Source mix</p><h2 id="pulse-heading" className="mt-1 font-serif text-xl font-semibold">Newsroom pulse</h2></div><Newspaper className="size-5 text-foreground-muted" /></div><ol className="mt-1 divide-y divide-border">{sources.map((source, index) => <li key={source.slug} className="py-4"><div className="flex items-center gap-3"><span className="w-5 font-serif text-sm text-foreground-muted">{index + 1}</span><Link href={withDisplayLanguage(`/source/${encodeURIComponent(source.slug)}`, displayLanguage)} className="min-w-0 flex-1 truncate text-sm font-bold hover:text-brand hover:underline"><span className="flex items-center gap-3"><SourceIcon name={source.name} baseUrl={source.baseUrl} />{source.name}</span></Link><span className="text-xs font-semibold text-foreground-muted">{source.count}</span></div><div className="ml-8 mt-2 h-1 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(12, source.count / maximum * 100)}%` }} /></div></li>)}</ol></section>;
}

function ExplorePanel({ displayLanguage }: { displayLanguage?: DisplayLanguage }) {
  const links = [{ href: "/stories", icon: Layers3, label: "Grouped stories", detail: "Compare reporting across publishers" }, { href: "/trending", icon: Clock3, label: "Trending now", detail: "See coverage gaining momentum" }, { href: "/search", icon: Search, label: "Search the index", detail: "Find reports by subject or source" }];
  return <section className="overflow-hidden rounded-xl bg-brand p-5 text-white shadow-sm"><p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-blue-100">Intelligence tools</p><h2 className="mt-1 font-serif text-xl font-semibold">Go beyond the headline</h2><div className="mt-4 divide-y divide-white/20 border-y border-white/20">{links.map(({ href, icon: Icon, label, detail }) => <Link key={href} href={withDisplayLanguage(href, displayLanguage)} className="group flex items-center gap-3 py-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/12"><Icon className="size-4" /></span><span className="flex-1"><span className="block text-sm font-bold">{label}</span><span className="mt-0.5 block text-xs leading-5 text-blue-100">{detail}</span></span><ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></Link>)}</div></section>;
}
