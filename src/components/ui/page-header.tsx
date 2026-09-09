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
    <header className={`relative isolate space-y-5 overflow-hidden rounded-xl border border-border bg-surface p-6 shadow-xs before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-brand after:absolute after:-right-20 after:-top-24 after:-z-10 after:size-64 after:rounded-full after:bg-brand-soft/45 sm:p-8 lg:p-10 ${className}`.trim()}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl space-y-1.5">
          {eyebrow && (
            <p className="eyebrow text-brand font-bold text-xs uppercase tracking-widest">
              {eyebrow}
            </p>
          )}
          <h1 className="page-title font-serif text-foreground text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
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
