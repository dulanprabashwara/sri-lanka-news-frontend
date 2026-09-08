import { ReactNode } from "react";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  filterSlot?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  filterSlot,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`relative space-y-5 rounded-xl border border-border border-t-4 border-t-brand bg-surface p-6 shadow-xs sm:p-8 ${className}`.trim()}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl space-y-1.5">
          {eyebrow && (
            <p className="eyebrow text-brand font-bold text-xs uppercase tracking-widest">
              {eyebrow}
            </p>
          )}
          <h1 className="page-title font-serif text-foreground text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="page-intro text-foreground-secondary text-base leading-relaxed max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-3 pt-1">
            {actions}
          </div>
        )}
      </div>
      {filterSlot && (
        <div className="pt-2">
          {filterSlot}
        </div>
      )}
    </header>
  );
}
