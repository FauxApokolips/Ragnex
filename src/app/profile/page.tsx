"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { setUserAvatar } from "@/lib/rtdb";
import { updateProfile } from "firebase/auth";

export default function ProfilePage() {
  const { user } = useAuth();
  const [url, setUrl] = useState(user?.photoURL || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    try {
      if (!user) {
        setMsg("Not signed in");
        return;
      }

      setSaving(true);

      await setUserAvatar(user.uid, url.trim());
      await updateProfile(user, { photoURL: url.trim() || null });

      setMsg("Saved!");
      setTimeout(() => setMsg(null), 1500);
    } catch (e) {
      console.error(e);
      setMsg("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function useGooglePhoto() {
    if (!user) {
      setMsg("Not signed in");
      return;
    }
    const g = user.photoURL || "";
    setUrl(g);
    await save();
  }

  return (
    <div className="mx-auto max-w-lg py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-100">Profile</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400">Avatar URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-zinc-100 outline-none focus:ring-2 focus:ring-violet-600"
            placeholder="https://example.com/avatar.png"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-violet-700 px-4 py-2 text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          <button
            onClick={useGooglePhoto}
            disabled={!user}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
          >
            Use Google Photo
          </button>
        </div>

        {msg && (
          <p className="text-sm text-zinc-400 transition">{msg}</p>
        )}
      </div>
    </div>
  );
}
