"use client";

import { useState } from "react";
import { isPublisherPlaceholder } from "./publisher-image-utils";

interface PublisherImageProps {
  src?: string | null;
  alt?: string | null;
  aspectRatio?: "16/9" | "4/3" | "16/10" | "square" | "auto";
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

const aspectRatioClasses: Record<string, string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "16/10": "aspect-[16/10]",
  square: "aspect-square",
  auto: "",
};

export function PublisherImage({
  src,
  alt,
  aspectRatio = "16/9",
  priority = false,
  className = "",
  imageClassName = "",
}: PublisherImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError || isPublisherPlaceholder(src)) {
    return null;
  }

  const ratioClass = aspectRatioClasses[aspectRatio] || "";

  return (
    <div className={`relative bg-surface-muted overflow-hidden border border-border/60 ${ratioClass} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || ""}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02] ${imageClassName}`}
      />
    </div>
  );
}
