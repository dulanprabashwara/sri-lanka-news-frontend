"use client";

import { useState } from "react";

export function SourceIcon({ name, baseUrl }: { name: string; baseUrl: string }) {
  const [failed, setFailed] = useState(false);
  let icon: string | undefined;
  try {
    const url = new URL(baseUrl);
    if (url.protocol === "https:" || url.protocol === "http:") {
      icon = `https://s2.googleusercontent.com/s2/favicons?domain=${url.hostname}&sz=128`;
    }
  } catch { /* Invalid publisher URLs use the initials fallback. */ }
  return <span className="inline-grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-white text-xs font-bold text-brand" aria-hidden="true">
    {icon && !failed ? (
      // Publisher-owned favicons have variable formats; native images support ICO too.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={icon} alt="" width={24} height={24} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="size-6 object-contain" />
    ) : name.split(/\s+/).slice(0, 2).map(word => word[0]).join("")}
  </span>;
}
