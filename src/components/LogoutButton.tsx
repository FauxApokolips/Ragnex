"use client";

import { useAuth } from "@/lib/auth";

export default function LogoutButton() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <button
      onClick={logout}
      className="absolute top-4 right-4 rounded-lg bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700 transition"
    >
      Logout
    </button>
  );
}
