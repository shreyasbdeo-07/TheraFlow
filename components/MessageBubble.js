"use client";
import { format } from "date-fns";

/**
 * MessageBubble
 * Renders a single chat message — either from the user (right) or the AI (left).
 *
 * Props:
 *   message: { role: "user"|"assistant", content: string, timestamp: Date|Timestamp }
 */
export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  // Handle both JS Date objects and Firestore Timestamps
  let time = "";
  try {
    const ts = message.timestamp?.toDate?.()
      ?? (message.timestamp instanceof Date ? message.timestamp : null);
    if (ts) time = format(ts, "h:mm a");
  } catch {
    // Timestamp not yet available (optimistic render)
  }

  return (
    <div
      className={`flex items-end gap-2.5 mb-2 animate-fade-in ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-2xl flex items-center justify-center text-sm flex-shrink-0 mb-0.5 ${
          isUser
            ? "bg-lavender-100 text-lavender-700"
            : "bg-sage-100 text-sage-700"
        }`}
      >
        {isUser ? "😊" : "🌿"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-sage-500 text-white rounded-br-sm"
              : "bg-white text-stone-700 border border-stone-100 rounded-bl-sm"
          }`}
        >
          {/* Render with preserved line breaks */}
          {message.content.split("\n").map((line, i, arr) => (
            <span key={i}>
              {line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Timestamp */}
        {time && (
          <span className="text-xs text-stone-300 px-1">{time}</span>
        )}
      </div>
    </div>
  );
}
