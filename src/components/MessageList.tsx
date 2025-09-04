"use client";
import { useEffect, useRef, useState } from "react";
import { onValue, ref as dbRef } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { listenRecentMessages } from "@/lib/rtdb";
import { useAuth } from "@/lib/auth";

type Msg = { id: string; uid: string; text: string; createdAt: number; deleted?: boolean };
type UsersMap = Record<string, { displayName?: string; photoURL?: string }>;

function hashToHue(id: string) {
  // simple deterministic hash -> 0..359
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}
function colorForUser(uid: string) {
  const hue = hashToHue(uid);
  // darker bg for dark theme, readable fg
  const bg = `hsl(${hue} 45% 22%)`;
  const bubble = `hsl(${hue} 85% 56%)`; // accent line/own name chip if needed
  const fg = `hsl(${hue} 100% 88%)`;
  return { hue, bg, bubble, fg };
}
function initials(name?: string) {
  if (!name) return "U";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || "")
    .join("");
}

export default function MessageList({ roomId }: { roomId: string }) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [users, setUsers] = useState<UsersMap>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stop = listenRecentMessages(roomId, 100, (m) => {
      setMsgs((prev) => [...prev, m]);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    const unsubUsers = onValue(dbRef(rtdb, "users"), (snap) => {
      setUsers((snap.val() as UsersMap) || {});
    });
    return () => {
      stop();
      unsubUsers();
    };
  }, [roomId]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950">
      {msgs.map((m) => {
        const mine = user && m.uid === user.uid;
        const profile = users[m.uid] || {};
        const name = profile.displayName || "User";
        const time = new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        if (mine) {
          // my bubble: strong indigo, white text
          return (
            <div key={m.id} className="ml-auto max-w-[80%] rounded-2xl bg-indigo-600 px-4 py-2 text-white shadow-sm">
              <div className="whitespace-pre-wrap break-words text-[15px] leading-snug">
                {m.deleted ? "Message deleted" : m.text}
              </div>
              <div className="mt-1 text-[11px] text-indigo-200/90">{time}</div>
            </div>
          );
        }

        // others: dark colored bubble with name row
        const clr = colorForUser(m.uid);
        return (
          <div
            key={m.id}
            className="max-w-[80%] rounded-2xl px-4 py-2 shadow-sm border"
            style={{ backgroundColor: clr.bg, borderColor: "rgba(255,255,255,0.08)", color: "#F5F5F6" }}
          >
            <div className="mb-1 flex items-center gap-2">
              {profile.photoURL ? (
                <img
                  alt={name}
                  src={profile.photoURL}
                  className="h-5 w-5 rounded-full ring-2 ring-black/30"
                  style={{ backgroundColor: clr.bubble }}
                />
              ) : (
                <div
                  className="h-5 w-5 rounded-full text-[10px] font-semibold grid place-items-center ring-2 ring-black/30"
                  style={{ backgroundColor: clr.bubble, color: "white" }}
                  aria-hidden
                >
                  {initials(name)}
                </div>
              )}
              <span className="text-xs font-medium opacity-90">{name}</span>
            </div>
            <div className="whitespace-pre-wrap break-words text-[15px] leading-snug">
              {m.deleted ? "Message deleted" : m.text}
            </div>
            <div className="mt-1 text-[11px] opacity-70">{time}</div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
