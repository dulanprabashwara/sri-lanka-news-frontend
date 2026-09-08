export function archivePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return 0;
  const page = Number(raw);
  return Number.isSafeInteger(page) && page <= 100000 ? page : 0;
}

export function archiveHref(page: number, filters: { lang?: string; source?: string; category?: string }): string {
  const query = new URLSearchParams({ page: String(page) });
  Object.entries(filters).forEach(([key, value]) => { if (value) query.set(key, value); });
  return `/articles?${query}`;
}
