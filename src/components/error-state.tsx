import { ReactNode } from "react";
import { Button } from "./ui/button";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  actionSlot?: ReactNode;
}

export function ErrorState({
  title = "Unable to load news",
  message,
  onRetry,
  actionSlot,
}: ErrorStateProps) {
  return (
    <div className="state-panel border-danger-border bg-danger-soft/60 p-6 rounded-xl border text-danger" role="alert">
      <h2 className="text-lg font-bold text-danger">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-red-900">{message}</p>
      {(onRetry || actionSlot) && (
        <div className="mt-4 flex items-center gap-3">
          {onRetry && (
            <Button variant="danger" size="sm" onClick={onRetry}>
              Try Again
            </Button>
          )}
          {actionSlot}
        </div>
      )}
    </div>
  );
}
