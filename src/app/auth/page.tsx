"use client";
import { useAuth } from "@/lib/auth";

export default function AuthPage() {
  const { user, login, logout } = useAuth();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Auth</h2>
      {!user ? (
        <button onClick={login} className="rounded-xl bg-black text-white px-4 py-2">Sign in with Google</button>
      ) : (
        <button onClick={logout} className="rounded-xl border px-4 py-2">Sign out</button>
      )}
    </div>
  );
}
