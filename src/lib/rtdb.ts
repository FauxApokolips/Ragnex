import { rtdb } from "./firebase";
import {
  ref, push, set, onChildAdded, onValue, query, limitToLast, startAt, get, off
} from "firebase/database";

// ---- Rooms ----
export async function createRoom(name: string, uid: string) {
  const roomRef = push(ref(rtdb, "rooms"));
  const roomId = roomRef.key!;
  const createdAt = Date.now();
  await set(roomRef, { name, createdBy: uid, createdAt });
  await set(ref(rtdb, `roomMembers/${roomId}/${uid}`), { role: "owner", joinedAt: createdAt });
  return roomId;
}

export function listenRooms(cb: (rooms: Record<string, any>) => void) {
  const r = ref(rtdb, "rooms");
  const unsub = onValue(r, (snap) => cb(snap.val() || {}));
  return () => off(r);
}

export async function joinRoom(roomId: string, uid: string) {
  await set(ref(rtdb, `roomMembers/${roomId}/${uid}`), { role: "member", joinedAt: Date.now() });
}

// ---- Messages ----
export async function sendMessage(roomId: string, uid: string, text: string) {
  const msgRef = push(ref(rtdb, `messages/${roomId}`));
  await set(msgRef, { uid, text, createdAt: Date.now(), deleted: false });
}

export function listenRecentMessages(roomId: string, pageSize = 50, onAdd: (msg: any) => void) {
  const q = query(ref(rtdb, `messages/${roomId}`), limitToLast(pageSize));
  return onChildAdded(q, (snap) => onAdd({ id: snap.key, ...snap.val() }));
}

// Pagination (older): fetch messages starting at timestamp
export async function fetchOlder(roomId: string, startTimestamp: number, pageSize = 50) {
  const q = query(ref(rtdb, `messages/${roomId}`), startAt(startTimestamp), limitToLast(pageSize));
  const snap = await get(q);
  const arr: any[] = [];
  snap.forEach((c) => arr.push({ id: c.key, ...c.val() }));
  return arr;
}

// ---- Typing ----
export async function setTyping(roomId: string, uid: string, val: boolean) {
  const r = ref(rtdb, `typing/${roomId}/${uid}`);
  return val ? set(r, true) : set(r, null);
}
export function listenTyping(roomId: string, cb: (map: Record<string, boolean>) => void) {
  const r = ref(rtdb, `typing/${roomId}`);
  return onValue(r, (snap) => cb(snap.val() || {}));
}

// ---- Presence ----
export function goOnline(uid: string) {
  const statusRef = ref(rtdb, `status/${uid}`);
  set(statusRef, { state: "online", lastChanged: Date.now() });

  const connectedRef = ref(rtdb, ".info/connected");
  const unsub = onValue(connectedRef, (snap) => {
    if (snap.val() === false) return;
    import("firebase/database").then(({ onDisconnect }) => {
      onDisconnect(statusRef).set({ state: "offline", lastChanged: Date.now() });
      set(statusRef, { state: "online", lastChanged: Date.now() });
    });
  });
  return () => off(connectedRef);
}
