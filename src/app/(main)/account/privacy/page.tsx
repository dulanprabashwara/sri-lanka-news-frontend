"use client";

import { useEffect, useState } from "react";
import { getPreferences, updatePreferences } from "@/lib/api/user";
import { UserPreferences } from "@/types/api";
import { Shield, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PrivacySettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dntActive, setDntActive] = useState(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.doNotTrack === '1' || (window as unknown as { doNotTrack?: string }).doNotTrack === '1' || !!(navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl;
    }
    return false;
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        getPreferences(session.access_token).then(setPrefs).catch(console.error);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No token");
      
      const updated = await updatePreferences(session.access_token, {
        preferredDisplayLanguage: prefs.preferredDisplayLanguage,
        preferredCategories: prefs.preferredCategories,
        analyticsEnabled: prefs.analyticsEnabled
      });
      setPrefs(updated);
      
      // Update local storage so client doesn't wait for API on next load
      localStorage.setItem('analytics_enabled', String(prefs.analyticsEnabled));
      
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
        <h1 className="text-2xl font-bold text-slate-900">Privacy & Data</h1>
        <p className="text-slate-500 mt-1">Manage how your data is used to improve the platform.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
        
        {/* Analytics & Telemetry */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            Analytics & Telemetry
          </h2>
          
          {dntActive && (
            <div className="mb-4 p-4 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <strong>Note:</strong> We detected a &quot;Do Not Track&quot; or &quot;Global Privacy Control&quot; signal from your browser. Our platform automatically respects this, and telemetry is disabled on your device regardless of this setting.
            </div>
          )}

          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
                checked={prefs.analyticsEnabled}
                onChange={e => setPrefs({...prefs, analyticsEnabled: e.target.checked})}
                disabled={dntActive}
              />
              <div>
                <div className="font-medium text-slate-900">Help improve the platform</div>
                <div className="text-sm text-slate-500 mt-1">
                  Allow the platform to collect basic, privacy-preserving usage data (like which articles are read). 
                  We never store your search queries or IP address, and all analytics data is entirely anonymous.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {saved ? (
              <span className="text-teal-600 font-medium">Preferences saved successfully!</span>
            ) : (
              <span>Changes take effect immediately.</span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={saving || dntActive}
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
