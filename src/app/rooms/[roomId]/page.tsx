// app/rooms/[roomId]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import { listenTyping } from "@/lib/rtdb";

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params?.roomId;
  const router = useRouter();
  const { user } = useAuth();
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
  if (user === null) router.push("/"); // when not logged in
}, [user, router]);

  // Subscribe to typing indicator
  useEffect(() => {
    if (!roomId) return;
    const stop = listenTyping(roomId, setTypingMap);
    return () => stop && stop();
  }, [roomId]);

  if (!roomId) return <div className="p-4">Invalid room id.</div>;
  if (!user) return <div className="p-4">Please sign in first.</div>;

  const othersTyping = Object.keys(typingMap || {}).filter((uid) => uid !== user.uid);

  return (
    <div className="flex flex-col h-[80vh] gap-3 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold break-all">Room: {roomId}</h3>
      </div>

      <MessageList roomId={roomId} />

      {othersTyping.length > 0 && (
        <div className="px-3 text-sm text-gray-500">Someone is typing…</div>
      )}

      <ChatInput roomId={roomId} />
    </div>
  );
}
  