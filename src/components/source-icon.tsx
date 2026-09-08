"use client";

import { useState } from "react";

const LOCAL_ICONS: Record<string, string> = {
  "lankadeepa": "/icons/lankadeepa.png",
  "divaina": "/icons/divaina.png",
  "the-island": "/icons/the-island.png",
  "ada-derana": "/icons/ada-derana.png",
  "hiru-news": "/icons/hiru-news.ico",
  "dailymirror": "/icons/dailymirror.png",
  "dailyft": "/icons/dailyft.png",
  "newsfirst": "/icons/newsfirst.png",
};

export type SourceIconSize = "sm" | "md" | "lg" | "xl" | "2xl";

export function SourceIcon({
  name,
  baseUrl,
  slug,
  size = "md",
  rounded = "full",
  className = "",
}: {
  name: string;
  baseUrl: string;
  slug?: string;
  size?: SourceIconSize;
  rounded?: "full" | "lg" | "md";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  let resolvedSlug = slug?.toLowerCase();
  if (!resolvedSlug) {
    if (baseUrl.includes("lankadeepa")) resolvedSlug = "lankadeepa";
    else if (baseUrl.includes("divaina")) resolvedSlug = "divaina";
    else if (baseUrl.includes("island.lk")) resolvedSlug = "the-island";
    else if (baseUrl.includes("adaderana")) resolvedSlug = "ada-derana";
    else if (baseUrl.includes("hirunews")) resolvedSlug = "hiru-news";
    else if (baseUrl.includes("dailymirror")) resolvedSlug = "dailymirror";
    else if (baseUrl.includes("ft.lk")) resolvedSlug = "dailyft";
    else if (baseUrl.includes("newsfirst")) resolvedSlug = "newsfirst";
    else if (name.toLowerCase().includes("lankadeepa")) resolvedSlug = "lankadeepa";
    else if (name.toLowerCase().includes("divaina")) resolvedSlug = "divaina";
    else if (name.toLowerCase().includes("island")) resolvedSlug = "the-island";
  }

  let icon: string | undefined = resolvedSlug ? LOCAL_ICONS[resolvedSlug] : undefined;

  if (!icon) {
    try {
      const url = new URL(baseUrl);
      if (url.protocol === "https:" || url.protocol === "http:") {
        icon = `https://s2.googleusercontent.com/s2/favicons?domain=${url.hostname}&sz=128`;
      }
    } catch { /* Invalid publisher URLs use the initials fallback. */ }
  }

  const containerSizes: Record<SourceIconSize, string> = {
    sm: "size-8",
    md: "size-10",
    lg: "size-12 sm:size-14",
    xl: "size-16 sm:size-20",
    "2xl": "size-20 sm:size-24",
  };

  const imageSizes: Record<SourceIconSize, string> = {
    sm: "size-5",
    md: "size-7",
    lg: "size-9 sm:size-10",
    xl: "size-12 sm:size-14",
    "2xl": "size-16 sm:size-18",
  };

  const roundedClasses = {
    full: "rounded-full",
    lg: "rounded-xl",
    md: "rounded-lg",
  };

  return (
    <span
      className={`inline-grid shrink-0 place-items-center overflow-hidden border border-border bg-white text-xs font-bold text-brand shadow-2xs ${containerSizes[size]} ${roundedClasses[rounded]} ${className}`}
      aria-hidden="true"
    >
      {icon && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={icon}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={`${imageSizes[size]} object-contain`}
        />
      ) : (
        name.split(/\s+/).slice(0, 2).map(word => word[0]).join("")
      )}
    </span>
  );
}
