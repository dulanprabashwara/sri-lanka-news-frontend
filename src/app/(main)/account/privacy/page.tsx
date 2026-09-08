"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AccountLayout } from "@/components/account/account-layout";
import { Surface } from "@/components/ui/surface";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getPreferences, updatePreferences } from "@/lib/api/user";
import { readDisplayLanguage } from "@/lib/language";
import { UserPreferences } from "@/types/api";
import { Shield, Save, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PrivacySettingsPage() {
  const searchParams = useSearchParams();
  const displayLanguage = readDisplayLanguage(searchParams.get("lang"));

  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dntActive = typeof window !== "undefined" && typeof navigator !== "undefined"
    ? navigator.doNotTrack === "1" ||
      (window as unknown as { doNotTrack?: string }).doNotTrack === "1" ||
      !!(navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl
    : false;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        getPreferences(session.access_token)
          .then(setPrefs)
          .catch((e) => {
            console.error(e);
            setError("Failed to load privacy preferences.");
          });
      }
    });
  }, []);

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No session");

      const updated = await updatePreferences(session.access_token, {
        preferredDisplayLanguage: prefs.preferredDisplayLanguage,
        preferredCategories: prefs.preferredCategories,
        analyticsEnabled: prefs.analyticsEnabled,
      });
      setPrefs(updated);

      localStorage.setItem("analytics_enabled", String(prefs.analyticsEnabled));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      setError("Failed to save privacy options. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (error && !prefs) {
    return (
      <AccountLayout
        title="Privacy & Data"
        description="Manage usage analytics preferences and browser privacy controls."
        activeSection="privacy"
        displayLanguage={displayLanguage}
      >
        <Surface variant="elevated" className="p-6 text-center text-foreground-secondary">
          <p>{error}</p>
        </Surface>
      </AccountLayout>
    );
  }

  if (!prefs) {
    return (
      <AccountLayout
        title="Privacy & Data"
        description="Manage usage analytics preferences and browser privacy controls."
        activeSection="privacy"
        displayLanguage={displayLanguage}
      >
        <Surface variant="elevated" className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-20 w-full" />
        </Surface>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout
      title="Privacy & Data"
      description="Manage usage analytics preferences and browser privacy controls."
      activeSection="privacy"
      displayLanguage={displayLanguage}
    >
      <div className="space-y-6">
        {/* Analytics & Telemetry */}
        <Surface variant="elevated" className="p-6 space-y-4">
          <SectionHeader
            title="Usage Analytics & Privacy"
            description="Control how optional, privacy-preserving usage data is handled."
          />

          {dntActive && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <EyeOff className="w-4 h-4 text-amber-800" />
                Browser Privacy Signal Detected
              </div>
              <p>
                Your browser sent a &quot;Do Not Track&quot; (DNT) or &quot;Global Privacy Control&quot; (GPC) signal.
                Our platform automatically honors your browser settings and suppresses optional analytics telemetry on this device.
              </p>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border text-brand focus:ring-brand"
                checked={prefs.analyticsEnabled}
                onChange={(e) => setPrefs({ ...prefs, analyticsEnabled: e.target.checked })}
              />
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand" />
                  Help improve news intelligence quality
                </div>
                <div className="text-xs text-foreground-secondary leading-relaxed">
                  Allow the platform to collect basic, privacy-preserving usage metrics (such as aggregate article reading counts).
                  Search terms and IP addresses are never recorded, and all analytics remain completely anonymous.
                </div>
                {dntActive && (
                  <div className="pt-1">
                    <StatusBadge status="warning" label="Telemetry suppressed on this device by browser DNT/GPC signal" size="sm" />
                  </div>
                )}
              </div>
            </label>
          </div>
        </Surface>

        {/* Footer Actions & Status Feedback */}
        <Surface variant="muted" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-medium text-foreground-secondary">
            {saved ? (
              <span className="text-emerald-700 font-bold">✓ Privacy settings saved successfully.</span>
            ) : error ? (
              <span className="text-rose-700 font-bold">{error}</span>
            ) : (
              <span>Changes take effect immediately upon saving.</span>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 w-full sm:w-auto shrink-0"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Privacy Options"}
          </Button>
        </Surface>
      </div>
    </AccountLayout>
  );
}
