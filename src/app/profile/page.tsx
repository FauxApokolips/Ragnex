// src/app/profile/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { setUserAvatar } from "@/lib/rtdb";
import { updateProfile } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [current, setCurrent] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user === undefined) return;          // still loading
    if (!user) { router.replace("/"); return; }
    const unsub = onValue(ref(rtdb, `users/${user.uid}/photoURL`), (snap) => {
      const v = snap.val() || user.photoURL || "";
      setCurrent(v);
      setUrl(v);
    });
    return () => unsub();
  }, [user, router]);

  if (!user) return null;

  async function save() {
    try {
  setSaving(true);

  if (!user) throw new Error("Not signed in");

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
    const g = user.photoURL || "";
    setUrl(g);
    await save();
  }

  return (
    <main className="mx-auto max-w-xl p-6 text-zinc-100">
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>

      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-800">
          { (url || current) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url || current || ""} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">No image</div>
          )}
        </div>
        <div className="text-sm">
          <div className="font-semibold">{user.displayName || "User"}</div>
          <div className="text-zinc-400">{user.email}</div>
        </div>
      </div>

      <label className="mt-6 block text-sm text-zinc-300">Avatar image URL</label>
      <input
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none focus:border-indigo-600"
        placeholder="https://example.com/me.jpg"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={useGooglePhoto}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2 text-zinc-200 hover:bg-zinc-800"
        >
          Use Google photo
        </button>
      </div>

      {msg && <div className="mt-4 text-sm text-zinc-300">{msg}</div>}
    </main>
  );
}
