// src/components/EmojiPicker.tsx
"use client";
import { useEffect, useRef } from "react";

type Props = { open: boolean; onClose: () => void; onPick: (emoji: string) => void };

export default function EmojiPicker({ open, onClose, onPick }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  // Load the web component only on the client and only when we open the picker
  useEffect(() => {
    if (!open) return;

    let mounted = true;
    (async () => {
      await import("emoji-picker-element");
      if (!mounted) return;

      const el = ref.current as any;
      if (!el) return;
      const handler = (e: any) => onPick(e.detail?.unicode || "");
      el.addEventListener("emoji-click", handler);
      return () => el.removeEventListener("emoji-click", handler);
    })();

    return () => {
      mounted = false;
    };
  }, [open, onPick]);

  // Close when clicking outside
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!open || !ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute bottom-14 left-0 z-50">
      {/* @ts-ignore custom element from emoji-picker-element */}
      <emoji-picker ref={ref as any} theme="dark" style={{ width: 320, borderRadius: 12 }} />
    </div>
  );
}
