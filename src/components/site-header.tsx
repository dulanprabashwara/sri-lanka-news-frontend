"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { readDisplayLanguage, withDisplayLanguage } from "@/lib/language";

export function SiteHeader({ authenticated = false }: { authenticated?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const displayLanguage = readDisplayLanguage(searchParams.get("lang"));

  function selectLanguage(value: string) {
    const parameters = new URLSearchParams(searchParams.toString());
    if (value === "original") parameters.delete("lang");
    else parameters.set("lang", value);
    const query = parameters.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href={withDisplayLanguage("/", displayLanguage)}
          className="group flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          aria-label="Sri Lanka News home"
        >
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-xl bg-teal-800 text-sm font-black tracking-tight text-white shadow-sm transition group-hover:bg-teal-700"
          >
            SL
          </span>
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight text-slate-950">
              Sri Lanka News
            </span>
            <span className="block text-xs font-medium text-slate-500">
              Independent news index
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="display-language">Display language</label>
          <select
            id="display-language"
            value={displayLanguage ?? "original"}
            onChange={(event) => selectLanguage(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <option value="original">Original</option>
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
          <nav aria-label="Primary navigation" className="flex items-center gap-1">
          <Link
            href={withDisplayLanguage("/", displayLanguage)}
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Latest news
          </Link>
          <Link
            href={withDisplayLanguage("/stories", displayLanguage)}
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Stories
          </Link>
          {authenticated ? <Link href={withDisplayLanguage("/bookmarks", displayLanguage)} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-teal-800">Bookmarks</Link> : null}
          {authenticated ? <Link href={withDisplayLanguage("/following", displayLanguage)} className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-teal-800">Following</Link> : null}
          <Link
            href={withDisplayLanguage(authenticated ? "/account" : `/auth/login?next=${encodeURIComponent(withDisplayLanguage("/account", displayLanguage))}`, displayLanguage)}
            className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-teal-800"
          >
            {authenticated ? "Account" : "Sign in"}
          </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
