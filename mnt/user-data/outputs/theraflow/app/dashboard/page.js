"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  getConversation,
  saveMessage,
  createConversation,
  updateConversationTitle,
} from "@/lib/firestore";
import MessageBubble from "@/components/MessageBubble";
import TypingIndicator from "@/components/TypingIndicator";

// ── Suggestion chips shown on empty chat ──────────────────
const SUGGESTIONS = [
  "I've been feeling anxious lately",
  "Help me with a breathing exercise",
  "I'm struggling with work stress",
  "I need help sleeping better",
  "I feel overwhelmed and don't know why",
  "Tell me a grounding technique",
];

export default function DashboardPage() {
  const searchParams   = useSearchParams();
  const conversationId = searchParams.get("convo");

  const [user, setUser]         = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [convoId, setConvoId]   = useState(conversationId);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const textareaRef = useRef(null);

  // Auth observer
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  // Load existing conversation
  useEffect(() => {
    if (!conversationId || !user) return;
    setConvoId(conversationId);

    (async () => {
      const msgs = await getConversation(user.uid, conversationId);
      setMessages(msgs);
    })();
  }, [conversationId, user]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function sendMessage(text) {
    if (!text.trim() || !user) return;
    setInput("");

    const userMsg = { role: "user", content: text.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    // Create a new conversation doc if needed
    let activeConvoId = convoId;
    if (!activeConvoId) {
      activeConvoId = await createConversation(user.uid, text.trim().slice(0, 50));
      setConvoId(activeConvoId);
      // Update URL without navigation
      window.history.replaceState(null, "", `/dashboard?convo=${activeConvoId}`);
    }

    // Save user message to Firestore
    await saveMessage(user.uid, activeConvoId, userMsg);

    try {
      // Call secure backend API route
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role:    m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data    = await res.json();
      const aiText  = data.reply ?? "I'm here. Could you tell me more?";
      const aiMsg   = { role: "assistant", content: aiText, timestamp: new Date() };

      setMessages((prev) => [...prev, aiMsg]);
      await saveMessage(user.uid, activeConvoId, aiMsg);

      // Set conversation title from first exchange
      if (messages.length === 0) {
        await updateConversationTitle(
          user.uid,
          activeConvoId,
          text.trim().slice(0, 60)
        );
      }
    } catch {
      const errMsg = {
        role: "assistant",
        content: "I'm sorry, I encountered a small issue connecting right now. Please try again in a moment — I'm here for you 🌿",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Messages area ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-2xl mx-auto space-y-1">

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-12 pb-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-sage-100 flex items-center justify-center text-3xl mb-5 shadow-soft">
                🌿
              </div>
              <h2 className="font-display text-2xl font-bold text-stone-800 mb-2">
                Hi{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}! I&apos;m TheraFlow
              </h2>
              <p className="text-stone-400 text-sm max-w-sm leading-relaxed mb-8">
                This is your safe space. Share what&apos;s on your mind — whatever you&apos;re
                feeling, you can say it here.
              </p>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="px-4 py-2 rounded-2xl border border-stone-200 bg-white text-stone-600 text-sm hover:bg-sage-50 hover:border-sage-200 hover:text-sage-700 transition-all duration-150 shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {/* Typing indicator */}
          {typing && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ─────────────────────────────────────── */}
      <div className="px-4 md:px-8 py-4 border-t border-stone-100 bg-white/70 backdrop-blur-md">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3 glass rounded-3xl px-4 py-3 shadow-soft border border-stone-100">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-grow
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind…"
              className="flex-1 bg-transparent outline-none resize-none text-stone-800 placeholder-stone-400 text-sm leading-relaxed min-h-[24px] max-h-[160px] font-body py-0.5"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || typing}
              className="w-9 h-9 rounded-2xl bg-sage-500 text-white flex items-center justify-center hover:bg-sage-600 active:scale-90 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Send"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-stone-300 mt-2">
            TheraFlow is a wellness tool, not a licensed therapist. For emergencies, call a crisis line.
          </p>
        </div>
      </div>
    </div>
  );
}
