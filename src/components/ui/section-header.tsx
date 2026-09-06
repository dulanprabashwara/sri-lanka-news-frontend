import { ReactNode } from "react";

export interface SectionHeaderProps {
  title: string;
  description?: string;
  actionSlot?: ReactNode;
  headingLevel?: "h2" | "h3" | "h4";
  className?: string;
  id?: string;
}

export function SectionHeader({
  title,
  description,
  actionSlot,
  headingLevel = "h2",
  className = "",
  id,
}: SectionHeaderProps) {
  const HeadingTag = headingLevel;

  return (
    <div id={id} className={`flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-3 ${className}`.trim()}>
      <div>
        <HeadingTag className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </HeadingTag>
        {description && (
          <p className="mt-1 text-sm text-foreground-secondary leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actionSlot && (
        <div className="shrink-0 pt-1 sm:pt-0">
          {actionSlot}
        </div>
      )}
    </div>
  );
}
