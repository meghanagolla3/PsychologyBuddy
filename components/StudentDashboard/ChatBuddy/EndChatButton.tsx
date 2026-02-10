"use client";
import { useState } from "react";

export default function EndChatButton({ sessionId, studentId, messages, endChat, onChatEnded }: any) {
  const [loading, setLoading] = useState(false);

  const handleEndChat = async () => {
    if (!sessionId || !studentId) return;

    try {
      setLoading(true);

      // 1️⃣ End the chat session (your hook logic)
      await endChat();

      // 2️⃣ Call summary generation API
      const res = await fetch("/api/students/summary/generate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": studentId
        },
        body: JSON.stringify({
          sessionId,
          conversation: messages.map((msg: any) => ({
            role: msg.sender === "student" ? "user" : "assistant",
            content: msg.content
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        // store for last-session preview use
        sessionStorage.setItem("lastSummaryId", data.data.id);

        onChatEnded?.(data.data);

        // 3️⃣ Redirect to summary modal page
        window.location.href = `/students/summaries/${sessionId}`;
      }
    } catch (err) {
      console.error("Failed to end chat:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEndChat}
      disabled={loading}
      className="px-4 py-2 bg-red-500 text-white rounded-lg"
    >
      {loading ? "Ending..." : "End Chat"}
    </button>
  );
}
