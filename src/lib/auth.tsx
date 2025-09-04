// src/lib/auth.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  setPersistence,
  browserLocalPersistence,
  User,
} from "firebase/auth";
import { rtdb } from "./firebase";
import { ref, serverTimestamp, set, onDisconnect } from "firebase/database";

// init auth once
const auth = getAuth();

// presence helpers (optional)
async function goOnline(uid: string) {
  const presRef = ref(rtdb, `presence/${uid}`);
  await set(presRef, serverTimestamp());
  onDisconnect(presRef).remove().catch(() => {});
}

type AuthCtx = {
  user: User | null | undefined; // undefined while loading
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    // persist session across reloads
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // store minimal user profile for names/avatars
        await set(ref(rtdb, `users/${u.uid}`), {
          displayName: u.displayName || "Anonymous",
          photoURL: u.photoURL || "",
          // storing timestamp is fine; serverTimestamp resolves on RTDB
          seenAt: serverTimestamp(),
        }).catch(() => {});
        goOnline(u.uid).catch(() => {});
      }
    });
    return () => unsub();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await fbSignOut(auth);
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
