// src/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user, login } = useAuth();
  const router = useRouter();

  // When auth state settles: if signed in, go to /rooms
  useEffect(() => {
    if (user === undefined) return;        // still loading
    if (user) router.replace("/rooms");    // already logged in
  }, [user, router]);

  // While auth bootstraps, show a minimal screen
  if (user === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-zinc-300">
        Loading…
      </main>
    );
  }

  // Not signed in → show login button
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="mb-6 text-3xl font-bold">Welcome to Realtime Chat</h1>
      <button
        onClick={login}
        className="rounded-xl bg-indigo-600 px-6 py-3 text-lg font-semibold text-white hover:bg-indigo-500"
      >
        Sign in with Google
      </button>
    </main>
  );
}
