"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Surface } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { unsubscribe } from "@/lib/api/notifications";
import { withDisplayLanguage, readDisplayLanguage } from "@/lib/language";
import { CheckCircle2, XCircle, Loader2, MailX } from "lucide-react";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const displayLanguage = readDisplayLanguage(searchParams.get("lang"));

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    token ? "idle" : "error"
  );

  const handleUnsubscribe = () => {
    if (!token) return;
    setStatus("loading");
    unsubscribe(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Surface variant="elevated" className="max-w-md w-full p-8 text-center space-y-6">
        {status === "idle" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-rose-50 text-rose-600">
              <MailX className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Unsubscribe from Email Notifications</h2>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Are you sure you want to stop receiving email notifications for unread news updates?
              </p>
            </div>
            <div className="flex gap-3 pt-2 w-full">
              <Link
                href={withDisplayLanguage("/", displayLanguage)}
                className="flex-1 inline-flex justify-center items-center rounded-lg border border-border bg-surface-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-muted transition-colors"
              >
                Cancel
              </Link>
              <Button
                variant="outline"
                onClick={handleUnsubscribe}
                className="flex-1 bg-rose-600 text-white hover:bg-rose-700 border-transparent text-xs font-semibold"
              >
                Unsubscribe
              </Button>
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center space-y-4 py-4">
            <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Processing Request...</h2>
              <p className="text-xs text-foreground-secondary">
                Updating your email notification delivery preferences.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Successfully Unsubscribed</h2>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                You will no longer receive email notifications. You can modify your preferences at any time in Account Settings.
              </p>
            </div>
            <Link
              href={withDisplayLanguage("/account/notifications", displayLanguage)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-secondary transition-colors"
            >
              Manage Preferences
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-rose-50 text-rose-600">
              <XCircle className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Unsubscribe Request Failed</h2>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                The unsubscribe link may be invalid or expired. Please sign in to manage your email notification settings directly.
              </p>
            </div>
            <Link
              href={withDisplayLanguage("/account/notifications", displayLanguage)}
              className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white hover:bg-brand-secondary transition-colors"
            >
              Manage Preferences
            </Link>
          </div>
        )}
      </Surface>
    </div>
  );
}
