import { ReactNode } from "react";

export interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function ContainerReading({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-3xl ${className}`.trim()}>
      {children}
    </div>
  );
}

export function ContainerContent({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-6xl ${className}`.trim()}>
      {children}
    </div>
  );
}

export function ContainerWide({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl ${className}`.trim()}>
      {children}
    </div>
  );
}

export function ContainerAdmin({ children, className = "" }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl ${className}`.trim()}>
      {children}
    </div>
  );
}

export type PageShellVariant = "content" | "reading" | "wide" | "admin" | "compact";

export interface PageShellProps {
  children: ReactNode;
  variant?: PageShellVariant;
  className?: string;
}

export function PageShell({ children, variant = "content", className = "" }: PageShellProps) {
  switch (variant) {
    case "reading":
      return <ContainerReading className={className}>{children}</ContainerReading>;
    case "wide":
      return <ContainerWide className={className}>{children}</ContainerWide>;
    case "admin":
      return <ContainerAdmin className={className}>{children}</ContainerAdmin>;
    case "compact":
      return (
        <div className={`mx-auto w-full max-w-xl ${className}`.trim()}>
          {children}
        </div>
      );
    case "content":
    default:
      return <ContainerContent className={className}>{children}</ContainerContent>;
  }
}
