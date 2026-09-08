"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ProfileForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name.trim() },
      });
      if (error) throw error;
      router.refresh();
      setMessage({ type: "success", text: "Profile updated successfully. Changes will appear globally." });
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <form onSubmit={updateProfile} className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label htmlFor="full-name" className="block text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1">
            Display Name
          </label>
          <input
            id="full-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter display name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus-visible:outline-brand"
          />
        </div>
        <div className="flex flex-col gap-1 items-end shrink-0">
          <button
            disabled={loading || name.trim() === initialName}
            className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover disabled:opacity-50 text-sm h-[38px]"
          >
            {loading ? "Updating..." : "Update Name"}
          </button>
        </div>
      </form>
      {message && (
        <p className={`text-xs font-semibold mt-2 ${message.type === "error" ? "text-danger" : "text-brand"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
