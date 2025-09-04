"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { sendMessage, setTyping } from "@/lib/rtdb";
import EmojiPicker from "./EmojiPicker";

export default function ChatInput({ roomId }: { roomId: string }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const idle = useRef<any>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setText(val);
    if (!user) return;
    setTyping(roomId, user.uid, true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setTyping(roomId, user.uid, false), 1200);
  }

  async function onSend() {
    if (!text.trim() || !user) return;
    await sendMessage(roomId, user.uid, text.trim());
    setText("");
    setTyping(roomId, user.uid, false);
    inputRef.current?.focus();
  }

  function addEmoji(char: string) {
    if (!char) return;
    setText((t) => (t || "") + char);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="relative mt-2 flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-11 w-11 place-items-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
        title="Emoji"
      >
        <span style={{ fontSize: 20 }}>😊</span>
      </button>

      <input
        ref={inputRef}
        value={text}
        onChange={onChange}
        placeholder="Type a message…"
        className="flex-1 h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />

      <button
        onClick={onSend}
        disabled={!text.trim()}
        className="h-11 rounded-xl bg-indigo-600 px-5 text-white shadow disabled:opacity-50"
      >
        Send
      </button>

      {/* popover */}
      <EmojiPicker open={open} onClose={() => setOpen(false)} onPick={addEmoji} />
    </div>
  );
}
