"use client";

import { useEffect, useState } from "react";
import { getPreferences, updatePreferences, NotificationPreference } from "@/lib/api/notifications";
import { Save, Bell, Mail, Clock } from "lucide-react";

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPreference | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPreferences().then(setPrefs).catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      const updated = await updatePreferences(prefs);
      setPrefs(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (!prefs) {
    return <div className="p-8 text-center text-slate-500">Loading preferences...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Notification Settings</h1>
        <p className="text-slate-500 mt-1">Control how and when you receive updates.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
        
        {/* Delivery Methods */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-400" />
            Delivery Methods
          </h2>
          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                checked={prefs.inAppEnabled}
                onChange={e => setPrefs({...prefs, inAppEnabled: e.target.checked})}
              />
              <div>
                <div className="font-medium text-slate-900">In-app notifications</div>
                <div className="text-sm text-slate-500">Show a badge and list inside the website</div>
              </div>
            </label>
            
            <label className="flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                checked={prefs.emailEnabled}
                disabled={!prefs.emailAvailable}
                onChange={e => setPrefs({...prefs, emailEnabled: e.target.checked})}
              />
              <div>
                <div className="font-medium text-slate-900">Email notifications</div>
                <div className="text-sm text-slate-500">Receive email alerts for your unread notifications</div>
                {!prefs.emailAvailable && (
                  <div className="text-sm text-amber-600 mt-1">
                    Email delivery is not configured on this server.
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Triggers */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">What to notify about</h2>
          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                checked={prefs.sourceFollowNotificationsEnabled}
                onChange={e => setPrefs({...prefs, sourceFollowNotificationsEnabled: e.target.checked})}
              />
              <div>
                <div className="font-medium text-slate-900">Followed Sources</div>
                <div className="text-sm text-slate-500">When sources you follow publish major news</div>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                checked={prefs.topicFollowNotificationsEnabled}
                onChange={e => setPrefs({...prefs, topicFollowNotificationsEnabled: e.target.checked})}
              />
              <div>
                <div className="font-medium text-slate-900">Followed Topics</div>
                <div className="text-sm text-slate-500">When articles match your followed topics</div>
              </div>
            </label>

            <label className="flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                checked={prefs.storyUpdateNotificationsEnabled}
                onChange={e => setPrefs({...prefs, storyUpdateNotificationsEnabled: e.target.checked})}
              />
              <div>
                <div className="font-medium text-slate-900">Story Updates</div>
                <div className="text-sm text-slate-500">When a developing story you read has major updates</div>
              </div>
            </label>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Quiet Hours
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                checked={prefs.quietHoursEnabled}
                onChange={e => setPrefs({...prefs, quietHoursEnabled: e.target.checked})}
              />
              <span className="font-medium text-slate-900">Mute email notifications during quiet hours</span>
            </label>
            
            {prefs.quietHoursEnabled && (
              <div className="flex items-center gap-4 pl-7">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Start Time</label>
                  <input 
                    type="time" 
                    className="rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    value={prefs.quietHoursStart || "22:00"}
                    onChange={e => setPrefs({...prefs, quietHoursStart: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">End Time</label>
                  <input 
                    type="time" 
                    className="rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    value={prefs.quietHoursEnd || "07:00"}
                    onChange={e => setPrefs({...prefs, quietHoursEnd: e.target.value})}
                  />
                </div>
              </div>
            )}
            
            {prefs.quietHoursEnabled && (
              <div className="pl-7">
                <label className="block text-xs font-medium text-slate-500 mb-1">Timezone</label>
                <select 
                  className="rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm max-w-xs w-full"
                  value={prefs.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                  onChange={e => setPrefs({...prefs, timezone: e.target.value})}
                >
                  <option value="Asia/Colombo">Asia/Colombo</option>
                  <option value="UTC">UTC</option>
                  <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                    {Intl.DateTimeFormat().resolvedOptions().timeZone} (Local)
                  </option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {saved ? (
              <span className="text-teal-600 font-medium">Preferences saved successfully!</span>
            ) : (
              <span>Changes will take effect immediately.</span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}
