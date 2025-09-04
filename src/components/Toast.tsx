"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Toast = { id: string; title: string; body?: string };

const ToastCtx = createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setItems((arr) => [...arr, { id, ...t }]);
    setTimeout(() => setItems((arr) => arr.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      {/* portal-ish fixed container */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex w-[320px] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto rounded-xl border border-zinc-800 bg-zinc-900/95 p-3 shadow-lg backdrop-blur"
          >
            <div className="text-sm font-semibold text-zinc-100">{t.title}</div>
            {t.body && <div className="mt-1 text-xs text-zinc-400">{t.body}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
