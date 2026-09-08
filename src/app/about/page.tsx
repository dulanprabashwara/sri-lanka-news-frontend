import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "About Ceylon News" };
export default function AboutPage() {
  return <div className="space-y-8"><PageHeader eyebrow="About the platform" title="A clearer view of Sri Lanka." description="Ceylon News brings publisher reporting into one multilingual news index, helping you discover stories and compare how events are covered." />
    <div className="grid gap-5 md:grid-cols-3">{[
      ["Publisher first", "We link to the original publisher for the full article. Reports, photographs, and original journalism belong to their respective publishers."],
      ["More context", "Related reports are grouped into stories. Coverage comparison and timelines help you explore different accounts of a developing event."],
      ["Read across languages", "English, Sinhala, and Tamil translations are shown when available. When a translation is missing, we keep the original and identify that fallback."],
    ].map(([title, text]) => <section key={title} className="rounded-xl border border-border bg-surface p-7"><h2 className="font-serif text-2xl font-semibold">{title}</h2><p className="mt-4 text-sm leading-7 text-foreground-secondary">{text}</p></section>)}</div>
    <section className="rounded-xl border border-border bg-brand-soft p-7"><h2 className="font-serif text-2xl font-semibold">Use context. Check the source.</h2><p className="mt-3 max-w-3xl text-sm leading-7 text-foreground-secondary">AI-assisted summaries, translations, and story grouping can make mistakes. They are navigation aids, not independent verification. Check important details against the linked publisher reports.</p><Link href="/guide" className="mt-5 inline-block font-semibold text-brand hover:underline">Read the user manual →</Link></section>
  </div>;
}
