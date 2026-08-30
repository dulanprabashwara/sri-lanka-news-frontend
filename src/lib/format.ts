import type { ArticleCategory, Language } from "@/types/api";

const languageNames: Record<Language, string> = {
  en: "English",
  si: "Sinhala",
  ta: "Tamil",
};

export function formatLanguage(language: Language): string {
  return languageNames[language];
}

export function formatCategory(category: ArticleCategory): string {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

export function formatPublishedAt(date: string): string {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Colombo",
  }).format(new Date(date));
}
