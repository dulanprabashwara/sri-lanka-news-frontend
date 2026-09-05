import { ReactNode } from "react";

export type SurfaceVariant = "flat" | "elevated" | "muted" | "bordered" | "highlight" | "danger" | "warning" | "success" | "info";

export interface SurfaceProps {
  children: ReactNode;
  variant?: SurfaceVariant;
  className?: string;
  as?: "div" | "article" | "section" | "aside";
}

export function Surface({
  children,
  variant = "bordered",
  className = "",
  as: Component = "div",
}: SurfaceProps) {
  const baseClasses = "rounded-xl p-5 transition-all duration-150";

  const variantClasses: Record<SurfaceVariant, string> = {
    flat: "bg-surface text-foreground",
    elevated: "bg-surface text-foreground shadow-sm border border-border",
    muted: "bg-surface-muted text-foreground-secondary border border-border",
    bordered: "bg-surface text-foreground border border-border",
    highlight: "bg-brand-soft/30 text-foreground border border-brand-soft",
    danger: "bg-danger-soft text-danger border border-danger-border",
    warning: "bg-warning-soft text-warning border border-warning-border",
    success: "bg-success-soft text-success border border-success-border",
    info: "bg-info-soft text-info border border-info-border",
  };

  return (
    <Component className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}>
      {children}
    </Component>
  );
}
