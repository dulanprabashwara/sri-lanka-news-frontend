"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const TOAST_EVENT = "ceylon-news:toast";

export const toast = {
  show(message: string, type: ToastType = "info", duration = 3500) {
    if (typeof window === "undefined") return;
    const event = new CustomEvent<ToastItem>(TOAST_EVENT, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        message,
        type,
        duration,
      },
    });
    window.dispatchEvent(event);
  },
  success(message: string, duration?: number) {
    this.show(message, "success", duration);
  },
  error(message: string, duration?: number) {
    this.show(message, "error", duration);
  },
  info(message: string, duration?: number) {
    this.show(message, "info", duration);
  },
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>;
      if (!customEvent.detail) return;
      const newToast = customEvent.detail;
      setToasts((prev) => [...prev, newToast]);

      const timer = setTimeout(() => {
        dismiss(newToast.id);
      }, newToast.duration ?? 3500);

      return () => clearTimeout(timer);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, [dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4"
    >
      {toasts.map((item) => {
        const isSuccess = item.type === "success";
        const isError = item.type === "error";
        return (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg shadow-black/10 text-sm text-foreground transition-all duration-200 animate-in fade-in slide-in-from-top-3 w-full"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isSuccess ? (
                <div className="rounded-full bg-emerald-50 p-1 text-emerald-600 shrink-0">
                  <CheckCircle2 className="size-4" />
                </div>
              ) : isError ? (
                <div className="rounded-full bg-rose-50 p-1 text-rose-600 shrink-0">
                  <AlertCircle className="size-4" />
                </div>
              ) : (
                <div className="rounded-full bg-brand-soft/60 p-1 text-brand shrink-0">
                  <Info className="size-4" />
                </div>
              )}
              <span className="font-medium text-foreground truncate">
                {item.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="text-foreground-muted hover:text-foreground p-1 rounded-md transition-colors cursor-pointer shrink-0"
              aria-label="Close notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
