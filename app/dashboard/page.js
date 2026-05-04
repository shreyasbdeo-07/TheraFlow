"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { createConversation, saveMessage, getUserPrefs } from "@/lib/firestore";

const STARTERS = [
  "I've been feeling anxious lately and don't know why...",
  "I want to talk about something that happened today.",
  "How can I manage stress during exam season?",
  "I'm struggling to sleep and my mind won't stop.",
];

function TypingDots() {
  return (
    <div className="flex items-end gap-2.5 mb-2 animate-fade-in">
      <div className="w-8 h-8 rounded-2xl bg-sage-100 flex items-center justify-center text-sm flex-shrink-0">
        🌿
      </div>
      <div className="bg-white border border-stone-100 rounded-3xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot w-2 h-2 rounded-full bg-sage-300 inline-block"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-2.5 mb-2 animate-fade-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-8 h-8 rounded-2xl flex items-center justify-center text-sm flex-shrink-0 mb-0.5 ${isUser ? "bg-lavender-100" : "bg-sage-100"}`}>
        {isUser ? "😊" : "🌿"}
      </div>
      <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-3xl text-sm leading-relaxed shadow-sm ${isUser ? "bg-sage-500 text-white rounded-br-sm" : "bg-white text-stone-700 border border-stone-100 rounded-bl-sm"}`}
          style={isUser ? { backgroundColor: "var(--theme-primary)" } : {}}>
          {message.content.split("\n").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </div>
        <span className="text-xs text-stone-300 px-1">{message.time}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there 👋 I'm TheraFlow — your calm, private companion. How are you feeling today? You can share as much or as little as you'd like. I'm here to listen.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const [convoId, setConvoId]     = useState(null);
  const [error, setError]         = useState("");
  const [personality, setPersonality] = useState("warm"); // loaded from Firestore
  const bottomRef                 = useRef(null);
  const textareaRef               = useRef(null);

  // Load user's saved personality preference
  useEffect(() => {
    if (user) {
      getUserPrefs(user.uid)
        .then((prefs) => { if (prefs?.aiPersonality) setPersonality(prefs.aiPersonality); })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function now() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  async function send() {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    setError("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg = { role: "user", content: text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      // ── 1. Build message history for the API (no timestamps) ──
      const apiMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: text },
      ];

      // ── 2. Call the real /api/chat route (with personality) ──
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, personality }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const reply = data.reply || "I'm here. Could you tell me more?";

      setTyping(false);
      setMessages((prev) => [...prev, { role: "assistant", content: reply, time: now() }]);

      // ── 3. Save to Firestore (non-blocking — won't break chat if it fails) ──
      if (user) {
        try {
          let activeConvoId = convoId;
          if (!activeConvoId) {
            const title = text.length > 40 ? text.slice(0, 40) + "…" : text;
            activeConvoId = await createConversation(user.uid, title);
            setConvoId(activeConvoId);
            await saveMessage(user.uid, activeConvoId, { role: "assistant", content: messages[0].content });
          }
          await saveMessage(user.uid, activeConvoId, { role: "user", content: text });
          await saveMessage(user.uid, activeConvoId, { role: "assistant", content: reply });
        } catch (fsErr) {
          console.warn("[Chat] Firestore save failed (non-critical):", fsErr.message);
        }
      }


    } catch (err) {
      console.error("[Chat] Error:", err);
      setTyping(false);
      setError("Couldn't reach the AI. Please check your API key or try again.");
      // Remove the user message optimistic update on error
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function autoResize(e) {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-stone-100 bg-white/60 backdrop-blur-sm flex-shrink-0">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sage-100 to-lavender-100 flex items-center justify-center text-lg shadow-sm">
          🌿
        </div>
        <div>
          <div className="font-semibold text-stone-800 text-sm">TheraFlow AI</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sage-400 animate-pulse-soft" style={{ backgroundColor: "var(--theme-primary)" }} />
            <span className="text-xs text-stone-400">Always here for you</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto">
          {messages.map((m, i) => (
            <MessageBubble key={i} message={m} />
          ))}
          {typing && <TypingDots />}
          {error && (
            <div className="text-center text-sm text-blush-400 py-2 animate-fade-in">
              ⚠️ {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick starters (only when no user message sent yet) */}
      {messages.length === 1 && (
        <div className="px-6 pb-2">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
            {STARTERS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                className="text-xs px-3 py-2 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-500 hover:text-stone-700 transition-all"
                style={{ "--hover-border": "var(--theme-primary-light)" }}
              >
                {s.length > 45 ? s.slice(0, 45) + "…" : s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input box */}
      <div className="px-6 py-4 border-t border-stone-100 bg-white/60 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3 glass rounded-3xl px-4 py-3 shadow-soft border border-stone-200/50">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKey}
              placeholder="Share what's on your mind…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-stone-700 placeholder-stone-400 outline-none leading-relaxed max-h-40"
            />
            <button
              onClick={send}
              disabled={!input.trim() || typing}
              id="chat-send-btn"
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: input.trim() && !typing ? "var(--theme-primary)" : undefined }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-stone-300 mt-2">
            TheraFlow is an AI companion — not a licensed therapist. Crisis support: call or text 988.
          </p>
        </div>
      </div>
    </div>
  );
}
