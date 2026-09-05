"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { unsubscribe } from "@/lib/api/notifications";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { withDisplayLanguage, readDisplayLanguage } from "@/lib/language";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const displayLanguage = readDisplayLanguage(searchParams.get("lang"));
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(token ? "idle" : "error");

  const handleUnsubscribe = () => {
    if (!token) return;
    setStatus("loading");
    unsubscribe(token)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  };

  return (
    <div className="min-h-[50vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
        {status === "idle" && (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-slate-900">Unsubscribe from Emails</h2>
            <p className="mt-2 text-slate-500 mb-6">
              Are you sure you want to stop receiving email notifications?
            </p>
            <div className="flex gap-4">
              <Link 
                href={withDisplayLanguage("/", displayLanguage)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button 
                onClick={handleUnsubscribe}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              >
                Unsubscribe
              </button>
            </div>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Processing...</h2>
            <p className="mt-2 text-slate-500">Unsubscribing you from email digests.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-teal-600 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Successfully Unsubscribed</h2>
            <p className="mt-2 text-slate-500 mb-6">
              You will no longer receive email digests. You can always turn them back on in your account settings.
            </p>
            <Link 
              href={withDisplayLanguage("/account/notifications", displayLanguage)}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500"
            >
              Manage Preferences
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Unsubscribe Failed</h2>
            <p className="mt-2 text-slate-500 mb-6">
              The unsubscribe link may be invalid or expired. Please log in to manage your email preferences.
            </p>
            <Link 
              href={withDisplayLanguage("/account/notifications", displayLanguage)}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500"
            >
              Manage Preferences
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
