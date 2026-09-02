"use client";

import { useState, useTransition } from "react";
import { savePreferencesAction } from "@/app/user-actions";
import { formatCategory } from "@/lib/format";
import { ARTICLE_CATEGORIES, type ArticleCategory, type UserPreferences } from "@/types/api";

export function PreferencesForm({ initial }: { initial: UserPreferences }) {
  const [language, setLanguage] = useState(initial.preferredDisplayLanguage);
  const [categories, setCategories] = useState(initial.preferredCategories);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(category: ArticleCategory) {
    setCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
  }

  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      setMessage(null);
      startTransition(async () => {
        const result = await savePreferencesAction({ preferredDisplayLanguage: language, preferredCategories: categories });
        setMessage(result.ok ? "Preferences saved." : result.message);
      });
    }} className="mt-8 border-t border-slate-200 pt-8">
      <h2 className="text-xl font-bold text-slate-950">Preferences</h2>
      <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="preferred-language">Preferred display language</label>
      <select id="preferred-language" value={language} onChange={(event) => setLanguage(event.target.value as UserPreferences["preferredDisplayLanguage"])} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2">
        <option value="ORIGINAL">Original publisher language</option>
        <option value="EN">English</option><option value="SI">සිංහල</option><option value="TA">தமிழ்</option>
      </select>
      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-slate-700">Preferred categories</legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ARTICLE_CATEGORIES.map((category) => <label key={category} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={categories.includes(category)} onChange={() => toggle(category)} />{formatCategory(category)}</label>)}
        </div>
      </fieldset>
      <button disabled={pending} className="mt-6 rounded-lg bg-teal-800 px-4 py-2 font-semibold text-white disabled:opacity-60">{pending ? "Saving…" : "Save preferences"}</button>
      {message ? <p role="status" className="mt-3 text-sm text-slate-700">{message}</p> : null}
    </form>
  );
}
