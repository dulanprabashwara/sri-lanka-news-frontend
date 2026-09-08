import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "User manual" };
export default function GuidePage() {
  const sections = [
    ["Browse the news", "The homepage leads with trending coverage, followed by the latest publisher reports. Use category links to narrow the desk. View all articles opens the complete paginated archive.", "/articles", "Open the article archive"],
    ["Explore a publisher", "Choose a newsroom in the publisher directory or click a source name beside a headline. Source pages collect its reports and link to its official website.", "/sources", "Browse publishers"],
    ["Follow a developing event", "Open a grouped story to compare publisher reports, review its timeline, and ask questions grounded in the available coverage. Always check the cited reports.", "/stories", "Explore grouped stories"],
    ["Change reading language", "Choose English, Sinhala, or Tamil in the header. This selects available content translations, not a translation of every interface label. An unavailable translation is marked and the original remains visible. Selecting a language does not trigger instant translation.", "/", "Return to the newsroom"],
    ["Find a report", "Use search to look for a headline or subject. Where available, semantic search helps find related reporting even when wording differs.", "/search", "Search the index"],
    ["Make it yours", "Sign in to save articles and stories, follow sources and topics, and manage your preferences. The For You feed uses your selected interests.", "/account", "Manage your account"],
  ];
  return <div className="space-y-8"><PageHeader eyebrow="Reader help" title="Your guide to Ceylon News." description="Start with a headline. Follow the context. Read the original." /><div className="grid gap-5 md:grid-cols-2">{sections.map(([title, body, href, label], index) => <section key={title} className="rounded-xl border border-border bg-surface p-6 sm:p-8"><p className="text-xs font-bold tracking-widest text-brand">0{index + 1}</p><h2 className="mt-3 font-serif text-2xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-foreground-secondary">{body}</p><Link href={href} className="mt-5 inline-block text-sm font-bold text-brand hover:underline">{label} →</Link></section>)}</div></div>;
}
