"use client";

import { useState, useTransition } from "react";
import { Check, Languages, SlidersHorizontal } from "lucide-react";
import { savePreferencesAction } from "@/app/user-actions";
import { formatCategory } from "@/lib/format";
import { ARTICLE_CATEGORIES, type ArticleCategory, type UserPreferences } from "@/types/api";

export function PreferencesForm({ initial }: { initial: UserPreferences }) {
  const [language, setLanguage] = useState(initial.preferredDisplayLanguage);
  const [categories, setCategories] = useState(initial.preferredCategories);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(category: ArticleCategory) {
    setCategories((current) => current.includes(category)
      ? current.filter((item) => item !== category)
      : [...current, category]);
  }

  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      setMessage(null);
      startTransition(async () => {
        const result = await savePreferencesAction({
          preferredDisplayLanguage: language,
          preferredCategories: categories,
          analyticsEnabled: initial.analyticsEnabled,
        });
        setMessage(result.ok ? "Preferences saved." : result.message);
      });
    }}>
      <div className="flex items-start gap-3 border-b border-border pb-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <SlidersHorizontal className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-brand">Reading experience</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-foreground">Display preferences</h2>
          <p className="mt-1 text-sm leading-5 text-foreground-secondary">Choose the language and topics Ceylon News should prioritize for you.</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface-muted p-4">
        <label className="flex items-center gap-2 text-sm font-bold text-foreground" htmlFor="preferred-language">
          <Languages className="size-4 text-brand" aria-hidden="true" />
          Preferred display language
        </label>
        <p className="mt-1 text-xs text-foreground-muted">Translations are shown when an enriched version is available.</p>
        <select
          id="preferred-language"
          value={language}
          onChange={(event) => setLanguage(event.target.value as UserPreferences["preferredDisplayLanguage"])}
          className="mt-3 w-full rounded-lg border border-border-strong bg-white px-3 py-2.5 text-sm font-semibold text-foreground focus:outline-2 focus:outline-brand"
        >
          <option value="ORIGINAL">Original publisher language</option>
          <option value="EN">English</option>
          <option value="SI">සිංහල</option>
          <option value="TA">தமிழ்</option>
        </select>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-bold text-foreground">Preferred categories</legend>
        <p className="mt-1 text-xs text-foreground-muted">Select the desks you want to see more often in your personalized feed.</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ARTICLE_CATEGORIES.map((category) => {
            const selected = categories.includes(category);
            return (
              <label
                key={category}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  selected
                    ? "border-brand bg-brand-soft/40 text-brand"
                    : "border-border bg-surface text-foreground-secondary hover:border-border-strong"
                }`}
              >
                <span className={`flex size-4 items-center justify-center rounded border ${selected ? "border-brand bg-brand text-white" : "border-border-strong bg-white"}`}>
                  {selected ? <Check className="size-3" aria-hidden="true" /> : null}
                </span>
                <input className="sr-only" type="checkbox" checked={selected} onChange={() => toggle(category)} />
                {formatCategory(category)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-foreground-muted">Changes update your personalized Ceylon News experience.</p>
        <button disabled={pending} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-hover disabled:opacity-60">
          {pending ? "Saving…" : "Save preferences"}
        </button>
      </div>
      {message ? <p role="status" className="mt-3 text-sm text-foreground-secondary">{message}</p> : null}
    </form>
  );
}
