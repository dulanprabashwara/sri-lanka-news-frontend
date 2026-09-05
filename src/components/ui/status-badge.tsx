import { ReactNode } from "react";

export type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusBadgeProps {
  status: StatusVariant;
  label: string;
  icon?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status = "neutral",
  label,
  icon,
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const variantClasses: Record<StatusVariant, string> = {
    success: "bg-success-soft text-success border-success-border",
    warning: "bg-warning-soft text-warning border-warning-border",
    danger: "bg-danger-soft text-danger border-danger-border",
    info: "bg-info-soft text-info border-info-border",
    neutral: "bg-surface-muted text-foreground-secondary border-border",
  };

  const dotClasses: Record<StatusVariant, string> = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    neutral: "bg-foreground-muted",
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs font-semibold" : "px-2.5 py-1 text-xs font-bold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${variantClasses[status]} ${sizeClasses} ${className}`.trim()}
    >
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        <span className={`size-1.5 rounded-full shrink-0 ${dotClasses[status]}`} aria-hidden="true" />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}
