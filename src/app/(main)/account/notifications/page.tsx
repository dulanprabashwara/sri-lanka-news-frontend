"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AccountLayout } from "@/components/account/account-layout";
import { Surface } from "@/components/ui/surface";
import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getPreferences, updatePreferences, NotificationPreference } from "@/lib/api/notifications";
import { readDisplayLanguage } from "@/lib/language";
import { Save, Bell, Clock } from "lucide-react";

export default function NotificationPreferencesPage() {
  const searchParams = useSearchParams();
  const displayLanguage = readDisplayLanguage(searchParams.get("lang"));

  const [prefs, setPrefs] = useState<NotificationPreference | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPreferences().then(setPrefs).catch((e) => {
      console.error(e);
      setError("Failed to load notification preferences.");
    });
  }, []);

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePreferences(prefs);
      setPrefs(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      setError("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (error && !prefs) {
    return (
      <AccountLayout
        title="Notification Preferences"
        description="Control how and when you receive news updates."
        activeSection="notifications"
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
        title="Notification Preferences"
        description="Control how and when you receive news updates."
        activeSection="notifications"
        displayLanguage={displayLanguage}
      >
        <Surface variant="elevated" className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </Surface>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout
      title="Notification Preferences"
      description="Control how and when you receive news updates."
      activeSection="notifications"
      displayLanguage={displayLanguage}
    >
      <div className="space-y-6">
        {/* Delivery Methods */}
        <Surface variant="elevated" className="p-6 space-y-4">
          <SectionHeader
            title="Delivery Channels"
            description="Choose where notifications are displayed."
          />
          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border text-brand-primary focus:ring-brand-primary"
                checked={prefs.inAppEnabled}
                onChange={(e) => setPrefs({ ...prefs, inAppEnabled: e.target.checked })}
              />
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4 text-brand-primary" />
                  In-app notifications
                </div>
                <div className="text-xs text-foreground-secondary">
                  Show unread badges and notification inbox updates in the website header.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border text-brand-primary focus:ring-brand-primary disabled:opacity-50"
                checked={prefs.emailEnabled}
                disabled={!prefs.emailAvailable}
                onChange={(e) => setPrefs({ ...prefs, emailEnabled: e.target.checked })}
              />
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span>Email notifications</span>
                  {!prefs.emailAvailable && (
                    <StatusBadge status="danger" label="Unavailable" size="sm" />
                  )}
                </div>
                <div className="text-xs text-foreground-secondary">
                  Receive email notifications for unread news updates.
                </div>
                {!prefs.emailAvailable && (
                  <p className="text-xs font-medium text-amber-700 mt-1">
                    Email delivery is not currently configured on this server environment.
                  </p>
                )}
              </div>
            </label>
          </div>
        </Surface>

        {/* Triggers & Followed News */}
        <Surface variant="elevated" className="p-6 space-y-4">
          <SectionHeader
            title="Notification Triggers"
            description="Select which news events trigger notifications."
          />
          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border text-brand-primary focus:ring-brand-primary"
                checked={prefs.sourceFollowNotificationsEnabled}
                onChange={(e) => setPrefs({ ...prefs, sourceFollowNotificationsEnabled: e.target.checked })}
              />
              <div>
                <div className="text-sm font-semibold text-foreground">Followed Sources</div>
                <div className="text-xs text-foreground-secondary">
                  Notify when news publishers you follow release new reports.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border text-brand-primary focus:ring-brand-primary"
                checked={prefs.topicFollowNotificationsEnabled}
                onChange={(e) => setPrefs({ ...prefs, topicFollowNotificationsEnabled: e.target.checked })}
              />
              <div>
                <div className="text-sm font-semibold text-foreground">Followed Topics</div>
                <div className="text-xs text-foreground-secondary">
                  Notify when new reports match topics you follow.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border text-brand-primary focus:ring-brand-primary"
                checked={prefs.storyUpdateNotificationsEnabled}
                onChange={(e) => setPrefs({ ...prefs, storyUpdateNotificationsEnabled: e.target.checked })}
              />
              <div>
                <div className="text-sm font-semibold text-foreground">Developing Story Updates</div>
                <div className="text-xs text-foreground-secondary">
                  Notify when major multi-publisher updates occur on stories you read.
                </div>
              </div>
            </label>
          </div>
        </Surface>

        {/* Quiet Hours */}
        <Surface variant="elevated" className="p-6 space-y-4">
          <SectionHeader
            title="Quiet Hours"
            description="Pause or delay email notification delivery during designated hours."
          />
          <div className="space-y-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-brand-primary focus:ring-brand-primary"
                checked={prefs.quietHoursEnabled}
                onChange={(e) => setPrefs({ ...prefs, quietHoursEnabled: e.target.checked })}
              />
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-primary" />
                Enable quiet hours
              </span>
            </label>

            {prefs.quietHoursEnabled && (
              <div className="pl-7 space-y-4 pt-2 border-l-2 border-border">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-2 focus:outline-brand"
                      value={prefs.quietHoursStart || "22:00"}
                      onChange={(e) => setPrefs({ ...prefs, quietHoursStart: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-2 focus:outline-brand"
                      value={prefs.quietHoursEnd || "07:00"}
                      onChange={(e) => setPrefs({ ...prefs, quietHoursEnd: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                    Timezone
                  </label>
                  <select
                    className="w-full sm:max-w-xs rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-2 focus:outline-brand"
                    value={prefs.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                    onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
                  >
                    <option value="Asia/Colombo">Asia/Colombo (Sri Lanka Standard Time)</option>
                    <option value="UTC">UTC</option>
                    <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                      {Intl.DateTimeFormat().resolvedOptions().timeZone} (Device Local)
                    </option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </Surface>

        {/* Footer Actions & Status Feedback */}
        <Surface variant="muted" className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-medium text-foreground-secondary">
            {saved ? (
              <span className="text-emerald-700 font-bold">✓ Notification preferences saved successfully.</span>
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
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </Surface>
      </div>
    </AccountLayout>
  );
}
