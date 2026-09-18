import Link from "next/link";
import { ChevronDown, Globe2, LogIn, Search } from "lucide-react";
import { withDisplayLanguage } from "@/lib/language";
import type { DisplayLanguage } from "@/types/api";

interface HeaderActionProps {
  displayLanguage?: DisplayLanguage;
}

export function HeaderSearchAction({
  displayLanguage,
  active = false,
}: HeaderActionProps & { active?: boolean }) {
  return (
    <Link
      href={withDisplayLanguage("/search", displayLanguage)}
      aria-label="Search news"
      className={`group inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-bold shadow-2xs transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        active
          ? "border-brand bg-brand-soft/60 text-brand"
          : "border-border-strong bg-surface text-foreground hover:border-brand hover:bg-brand-soft/30 hover:text-brand"
      }`}
    >
      <Search className="size-4.5 text-foreground-muted transition-colors group-hover:text-brand" aria-hidden="true" />
      <span>Search</span>
    </Link>
  );
}

export function HeaderLanguageControl({
  displayLanguage,
  onLanguageChange,
}: HeaderActionProps & { onLanguageChange: (value: string) => void }) {
  return (
    <div className="relative flex min-h-11 items-center rounded-xl border border-border-strong bg-surface shadow-2xs transition-colors hover:border-brand hover:bg-brand-soft/20 focus-within:border-brand">
      <Globe2 className="pointer-events-none absolute left-3 size-4.5 text-brand" aria-hidden="true" />
      <select
        aria-label="Display language"
        value={displayLanguage ?? "original"}
        onChange={(event) => onLanguageChange(event.target.value)}
        className="min-h-11 cursor-pointer appearance-none rounded-xl bg-transparent pl-9 pr-8 text-sm font-bold text-foreground outline-none"
      >
        <option value="original">Original</option>
        <option value="en">English</option>
        <option value="si">සිංහල</option>
        <option value="ta">தமிழ்</option>
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-foreground-muted" aria-hidden="true" />
    </div>
  );
}

export function HeaderSignInAction({ displayLanguage }: HeaderActionProps) {
  return (
    <Link
      href={withDisplayLanguage("/auth/login", displayLanguage)}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-brand-hover hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <LogIn className="size-4" aria-hidden="true" />
      Sign in
    </Link>
  );
}

export function HeaderGuestActions({
  displayLanguage,
  searchActive,
  onLanguageChange,
}: HeaderActionProps & {
  searchActive: boolean;
  onLanguageChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <HeaderSearchAction displayLanguage={displayLanguage} active={searchActive} />
      <HeaderLanguageControl displayLanguage={displayLanguage} onLanguageChange={onLanguageChange} />
      <HeaderSignInAction displayLanguage={displayLanguage} />
    </div>
  );
}
