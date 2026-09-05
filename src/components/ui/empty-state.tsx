import { ReactNode } from "react";
import { Surface } from "./surface";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <Surface
      variant="bordered"
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 ${className}`.trim()}
    >
      {icon && (
        <div className="mb-4 grid size-12 place-items-center rounded-xl bg-surface-muted text-foreground-secondary">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-foreground sm:text-xl">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-foreground-secondary leading-relaxed">
          {description}
        </p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </Surface>
  );
}
