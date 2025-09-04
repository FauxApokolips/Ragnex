// app/rooms/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onValue, push, ref, serverTimestamp } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth";

type Room = { id: string; name?: string; createdAt?: number; createdBy?: string };

export default function RoomsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newName, setNewName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [busy, setBusy] = useState(false);

  // Subscribe to rooms list
  useEffect(() => {
    const unsub = onValue(ref(rtdb, "rooms"), (snap) => {
      const val = snap.val() || {};
      const arr: Room[] = Object.entries(val).map(([id, v]: any) => ({
        id,
        name: v?.name,
        createdAt: v?.createdAt,
        createdBy: v?.createdBy,
      }));
      // newest first
      arr.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setRooms(arr);
    });
    return () => unsub();
  }, []);

  async function createRoom() {
    if (!user || !newName.trim()) return;
    try {
      setBusy(true);
      const refRooms = ref(rtdb, "rooms");
      const node = await push(refRooms, {
        name: newName.trim(),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });
      setNewName("");
      router.push(`/rooms/${node.key}`);
    } finally {
      setBusy(false);
    }
  }

  function joinRoom() {
    if (!joinId.trim()) return;
    router.push(`/rooms/${joinId.trim()}`);
  }

  const disabledCreate = useMemo(() => !newName.trim() || !user || busy, [newName, user, busy]);
  const disabledJoin = useMemo(() => !joinId.trim(), [joinId]);

  return (
    <div className="mx-auto max-w-3xl p-6 text-zinc-100">
      <h1 className="mb-5 text-3xl font-bold tracking-tight">Rooms</h1>

      {/* Actions */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New room name"
            className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={createRoom}
            disabled={disabledCreate}
            className="h-11 rounded-xl bg-indigo-600 px-5 text-white shadow disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            placeholder="Enter roomId to join"
            className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={joinRoom}
            disabled={disabledJoin}
            className="h-11 rounded-xl border border-zinc-700 bg-zinc-950 px-5 text-zinc-100 hover:bg-zinc-900 disabled:opacity-50"
          >
            Join
          </button>
        </div>
      </div>

      {/* Rooms list */}
      {rooms.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-400">
          No rooms yet. Create one above 👆
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="group flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-indigo-600 hover:bg-zinc-900"
              onClick={() => router.push(`/rooms/${r.id}`)}
            >
              <div>
                <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                  {r.name || "Untitled room"}
                </div>
                <div className="text-xs text-zinc-500">roomId: <span className="font-mono">{r.id}</span></div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  title="Copy roomId"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(r.id);
                  }}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
                >
                  Copy
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/rooms/${r.id}`);
                  }}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-500"
                >
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
